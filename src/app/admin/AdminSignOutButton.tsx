'use client';

import { useState } from 'react';
import styles from './admin-shell.module.css';

export default function AdminSignOutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        keepalive: true,
      });
      const data: { error?: string } | null = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || 'Could not sign out. Your session may still be active. Please try again.'
        );
      }

      window.location.assign('/');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not sign out. Your session may still be active. Please try again.'
      );
      setPending(false);
    }
  }

  return (
    <div className={styles.signOutWrap}>
      <button
        type="button"
        className={`text-label-medium ${styles.signOutButton}`}
        onClick={handleSignOut}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? 'Signing out...' : 'Sign Out'}
      </button>
      {error && (
        <p className={styles.signOutError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
