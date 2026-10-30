import styles from './page.module.css';

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
          {/* Track 1: SPLIT Track */}
          <article className={styles.caseCard}>
            <div>
              <div className={styles.cardHeader}>
                <h2 className={`text-title-medium ${styles.cardTitle}`}>
                  Viral Genomic Outbreak Surveillance
                </h2>
                <span className={`text-label-small ${styles.badgeFree}`}>
                  SPLIT • Free Steps 1–3
                </span>
              </div>
              <p className={`text-body-medium ${styles.cardDescription}`}>
                Inspect raw FASTQ reads, align viral sequences using samtools via Biowasm, and detect
                lineage-defining mutations in Python.
              </p>
            </div>
            <div className={`text-label-small ${styles.cardMeta}`}>
              <span className={styles.cardMetaItem}>10 Steps</span>
              <span>•</span>
              <span className={styles.cardMetaItem}>Pyodide & Biowasm</span>
              <span>•</span>
              <span className={styles.cardMetaItem}>~20 min/step</span>
            </div>
          </article>

          {/* Track 2: PRO Track */}
          <article className={styles.caseCard}>
            <div>
              <div className={styles.cardHeader}>
                <h2 className={`text-title-medium ${styles.cardTitle}`}>
                  Bacterial Genome Assembly & Annotation
                </h2>
                <span className={`text-label-small ${styles.badgePro}`}>
                  PRO Plan
                </span>
              </div>
              <p className={`text-body-medium ${styles.cardDescription}`}>
                Perform quality filtration, evaluate k-mer frequencies, reconstruct de novo contigs,
                and generate functional antimicrobial resistance profiles.
              </p>
            </div>
            <div className={`text-label-small ${styles.cardMeta}`}>
              <span className={styles.cardMetaItem}>8 Steps</span>
              <span>•</span>
              <span className={styles.cardMetaItem}>WebR & Python</span>
              <span>•</span>
              <span className={styles.cardMetaItem}>Advanced</span>
            </div>
          </article>
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

