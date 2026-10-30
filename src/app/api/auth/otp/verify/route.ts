import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/auth';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and 6-digit code are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();

    // Find the latest active code for this email
    const loginCode = await prisma.loginCode.findFirst({
      where: {
        email: trimmedEmail,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!loginCode) {
      return NextResponse.json(
        { error: 'No active code found. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > loginCode.expiresAt) {
      return NextResponse.json(
        { error: 'This code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check attempts limit (after 5 wrong tries the code dies per PRD FR-A.2)
    if (loginCode.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many incorrect attempts. This code is now invalid. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify code hash
    const inputHash = hashToken(cleanCode);
    if (inputHash !== loginCode.codeHash) {
      await prisma.loginCode.update({
        where: { id: loginCode.id },
        data: { attempts: { increment: 1 } },
      });

      const remainingTries = 5 - (loginCode.attempts + 1);
      return NextResponse.json(
        {
          error: `Incorrect code. ${remainingTries > 0 ? `${remainingTries} attempt(s) remaining.` : 'Code expired.'}`,
        },
        { status: 400 }
      );
    }

    // Mark code as consumed
    await prisma.loginCode.update({
      where: { id: loginCode.id },
      data: { consumedAt: new Date() },
    });

    // Check if user exists; if not, create new learner account
    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      // Check emergency sign-up switch
      if (process.env.SIGNUPS_ENABLED === 'false') {
        return NextResponse.json(
          { error: 'New account registrations are currently paused.' },
          { status: 403 }
        );
      }

      user = await prisma.user.create({
        data: {
          email: trimmedEmail,
        },
      });
    }

    // Set 30-day session cookie (PRD FR-A.3)
    const response = NextResponse.json({
      message: 'Signed in successfully.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, user.id, sessionCookieOptions);

    return response;
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during verification. Please try again.' },
      { status: 500 }
    );
  }
}

