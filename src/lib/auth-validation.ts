import { NextResponse } from 'next/server';
import { z } from 'zod';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(EMAIL_PATTERN, 'Please enter a valid email address.');

const passwordSchema = z
  .string()
  .trim()
  .min(8, 'Password must be at least 8 characters long.');

const strongPasswordSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (value.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (!/\d/.test(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one number.',
      });
      return;
    }

    if (!/[^A-Za-z0-9\s]/.test(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one special character (for example, @ or #).',
      });
    }
  });

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters long.'),
    firstName: z
      .string()
      .trim()
      .min(2, 'First name must be at least 2 characters long.')
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(2, 'Last name must be at least 2 characters long.')
      .optional(),
    email: emailSchema,
    password: strongPasswordSchema,
    terms: z.literal(true, 'You must accept the Terms and Conditions and Privacy Policy.'),
  })
  .superRefine((data, ctx) => {
    if (data.firstName !== undefined && data.lastName === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['lastName'],
        message: 'Last name must be at least 2 characters long.',
      });
    }

    if (data.lastName !== undefined && data.firstName === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['firstName'],
        message: 'First name must be at least 2 characters long.',
      });
    }
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, 'Reset token is required.'),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      });
    }
  });

export const otpRequestSchema = z.object({
  email: emailSchema,
});

export const otpVerifySchema = z.object({
  email: emailSchema,
  code: z
    .union([z.string(), z.number()])
    .transform((value) => String(value).trim())
    .refine((value) => /^\d{6}$/.test(value), {
      message: 'Security code must be exactly 6 digits.',
    }),
});

export function validationErrorResponse(error: z.ZodError) {
  return NextResponse.json(
    {
      error: 'Validation failed.',
      issues: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    },
    { status: 400 }
  );
}
