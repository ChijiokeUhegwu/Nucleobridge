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

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || 'NucleoBridge <noreply@nucleobridge.org>';

  if (!transporter) {
    console.warn(
      `\n=======================================================\n` +
      `[MOCK EMAIL SERVICE] Gmail SMTP credentials not yet provided in .env.\n` +
      `To: ${email}\n` +
      `Subject: Verify Your NucleoBridge Email Address\n` +
      `Verification Code: ${code}\n` +
      `This code will expire in 10 minutes.\n` +
      `=======================================================\n`
    );
    return true;
  }

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Verify Your NucleoBridge Email Address',
      text: `Your NucleoBridge email verification code is: ${code}. It expires in 10 minutes. If you did not create an account, you can safely ignore this email.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #d5e7dd; border-radius: 8px; background-color: #f3fbf6; color: #161d1a;">
          <h2 style="color: #0f6e56; margin-top: 0;">Verify Your Email Address</h2>
          <p style="font-size: 15px; line-height: 1.5;">Enter the following 6-digit code to verify your NucleoBridge account:</p>
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
    console.error('Failed to send verification email via Gmail SMTP:', error);
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
 * Sends a welcome email immediately after successful email verification.
 * Contains personalized greeting, platform value overview, and primary HTML action
 * button linking to log in and start learning.
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  lastName?: string
): Promise<boolean> {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || 'NucleoBridge <noreply@nucleobridge.org>';
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const loginUrl = `${appUrl}/auth?view=login`;

  const cleanFirst = firstName ? firstName.trim() : '';
  const cleanLast = lastName ? lastName.trim() : '';
  const greetingName = cleanFirst || cleanLast || 'there';

  if (!transporter) {
    console.warn(
      `\n=======================================================\n` +
      `[MOCK EMAIL SERVICE] Gmail SMTP credentials not yet provided in .env.\n` +
      `To: ${email}\n` +
      `Subject: Welcome to NucleoBridge! Your bioinformatics journey starts here\n` +
      `Greeting: Hi ${greetingName},\n` +
      `Login URL: ${loginUrl}\n` +
      `=======================================================\n`
    );
    return true;
  }

  const safeFirstName = escapeHtml(greetingName);
  const safeLoginUrl = escapeHtml(loginUrl);

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Welcome to NucleoBridge! Your bioinformatics journey starts here',
      text:
        `Hi ${greetingName},\n\n` +
        `Welcome to NucleoBridge! We're glad you're here.\n\n` +
        `Learning bioinformatics is easier when you can put your knowledge into practice. That's why we built NucleoBridge: to help you develop practical bioinformatics skills by solving real-world computational biology challenges, right from your browser. No complicated installations or setup required.\n\n` +
        `Work through interactive case studies, get instant feedback on your code, and learn at your own pace. And when you get stuck, your AI mentor is there to offer hints, explain concepts, and help you find your way forward.\n\n` +
        `Ready to put your skills into practice?\n\n` +
        `Solve Your First Task: ${loginUrl}\n\n` +
        `Cheers,\n` +
        `The NucleoBridge Team`,
      html: `
        <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 28px; border: 1px solid #d5e7dd; border-radius: 12px; background-color: #f3fbf6; color: #161d1a;">
          <h2 style="color: #0f6e56; margin-top: 0; font-size: 22px; font-weight: 700; line-height: 1.3;">Welcome to NucleoBridge!</h2>
          <p style="font-size: 16px; line-height: 1.5; font-weight: 600; color: #161d1a; margin-bottom: 16px;">Hi ${safeFirstName},</p>
          <p style="font-size: 15px; line-height: 1.6; color: #3a4a43; margin-bottom: 16px;">
            Welcome to NucleoBridge! We&#39;re glad you&#39;re here.
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #3a4a43; margin-bottom: 16px;">
            Learning bioinformatics is easier when you can put your knowledge into practice. That&#39;s why we built NucleoBridge: to help you develop practical bioinformatics skills by solving real-world computational biology challenges, right from your browser. No complicated installations or setup required.
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #3a4a43; margin-bottom: 24px;">
            Work through interactive case studies, get instant feedback on your code, and learn at your own pace. And when you get stuck, your AI mentor is there to offer hints, explain concepts, and help you find your way forward.
          </p>
          <p style="font-size: 16px; line-height: 1.5; font-weight: 600; color: #161d1a; margin-bottom: 20px;">
            Ready to put your skills into practice?
          </p>
          <div style="margin: 24px 0 28px 0; text-align: center;">
            <a href="${safeLoginUrl}" style="display: inline-block; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; background-color: #0f6e56; color: #ffffff; border-radius: 8px; box-shadow: 1.5px 6px 30px 0px rgba(15, 110, 86, 0.12);">
              Log In and Start Learning &rarr;
            </a>
          </div>
          <p style="font-size: 13px; color: #51625a; line-height: 1.5; margin-bottom: 24px;">
            If the button above does not work, copy and paste this link into your browser:<br />
            <a href="${safeLoginUrl}" style="color: #0f6e56; word-break: break-all;">${safeLoginUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #d5e7dd; margin: 24px 0;" />
          <p style="font-size: 14px; color: #3a4a43; line-height: 1.5; margin: 0;">
            Cheers,<br />
            <strong>The NucleoBridge Team</strong>
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send welcome email via Gmail SMTP:', error);
    return false;
  }
}

