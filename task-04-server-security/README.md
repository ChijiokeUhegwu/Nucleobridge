# Task 04: Server Security

## 1. What This Is

NucleoBridge is a freemium, browser-based bioinformatics learning platform for self-directed learners on low-resource hardware, and the one thing that must work is that paid lesson content reaches only learners with an active PRO entitlement.

## 2. Status

This task record covers backend authentication security, server-side input validation, password cryptography, database migration integrity, breached-password defense, rate limiting, and the asynchronous email verification flow. It does not cover the in-browser WebAssembly runtime (Pyodide, WebR, Biowasm), check runner execution, or payment gateways.

| State | Area | What is true now |
|---|---|---|
| **Finished** | Database Schema & Migrations | PostgreSQL 18 holds the confirmed `User` model with `firstName`, `lastName`, `passwordHash`, `emailVerified`, `emailVerificationCodeHash`, `emailVerificationExpiresAt`, and `emailVerifiedAt` (`prisma/schema.prisma:109-130`). The `PasswordResetToken` table is defined. Forward-only migrations are tracked in `prisma/migrations/` and up-to-date (`20261030105045_init_auth` through `20261107091222_add_email_verified_at`). Safe three-step schema evolution, drift detection, and manual migration execution rules are proven and documented (`docs/migrations.md`, `docs/schema.md`, `evidence/03`-`06`). |
| **Finished** | Password Hashing & Inversion Principle | Passwords are authenticated and hashed using Argon2id via `@node-rs/argon2` (`src/lib/auth.ts:19-40`) using OWASP baseline parameters (19 MiB memory, timeCost 2, parallelism 1). Salting is unique and automatic per hash (`evidence/07`). Algorithm benchmarks prove that Argon2id consumes ~153.7 ms per hash while SHA-256 consumes ~0.89 ms (`evidence/08`), validating the inversion principle: adding a negligible ~154 ms delay to legitimate sign-in cripples offline brute-force cracking rigs (`docs/hashing.md`). Legacy bcrypt hashes are safely verified for backward compatibility (`src/lib/auth.ts:45-53`). |
| **Finished** | Boundary Validation Placement | Server-side validation sits strictly at the HTTP request boundary using a unified Zod schema (`src/lib/auth-validation.ts:13-39`, `src/app/api/auth/signup/route.ts:27-38`). Raw payloads are parsed before reaching any database queries, business logic, or expensive cryptography (`docs/validation-placement.md`). Validation enforces 2-to-50 character name lengths, RFC 5322 email patterns, and password complexity. Cold start takes ~9.97 ms; warm requests parse in sub-millisecond times (0.25–0.83 ms) (`evidence/11`). Direct API requests that bypass the client UI are rejected immediately (`evidence/12`). |
| **Finished** | Input Normalization | Email addresses are strictly trimmed and converted to lowercase before database query lookups or writes (`src/app/api/auth/signup/route.ts:44`, `src/app/api/auth/verify/route.ts:16`). Passwords have leading and trailing whitespace trimmed to prevent accidental paste errors while preserving user-selected casing complexity (`docs/password-trimming.md`, `evidence/09-to-10`). |
| **Finished** | Breached-Password Defense (k-Anonymity) | The signup route integrates the Have I Been Pwned (HIBP) API using k-Anonymity (`src/lib/auth.ts:98-141`). The server hashes the password locally via SHA-1, dispatches only the 5-character prefix over HTTPS, and checks the returned suffix range locally (`docs/breach-check.md`). Plaintext passwords and full hashes are never transmitted externally. Compromised credentials are rejected with a clear 400 error (`evidence/15`). |
| **Finished** | Sliding-Window Rate Limiting | Rate limiting protects auth endpoints with a sliding window of 5 requests per 15 minutes (`src/lib/rate-limit.ts:3-13`). IP addresses are extracted with `x-forwarded-for` proxy handling (`src/lib/rate-limit.ts:15-24`). Rate limit triggering (`evidence/13`) and header spoofing vulnerabilities (`evidence/14`) were investigated; multi-keying and external storage requirements are documented (`docs/rate-limiting.md`). |
| **Finished** | Ephemeral OTP Email Verification | Registration generates a 6-digit numeric OTP via `crypto.randomInt(100000, 1000000)` (`src/lib/auth.ts:68-70`). The database persists only the SHA-256 hash (`emailVerificationCodeHash`) and an explicit 10-minute expiry timestamp (`emailVerificationExpiresAt`). Verification (`POST /api/auth/verify`) matches hashes, rejects expired codes (`evidence/20`), rejects wrong codes (`evidence/21`), and nullifies the hash and timestamp upon successful verification to prevent reuse (`evidence/22`). |
| **Finished** | Asynchronous Background Email Delivery | Outgoing email is decoupled from the HTTP response using unawaited background promises (`src/app/api/auth/signup/route.ts:104`, `src/app/api/auth/verify/route.ts:89`). Registration latency with inline SMTP took 2959.55 ms; background job dispatch reduced latency to 1414.25 ms (52.2% faster) (`evidence/18`, `docs/email-verification.md`). Nodemailer is configured for Gmail SMTP with an authenticated 16-character App Password (`evidence/16`-`17`). |
| **Finished** | Onboarding Welcome Email | Successful verification triggers an asynchronous welcome email (`src/lib/mail.ts:186-270`). The email uses approved marketing copy, a personalized greeting (`Hi [First Name],`), a platform overview, and a primary call-to-action button linking to `/auth?view=login` (`docs/email-copy.md`). Layout strictly adheres to semantic design tokens (`--color-surface`, `--color-primary`, `--color-outline-variant`, `--shadow-soft`, and DM Sans) (`evidence/23`). |
| **Finished** | Security Controls Decision Record | Four considered controls were evaluated and explicitly deferred for Milestone 1: Multi-Factor Authentication (TOTP), Distributed Redis-backed rate limiting, Interactive CAPTCHAs, and Edge WAF geoblocking. Detailed rationale, business trade-offs, and future adoption triggers are documented in `docs/security-controls.md`. |
| **Half done** | Session Security | The session cookie set after signup remains an unsigned user ID (`nb_session_user_id` in `src/lib/session.ts:4-33`). No cryptographic signature or session table lookup protects the cookie from tampering. Transition to signed JWTs or database-backed session tokens is slated for Task 05. See defect 1. |
| **Half done** | In-Memory Rate Limiting Durability | Rate limit counters are stored in an in-memory JavaScript `Map` (`src/lib/rate-limit.ts:13`). Counters reset on server restart and do not coordinate across multiple serverless instances or containers. See defect 2. |
| **Half done** | Terms Acceptance Persistence | Registration validates `terms: true` via Zod (`src/lib/auth-validation.ts:28`), but the `User` table does not persist `termsAcceptedAt` or `termsVersion`. See defect 3. |
| **Not started** | In-browser WebAssembly runtime | Pyodide (Python), WebR (R), Biowasm (samtools), Web Worker execution harness, and automated check grading. |
| **Not started** | Five learning features | Guided step page, check runner, autosave/resume and cross-device sync, hint ladder with AI mentor, and progress map. |
| **Not started** | Paid path & monetization | `assertStepAccess` guard, Flutterwave checkout redirect, webhook signature verification, `fulfillPayment`, reconcile cron job, and PRO entitlement enforcement. |
| **Not started** | Content pipeline & vector search | Authored step pack parser, chunking pipeline, pgvector similarity search, and Socratic AI mentor prompt boundaries. |
| **Not started** | "Delete my data" self-service | One-click user deletion button in account settings that removes learner records while anonymizing payment receipts. |

