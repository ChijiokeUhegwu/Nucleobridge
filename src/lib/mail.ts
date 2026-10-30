import nodemailer from 'nodemailer';

/**
 * Creates and returns a Nodemailer transporter configured for Gmail SMTP
 * using credentials from environment variables.
 */
function getTransporter() {
  const host = process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_SERVER_PORT || 465);
  const secure = process.env.EMAIL_SERVER_SECURE === 'true' || port === 465;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (!user || !pass || user.includes('your-email') || pass.includes('your-gmail')) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Escapes text before it is interpolated into an HTML email body.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sends a 6-digit one-time code to the user's email via Gmail SMTP.
 */
export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || 'NucleoBridge <noreply@nucleobridge.org>';

  if (!transporter) {
    console.warn(
      `\n=======================================================\n` +
      `[MOCK EMAIL SERVICE] Gmail SMTP credentials not yet provided in .env.\n` +
      `To: ${email}\n` +
      `Subject: Your NucleoBridge 6-Digit One-Time Code\n` +
      `One-Time Code: ${code}\n` +
      `This code will expire in 10 minutes.\n` +
      `=======================================================\n`
    );
    return true;
  }

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: `Your NucleoBridge Verification Code: ${code}`,
      text: `Your NucleoBridge 6-digit verification code is: ${code}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #d5e7dd; border-radius: 8px; background-color: #f3fbf6; color: #161d1a;">
          <h2 style="color: #0f6e56; margin-top: 0;">NucleoBridge Sign-In Code</h2>
          <p style="font-size: 15px; line-height: 1.5;">Enter the following 6-digit code in your browser tab to sign in:</p>
          <div style="margin: 24px 0; text-align: center;">
            <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 12px 28px; background-color: #a0f3d4; color: #00513e; border-radius: 6px;">
              ${code}
            </span>
          </div>
          <p style="font-size: 13px; color: #51625a;">This code will expire in 10 minutes. For security, never share this code with anyone.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send OTP email via Gmail SMTP:', error);
    return false;
  }
}

/**
 * Sends a password reset link to the user's email via Gmail SMTP.
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  token: string
): Promise<boolean> {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || 'NucleoBridge <noreply@nucleobridge.org>';

  if (!transporter) {
    console.warn(
      `\n=======================================================\n` +
      `[MOCK EMAIL SERVICE] Gmail SMTP credentials not yet provided in .env.\n` +
      `To: ${email}\n` +
      `Subject: Reset Your NucleoBridge Password\n` +
      `Reset URL: ${resetUrl}\n` +
      `Token: ${token}\n` +
      `This link will expire in 1 hour.\n` +
      `=======================================================\n`
    );
    return true;
  }

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Reset Your NucleoBridge Password',
      text: `You requested a password reset for NucleoBridge. Open the following link to reset your password: ${resetUrl}. This link expires in 1 hour.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #d5e7dd; border-radius: 8px; background-color: #f3fbf6; color: #161d1a;">
          <h2 style="color: #0f6e56; margin-top: 0;">Reset Your Password</h2>
          <p style="font-size: 15px; line-height: 1.5;">We received a request to reset your NucleoBridge password. Click the button below to choose a new password:</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 24px; background-color: #0f6e56; color: #ffffff; border-radius: 6px;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 13px; color: #51625a;">This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send password reset email via Gmail SMTP:', error);
    return false;
  }
}

/**
 * Sends a welcome email after a learner creates an account.
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  lastName: string
): Promise<boolean> {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || 'NucleoBridge <noreply@nucleobridge.org>';
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const dashboardUrl = `${appUrl}/dashboard`;
  const fullName = `${firstName} ${lastName}`.trim();

  if (!transporter) {
    console.warn(
      `\n=======================================================\n` +
      `[MOCK EMAIL SERVICE] Gmail SMTP credentials not yet provided in .env.\n` +
      `To: ${email}\n` +
      `Subject: Welcome to NucleoBridge\n` +
      `Hello ${fullName},\n` +
      `Your account is ready. Open your dashboard: ${dashboardUrl}\n` +
      `=======================================================\n`
    );
    return true;
  }

  const safeName = escapeHtml(fullName);
  const safeDashboardUrl = escapeHtml(dashboardUrl);

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Welcome to NucleoBridge',
      text:
        `Hello ${fullName},\n\n` +
        `Welcome to NucleoBridge — your account is ready.\n\n` +
        `Open your dashboard to explore the case study catalogue, run real bioinformatics tools in your browser, and keep your progress in one place.\n\n` +
        `Open your dashboard: ${dashboardUrl}\n\n` +
        `If you did not create this account, you can safely ignore this email.\n\n` +
        `— The NucleoBridge team`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #d5e7dd; border-radius: 8px; background-color: #f3fbf6; color: #161d1a;">
          <h2 style="color: #0f6e56; margin-top: 0;">Welcome to NucleoBridge</h2>
          <p style="font-size: 15px; line-height: 1.5;">Hello ${safeName},</p>
          <p style="font-size: 15px; line-height: 1.5;">Your account is ready. You can now open your dashboard to explore the case study catalogue, run real bioinformatics tools in your browser, and keep your progress in one place.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${safeDashboardUrl}" style="display: inline-block; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 24px; background-color: #0f6e56; color: #ffffff; border-radius: 6px;">
              Open Your Dashboard
            </a>
          </div>
          <p style="font-size: 13px; color: #51625a;">If the button does not work, copy this address into your browser:<br />${safeDashboardUrl}</p>
          <p style="font-size: 13px; color: #51625a;">If you did not create this account, you can safely ignore this email.</p>
          <p style="font-size: 13px; color: #51625a; margin-bottom: 0;">— The NucleoBridge team</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send welcome email via Gmail SMTP:', error);
    return false;
  }
}

