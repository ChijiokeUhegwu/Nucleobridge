# Task 05: Sessions, Compliance & Defense

## 1. What This Is

NucleoBridge is a freemium, browser-based bioinformatics learning platform for self-directed learners on low-resource hardware, and the one thing that must work is that paid lesson content reaches only learners with an active PRO entitlement.

## 2. Status

This task record covers server-side session lifecycle management (CSPRNG token generation, SHA-256 database hashing, strict cookie isolation, and anti-stacking overwrites), defense-in-depth against session hijacking and network failure edge cases, global session invalidation on password resets, user enumeration defense with indistinguishable generic errors, onboarding gating trade-offs (pure soft, pure hard, and shipped hybrid gating), legal compliance with NDPA 2023 and GDPR Art. 17 "Right to be Forgotten" via a 30-day soft-deletion grace period and automated cascade hard purge job, retention matrix mapping with permanent delinked financial record keeping, privacy policy documentation and founder interview insights, client-side state evaluation (Zustand evaluation and intentional removal), and Role-Based Access Control (RBAC) with protected administrative routes. It does not cover the in-browser WebAssembly runtime (Pyodide, WebR, Biowasm), check runner execution, or payment gateways.

| State | Area | What is true now |
|---|---|---|
| **Finished** | Server-Side Hashed Sessions & CSPRNG Token Generation | PostgreSQL holds the confirmed `Session` model (`id`, `userId`, `tokenHash`, `expiresAt`, `createdAt` in `prisma/schema.prisma:136-146`). Tokens are generated using 32 bytes (256 bits) of cryptographic entropy via Node.js native CSPRNG (`src/lib/session.ts:114-116`). The database persists only the SHA-256 digest (`tokenHash`), ensuring that compromised database dumps yield no usable bearer tokens (`docs/sessions.md`). Every authenticated request actively validates user existence and active cascade state via `getSessionUser()` (`src/lib/session.ts:157-205`), enforcing PRD FR-A.6. Sessions enforce a strict 30-day time-to-live (`SESSION_MAX_AGE_SECONDS = 2592000`). Verified in `evidence/01-two-session-ids.txt` and `evidence/02-cookie-flags.png`. |
| **Finished** | Strict Cookie Replacement & Multi-User Anti-Stacking | Resolved the browser cookie stacking defect where consecutive user logins on shared hardware sent multiple session tokens (`evidence/06-two-users-one-browser.txt`). Route handlers check incoming requests and proactively invalidate prior database session records (`src/lib/session.ts:103-108`). Subpath duplicate cookies (`/api/auth`, `/auth`) are evicted with `maxAge: 0` before overwriting the root-scoped cookie (`src/lib/session.ts:23-38`). Cookies strictly enforce `Path=/`, `HttpOnly=true`, `SameSite=lax`, and `Secure=true` in production (`evidence/02-cookie-flags.png`). |
| **Finished** | Logout Network Failure Edge Case & Background Retry Resilience | Solved the critical edge case where an in-flight network drop caused naive client interfaces to falsely claim logout while the session remained active in PostgreSQL (`evidence/09-logout-network-failure.txt`). Client-side signout executes an automated 3-attempt retry loop with exponential backoff (`0ms`, `400ms`, `800ms`), `keepalive: true`, and an `AbortController` 3.5s timeout (`src/app/dashboard/page.tsx:66-116`). Transparent background retries handle transient drops with zero user clicks. If all retries fail, the UI surfaces a high-contrast security warning informing the user that their session remains active on shared machines (`evidence/10-logout-edge-case-fixed.txt`). Server-side logout atomically deletes the database record and sets `Max-Age=0` (`evidence/07-session-row-present.png`, `evidence/08-session-row-deleted.png`). |
| **Finished** | Global Session Revocation on Password Reset | Successful password reset completion (`POST /api/auth/reset-password`) strictly updates the `passwordHash` and executes an atomic multi-device session purge: `prisma.session.deleteMany({ where: { userId: user.id } })` (`src/app/api/auth/reset-password/route.ts:60-63`). Active sessions across all alternative browsers, devices, and tabs are terminated immediately, preventing stale session hijacking (`docs/reset-kills-other-session.md`). The current response cookie is cleared immediately (`Max-Age=0`), and automatic login is rejected, forcing re-authentication from scratch (`evidence/11-reset-kills-other-session.mp4`). |
| **Finished** | Generic Authentication Errors & Enumeration Defense | Sign-in attempts with a wrong email vs. a correct email with a wrong password return an identical, generic HTTP 401 response: `{"error": "Invalid email or password."}` (`src/app/api/auth/login-password/route.ts:40-42,54-56`). Server-side timing discrepancies are mitigated by running an Argon2id comparison against a dummy hash when an email is not found (`src/lib/auth.ts:50-53`), preventing automated user enumeration and targeted phishing (`docs/generic-errors.md`, `evidence/05-generic-errors-both-cases.png`). |
| **Finished** | Onboarding Gating Architecture (Hybrid Model Shipped) | Evaluated Pure Soft Gating, Pure Hard Gating, and Hybrid Gating across user attrition, spam vulnerability, and African hardware constraints (4 GB RAM laptops, metered data) (`docs/gating.md`). NucleoBridge ships the Hybrid Model: registration creates the account, hashes a 6-digit OTP, pre-issues a session, and strictly stops the learner at a mandatory email verification gate (`evidence/03`, `04`, `04B`). Upon entering the valid code, the server verifies the email and executes an automated session handoff into `/dashboard`, eliminating redundant password re-entry fatigue and recovering an estimated 8% funnel drop-off (`docs/gating.md`). Regulatory and clinical genomic data triggers for Pure Hard Gating are formally defined. |
| **Finished** | Legal Account Deletion & 30-Day Grace Period (NDPA & GDPR Art. 17) | Implemented a two-stage self-service account deletion architecture compliant with the Nigeria Data Protection Act (NDPA) 2023 and GDPR Art. 17 "Right to be Forgotten". The `User` model tracks `deletionRequestedAt DateTime?` (`prisma/schema.prisma:122`). `POST /api/user/delete` initiates the 30-day grace period: it immediately scrambles the identity to `deleted-[uuid]@example.com`, overwrites names to `Deleted User`, nullifies password hashes and verification secrets, and instantly wipes all active sessions (`src/lib/account-deletion.ts:13-41`, `src/app/api/user/delete/route.ts:1-42`). `getSessionUser()` actively rejects deleted accounts (`src/lib/session.ts:197-199`). The dashboard provides a self-service "Danger Zone" modal with explicit confirmation (`src/app/dashboard/DeleteAccountSection.tsx:1-182`, `evidence/12-deletion-request-locks-account.mp4`). |
| **Finished** | Scheduled Hard Purge Job & Cascade Cleanup | Built a daily background purge worker (`POST /api/cron/purge-accounts` and `src/scripts/purge-accounts.ts:1-16`) that identifies accounts where `deletionRequestedAt` exceeds 30 days (`src/lib/account-deletion.ts:48-102`). The job runs inside a Prisma `$transaction`, cascade deleting child records (sessions, reset tokens, progress, snapshots, check attempts, mentor messages, hint quotas, events) before hard deleting the `User` row. Verified to log mandatory start and finish lines (`[Hard Delete Job] Started. Found X accounts to purge.`, `[Hard Delete Job] Finished. Successfully purged X accounts.`). Safe and strictly idempotent when run repeatedly against identical data (`evidence/13-scheduled-job-run-one.txt`, `evidence/14-scheduled-job-run-two.txt`). |
| **Finished** | Comprehensive Retention Matrix & Financial Record Delinking | Formalized a 24-table retention matrix across all Prisma schema models and columns (`docs/retention-matrix.md`). Under the confirmed owner decision of 13 November 2026, financial records (`Payment`, `PaymentEvent`) and membership tiers (`Entitlement`) are retained permanently under statutory legal obligations (tax, accounting, audit, fraud prevention), but are delinked from learner identities by setting `userId = null`. Backup rotation is mapped to 7-day snapshot retention, and reconciliation between live live database deletion and immutable backups is documented in `docs/privacy-draft-with-broken-promise.md` and published in `docs/privacy.md`. Founder interview insights recorded in `docs/interview-with-owner.md`. |
| **Finished** | Frontend State Management Evaluation | Evaluated Zustand vs. React Context vs. URL query parameters for cross-component state flow. Implemented Zustand on the auth password reset workflow and captured working cross-component state in `evidence/15-state-management-working.mp4`. Intentionally removed Zustand from the codebase following evaluation to eliminate unnecessary bundle bloat, prevent forced `"use client"` conversions, and avoid premature abstraction (`docs/state-management.md`). |
| **Finished** | Role-Based Access Control (RBAC) & Protected Admin Area | Added `Role` enum (`USER`, `ADMIN`) and `User.role` in schema and migration `20261113161040_add_user_role` (`prisma/schema.prisma:103-106,118`). Built protected administrative routes (`/admin`, `/admin/case-studies` in `src/app/admin/`) and an API endpoint (`POST /api/admin/case-studies/update-tier` in `src/app/api/admin/case-studies/update-tier/route.ts:1-72`). Strict server-side RBAC guards verify `user.role === 'ADMIN'`; unauthenticated users redirect to login, while unauthorized learners receive HTTP 403 Forbidden (`evidence/16-admin-route-refused.mp4`). Authorized admins can toggle case study access tiers (`FREE` vs. `PAID`) with automatic step cascade. |
| **Half done** | Database Migration for Entitlement Nullable Foreign Key | `prisma/schema.prisma` was updated to make `Entitlement.userId` nullable (`String?`) with `onDelete: SetNull` so membership rows survive learner deletion, but the migration has not yet been applied to the live PostgreSQL instance (`decisions.md:R3`). See defect 1. |
| **Half done** | Automated Login Code Purge Worker | The `LoginCode` table records single-use 10-minute OTP codes. While expired codes are rejected at runtime, no scheduled cron or background cleanup deletes stale expired codes daily as required by PRD Section 8. See defect 2. |
| **Half done** | Distributed Ingress Header Verification for Rate Limiting | Auth endpoints use sliding-window rate limiting; multi-instance Redis backing and upstream reverse proxy header sanitization remain pending production cloud infrastructure. See defect 3. |
| **Not started** | In-browser WebAssembly runtime | Pyodide (Python), WebR (R), Biowasm (samtools), Web Worker execution harness, virtual filesystem (MEMFS), and automated check grading. |
| **Not started** | Five learning features | Guided step page, instant check runner, autosave/resume and cross-device sync, hint ladder with AI mentor, and progress map. |
| **Not started** | Paid path & monetization | `assertStepAccess` guard, Flutterwave checkout redirect, webhook signature verification, `fulfillPayment`, reconcile cron job, and PRO entitlement enforcement. |
| **Not started** | Content pipeline & vector search | Authored step pack parser, chunking pipeline, pgvector similarity search, and Socratic AI mentor prompt boundaries. |

