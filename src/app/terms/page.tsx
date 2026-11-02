import type { Metadata } from 'next';
import Link from 'next/link';
import { authHref } from '@/lib/auth-routes';
import styles from '@/styles/legal.module.css';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'The terms governing access to and use of NucleoBridge.',
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              NB
            </span>
            <span className={`text-title-large ${styles.brandName}`}>NucleoBridge</span>
          </Link>
          <Link href={authHref('signup')} className={styles.backLink}>
            Back to sign up
          </Link>
        </header>

        <article className={styles.card}>
          <h1 className={`text-headline-large ${styles.title}`}>Terms and Conditions</h1>
          <p className={styles.effective}>Effective date: 2 November 2026</p>

          <div className={styles.content}>
            <h2>1. Agreement to these Terms</h2>
            <p>
              These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the
              NucleoBridge website, learning platform, and related services (the
              &quot;Services&quot;).
            </p>
            <p>
              By creating an account, signing in, clicking an acceptance button, paying for PRO, or
              otherwise using the Services, you agree to these Terms and our{' '}
              <Link href="/privacy">Privacy Policy</Link>. If you do not agree to these Terms, you
              may not access or use the Services.
            </p>

            <h2>2. Access to the Services and accounts</h2>

            <h3>2.1 Your credentials</h3>
            <p>
              To access certain Services, you need an email address and either a password or a
              one-time email code. You must provide true, accurate, and complete registration
              information and keep it up to date.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your credentials and for
              all activity that occurs under your account, except where caused by our fault. You
              must notify us promptly if you suspect unauthorised access to your account.
              NucleoBridge will not be liable for loss or damage arising from your failure to keep
              your credentials secure.
            </p>

            <h3>2.2 Age restriction</h3>
            <p>
              By using the Services, you affirm that you are at least 16 years old, or the minimum
              age required in your jurisdiction to enter into a binding contract, whichever is
              higher. The Services are not directed to children below that age.
            </p>

            <h3>2.3 Account restrictions</h3>
            <p>
              You must not create multiple personal accounts to circumvent rules, limits, or
              enforcement actions. You must not share login credentials or attempt to bypass
              authentication, rate limits, paid-access controls, or other technical controls.
            </p>

            <h2>3. Description of the Services</h2>
            <p>
              NucleoBridge provides browser-based bioinformatics case studies. Depending on the
              step, the Services may include:
            </p>
            <ul>
              <li>guided step pages with instructions and a code editor or terminal;</li>
              <li>
                real Python, R, and command-line tools running in your browser through WebAssembly;
              </li>
              <li>automated checks that evaluate your work and decide pass or fail;</li>
              <li>autosave, resume, and cross-device sync;</li>
              <li>authored hints and an AI mentor;</li>
              <li>a progress map;</li>
              <li>free steps and paid PRO steps.</li>
            </ul>
            <p>
              We may add, modify, suspend, or discontinue features from time to time with reasonable
              notice where practicable. We do not guarantee uninterrupted or error-free operation.
              Code runs in your browser; opening a new step needs internet access. The browser
              cache and saved work are not an offline product.
            </p>

            <h2>4. Learning integrity and automated checks</h2>

            <h3>4.1 Your own work</h3>
            <p>
              You agree that work you submit is your own, except where a step explicitly permits
              specified resources. You must not use unauthorised automation, AI tools, or
              third-party assistance where the step rules prohibit it. You must not share, publish,
              or resell paid lesson content, hints, or mentor answers.
            </p>

            <h3>4.2 Automated checks</h3>
            <p>
              Checks run in your browser and decide whether a step is passed or failed. The AI
              mentor provides guidance and does not state a pass or grade. Automated outputs may be
              inaccurate or incomplete; they are not professional advice.
            </p>

            <h3>4.3 Skips and progress</h3>
            <p>
              A step unlocks when you pass or skip the step before it and you have access to it. A
              skip records a skip, not a pass. You may skip only under the conditions shown in the
              app.
            </p>

            <h3>4.4 Enforcement</h3>
            <p>
              We may investigate suspected cheating, abuse, or attempts to bypass paid-access
              controls and may suspend or terminate access where we reasonably believe a breach has
              occurred or is imminent.
            </p>

            <h2>5. PRO passes and payments</h2>
            <p>PRO is a time pass, not an auto-renewing subscription.</p>

            <h3>5.1 Plans and fees</h3>
            <p>
              The price, duration, and included features of a PRO pass are shown at purchase. We
              may change them for future purchases. The amount charged is the price shown at
              purchase.
            </p>

            <h3>5.2 Payment processing</h3>
            <p>
              Payments are processed by Flutterwave. By making a payment, you agree to
              Flutterwave&apos;s terms and privacy policy. We do not store full card or bank details
              on our servers. You must provide valid billing information and a payment method that
              can be charged the applicable fee.
            </p>

            <h3>5.3 Pass term and renewal</h3>
            <p>
              A PRO pass starts when we verify the payment and ends after the stated duration. You
              renew by paying again. We do not charge you automatically and do not renew a pass
              without a new payment.
            </p>

            <h3>5.4 Refunds</h3>
            <p>
              Refunds are handled under the policy shown at purchase and applicable law. If we
              refund a payment, the PRO entitlement linked to that payment is revoked. A refund of
              one payment does not revoke an entitlement created by a different payment.
            </p>

            <h3>5.5 Changes to fees</h3>
            <p>
              We may change PRO prices or durations for future purchases on reasonable notice.
              Changes do not affect a pass that has already started.
            </p>

            <h3>5.6 Consumer rights</h3>
            <p>
              Nothing in these Terms limits any statutory cancellation, refund, or consumer right
              that applies to you.
            </p>

            <h2>6. Intellectual property</h2>

            <h3>6.1 Ownership</h3>
            <p>
              NucleoBridge and its licensors own all rights in the Services, including software,
              lesson content, task materials, hints, check definitions, branding, documentation,
              and underlying technology.
            </p>

            <h3>6.2 Licence to you</h3>
            <p>
              Subject to these Terms, we grant you a limited, non-exclusive, non-transferable,
              revocable licence to access and use the Services for their intended purpose.
            </p>

            <h3>6.3 Feedback</h3>
            <p>
              If you provide comments, reports, feedback, or suggestions, you grant us the right to
              use that feedback for any purpose, including improving the Services.
            </p>
            <p>
              If you believe content on the Services infringes your intellectual property rights,
              contact us at <a href="mailto:support@nucleobridge.org">support@nucleobridge.org</a>{' '}
              with enough detail to evaluate your claim.
            </p>

            <h2>7. Your content</h2>

            <h3>7.1 Ownership</h3>
            <p>
              You retain ownership of code, queries, answers, notes, snapshots, and other material
              you submit (&quot;Content&quot;).
            </p>

            <h3>7.2 Licence to us</h3>
            <p>
              By submitting Content, you grant NucleoBridge a non-exclusive, worldwide,
              royalty-free licence to host, store, reproduce, process, display, and analyse your
              Content as reasonably necessary to operate the Services, run checks, provide hints and
              mentor responses, sync your progress, and provide support. This includes processing
              Content through AI model providers where the mentor is used.
            </p>

            <h3>7.3 Your representations</h3>
            <p>
              You represent that you have the right to submit your Content, that it does not
              violate applicable law or third-party rights, and that submitting it does not breach
              a confidentiality obligation.
            </p>

            <h3>7.4 Content removal</h3>
            <p>
              We may monitor, block, or remove Content where we reasonably believe it violates
              these Terms or applicable law. You are responsible for keeping backup copies of your
              Content where needed.
            </p>

            <h3>7.5 Content disclaimer</h3>
            <p>
              We do not guarantee the accuracy, integrity, or quality of Content submitted by you
              or third parties.
            </p>

            <h2>8. Acceptable use and prohibited uses</h2>
            <p>You may not, and may not permit any third party to:</p>
            <ul>
              <li>violate applicable law, regulation, or third-party rights;</li>
              <li>
                probe, scan, or test the vulnerability of the Services without our prior written
                consent, or circumvent security, access controls, paid-access controls, or rate
                limits;
              </li>
              <li>
                access or attempt to access data, accounts, or systems you are not authorised to
                use;
              </li>
              <li>
                reverse engineer, decompile, or disassemble the Services except where mandatory law
                permits;
              </li>
              <li>upload, transmit, or distribute malware, spam, or unlawful content;</li>
              <li>
                interfere with or overload our infrastructure, including through denial-of-service
                style behaviour;
              </li>
              <li>
                scrape, crawl, or use automated means to extract bulk content without our
                permission;
              </li>
              <li>
                impersonate another person or misrepresent your affiliation with any person or
                organisation;
              </li>
              <li>
                use the Services to develop or provide a competing service or product without our
                written consent;
              </li>
              <li>share, publish, or resell paid lesson content, hints, or mentor answers;</li>
              <li>
                submit real patient data, clinical data, or other sensitive personal information
                unless a feature explicitly requires it and you are authorised to do so.
              </li>
            </ul>
            <p>
              We may investigate suspected violations and suspend or terminate access where we
              reasonably believe a breach has occurred or is imminent.
            </p>

            <h2>9. Third-party services</h2>
            <p>
              The Services use third-party providers, including Flutterwave for payments, email
              delivery providers, hosting and database providers, private object storage, and AI
              model providers. Your use of those services is subject to their own terms and privacy
              policies.
            </p>
            <p>
              We are not responsible for third-party services outside our reasonable control.
              Including a third-party integration does not imply endorsement.
            </p>

            <h2>10. Disclaimers</h2>
            <p>
              To the maximum extent permitted by law, the Services are provided on an &quot;as
              is&quot; and &quot;as available&quot; basis. We disclaim all warranties, whether
              express, implied, or statutory, including implied warranties of merchantability,
              fitness for a particular purpose, title, and non-infringement.
            </p>
            <p>
              We do not warrant that the Services will be uninterrupted, secure, or error-free,
              that defects will be corrected, or that check results, scores, hints, or AI mentor
              outputs will be accurate or suitable for any particular educational, professional, or
              business outcome.
            </p>
            <p>
              Automated checks and AI mentor outputs are intended to support learning, not replace
              human judgement or professional advice. NucleoBridge is not responsible for decisions
              you make based on the Services.
            </p>

            <h2>11. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, NucleoBridge and its affiliates, directors,
              officers, employees, and agents will not be liable for any indirect, incidental,
              special, consequential, or punitive damages, or any loss of profits, revenues,
              goodwill, business opportunity, or data, arising out of or in connection with the
              Services or these Terms.
            </p>
            <p>
              To the maximum extent permitted by law, our total aggregate liability for all claims
              arising out of or relating to the Services or these Terms will not exceed the greater
              of:
            </p>
            <ul>
              <li>
                the total fees you paid to NucleoBridge for the Services giving rise to the claim
                during the twelve (12) months immediately before the event giving rise to
                liability; or
              </li>
              <li>
                fifty thousand Naira (₦50,000) if you have not paid fees to NucleoBridge for the
                Services giving rise to the claim.
              </li>
            </ul>
            <p>
              Nothing in these Terms excludes or limits liability that cannot be excluded or
              limited under applicable law, including liability for death or personal injury caused
              by negligence, fraud, or fraudulent misrepresentation.
            </p>

            <h2>12. Indemnity</h2>
            <p>
              You will defend, indemnify, and hold harmless NucleoBridge and its affiliates,
              directors, officers, employees, and agents from and against any claims, damages,
              liabilities, losses, costs, and expenses (including reasonable legal fees) arising
              out of or related to your use of the Services, your Content, your violation of these
              Terms, or your violation of any law or third-party rights, except to the extent
              caused by our wilful misconduct or breach of these Terms. NucleoBridge may assume the
              exclusive defence of any matter subject to indemnification, and you will reasonably
              cooperate with us.
            </p>

            <h2>13. Governing law and jurisdiction</h2>
            <p>
              These Terms and any dispute or claim arising out of or in connection with them or the
              Services are governed by the laws of the Federal Republic of Nigeria, without regard
              to conflict-of-law rules that would require the laws of another jurisdiction to
              apply.
            </p>
            <p>
              Subject to any mandatory consumer protections in your country of residence, you agree
              that the courts of Nigeria have exclusive jurisdiction to settle any dispute or claim
              arising out of or in connection with these Terms or the Services, except where
              applicable law requires a different forum or where we agree otherwise in writing.
            </p>

            <h2>14. Suspension and termination</h2>

            <h3>14.1 Termination by us</h3>
            <p>
              We may suspend or terminate your access to the Services if we reasonably believe you
              have violated these Terms, created risk or possible legal exposure, or must do so to
              comply with law. Where appropriate, we will provide notice before suspension or
              termination.
            </p>

            <h3>14.2 Termination by you</h3>
            <p>
              You may stop using the Services at any time. You may request account closure by
              contacting <a href="mailto:support@nucleobridge.org">support@nucleobridge.org</a>{' '}
              subject to the retention obligations described in our Privacy Policy. The account
              area is designed to provide a &quot;Delete my data&quot; button.
            </p>

            <h3>14.3 Suspension</h3>
            <p>
              We may suspend your access without prior notice where necessary to resolve technical
              risks, security incidents, or suspected abuse. Unless the suspension results from
              your breach of these Terms, we will use reasonable efforts to restore access once the
              underlying issue is resolved.
            </p>
            <p>
              Upon termination, your right to use the Services ceases immediately. Provisions that
              by their nature should survive termination will survive.
            </p>

            <h2>15. Notices</h2>

            <h3>15.1 Notices to us</h3>
            <p>
              To submit notices to us, contact{' '}
              <a href="mailto:support@nucleobridge.org">support@nucleobridge.org</a>.
            </p>

            <h3>15.2 Notices to you</h3>
            <p>
              We may provide notices to you by email to the address associated with your account,
              through the Services, or by posting on our website.
            </p>

            <h2>16. Changes to these Terms</h2>
            <p>
              We may update these Terms from time to time. When we do, we will post the updated
              Terms on this page with a revised effective date. Where changes are material, we will
              provide additional notice as required by applicable law. Your continued use of the
              Services after the effective date of updated Terms constitutes acceptance of those
              changes, except where further acceptance is required by law.
            </p>

            <h2>17. General</h2>

            <h3>17.1 Entire agreement</h3>
            <p>
              These Terms, together with our Privacy Policy and any agreement expressly referenced
              or entered into between you and NucleoBridge, constitute the entire agreement
              regarding the Services and supersede any prior agreements on that subject.
            </p>

            <h3>17.2 Severability</h3>
            <p>
              If any provision of these Terms is held invalid or unenforceable, the remaining
              provisions remain in full force and effect, and the invalid provision will be
              modified to the minimum extent necessary to make it enforceable.
            </p>

            <h3>17.3 No waiver</h3>
            <p>
              Our failure to enforce any right or provision is not a waiver of that right or
              provision. Any waiver must be in writing to be effective.
            </p>

            <h3>17.4 Assignment</h3>
            <p>
              You may not assign these Terms without our prior written consent. We may assign these
              Terms in connection with a merger, acquisition, corporate reorganisation, or sale of
              assets.
            </p>

            <h3>17.5 No third-party beneficiaries</h3>
            <p>
              Except as expressly stated, these Terms do not create rights for any person who is
              not a party to them.
            </p>

            <h3>17.6 Relationship of the parties</h3>
            <p>
              Nothing in these Terms creates any partnership, joint venture, agency, or employment
              relationship between you and NucleoBridge.
            </p>

            <h3>17.7 Survival</h3>
            <p>
              All sections that by their nature should survive termination or cancellation of these
              Terms will survive, including intellectual property, disclaimers, limitation of
              liability, indemnity, and governing law.
            </p>

            <h3>17.8 Force majeure</h3>
            <p>
              Neither party will be liable for failure or delay resulting from causes beyond
              reasonable control, including natural disasters, epidemics, war, civil unrest,
              government action, labour disputes, telecommunications or hosting outages, or
              cyber-attacks.
            </p>

            <h2>18. Contact</h2>
            <p>Questions about these Terms:</p>
            <p>
              Email: <a href="mailto:support@nucleobridge.org">support@nucleobridge.org</a>
            </p>
          </div>

          <div className={styles.footer}>
            <Link href={authHref('signup')} className={styles.backLink}>
              Back to sign up
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
