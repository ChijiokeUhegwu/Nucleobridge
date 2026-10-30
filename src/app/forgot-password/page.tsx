'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/auth-forms.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className={styles.pageContainer}>
      <Link href="/" className={styles.brandHeader}>
        <div className={styles.brandIcon} aria-hidden="true">
          NB
        </div>
        <span className={`text-title-large ${styles.brandTitle}`}>NucleoBridge</span>
      </Link>

      <div className={styles.card}>
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
              onChange={(e) => setEmail(e.target.value)}
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
            <Link href="/login" className={styles.textLink}>
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