**What this folder contains.** `docs/` holds architecture documentation, security threat models, and research: `sessions.md`, `gating.md`, `generic-errors.md`, `reset-kills-other-session.md`, `privacy.md`, `privacy-draft-with-broken-promise.md`, `retention-matrix.md`, `interview-with-owner.md`, `state-management.md`, and `handbook.md`. `evidence/` holds raw terminal transcripts, cookie security matrices, video recordings of user journeys, failure-mode tests, cron job outputs, and RBAC refusal proofs. Application code created or modified by this task lives in `src/lib/` (`session.ts`, `account-deletion.ts`, `auth.ts`, `prisma.ts`), `src/app/api/auth/` (`login-password/route.ts`, `signout/route.ts`, `reset-password/route.ts`, `verify/route.ts`), `src/app/api/user/delete/route.ts`, `src/app/api/cron/purge-accounts/route.ts`, `src/app/api/admin/case-studies/update-tier/route.ts`, `src/app/dashboard/` (`page.tsx`, `DeleteAccountSection.tsx`, `dashboard.module.css`, `delete-account.module.css`), `src/app/admin/` (`page.tsx`, `layout.tsx`, `AdminSignOutButton.tsx`, `case-studies/`), `src/scripts/` (`purge-accounts.ts`), and `prisma/` (`schema.prisma`, `migrations/`).

