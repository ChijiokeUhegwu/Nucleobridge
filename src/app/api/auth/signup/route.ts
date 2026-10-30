import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/mail';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, confirmPassword } = body;

    const cleanFirstName = String(firstName ?? '').trim();
    const cleanLastName = String(lastName ?? '').trim();

    // Validation
    if (!cleanFirstName || !cleanLastName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required.' },
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

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

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
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        firstName: cleanFirstName,
        lastName: cleanLastName,
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

