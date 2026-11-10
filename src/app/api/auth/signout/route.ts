import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  invalidateExistingSession,
} from '@/lib/session';

export async function POST(request: Request) {
  try {
    await invalidateExistingSession(request);

    const response = NextResponse.json({ message: 'Signed out successfully.' });

    // Clear root and any potential subpath cookies
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
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      ...sessionCookieOptions,
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'An error occurred during sign out. Please try again.' },
      { status: 500 }
    );
  }
}