**Evidence index.**
* `evidence/01-two-session-ids.txt`: Proof of fresh 256-bit CSPRNG session token issuance on consecutive sign-ins with SHA-256 database hashing.
* `evidence/02-cookie-flags.png`: Security analysis and DevTools inspection of defensive cookie attributes (`HttpOnly`, `SameSite=lax`, `Secure`, `Path=/`, 30-day `Max-Age`).
* `evidence/03-soft-gating-flow.mp4`: Screen recording demonstrating pure soft gating: immediate dashboard access with zero verification barrier.
* `evidence/04-hard-gating-flow.mp4`: Screen recording demonstrating pure hard gating: mandatory verification barrier followed by redundant credential re-entry.
* `evidence/04B-hybrid-gating-flow.mp4`: Screen recording demonstrating shipped hybrid gating: mandatory email OTP verification followed by automated session handoff into `/dashboard`.
* `evidence/05-generic-errors-both-cases.png`: Side-by-side UI comparison proving indistinguishable "Invalid email or password" error responses for wrong email vs. wrong password.
* `evidence/06-two-users-one-browser.txt`: Server query trace demonstrating the legacy cookie stacking defect where multiple session cookies caused cross-account impersonation.
* `evidence/07-session-row-present.png`: Prisma Studio inspection at `localhost:5555` capturing the active session row in PostgreSQL prior to logout.
* `evidence/08-session-row-deleted.png`: Prisma Studio inspection at `localhost:5555` confirming complete deletion of the session record from PostgreSQL upon signout.
* `evidence/09-logout-network-failure.txt`: Threat model and reproduction transcript of the logout network failure edge case where client UI claimed logout while the session remained active.
* `evidence/10-logout-edge-case-fixed.txt`: Complete architectural fix report: automated 3-attempt background retries (`keepalive: true`), AbortController timeout, and fallback security banner.
* `evidence/11-reset-kills-other-session.mp4`: Screen recording demonstrating global session revocation: password reset immediately invalidates all active sessions across alternate browsers.
* `evidence/12-deletion-request-locks-account.mp4`: Screen recording demonstrating legal account deletion: self-service deletion request scrambles identity, clears credentials, and locks the account.
* `evidence/13-scheduled-job-run-one.txt`: Terminal and Prisma query trace of Run 1 of the account purge cron job, confirming execution of the 30-day hard delete query.
* `evidence/14-scheduled-job-run-two.txt`: Terminal and Prisma query trace of Run 2 of the account purge cron job against the same dataset, proving zero changes and strict idempotency.
* `evidence/15-state-management-working.mp4`: Screen recording demonstrating client-side state sharing via Zustand between forgot-password and reset-password forms prior to intentional removal.
* `evidence/16-admin-route-refused.mp4`: Screen recording proving RBAC enforcement: learner account attempting to access `/admin/case-studies` is blocked with HTTP 403 Forbidden.

