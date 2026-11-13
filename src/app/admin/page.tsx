import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './admin-home.module.css';

export const metadata: Metadata = {
  title: 'Admin',
};

export const dynamic = 'force-dynamic';

export default function AdminHomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.intro}>
        <p className={`text-label-medium ${styles.eyebrow}`}>Administrator</p>
        <h1 className={`text-headline-large ${styles.title}`}>Admin overview</h1>
        <p className={`text-body-large ${styles.subtitle}`}>
          Manage case study access tiers and move between the admin and learner views.
        </p>
      </section>

      <div className={styles.grid}>
        <Link href="/admin/case-studies" className={styles.card}>
          <h2 className={`text-title-large ${styles.cardTitle}`}>Case study access</h2>
          <p className={`text-body-medium ${styles.cardText}`}>
            Change a case study between Free and Premium. Every step in the case study follows the
            new tier.
          </p>
          <span className={`text-label-medium ${styles.cardAction}`}>Open case studies</span>
        </Link>

        <Link href="/dashboard" className={styles.card}>
          <h2 className={`text-title-large ${styles.cardTitle}`}>Learner view</h2>
          <p className={`text-body-medium ${styles.cardText}`}>
            See the standard learner dashboard and learning progress view.
          </p>
          <span className={`text-label-medium ${styles.cardAction}`}>Switch to Learner View</span>
        </Link>
      </div>
    </main>
  );
}
