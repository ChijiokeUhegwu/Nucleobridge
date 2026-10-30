'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/styles/auth-forms.module.css';

type AuthMode = 'password' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('password');

  // Password mode state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP mode state
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState('');

  // Status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Switch mode
  const handleModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setSuccess(null);
    setOtpStep('request');
    setOtpCode('');
  };

  // Submit Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setSuccess('Signed in successfully! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Request 6-digit OTP code
  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify 6-digit OTP code
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
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
        router.push('/');
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Link href="/" className={styles.brandHeader}>
        <div className={styles.brandIcon} aria-hidden="true">
          NB
        </div>
        <span className={`text-title-large ${styles.brandTitle}`}>NucleoBridge</span>
      </Link>

      <div className={styles.card}>
        <h1 className={`text-headline-small ${styles.cardTitle}`}>Welcome Back</h1>
        <p className={`text-body-medium ${styles.cardSubtitle}`}>
          Sign in to access your saved progress and interactive bioinformatics steps.
        </p>

        {/* Unified Authentication Mode Selector */}
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

        {/* Password Login Form */}
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="learner@example.com"
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="loginPassword" className={`text-label-medium ${styles.label}`}>
                  Password
                </label>
                <Link href="/forgot-password" className={`text-label-small ${styles.textLink}`}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="loginPassword"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

        {/* 6-Digit OTP Email Login Form */}
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
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setOtpCode(e.target.value)}
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
            <Link href="/signup" className={styles.textLink}>
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