---

## 3. The Stack, and Why

| Choice | Why this, rather than the alternative |
|---|---|
| **Server-Side Hashed Sessions (`Session` table + SHA-256)** | Storing hashed session tokens (`tokenHash`) in PostgreSQL provides instant server-side revocation on signout, password reset, or account deletion, and ensures that an SQL injection or leaked database backup yields only irreversible SHA-256 digests. This is strictly superior to stateless JWT cookies (which cannot be revoked server-side without a distributed blocklist) and superior to storing raw tokens in the database. |
| **High-Entropy CSPRNG Session Identifiers (`crypto.randomBytes(32)`)** | Generates 256 bits of cryptographic entropy ($2^{256}$ possibilities), rendering brute-force enumeration, token collision, and sequential token prediction mathematically impossible, unlike insecure pseudo-random generators (`Math.random()`) or sequential database IDs. |
| **Strict 1-to-1 Cookie Overwrite with Subpath Cleanup** | Explicitly overrides previous cookie jar entries by standardizing `name='nb_session'`, `path='/'`, `sameSite='lax'`, `secure`, and `httpOnly`, while proactively clearing legacy subpath cookies (`/api/auth`, `/auth`). This eliminates multi-cookie stacking on shared devices that previously led to account cross-talk, unlike relying on default browser cookie jar behavior. |
| **Hybrid Onboarding Gating (Mandatory OTP + Automated Session Handoff)** | Enforces an upfront 6-digit email OTP barrier to guarantee 100% inbox validity, defend domain email deliverability, and block Sybil bot account creation. Upon successful verification, an automated session handoff admits the learner directly to `/dashboard`, eliminating redundant password re-entry fatigue and recovering an estimated 8% funnel drop-off compared to Pure Hard Gating. |
| **Automated Background Logout Retries (`keepalive: true` + Exponential Backoff)** | Eliminates false-positive logout claims during transient sub-second mobile network drops (common on Nigerian cellular connections) by executing an automated 3-attempt retry loop without forcing manual clicks. Configures `keepalive: true` to ensure requests complete even if the browser window lifecycle changes, with a hard fail-safe security banner if all retries fail. |
| **Global Multi-Device Session Invalidation on Password Reset (`prisma.session.deleteMany`)** | Immediately evicts all active sessions across every browser, phone, and terminal upon successful password reset. Adheres to zero-trust defense standards in banking, healthcare, and defense, neutralizing compromised session tokens instantly, rather than only clearing the local browser cookie. |
| **Indistinguishable Generic Authentication Errors** | Returns identical HTTP 401 error messages ("Invalid email or password.") with balanced timing for nonexistent emails and incorrect passwords, eliminating user enumeration vulnerabilities that enable targeted credential stuffing and spear-phishing. |
| **Two-Stage Account Deletion (30-Day Soft Grace Period + Cascade Hard Purge)** | Complies with the Nigeria Data Protection Act (NDPA) 2023 and GDPR Art. 17 "Right to be Forgotten". Immediate pseudonymization (email scrambled, credentials nulled, sessions wiped) locks the account instantly, while a 30-day grace period balances learner rights against fraud recovery before a scheduled cron job hard-deletes the relational tree. |
| **Delinked Permanent Financial Record Retention (`userId = null`)** | Adheres to statutory tax, accounting, and anti-fraud record retention obligations by permanently preserving `Payment`, `PaymentEvent`, and `Entitlement` rows while setting `userId = null` upon account purge. This reconciles legal compliance with data erasure rights, rather than unlawfully deleting financial transaction history or retaining personal data indefinitely. |
| **Native React State & URL Params over External Global State** | Preserves Next.js Server Component performance, reduces client JavaScript bundle size, and simplifies cognitive load by removing Zustand after evaluation. Ephemeral UI state (such as passing an email to a reset form) is handled natively via URL query parameters, avoiding premature abstraction and client-side lock-in. |
| **Server-Side Role-Based Access Control (RBAC) on Route Boundaries** | Enforces authorization directly in Next.js Server Components and API route handlers (`user.role === 'ADMIN'`). Returns structured HTTP 403 Forbidden responses to unauthorized learners and prevents client-side bypasses, rather than relying on cosmetic UI hidden-state guards. |

