'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATALOG_PREVIEW } from '@/lib/catalog-preview';
import styles from './dashboard.module.css';

type SessionUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });

        if (response.status === 401) {
          router.replace('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Unable to load your dashboard. Please try again.');
        }

        const data = await response.json();

        if (active) {
          setUser(data.user);
          setLoading(false);
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Unable to load your dashboard. Please try again.'
          );
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);

    try {
      const response = await fetch('/api/auth/signout', { method: 'POST' });

      if (!response.ok) {
        throw new Error('Could not sign out. Please try again.');
      }

      window.location.assign('/');
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : 'Could not sign out. Please try again.'
      );
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.centeredScreen}>
        <div className={styles.brandMark}>NB</div>
        <p className={`text-body-medium ${styles.centeredText}`}>Loading your dashboard...</p>
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <div className={styles.centeredScreen}>
        <div className={styles.errorCard}>
          <h1 className={`text-title-large ${styles.errorTitle}`}>
            We could not load your dashboard
          </h1>
          <p className={`text-body-medium ${styles.errorText}`}>
            {loadError || 'Your session could not be found.'}
          </p>
          <Link href="/login" className={styles.errorLink}>
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.email.split('@')[0];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brandGroup}>
          <span className={styles.brandIcon} aria-hidden="true">
            NB
          </span>
          <span className={`text-title-large ${styles.brandTitle}`}>NucleoBridge</span>
          <span className={`text-label-small ${styles.brandPill}`}>Learner Dashboard</span>
        </Link>

        <div className={styles.headerActions}>
          <span className={`text-label-medium ${styles.userEmail}`}>{user.email}</span>
          <button
            type="button"
            className={`text-label-large ${styles.signOutButton}`}
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.welcomePanel}>
          <p className={`text-label-medium ${styles.eyebrow}`}>Your learning space</p>
          <h1 className={`text-headline-large ${styles.greeting}`}>Hello {displayName},</h1>
          <p className={`text-body-large ${styles.welcomeText}`}>
            Welcome to NucleoBridge. Your account is ready, and your case study catalogue overview
            is below.
          </p>
        </section>

        {signOutError && <div className={`text-body-small ${styles.errorBanner}`}>{signOutError}</div>}

        <section aria-labelledby="catalog-heading">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="catalog-heading" className={`text-title-large ${styles.sectionTitle}`}>
                Case Study Catalogue
              </h2>
              <p className={`text-body-small ${styles.sectionSubtitle}`}>
                Explore the tracks available in your learning space.
              </p>
            </div>
            <span className={`text-label-small ${styles.catalogCount}`}>
              {CATALOG_PREVIEW.length} tracks
            </span>
          </div>

          <div className={styles.catalogGrid}>
            {CATALOG_PREVIEW.map((caseStudy) => (
              <article key={caseStudy.slug} className={styles.caseCard}>
                <div>
                  <div className={styles.cardHeader}>
                    <h3 className={`text-title-medium ${styles.cardTitle}`}>{caseStudy.title}</h3>
                    <span
                      className={`text-label-small ${
                        caseStudy.accessTone === 'pro' ? styles.badgePro : styles.badgeFree
                      }`}
                    >
                      {caseStudy.accessLabel}
                    </span>
                  </div>
                  <p className={`text-body-medium ${styles.cardDescription}`}>
                    {caseStudy.description}
                  </p>
                </div>
                <div className={`text-label-small ${styles.cardMeta}`}>
                  {caseStudy.meta.map((item, index) => (
                    <span key={item} className={styles.cardMetaItem}>
                      {index > 0 && <span aria-hidden="true">•</span>}
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
