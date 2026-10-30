import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateResetToken, hashToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (user) {
      // Invalidate existing unused tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
      });

      // Generate a new secure 32-byte reset token
      const rawToken = generateResetToken();
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      // Build reset URL
      const hostUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const resetUrl = `${hostUrl}/reset-password?token=${rawToken}`;

      await sendPasswordResetEmail(trimmedEmail, resetUrl, rawToken);
    }

    // Always return a neutral success message to avoid email enumeration
    return NextResponse.json({
      message:
        'If an account exists with this email, password reset instructions have been dispatched.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