---

## 4. Getting Started

### Prerequisites

* Node.js 20.x or newer (Node 24 recommended).
* PostgreSQL 18 with the `vector` extension available.
* A Google Account with 2-Step Verification and a generated 16-character App Password (for Gmail SMTP).

### Setup Commands

```bash
# 1. Clone the repository
git clone https://github.com/ChijiokeUhegwu/Nucleobridge.git
cd Nucleobridge

# 2. Install dependencies
npm install

# 3. Create the local environment file
# Windows PowerShell:
Copy-Item .env.example .env
# macOS/Linux:
cp .env.example .env
```

**Step 4.** Open `.env` and set `DATABASE_URL` and `DIRECT_DATABASE_URL` to your PostgreSQL database. For local setups, create the database first (e.g., `createdb nucleobridge`).

**Step 5.** Configure Gmail SMTP credentials and operational secrets in `.env`:
```ini
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=465
EMAIL_SERVER_SECURE="true"
EMAIL_SERVER_USER="your-gmail-address@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-char-app-password"
EMAIL_FROM="NucleoBridge <your-gmail-address@gmail.com>"
CRON_SECRET="your-high-entropy-cron-secret-key"
```

```bash
# 6. Apply existing migrations
npx prisma migrate dev

# 7. Start the development server
npm run dev

# 8. Start Prisma Studio (in a separate terminal)
npx prisma studio
```

