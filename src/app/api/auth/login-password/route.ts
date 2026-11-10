import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, needsPasswordRehash, verifyPassword } from '@/lib/auth';
import {
  createSession,
  invalidateExistingSession,
  setSessionCookie,
} from '@/lib/session';
import { loginSchema, validationErrorResponse } from '@/lib/auth-validation';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const rateLimitResponse = enforceRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

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

    // 1 & 2. Extract existing session cookie & delete from Prisma Session table
    await invalidateExistingSession(request);

    // Generate fresh session token and persist SHA-256 hash in PostgreSQL
    const sessionToken = await createSession(user.id);

    const response = NextResponse.json({
      message: 'Signed in successfully.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    // 3. Strict Cookie Overwrite: Ensure name, path ('/'), secure, and sameSite
    // attributes are identical to force the browser to overwrite the existing entry
    setSessionCookie(response, sessionToken);

    return response;
  } catch (error) {
    console.error('Password login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during sign in. Please try again.' },
      { status: 500 }
    );
  }
}

