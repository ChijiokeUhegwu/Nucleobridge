import type { Metadata } from 'next';
import { Fragment } from 'react';
import { CATALOG_PREVIEW } from '@/lib/catalog-preview';
import styles from './page.module.css';

export const metadata: Metadata = {
  description:
    'Master hands-on bioinformatics in your browser with Nucleobridge case studies, real Python, R, and samtools workflows, and instant automated checks.',
  keywords: [
    'Nucleobridge',
    'bioinformatics',
    'bioinformatics learning platform',
    'interactive bioinformatics',
    'hands-on bioinformatics',
    'learn bioinformatics online',
    'bioinformatics case studies',
    'in-browser bioinformatics',
    'Python bioinformatics',
    'R bioinformatics',
    'samtools',
  ],
};

/**
 * NucleoBridge Minimalist Home Screen
 * - Strict Viewport: Exactly 100vh layout with zero page scrolling.
 * - Semantic Tokens: Colors consumed strictly via main-tokens.css variables.
 * - PRD Alignment: Displays catalog preview (titles & access labels) for visitors (FR-A.1, D3).
 */
export default function HomePage() {
  return (
    <div className={styles.viewportContainer}>
      {/* Top Application Bar */}
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <div className={styles.brandIcon} aria-hidden="true">
            NB
          </div>
          <span className={`text-title-large ${styles.brandTitle}`}>
            NucleoBridge
          </span>
          <span className={`text-label-small ${styles.brandPill}`}>
            Bioinformatics in Browser
          </span>
        </div>

        <nav className={styles.navAction}>
          <a href="/login" className={`text-label-large ${styles.navLink}`}>
            Sign In
          </a>
          <a href="/signup" className={`text-label-large ${styles.signInButton}`}>
            Create Account
          </a>
        </nav>
      </header>

      {/* Main Focus Content */}
      <main className={styles.mainContent}>
        <section className={styles.heroSection}>
          <div className={`text-label-medium ${styles.heroTag}`}>
            <span>Real Tools • In-Browser Wasm • Instant Feedback</span>
          </div>
          <h1 className={`text-headline-large ${styles.heroTitle}`}>
            Master In-Demand Bioinformatics In Your Browser.
          </h1>
          <p className={`text-body-large ${styles.heroSubtitle}`}>
            Run real Python, R, and samtools workflows directly inside your browser. Automated
            checks verify your progress instantly, while a Socratic AI mentor guides you without
            giving away final answers.
          </p>
        </section>

        {/* Case Study Catalog Preview */}
        <div id="curriculum" className={styles.curriculumGrid}>
          {CATALOG_PREVIEW.map((caseStudy) => (
            <article key={caseStudy.slug} className={styles.caseCard}>
              <div>
                <div className={styles.cardHeader}>
                  <h2 className={`text-title-medium ${styles.cardTitle}`}>{caseStudy.title}</h2>
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
                  <Fragment key={item}>
                    {index > 0 && <span>•</span>}
                    <span className={styles.cardMetaItem}>{item}</span>
                  </Fragment>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Primary Interaction Buttons */}
        <div className={styles.ctaBar}>
          <a href="/login" className={`text-label-large ${styles.primaryCta}`}>
            Start Free Case Study
          </a>
          <a href="/catalog" className={`text-label-large ${styles.secondaryCta}`}>
            Browse Catalog
          </a>
        </div>
      </main>

      {/* Status Bar / Footer */}
      <footer className={styles.footer}>
        <div className={`text-label-small ${styles.footerMetrics}`}>
          <div className={styles.metricItem}>
            <span className={styles.statusIndicator} aria-hidden="true" />
            <span>Wasm Runtime Engine: Ready</span>
          </div>
          <span>•</span>
          <div className={styles.metricItem}>
            <span>Hardware Target: 4 GB RAM Laptops & Mobile</span>
          </div>
          <span>•</span>
          <div className={styles.metricItem}>
            <span>Zero Installation Required</span>
          </div>
        </div>

        <div className={`text-label-small ${styles.footerCopyright}`}>
          <span>NucleoBridge © 2026 • 24h Offline Resilience Cache</span>
        </div>
      </footer>
    </div>
  );
}