Open `http://localhost:3000`. The application views are accessible at:

### Route Directory

* **Authentication:**
  * Registration: `http://localhost:3000/auth?view=signup`
  * Sign In: `http://localhost:3000/auth?view=login`
  * Email Verification: `http://localhost:3000/auth?view=verify-email&email=learner@example.com`
  * Password Reset Request: `http://localhost:3000/auth?view=forgot-password`
  * Password Reset Completion: `http://localhost:3000/auth?view=reset-password&token=...`
* **Learner Area:**
  * Learner Dashboard: `http://localhost:3000/dashboard` (features case study tracks, resilient signout, and account deletion Danger Zone)
  * Privacy Policy: `http://localhost:3000/privacy`
  * Terms of Service: `http://localhost:3000/terms`
* **Administrative Portal (Admin Role Required):**
  * Admin Overview: `http://localhost:3000/admin`
  * Case Study Access Tier Manager: `http://localhost:3000/admin/case-studies`
* **API Endpoints:**
  * User Registration: `POST /api/auth/signup`
  * Password Login: `POST /api/auth/login-password`
  * Email OTP Verification: `POST /api/auth/verify`
  * Resilient Sign Out: `POST /api/auth/signout`
  * Password Reset Request: `POST /api/auth/forgot-password`
  * Password Reset Completion: `POST /api/auth/reset-password`
  * Current Session Identity: `GET /api/auth/me`
  * Self-Service Account Deletion: `POST /api/user/delete`
  * Scheduled Account Purge Cron: `POST /api/cron/purge-accounts` (Protected by `CRON_SECRET`)
  * Admin Case Study Tier Update: `POST /api/admin/case-studies/update-tier` (Protected by `ADMIN` role)

---

## 5. Environment Variables