**What this folder contains.** `docs/` holds the architecture documentation, security rationale, and experiments: `schema.md`, `database-state.md`, `migrations.md`, `hashing.md`, `validation-placement.md`, `password-trimming.md`, `breach-check.md`, `rate-limiting.md`, `email-verification.md`, `email-copy.md`, and `security-controls.md`. `evidence/` holds the entity-relationship drawing, database state captures, migration logs, drift transcripts, timing benchmarks, video recordings, form attack audits, error UI captures, and rendered email screenshots. The application code modified or created by this task lives in `src/lib/` (`auth.ts`, `auth-validation.ts`, `rate-limit.ts`, `mail.ts`, `session.ts`, `prisma.ts`), `src/app/api/auth/` (`signup/route.ts`, `verify/route.ts`), and `prisma/` (`schema.prisma`, `migrations/`).

**Evidence index.**
* `evidence/01-schema-drawing.jpg`: Entity-relationship drawing of User, Session, Payment, PaymentAttempt, and DocumentChunk.
* `evidence/02-database-state-before.png`: Prisma Studio inspection showing pre-existing database tables and relational schema.
* `evidence/03-initial-migration.txt`: Terminal output from running `npx prisma migrate dev --name init_auth`.
* `evidence/04-required-column-failure.txt`: Terminal log showing PostgreSQL failure when attempting to add a non-nullable column without a default value to an existing populated table.
* `evidence/05-required-column-three-steps.txt`: Demonstration of the safe three-step schema migration: add optional column, backfill data, and alter to required.
* `evidence/06-drift-error.txt`: Prisma Client drift error log demonstrating query failure when schema definitions desynchronize from physical database state.
* `evidence/07-hash-twice-different.txt`: Proof that Argon2id generates unique salts on every invocation, producing different hash strings for identical password inputs.
* `evidence/08-timing-argon-vs-sha.txt`: Cryptographic timing benchmark: Argon2id (153.72 ms) vs. SHA-256 (0.89 ms) and the Inversion Principle.
* `evidence/09-to-10-email-case-normalised-and-password-trim-working.mp4`: Screen recording demonstrating whitespace trimming on passwords and lowercase normalization on email input.
* `evidence/11-validation-timing.txt`: Zod schema execution latency: 9.97 ms cold start, 0.25–0.83 ms warm execution.
* `evidence/12-direct-request-before-and-after.txt`: Direct cURL request transcript showing server boundary rejection of malformed requests that bypass the client.
* `evidence/13-rate-limit-triggered.png`: UI screenshot demonstrating rate limit lockout after 5 rapid requests: "Too many attempts. Please try again in 15 minutes."
* `evidence/14-rate-limit-defeated.png`: Screenshot showing how an attacker spoofing the `x-forwarded-for` header bypassed basic IP rate limits.
* `evidence/15-breach-check-rejection.png`: UI screenshot of k-anonymity Have I Been Pwned rejection: "This password has been compromised in a known data breach. Please choose a safer password."
* `evidence/16-smtp-failure.txt`: Terminal log of Google SMTP rejection `535-5.7.8 BadCredentials` when using standard Google account credentials.
* `evidence/17-smtp-success.txt`: Server terminal log showing successful Gmail SMTP dispatch after authenticating with a 16-character Google App Password.
* `evidence/18-registration-timing-sync-vs-job.txt`: Performance benchmark comparing inline synchronous email dispatch (2959.55 ms) vs. background asynchronous job dispatch (1414.25 ms).
* `evidence/19-verification-row.png`: Prisma Studio capture of newly registered user showing unverified state, 64-character SHA-256 OTP hash, and active 10-minute expiry timestamp.
* `evidence/20-verification-expired.png`: UI screenshot capturing rejection of expired verification code: "This verification code has expired. Please request a new one."
* `evidence/21-verification-wrong-code.png`: UI screenshot capturing rejection of an invalid verification code: "Invalid verification code."
* `evidence/22-verification-code-reused.png`: UI screenshot capturing rejection of a previously verified code: "This verification code has already been used."
* `evidence/23-rendered-email.png`: High-resolution render of the production onboarding welcome email styled with semantic design tokens and DM Sans typography.

