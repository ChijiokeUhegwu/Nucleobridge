import { NextResponse } from 'next/server';
import { purgeExpiredAccounts } from '@/lib/account-deletion';

function verifyCronAuth(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return true; // Allow execution in development if secret is not set
  }
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const result = await purgeExpiredAccounts();
    return NextResponse.json({
      success: true,
      purgedCount: result.purgedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Hard Delete Job] Error running purge job:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during account purge.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}

