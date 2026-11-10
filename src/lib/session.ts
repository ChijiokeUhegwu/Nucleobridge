import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
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
 * Sets the session cookie on a NextResponse with strict 1-to-1 replacement attributes.
 * Guarantees exact same name, path ('/'), sameSite ('lax'), secure, and httpOnly flags
 * to overwrite existing browser cookie jar entries rather than creating duplicates.
 */
export function setSessionCookie(response: NextResponse, sessionToken: string): void {
  // Clear any potential subpath duplicates that may have stacked in the browser
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...sessionCookieOptions,
    path: '/api/auth',
    maxAge: 0,
  });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...sessionCookieOptions,
    path: '/auth',
    maxAge: 0,
  });

  // Strictly overwrite the root cookie
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, sessionCookieOptions);
}

/**
 * Extracts all session tokens from incoming cookies() store and raw Request Cookie header.
 */
export function extractSessionTokens(request?: Request): string[] {
  const tokens: string[] = [];

  try {
    const store = cookies();
    const list = store.getAll(SESSION_COOKIE_NAME);
    for (const c of list) {
      if (c?.value && !tokens.includes(c.value)) {
        tokens.push(c.value);
      }
    }
  } catch {
    // cookies() unavailable outside Next.js request context
  }

  if (request) {
    const raw = request.headers.get('cookie') || '';
    if (raw.includes(SESSION_COOKIE_NAME)) {
      const parts = raw.split(';');
      for (const part of parts) {
        const [k, ...v] = part.trim().split('=');
        if (k === SESSION_COOKIE_NAME) {
          const val = v.join('=');
          if (val && !tokens.includes(val)) {
            tokens.push(val);
          }
        }
      }
    }
  }

  return tokens;
}

/**
 * Reads the incoming request for existing session tokens and invalidates each
 * corresponding record from the PostgreSQL Prisma Session table.
 */
export async function invalidateExistingSession(request?: Request): Promise<void> {
  const tokens = extractSessionTokens(request);
  for (const token of tokens) {
    await invalidateSession(token);
  }
}

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
  const allCookies = cookies().getAll(SESSION_COOKIE_NAME);
  if (!allCookies || allCookies.length === 0) {
    return null;
  }

  // Iterate over tokens in reverse order (most recent first) to find the active session
  for (let i = allCookies.length - 1; i >= 0; i--) {
    const rawToken = allCookies[i]?.value;
    if (!rawToken) continue;

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
            createdAt: true,
          },
        },
      },
    });

    if (!session) {
      continue;
    }

    // Reject expired sessions
    if (session.expiresAt <= new Date()) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      continue;
    }

    // PRD FR-A.6: A deleted user's session stops working at once.
    if (!session.user) {
      continue;
    }

    return session.user;
  }

  return null;
}