---

## 3. The Stack, and Why

| Choice | Why this, rather than the alternative |
|---|---|
| **Argon2id via `@node-rs/argon2`** | Winner of the Password Hashing Competition. Provides memory-hard defense against GPU and ASIC cracking rigs. Uses OWASP baseline parameters (19 MiB memory, timeCost 2, parallelism 1) taking ~154 ms per hash, rather than outdated MD5/SHA-256 or pure JS bcrypt implementations. |
| **Zod Schema Validation at the Route Boundary** | Validates the complete payload shape before database queries or cryptography run, inferring static TypeScript types and preventing Bcrypt/Argon2 CPU exhaustion attacks, rather than scattering fragile manual `if` statements across route handlers. |
| **Have I Been Pwned (HIBP) k-Anonymity API** | Evaluates passwords against 800M+ compromised credentials without ever transmitting the plaintext password or full hash across the network. Only a 5-character SHA-1 prefix is sent; verification occurs locally on the server. |
| **SHA-256 Hashing for 6-Digit Verification Codes** | Verification codes are short-lived (10 mins) and rate-limited. Storing the SHA-256 hash (`emailVerificationCodeHash`) prevents plaintext exposure in database dumps or query logs, without imposing the CPU overhead of Argon2id on high-frequency verification lookups. |
| **Asynchronous Non-Blocking Background Email Delivery** | Outgoing SMTP calls run concurrently via unawaited background promises (`void sendEmail().catch(...)`), isolating the user's HTTP request from third-party SMTP latency and cutting registration response times by 52.2% (from 2960 ms to 1414 ms). |
| **Prisma ORM with PostgreSQL 18 & Forward-Only Migrations** | Strongly typed data access with parameterized SQL queries that eliminate SQL injection. Migrations are strictly forward-only and executed manually to prevent catastrophic automated data loss. |
| **In-Memory Sliding Window Rate Limiting** | Zero-latency, in-process rate limiting (5 attempts per 15 minutes) with zero infrastructure dependencies for early development, rather than introducing third-party Redis complexity prematurely. |
| **Semantic Token Inline Styles for HTML Emails** | HTML email rendering engines (Gmail, Apple Mail, Outlook) strip `<style>` blocks and CSS variables. Inlining brand colors derived directly from `task-01-design-system/main-tokens.css` ensures 100% brand consistency across all mail clients. |

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

