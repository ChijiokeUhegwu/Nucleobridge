import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const SESSION_COOKIE_NAME = 'nb_session_user_id';
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_MAX_AGE_SECONDS,
  path: '/',
};

/**
 * Returns the signed-in learner for the current request, or null when the
 * session cookie is missing or points at a user that no longer exists.
 */
export async function getSessionUser() {
  const userId = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });
}
