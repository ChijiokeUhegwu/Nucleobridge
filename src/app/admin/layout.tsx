import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import AdminSignOutButton from './AdminSignOutButton';
import styles from './admin-shell.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.brandGroup}>
          <span className={styles.brandIcon} aria-hidden="true">
            NB
          </span>
          <span className={`text-title-large ${styles.brandTitle}`}>NucleoBridge</span>
          <span className={`text-label-small ${styles.brandPill}`}>Admin</span>
        </Link>

        <nav className={styles.nav} aria-label="Admin navigation">
          <Link href="/admin" className={styles.navLink}>
            Overview
          </Link>
          <Link href="/admin/case-studies" className={styles.navLink}>
            Case studies
          </Link>
        </nav>

        <div className={styles.actions}>
          <span className={`text-label-medium ${styles.userEmail}`}>{user.email}</span>
          <Link href="/dashboard" className={`text-label-medium ${styles.switchLink}`}>
            Switch to Learner View
          </Link>
          <AdminSignOutButton />
        </div>
      </header>

      {children}
    </div>
  );
}