| Variable | What it is for | Current use |
|---|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection string used by the Prisma client. | Used in `prisma/schema.prisma` and runtime database queries. |
| `DIRECT_DATABASE_URL` | Direct, unpooled PostgreSQL connection string used for schema migrations. | Used in `prisma/schema.prisma` for migrations. |
| `NEXTAUTH_URL` | Base application URL used to construct verification and password-reset links. | Used in `src/lib/mail.ts` and route handlers. Defaults to `http://localhost:3000`. |
| `CRON_SECRET` | Bearer token secret authenticating scheduled background jobs (e.g. account purge). | Checked in `Authorization` header by `POST /api/cron/purge-accounts`. |
| `SIGNUPS_ENABLED` | Emergency kill-switch that halts new user registrations when set to `"false"`. | Evaluated at the start of `POST /api/auth/signup`. |
| `EMAIL_SERVER_HOST` | SMTP server host. | Used in `src/lib/mail.ts` (e.g., `smtp.gmail.com`). |
| `EMAIL_SERVER_PORT` | SMTP port. | Used in `src/lib/mail.ts` (`465` for SSL/TLS, `587` for STARTTLS). |
| `EMAIL_SERVER_SECURE` | Boolean flag indicating whether TLS should be used immediately. | Read by `src/lib/mail.ts`. |
| `EMAIL_SERVER_USER` | SMTP authentication username. | Used in `src/lib/mail.ts`. When missing, mail falls back to server console logs. |
| `EMAIL_SERVER_PASSWORD` | SMTP authentication password (e.g., Google App Password). | Used in `src/lib/mail.ts`. |
| `EMAIL_FROM` | Sender address appearing in outgoing emails. | Used in `src/lib/mail.ts`. |
| `FLUTTERWAVE_PUBLIC_KEY` | Public key for client-side Flutterwave checkout redirects. | Reserved; payment implementation begins in Milestone 4. |
| `FLUTTERWAVE_SECRET_KEY` | Secret key for server-to-server transaction verification and refund scripts. | Reserved. |
| `FLUTTERWAVE_WEBHOOK_HASH` | Cryptographic secret for validating incoming payment webhooks. | Reserved. |
| `FREE_MODEL_API_KEY` | Provider API key for the free AI mentor model pool. | Reserved; AI mentor implementation begins in Milestone 6. |
| `PAID_MODEL_API_KEY` | Provider API key for the paid AI mentor model pool. | Reserved. |
| `EMBEDDING_MODEL_API_KEY` | Provider API key for vector content chunk embeddings. | Reserved. |
| `DATASET_STORAGE_URL` | Base endpoint for private bioinformatics dataset storage. | Reserved. |
| `DATASET_STORAGE_SECRET_KEY` | Secret key for generating signed dataset download URLs. | Reserved. |
| `RECONCILE_JOB_SECRET` | Bearer token authenticating the scheduled payment reconcile cron job. | Reserved. |

---

## 6. What This Deliberately Does Not Do

* **It does not use stateless JWT cookies.** Sessions rely on server-side database records in the `Session` table. Stateless JWTs were rejected to guarantee instantaneous server-side revocation on signout, password reset, and account deletion without complex distributed token blacklisting.
* **It does not keep third-party client state management libraries.** Zustand was evaluated and intentionally uninstalled following testing. Cross-component state is handled natively via URL query parameters and React props, avoiding client bundle bloat and preserving Next.js Server Components.
* **It does not store credit card or bank credentials.** In accordance with `security-privacy.md` and `payments.md`, all financial data is handled externally by Flutterwave. Even under session compromise, financial credentials cannot be exfiltrated from the platform.
* **It does not allow learners to cancel or sign back into accounts pending deletion.** Requesting account deletion starts a 30-day grace period during which the account is immediately locked and scrambled. The application provides no self-service reactivation button; accounts progress irreversibly toward hard purge.
* **It does not promise instant backup purging within 24 hours.** Because database snapshots are immutable copies rotated on a 7-day schedule, the Privacy Policy explicitly documents that deleted data may persist in encrypted backups for up to 7 days before being overwritten (`docs/privacy-draft-with-broken-promise.md`).
* **It does not expose administrative views or case study tier controls to learners.** Non-admin users are strictly barred from `/admin/*` via server-side session checks returning HTTP 403 Forbidden.
* **It does not execute in-browser bioinformatics code.** There is no Pyodide, WebR, Biowasm, Web Worker execution harness, virtual filesystem (MEMFS), or check runner built yet.
* **It does not implement paid path monetization.** There is no `assertStepAccess` guard, Flutterwave checkout redirect, webhook signature verification, `fulfillPayment`, or reconcile cron job.
* **It does not implement the content import pipeline or vector search.** `ContentChunk` vector columns exist in the database, but no chunking, embedding, or pgvector retrieval queries have been written.