**Step 5.** Configure Gmail SMTP credentials in `.env`:
```ini
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=465
EMAIL_SERVER_SECURE="true"
EMAIL_SERVER_USER="your-gmail-address@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-char-app-password"
EMAIL_FROM="NucleoBridge <your-gmail-address@gmail.com>"
```
*(If credentials contain placeholder text, the mail utility safely mocks email delivery by logging verification codes directly to the terminal).*

```bash
# 6. Apply existing migrations
npx prisma migrate dev

# 7. Start the development server
npm run dev

# 8. Start Prisma Studio (in a separate terminal)
npx prisma studio
```

Open `http://localhost:3000`. The auth views are accessible at:
* Registration: `http://localhost:3000/auth?view=signup`
* Sign In: `http://localhost:3000/auth?view=login`
* Email Verification: `http://localhost:3000/auth?view=verify-email&email=learner@example.com`
* Password Reset Request: `http://localhost:3000/auth?view=forgot-password`
* Password Reset Completion: `http://localhost:3000/auth?view=reset-password&token=...`

---

## 5. Environment Variables

| Variable | What it is for | Current use |
|---|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection string used by the Prisma client. | Used in `prisma/schema.prisma` and runtime database queries. |
| `DIRECT_DATABASE_URL` | Direct, unpooled PostgreSQL connection string used for schema migrations. | Used in `prisma/schema.prisma` for migrations. |
| `NEXTAUTH_URL` | Base application URL used to construct verification and password-reset links. | Used in `src/lib/mail.ts` and route handlers. Defaults to `http://localhost:3000`. |
| `EMAIL_SERVER_HOST` | SMTP server host. | Used in `src/lib/mail.ts` (e.g., `smtp.gmail.com`). |
| `EMAIL_SERVER_PORT` | SMTP port. | Used in `src/lib/mail.ts` (`465` for SSL/TLS, `587` for STARTTLS). |
| `EMAIL_SERVER_SECURE` | Boolean flag indicating whether TLS should be used immediately. | Read by `src/lib/mail.ts`. |
| `EMAIL_SERVER_USER` | SMTP authentication username. | Used in `src/lib/mail.ts`. When missing, mail falls back to server console logs. |
| `EMAIL_SERVER_PASSWORD` | SMTP authentication password (e.g., Google App Password). | Used in `src/lib/mail.ts`. |
| `EMAIL_FROM` | Sender address appearing in outgoing emails. | Used in `src/lib/mail.ts`. |
| `SIGNUPS_ENABLED` | Emergency kill-switch that halts new user registrations when set to `"false"`. | Evaluated at the start of `POST /api/auth/signup`. |
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

* **It does not implement Multi-Factor Authentication (TOTP/WebAuthn).** High-friction 2FA is deferred to prevent onboarding drop-off during qualitative learner feedback (`docs/security-controls.md`).
* **It does not use distributed Redis rate limiting.** Counters reside in a local Node.js `Map`; multi-instance coordination is deferred until serverless cloud deployment.
* **It does not implement interactive CAPTCHAs.** Third-party challenge widgets were rejected to avoid tracking scripts, privacy conflicts under the NDPA, and accessibility degradation on low-resource devices.
* **It does not provision an Edge WAF or IP Geoblocking.** Network-level filtering was omitted to prevent false-positive lockouts on emerging-market mobile NAT networks.
* **It does not execute in-browser bioinformatics code.** There is no Pyodide, WebR, Biowasm, Web Worker harness, or check runner built yet.
* **It does not build the five learning features.** Guided step delivery, instant grading, autosave/sync, hint ladders with AI mentor, and progress maps are subsequent milestones.
* **It does not implement paid path monetization.** There is no `assertStepAccess` guard, Flutterwave payment redirect, webhook verification, or reconcile job.
* **It does not implement the content import pipeline or vector search.** `ContentChunk` vector columns exist in the database, but no chunking, embedding, or pgvector retrieval queries have been written.
* **It does not persist terms acceptance timestamps.** Registration validates `terms: true`, but no `termsAcceptedAt` column is saved to the database.

