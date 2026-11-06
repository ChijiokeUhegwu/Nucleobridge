import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, needsPasswordRehash, verifyPassword } from '@/lib/auth';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';
import { loginSchema, validationErrorResponse } from '@/lib/auth-validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { email: trimmedEmail, password: cleanPassword } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(cleanPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (needsPasswordRehash(user.passwordHash)) {
      try {
        const passwordHash = await hashPassword(cleanPassword);
        await prisma.user.updateMany({
          where: { id: user.id, passwordHash: user.passwordHash },
          data: { passwordHash },
        });
      } catch (error) {
        console.error(
          'Password rehash error:',
          error instanceof Error ? error.message : 'unknown error'
        );
      }
    }

    // Set standard 30-day session cookie
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
    console.error('Password login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during sign in. Please try again.' },
      { status: 500 }
    );
  }
}

