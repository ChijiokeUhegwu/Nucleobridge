'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authHref, isAuthView, type AuthView } from '@/lib/auth-routes';
import styles from '@/styles/auth-forms.module.css';

type LoginMode = 'password' | 'otp';
type OtpStep = 'request' | 'verify';

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.pageContainer}>
      <Link href="/" className={styles.brandHeader}>
        <div className={styles.brandIcon} aria-hidden="true">
          NB
        </div>
        <span className={`text-title-large ${styles.brandTitle}`}>NucleoBridge</span>
      </Link>

      <div className={styles.card}>{children}</div>
    </div>
  );
}

function AuthLoading() {
  return (
    <AuthShell>
      <h1 className={`text-headline-small ${styles.cardTitle}`}>Loading...</h1>
      <p className={`text-body-medium ${styles.cardSubtitle}`}>
        Preparing your sign-in options.
      </p>
    </AuthShell>
  );
}

function LoginView() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>('request');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleModeChange(mode: LoginMode) {
    setAuthMode(mode);
    setError(null);
    setSuccess(null);
    setOtpStep('request');
    setOtpCode('');
  }

  async function handlePasswordLogin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in.');
      }

      setSuccess('Signed in successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpRequest(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send one-time code.');
      }

      setSuccess(data.message || 'Verification code sent to your email.');
      setOtpStep('verify');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerify(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Incorrect or expired code.');
      }

      setSuccess('Code verified! Signed in successfully.');
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className={`text-headline-small ${styles.cardTitle}`}>Welcome Back</h1>
      <p className={`text-body-medium ${styles.cardSubtitle}`}>
        Sign in to access your saved progress and interactive bioinformatics steps.
      </p>

      <div className={styles.tabGroup} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={authMode === 'password'}
          onClick={() => handleModeChange('password')}
          className={`${styles.tabButton} ${authMode === 'password' ? styles.tabButtonActive : ''}`}
        >
          Password Sign In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={authMode === 'otp'}
          onClick={() => handleModeChange('otp')}
          className={`${styles.tabButton} ${authMode === 'otp' ? styles.tabButtonActive : ''}`}
        >
          6-Digit Email Code
        </button>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      {authMode === 'password' && (
        <form onSubmit={handlePasswordLogin} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="loginEmail" className={`text-label-medium ${styles.label}`}>
              Email Address
            </label>
            <input
              id="loginEmail"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="learner@example.com"
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="loginPassword" className={`text-label-medium ${styles.label}`}>
                Password
              </label>
              <Link href={authHref('forgot-password')} className={`text-label-small ${styles.textLink}`}>
                Forgot password?
              </Link>
            </div>
            <input
              id="loginPassword"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`text-label-large ${styles.submitButton}`}
          >
            {loading ? 'Signing In...' : 'Sign In with Password'}
          </button>
        </form>
      )}

      {authMode === 'otp' && (
        <div>
          {otpStep === 'request' ? (
            <form onSubmit={handleOtpRequest} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label htmlFor="otpEmail" className={`text-label-medium ${styles.label}`}>
                  Email Address
                </label>
                <input
                  id="otpEmail"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="learner@example.com"
                  className={styles.input}
                />
              </div>

              <p className={`text-body-small ${styles.subtleText}`}>
                We will dispatch a 6-digit code via Gmail SMTP to your inbox. No password needed.
              </p>

              <button
                type="submit"
                disabled={loading}
                className={`text-label-large ${styles.submitButton}`}
              >
                {loading ? 'Dispatching Code...' : 'Send 6-Digit Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpVerify} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label htmlFor="otpCode" className={`text-label-medium ${styles.label}`}>
                  Enter 6-Digit Code
                </label>
                <input
                  id="otpCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                  placeholder="123456"
                  className={`${styles.input} ${styles.inputOtp}`}
                />
              </div>

              <p className={`text-body-small ${styles.subtleText}`}>
                Code sent to <strong>{email}</strong>. It expires in 10 minutes.
              </p>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className={`text-label-large ${styles.submitButton}`}
              >
                {loading ? 'Verifying Code...' : 'Verify & Sign In'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setOtpStep('request');
                  setOtpCode('');
                  setError(null);
                }}
                className={`text-label-medium ${styles.secondaryButton}`}
              >
                Request a Different Code
              </button>
            </form>
          )}
        </div>
      )}

      <div className={styles.footerLinks}>
        <p className={`text-body-small ${styles.subtleText}`}>
          Don&apos;t have an account?{' '}
          <Link href={authHref('signup')} className={styles.textLink}>
            Create an Account
          </Link>
        </p>
      </div>
    </>
  );
}