---

## 7. Known Defects

1. **Critical: Session cookies store an unsigned, unencrypted user ID.**
   * *Location:* [`src/lib/session.ts:4-33`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/src/lib/session.ts#L4-L33)
   * *Impact:* The application sets `nb_session_user_id` containing the raw user UUID upon login and registration. [`src/app/api/auth/me/route.ts`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/src/app/api/auth/me/route.ts) trusts this cookie value directly without cryptographic signature or database session verification. Anyone who discovers another user's ID can forge the cookie and achieve full account takeover. Migrating to signed JWTs or database-backed sessions is mandatory in Task 05.

2. **High: In-memory rate limiting state is lost on process restart.**
   * *Location:* [`src/lib/rate-limit.ts:13`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/src/lib/rate-limit.ts#L13)
   * *Impact:* Rate-limiting counters live in a JavaScript `Map`. Restarting the Node server resets all counters to zero. In a serverless deployment (such as Vercel), each function invocation may run in an isolated environment with a fresh map, rendering IP throttling ineffective against distributed brute-force attacks.

3. **High: Terms acceptance is not recorded in the database.**
   * *Location:* [`src/app/api/auth/signup/route.ts:27-38`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/src/app/api/auth/signup/route.ts#L27-L38)
   * *Impact:* The registration schema validates that `terms: true` was checked, but [`prisma/schema.prisma`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/prisma/schema.prisma#L109-L130) has no `termsAcceptedAt` or `termsVersion` field. The platform cannot legally prove which learner accepted which version of the terms. Adding this column requires a dedicated migration approved by the owner.

4. **Medium: Rate limiting is vulnerable to IP spoofing via `x-forwarded-for`.**
   * *Location:* [`src/lib/rate-limit.ts:15-24`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/src/lib/rate-limit.ts#L15-L24)
   * *Impact:* The current implementation trusts the first IP in the `x-forwarded-for` header. As proven in [`evidence/14-rate-limit-defeated.png`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-04-server-security/evidence/14-rate-limit-defeated.png), an attacker sending arbitrary `x-forwarded-for` values bypasses the 5-request limit. In production, the reverse proxy must strip untrusted client-supplied headers and only append verified ingress IPs.

5. **Medium: Gmail SMTP rate limits and quota caps.**
   * *Location:* [`src/lib/mail.ts:7-27`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/src/lib/mail.ts#L7-L27)
   * *Impact:* The application uses Gmail SMTP for transactional emails. Google enforces strict daily sending limits (typically 500 emails/day for standard accounts) and aggressive rate limits on concurrent SMTP connections. A sudden surge in signups will trigger Google SMTP blocking. Production deployment requires transitioning to a dedicated transactional email service provider (e.g., Resend, Postmark, or Amazon SES).

6. **Low: Verification codes use unsalted SHA-256 instead of keyed HMAC.**
   * *Location:* [`src/lib/auth.ts:64-66`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/src/lib/auth.ts#L64-L66)
   * *Impact:* `hashToken` uses unsalted SHA-256 (`crypto.createHash('sha256').update(token).digest('hex')`). Because a 6-digit numeric OTP has only $1,000,000$ possibilities, an attacker with read access to the database can compute a complete lookup table in under 50 milliseconds. While mitigated by the 10-minute expiry window, 5-attempt rate limit, and atomic nullification, adopting an HMAC keyed with a server-side secret (`crypto.createHmac('sha256', secret)`) would eliminate offline dictionary enumeration entirely.

7. **Low: Absence of automated continuous integration tests.**
   * *Location:* `package.json:6-14`
   * *Impact:* `package.json` contains no test script or framework (such as Vitest or Jest). Security features—such as password hashing parity, k-anonymity matching, Zod schema validation, and OTP expiration checks—are verified manually and documented in evidence files, but are not guarded by automated regression test gates in CI.

