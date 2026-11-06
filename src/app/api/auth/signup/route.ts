import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/mail';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';
import { signupSchema, validationErrorResponse } from '@/lib/auth-validation';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const body = rawBody && typeof rawBody === 'object' ? rawBody : {};

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
    const passwordHash = await hashPassword(cleanPassword);
    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        firstName: cleanFirstName,
        lastName: cleanLastName || null,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    const welcomeEmailSent = await sendWelcomeEmail(
      trimmedEmail,
      cleanFirstName,
      cleanLastName
    );
    if (!welcomeEmailSent) {
      console.warn('Account created, but the welcome email could not be sent.');
    }

    const response = NextResponse.json(
      {
        message: 'Account created successfully. Welcome to NucleoBridge.',
        user,
      },
      { status: 201 }
    );

    response.cookies.set(SESSION_COOKIE_NAME, user.id, sessionCookieOptions);

    return response;
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating your account. Please try again.' },
      { status: 500 }
    );
  }
}

