import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOtpCode, hashPassword, hashToken, isPasswordBreached } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/mail';
import {
  createSession,
  invalidateExistingSession,
  setSessionCookie,
} from '@/lib/session';
import { signupSchema, validationErrorResponse } from '@/lib/auth-validation';
import { enforceRateLimit } from '@/lib/rate-limit';

const EMAIL_VERIFICATION_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const rateLimitResponse = enforceRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid or missing JSON request body.' },
        { status: 400 }
      );
    }

    if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
      return NextResponse.json(
        { error: 'Request body must be a valid JSON object.' },
        { status: 400 }
      );
    }

    const body = rawBody as Record<string, unknown>;

    const suppliedName = typeof body.name === 'string' ? body.name : '';
    const suppliedFirstName = typeof body.firstName === 'string' ? body.firstName : '';
    const suppliedLastName = typeof body.lastName === 'string' ? body.lastName : '';
    const combinedName =
      suppliedName || [suppliedFirstName, suppliedLastName].filter(Boolean).join(' ').trim();

    const validation = signupSchema.safeParse({
      name: combinedName,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
      terms: body.terms !== undefined ? body.terms : body.acceptedTerms,
    });

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { name, firstName, lastName, email, password } = validation.data;
    const cleanFirstName = (firstName ?? name).trim();
    const cleanLastName = (lastName ?? '').trim();
    const cleanPassword = password.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Check emergency sign-ups switch
    if (process.env.SIGNUPS_ENABLED === 'false') {
      return NextResponse.json(
        { error: 'New account sign-ups are currently paused for maintenance.' },
        { status: 403 }
      );
    }

    const passwordBreached = await isPasswordBreached(cleanPassword);
    if (passwordBreached) {
      return NextResponse.json(
        {
          error:
            'This password has been compromised in a known data breach. Please choose a safer password.',
        },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Hash password and create record
    const verificationCode = generateOtpCode();
    const emailVerificationCodeHash = hashToken(verificationCode);
    const emailVerificationExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_WINDOW_MS);

    const passwordHash = await hashPassword(cleanPassword);
    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        firstName: cleanFirstName,
        lastName: cleanLastName || null,
        passwordHash,
        emailVerified: false,
        emailVerificationCodeHash,
        emailVerificationExpiresAt,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        emailVerificationExpiresAt: true,
        createdAt: true,
      },
    });

    void sendVerificationEmail(trimmedEmail, verificationCode).catch((error) => {
      console.error('Verification email dispatch failed:', error);
    });

    // Invalidate and delete any existing active session(s) sent by this browser in PostgreSQL
    await invalidateExistingSession(request);

    const sessionToken = await createSession(user.id);

    const response = NextResponse.json(
      {
        message:
          'Account created successfully. Please check your email for a verification code.',
        user,
      },
      { status: 201 }
    );

    setSessionCookie(response, sessionToken);

    return response;
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating your account. Please try again.' },
      { status: 500 }
    );
  }
}