---

## 7. Known Defects

1. **Critical: Pending database migration for nullable `Entitlement.userId` (`onDelete: SetNull`).**
   * *Location:* [`prisma/schema.prisma:290-305`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/prisma/schema.prisma#L290-L305), [`task-05-sessions-compliance-defence/docs/retention-matrix.md:16,215-225`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-05-sessions-compliance-defence/docs/retention-matrix.md#L16-L225), `.agents/rules/decisions.md:R3`.
   * *Impact:* Under owner retention decision R3 (13 November 2026), membership rows (`Entitlement`) must survive learner account purges with `userId` set to `NULL` to preserve statutory audit trails. While `prisma/schema.prisma` was updated, the corresponding migration has not yet been applied to the live PostgreSQL database. Running the hard delete transaction on an account with an active `Entitlement` will fail or attempt foreign key cascade until `npx prisma migrate dev --name make_entitlement_user_nullable` is approved and applied.

2. **High: Stale `LoginCode` records lack an automated daily purge job.**
   * *Location:* [`prisma/schema.prisma:161-171`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/prisma/schema.prisma#L161-L171), [`task-05-sessions-compliance-defence/docs/retention-matrix.md:49-50`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-05-sessions-compliance-defence/docs/retention-matrix.md#L49-L50).
   * *Impact:* Single-use 10-minute email sign-in codes expire logically at runtime, but expired rows are never cleaned up automatically from PostgreSQL. PRD Section 8 mandates a daily cleanup job for expired login codes. Without a scheduled runner, the `LoginCode` table will accumulate zombie rows indefinitely.

3. **High: Unkeyed IP sliding-window rate limiting in memory resets on process restart.**
   * *Location:* [`src/lib/rate-limit.ts:13-24`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/src/lib/rate-limit.ts#L13-L24), [`src/app/api/admin/case-studies/update-tier/route.ts:20-23`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/src/app/api/admin/case-studies/update-tier/route.ts#L20-L23).
   * *Impact:* Rate-limiting counters live in a Node.js process memory `Map`. Process restarts reset counters to zero, and serverless instances do not share state. Upstream reverse proxy ingress headers must be sanitized before production deployment to prevent header spoofing.

4. **Medium: Cron endpoint secret validation lacks IP restriction or signed JWT authorization.**
   * *Location:* [`src/app/api/cron/purge-accounts/route.ts:12-22`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/src/app/api/cron/purge-accounts/route.ts#L12-L22).
   * *Impact:* `POST /api/cron/purge-accounts` relies strictly on a shared secret bearer token (`Authorization: Bearer <CRON_SECRET>`). If the environment secret is leaked or omitted, the endpoint could be invoked by unauthorized actors. Adding IP allowlisting or cloud provider IAM signature verification is required before production deployment.

5. **Medium: Gmail SMTP rate limits and mailbox connection caps.**
   * *Location:* [`src/lib/mail.ts:7-27`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/src/lib/mail.ts#L7-L27).
   * *Impact:* The application uses Gmail SMTP for transactional emails. Google enforces strict daily sending limits (typically 500 emails/day) and aggressive rate limits on concurrent SMTP connections. A surge in registrations will trigger Gmail SMTP blocking. Production deployment requires transitioning to a dedicated transactional email service provider (e.g., Resend, Postmark, or Amazon SES).

6. **Low: Absence of automated continuous integration regression test suite.**
   * *Location:* `package.json:6-14`.
   * *Impact:* `package.json` contains no test script or framework (such as Vitest or Jest). Security features—such as multi-device session revocation, cookie replacement, RBAC rejection, and cascade purge idempotency—are verified manually and documented in evidence files, but are not guarded by automated regression test gates in CI.
