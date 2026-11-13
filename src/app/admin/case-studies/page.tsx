import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { AccessMode } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import CaseStudyTierForm from './CaseStudyTierForm';
import styles from './admin-case-studies.module.css';

export const metadata: Metadata = {
  title: 'Case Study Access',
};

export const dynamic = 'force-dynamic';

function tierLabel(accessMode: AccessMode) {
  if (accessMode === 'PAID') {
    return 'Premium';
  }

  if (accessMode === 'SPLIT') {
    return 'Split';
  }

  return 'Free';
}

export default async function AdminCaseStudiesPage() {
  const user = await getSessionUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const caseStudies = await prisma.caseStudy.findMany({
    orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      accessMode: true,
      published: true,
      archivedAt: true,
      _count: {
        select: {
          steps: true,
        },
      },
    },
  });

  const freeCount = caseStudies.filter((caseStudy) => caseStudy.accessMode === 'FREE').length;
  const premiumCount = caseStudies.filter((caseStudy) => caseStudy.accessMode === 'PAID').length;
  const splitCount = caseStudies.filter((caseStudy) => caseStudy.accessMode === 'SPLIT').length;

  return (
    <main className={styles.main}>
        <section className={styles.intro}>
          <p className={`text-label-medium ${styles.eyebrow}`}>Access control</p>
          <h1 className={`text-headline-large ${styles.title}`}>Case study access tiers</h1>
          <p className={`text-body-large ${styles.subtitle}`}>
            Change a case study between Free and Premium. Every step in the case study is updated to
            match the new tier.
          </p>

          <div className={styles.summaryRow} aria-label="Case study tier summary">
            <span className={`text-label-small ${styles.summaryPill}`}>
              {caseStudies.length} total
            </span>
            <span className={`text-label-small ${styles.summaryPill}`}>{freeCount} free</span>
            <span className={`text-label-small ${styles.summaryPill}`}>
              {premiumCount} premium
            </span>
            {splitCount > 0 && (
              <span className={`text-label-small ${styles.summaryPill}`}>{splitCount} split</span>
            )}
          </div>
        </section>

        <section className={styles.tableCard} aria-labelledby="case-study-table-heading">
          <div className={styles.tableHeader}>
            <div>
              <h2 id="case-study-table-heading" className={`text-title-large ${styles.tableTitle}`}>
                Update case study tier
              </h2>
              <p className={`text-body-small ${styles.tableSubtitle}`}>
                Select a new tier and save the change.
              </p>
            </div>
          </div>

          {caseStudies.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={`text-title-medium ${styles.emptyTitle}`}>No case studies yet</h3>
              <p className={`text-body-medium ${styles.emptyText}`}>
                Import a case study before changing its access tier.
              </p>
            </div>
          ) : (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Case study</th>
                    <th scope="col">Steps</th>
                    <th scope="col">Current tier</th>
                    <th scope="col">Status</th>
                    <th scope="col">Update tier</th>
                  </tr>
                </thead>
                <tbody>
                  {caseStudies.map((caseStudy) => (
                    <tr key={caseStudy.id}>
                      <td>
                        <div className={styles.caseStudyCell}>
                          <span className={`text-title-small ${styles.caseStudyTitle}`}>
                            {caseStudy.title}
                          </span>
                          <span className={`text-body-small ${styles.caseStudySlug}`}>
                            {caseStudy.slug}
                          </span>
                        </div>
                      </td>
                      <td className={`text-body-medium ${styles.stepCount}`}>
                        {caseStudy._count.steps}
                      </td>
                      <td>
                        <span
                          className={`text-label-small ${
                            caseStudy.accessMode === 'PAID'
                              ? styles.badgePremium
                              : caseStudy.accessMode === 'SPLIT'
                                ? styles.badgeSplit
                                : styles.badgeFree
                          }`}
                        >
                          {tierLabel(caseStudy.accessMode)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`text-label-small ${
                            caseStudy.archivedAt
                              ? styles.statusArchived
                              : caseStudy.published
                                ? styles.statusPublished
                                : styles.statusDraft
                          }`}
                        >
                          {caseStudy.archivedAt
                            ? 'Archived'
                            : caseStudy.published
                              ? 'Published'
                              : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <CaseStudyTierForm
                          caseStudyId={caseStudy.id}
                          caseStudyTitle={caseStudy.title}
                          accessMode={caseStudy.accessMode}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
    </main>
  );
}
