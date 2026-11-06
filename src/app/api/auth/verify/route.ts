import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/auth';
import { otpVerifySchema, validationErrorResponse } from '@/lib/auth-validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = otpVerifySchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { email: trimmedEmail, code: cleanCode } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      select: {
        id: true,
        emailVerified: true,
        emailVerificationCodeHash: true,
        emailVerificationExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found for this email address.' },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'This verification code has already been used.' },
        { status: 400 }
      );
    }

    if (!user.emailVerificationCodeHash || !user.emailVerificationExpiresAt) {
      return NextResponse.json(
        { error: 'No active verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    if (user.emailVerificationExpiresAt <= new Date()) {
      return NextResponse.json(
        { error: 'This verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const submittedCodeHash = hashToken(cleanCode);
    if (submittedCodeHash !== user.emailVerificationCodeHash) {
      return NextResponse.json(
        { error: 'Invalid verification code.' },
        { status: 400 }
      );
    }

    const result = await prisma.user.updateMany({
      where: {
        id: user.id,
        emailVerified: false,
        emailVerificationCodeHash: submittedCodeHash,
      },
      data: {
        emailVerified: true,
        emailVerificationCodeHash: null,
        emailVerificationExpiresAt: null,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'This verification code has already been used.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Email verified successfully.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during verification. Please try again.' },
      { status: 500 }
    );
  }
}
