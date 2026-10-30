import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOtpCode, hashToken } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required to send a code.' },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Rate limiting: At most 3 codes per email per hour (PRD FR-A.2)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCodesCount = await prisma.loginCode.count({
      where: {
        email: trimmedEmail,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCodesCount >= 3) {
      return NextResponse.json(
        { error: 'Too many codes requested. Please wait an hour before requesting another code.' },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const code = generateOtpCode();
    const codeHash = hashToken(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes (PRD FR-A.2)

    // Store in LoginCode table
    await prisma.loginCode.create({
      data: {
        email: trimmedEmail,
        codeHash,
        expiresAt,
      },
    });

    // Send code using Gmail SMTP
    const sent = await sendOtpEmail(trimmedEmail, code);
    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send verification code. Please check server mail settings.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'A 6-digit code has been sent to your email. Enter it below.',
      email: trimmedEmail,
    });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
