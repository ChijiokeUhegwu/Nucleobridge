import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, hashToken } from '@/lib/auth';
import { resetPasswordSchema, validationErrorResponse } from '@/lib/auth-validation';
import { enforceRateLimit } from '@/lib/rate-limit';
import { clearSessionCookie } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const rateLimitResponse = enforceRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

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

    // 1. Hash new password and update user record
    const newPasswordHash = await hashPassword(cleanPassword);

    // Atomically update password, consume reset token, and enforce global session invalidation
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      // 2. Destroy all active sessions for this user across all devices
      prisma.session.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ]);

    // 4. Return success response forcing user to log in from scratch
    const response = NextResponse.json({
      message: 'Password successfully updated. You can now sign in with your new password.',
    });

    // 3. Clear any existing session cookie on the current request (Max-Age=0)
    clearSessionCookie(response);

    return response;
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}

