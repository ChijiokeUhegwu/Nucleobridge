import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, sessionCookieOptions, invalidateSession } from '@/lib/session';

export async function POST() {
  const rawToken = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (rawToken) {
    await invalidateSession(rawToken);
  }

  const response = NextResponse.json({ message: 'Signed out successfully.' });

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...sessionCookieOptions,
    maxAge: 0,
  });

  return response;
}
