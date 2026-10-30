'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '@/styles/auth-forms.module.css';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
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
            onChange={(e) => setToken(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
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
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          <Link href="/login" className={styles.textLink}>
            Return to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.pageContainer}>
      <Link href="/" className={styles.brandHeader}>
        <div className={styles.brandIcon} aria-hidden="true">
          NB
        </div>
        <span className={`text-title-large ${styles.brandTitle}`}>NucleoBridge</span>
      </Link>

      <Suspense fallback={<div className={styles.card}>Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
