import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/auth';

export const SESSION_COOKIE_NAME = 'nb_session';
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days per PRD FR-A.3

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_MAX_AGE_SECONDS,
  path: '/',
};

/**
 * Generates a high-entropy random session token (32 bytes = 256 bits of entropy)
 * using the platform's cryptographic random function (node:crypto).
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Creates a server-side session record in PostgreSQL storing the SHA-256 hash of
 * the session token. Returns the raw, unhashed token to be transmitted to the browser.
 */
export async function createSession(userId: string): Promise<string> {
  const rawToken = generateSessionToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}

/**
 * Invalidates and deletes a session server-side from PostgreSQL using the raw token.
 */
export async function invalidateSession(rawToken: string): Promise<void> {
  if (!rawToken) {
    return;
  }

  const tokenHash = hashToken(rawToken);
  await prisma.session.deleteMany({
    where: { tokenHash },
  });
}

/**
 * Returns the signed-in learner for the current request, or null when the
 * session cookie is missing, expired, or points at a user that no longer exists.
 * Strictly adheres to PRD FR-A.6 (user existence check on every call).
 */
export async function getSessionUser() {
  const rawToken = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) {
    return null;
  }

  const tokenHash = hashToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerified: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Reject expired sessions
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // PRD FR-A.6: A deleted user's session stops working at once.
  if (!session.user) {
    return null;
  }

  return session.user;
}
