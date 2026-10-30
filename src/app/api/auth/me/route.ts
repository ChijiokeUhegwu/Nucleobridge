import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session lookup error:', error);
    return NextResponse.json(
      { error: 'Unable to load your session. Please try again.' },
      { status: 500 }
    );
  }
}
