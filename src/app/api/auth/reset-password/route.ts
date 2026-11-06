import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, hashToken } from '@/lib/auth';
import { resetPasswordSchema, validationErrorResponse } from '@/lib/auth-validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { token, password: cleanPassword } = validation.data;
    const tokenHash = hashToken(token);

    // Lookup token record
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt !== null) {
      return NextResponse.json(
        { error: 'Invalid or already used password reset token. Please request a new link.' },
        { status: 400 }
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { error: 'This password reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password and update user record
    const newPasswordHash = await hashPassword(cleanPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      message: 'Password successfully updated. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}

