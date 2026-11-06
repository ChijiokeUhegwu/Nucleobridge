import { NextResponse } from 'next/server';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const DEFAULT_IP = 'unknown';
const CLEANUP_THRESHOLD = 1000;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (!forwardedFor) {
    return DEFAULT_IP;
  }

  const firstIp = forwardedFor.split(',')[0]?.trim();
  return firstIp || DEFAULT_IP;
}

function pruneExpiredEntries(now: number) {
  if (rateLimitStore.size < CLEANUP_THRESHOLD) {
    return;
  }

  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function enforceRateLimit(request: Request): NextResponse | null {
  const now = Date.now();
  pruneExpiredEntries(now);

  const ip = getClientIp(request);
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return null;
  }

  if (entry.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  entry.count += 1;
  return null;
}
