import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ message: 'Signed out successfully.' });

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...sessionCookieOptions,
    maxAge: 0,
  });

  return response;
}
