import { NextResponse } from 'next/server';
import { getSessionUser, clearSessionCookie } from '@/lib/session';
import { requestAccountDeletion } from '@/lib/account-deletion';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const rateLimitResponse = enforceRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to request account deletion.' },
        { status: 401 }
      );
    }

    const { anonymizedEmail } = await requestAccountDeletion(user.id);

    const response = NextResponse.json({
      message:
        'Account deletion requested. Your personal data has been anonymized and all active sessions revoked. Full account purge will occur after 30 days.',
      anonymizedEmail,
    });

    clearSessionCookie(response);

    return response;
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing account deletion.' },
      { status: 500 }
    );
  }
}