function SignUpView() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      setSuccess('Account created successfully! Taking you to your dashboard...');
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1200);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className={`text-headline-small ${styles.cardTitle}`}>Create an Account</h1>
      <p className={`text-body-medium ${styles.cardSubtitle}`}>
        Join NucleoBridge to run bioinformatics workflows directly in your browser.
      </p>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.rowTwoCol}>
          <div className={styles.fieldGroup}>
            <label htmlFor="firstName" className={`text-label-medium ${styles.label}`}>
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="lastName" className={`text-label-medium ${styles.label}`}>
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={`text-label-medium ${styles.label}`}>
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="learner@example.com"
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="password" className={`text-label-medium ${styles.label}`}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="confirmPassword" className={`text-label-medium ${styles.label}`}>
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
            className={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`text-label-large ${styles.submitButton}`}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className={styles.footerLinks}>
        <p className={`text-body-small ${styles.subtleText}`}>
          Already have an account?{' '}
          <Link href={authHref('login')} className={styles.textLink}>
            Sign In
          </Link>
        </p>
      </div>
    </>
  );
}

function ForgotPasswordView() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch password reset request.');
      }

      setSuccess(
        data.message ||
          'If an account exists with this email, password reset instructions have been sent.'
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className={`text-headline-small ${styles.cardTitle}`}>Reset Password</h1>
      <p className={`text-body-medium ${styles.cardSubtitle}`}>
        Enter your registered email address and we will dispatch password recovery instructions.
      </p>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label htmlFor="forgotEmail" className={`text-label-medium ${styles.label}`}>
            Email Address
          </label>
          <input
            id="forgotEmail"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="learner@example.com"
            className={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`text-label-large ${styles.submitButton}`}
        >
          {loading ? 'Dispatching Reset Link...' : 'Send Reset Link'}
        </button>
      </form>

      <div className={styles.footerLinks}>
        <p className={`text-body-small ${styles.subtleText}`}>
          Remembered your password?{' '}
          <Link href={authHref('login')} className={styles.textLink}>
            Back to Sign In
          </Link>
        </p>
      </div>
    </>
  );
}

function ResetPasswordView({ initialToken }: { initialToken: string }) {
  const router = useRouter();
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setToken(initialToken);
  }, [initialToken]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Password reset token is missing. Please check your reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSuccess('Your password has been successfully updated! Redirecting to sign in...');
      setTimeout(() => {
        router.push(authHref('login'));
      }, 2000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className={`text-headline-small ${styles.cardTitle}`}>Choose New Password</h1>
      <p className={`text-body-medium ${styles.cardSubtitle}`}>
        Enter your secure replacement password below.
      </p>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label htmlFor="resetToken" className={`text-label-medium ${styles.label}`}>
            Reset Token
          </label>
          <input
            id="resetToken"
            type="text"
            required
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste your 32-character reset token"
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="newPassword" className={`text-label-medium ${styles.label}`}>
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="confirmNewPassword" className={`text-label-medium ${styles.label}`}>
            Confirm New Password
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat new password"
            className={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`text-label-large ${styles.submitButton}`}
        >
          {loading ? 'Updating Password...' : 'Save New Password'}
        </button>
      </form>

      <div className={styles.footerLinks}>
        <p className={`text-body-small ${styles.subtleText}`}>
          <Link href={authHref('login')} className={styles.textLink}>
            Return to Sign In
          </Link>
        </p>
      </div>
    </>
  );
}

function AuthViews() {
  const searchParams = useSearchParams();
  const requestedView = searchParams.get('view');
  const view: AuthView = isAuthView(requestedView) ? requestedView : 'login';
  const token = searchParams.get('token') ?? '';

  return (
    <AuthShell>
      {view === 'login' && <LoginView />}
      {view === 'signup' && <SignUpView />}
      {view === 'forgot-password' && <ForgotPasswordView />}
      {view === 'reset-password' && <ResetPasswordView initialToken={token} />}
    </AuthShell>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthViews />
    </Suspense>
  );
}
