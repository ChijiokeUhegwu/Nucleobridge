# NucleoBridge

NucleoBridge is a freemium, browser-based bioinformatics learning platform for self-directed learners on low-resource hardware. The target product runs real Python, R, and command-line tools in the browser through WebAssembly, grades steps with deterministic checks, autosaves and syncs progress, and offers a hint ladder that ends with an AI mentor built to withhold the final answer. PRO is a manually renewed time pass.

**Published Article:** [My Design System Was Just a CSS File (Until I Gave It a Boundary)](https://medium.com/@chijiokeuhegwu/my-design-system-was-just-a-css-file-until-i-gave-it-a-boundary-dad27859a94c)

The repository currently contains the **authentication, security, compliance, and admin foundation** for that product. The learning runtime, paid access path, content pipeline, and AI mentor are not built yet. The critical product invariant — paid lesson content reaches only learners with an active PRO entitlement — is therefore **not implemented or testable yet**.

---

## 1. Current State (14 November 2026)

| Area | State | What is true now |
|---|---|---|
| **Design system** — [task-01](task-01-design-system/README.md) | Finished | Semantic CSS tokens generated from Figma JSON: 53 light roles, 53 dark roles, 15 typography styles, and 3 elevation shadows. The compiler loads primitives into memory and emits zero primitive variables. The app uses CSS Modules, not Tailwind. |
| **Repository and database** — [task-02](task-02-repository-and-scaffold/README.md) | Finished with open defects | Next.js 14 App Router, TypeScript strict mode, Prisma 5, PostgreSQL with pgvector, a checked-in migration history, and a Prisma client singleton. The schema now has 24 models and 14 enums, including owner-approved additions for password reset, server-side sessions, account deletion, RBAC, and retained payment records. |
| **Client-side auth validation** — [task-03](task-03-client-validation/README.md) | Finished with open defects | One `/auth` page with login, signup, forgot-password, and reset-password views. Signup validates names, email, password strength, and terms acceptance, with a visible `aria-disabled` submit button and inline errors. This task covers auth forms only, not the lesson check runner. |
| **Server security** — [task-04](task-04-server-security/README.md) | Finished with open defects | Zod validation at route boundaries, Argon2id password hashing, HIBP breached-password checks, 5-requests-per-15-minutes rate limiting, SHA-256-hashed six-digit email codes with a ten-minute expiry, and background email delivery. |
| **Sessions, compliance, and RBAC** — [task-05](task-05-sessions-compliance-defence/README.md) | Finished with open defects | Server-side sessions with SHA-256-hashed tokens, `HttpOnly`/`SameSite=Lax`/`Secure` cookies, global session revocation on password reset, generic authentication errors, a 30-day account-deletion grace period with a purge job, retained-but-delinked payment records, and an owner-approved admin case-study tier manager. |
| **Browser runtime** | Not started | No Web Worker, Pyodide, WebR, Biowasm, virtual filesystem, or check runner. |
| **Five learning features** | Not started | No guided step page, check my work, autosave/resume and sync, hint ladder, or progress map. |
| **Paid path** | Not started | No `assertStepAccess`, paid step routes, Flutterwave checkout/webhook, `fulfillPayment`, reconcile job, or PRO enforcement. |
| **Content pipeline, vector search, and AI mentor** | Not started | The `ContentChunk.embedding` `vector(768)` column exists, but there is no importer, chunking, embedding, retrieval, mentor routing, or output filter. |
| **Instrumentation, owner scripts, and metrics** | Not started | No event recording, owner grant/revoke/refund scripts, or metrics review path. There is no metrics dashboard. |
| **Automated tests and CI** | Not started | `package.json` has no test script, there are no test files, and no CI workflow is committed. Security behaviour is verified manually and recorded in each task's `evidence/` folder. |
| **Production verification** | Not verified | No production build, deployment, managed PostgreSQL, real inbox, real Flutterwave payment, or physical 4 GB device run is recorded. |

### What works today

- Public home page at `/` with a hardcoded case-study preview. "Browse Catalog" points at `/catalog`, which does not exist yet.
- Auth at `/auth?view=login`, `?view=signup`, `?view=forgot-password`, `?view=reset-password`, and `?view=verify-email`. The old `/login`, `/signup`, `/forgot-password`, and `/reset-password` URLs redirect there.
- Password sign-in and six-digit email-code sign-in, email verification, forgot/reset password, signout, and a session lookup route.
- Server-side sessions: a 32-byte random token is sent in the `nb_session` cookie; only its SHA-256 hash is stored in PostgreSQL. Sessions expire after 30 days and stop working immediately when the user is deleted.
- The dashboard at `/dashboard`, the privacy and terms pages, and the admin area at `/admin` and `/admin/case-studies` for users with the `ADMIN` role.
- Account deletion: identity is anonymised, credentials and sessions are removed, the account is locked immediately, and a daily purge job hard-deletes learner rows after 30 days. Payment and entitlement rows survive without the learner link.
- Argon2id password hashing with the OWASP baseline (19 MiB, timeCost 2, parallelism 1), HIBP k-anonymity checks, Zod request validation, and a five-request/fifteen-minute rate limit on auth routes.
- Design-system integration: components consume semantic roles such as `--color-surface` and `--color-error`, not raw palette values.

### Not built yet

- WebAssembly execution, deterministic check grading, autosave/resume, cross-device sync, hint ladder, and progress map.
- Paid step access, Flutterwave payments, PRO entitlements, the paywall, and the billing page.
- Content import, chunking, embeddings, vector search, and the AI mentor.
- Instrumentation events, owner scripts, the feedback link, and automated tests/CI.
- A seed script. The home-page catalogue is still a hardcoded preview in `src/lib/catalog-preview.ts`.

---

## 2. Stack: Current and Planned

| Layer | Current state | Why this choice |
|---|---|---|
| **Framework and API: Next.js 14 App Router + TypeScript** | In use | One deployable holds the pages and server route handlers with shared types, rather than a separate SPA and API with CORS and a second deployment. |
| **Database: PostgreSQL + Prisma 5 + pgvector** | Schema and migrations in use against local PostgreSQL. Hosting provider is undecided. | Relational data and 768-dimensional content embeddings stay in one transactional engine; raw SQL is reserved for the vector column. |
| **Styling: semantic CSS tokens + CSS Modules** | In use | Preserves the light/dark token contract and keeps primitive palette values out of component code. There is no Tailwind build. |
| **Authentication: custom password + email-code flow, Argon2id, server-side sessions** | In use. This is not Auth.js and not a JWT session. | Passwords are hashed with a memory-hard algorithm; email codes and reset tokens are stored as SHA-256 hashes; database-backed sessions can be revoked instantly. |
| **Email: Nodemailer over SMTP** | In use for development and Gmail SMTP; missing credentials fall back to logging the code in the server terminal. Provider is undecided. | No email provider is chosen in the PRD or owner decisions, so generic SMTP keeps the provider replaceable. |
| **Payments: Flutterwave** | Chosen in the PRD, not implemented. Gateway endpoint, field, event, signature, and amount details remain unconfirmed. | Native Nigerian payment rails; hosted checkout redirect is the intended flow. |
| **Browser runtime: Web Worker + Pyodide, WebR, Biowasm** | Planned, not installed | Runs real tools in the browser without cloud containers or per-second VM costs. |
| **Editor: CodeMirror 6** | Planned, not installed | Smaller memory footprint than Monaco on 4 GB laptops. |
| **Client persistence: IndexedDB + service worker** | Planned, not built | Structured snapshots and cached lesson bundles larger than the LocalStorage limit. |
| **AI mentor: free/paid model routing + embeddings** | Schema only, no pipeline | Retrieval-grounded guidance with token ceilings and answer filters is a later milestone. |

---

## 3. Getting Started

### Prerequisites

- Node.js 20.x or newer.
- PostgreSQL with the `vector` extension available. The migration runs `CREATE EXTENSION IF NOT EXISTS "vector"`, so the database user must be allowed to create it, or the extension must already be installed.
- For real email delivery, an SMTP account with an app password. For local development, the mail helper can log codes to the terminal instead.

### Commands

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

**Step 4.** Open `.env` and set `DATABASE_URL` and `DIRECT_DATABASE_URL` to the PostgreSQL database, using the same database name in both. For a local PostgreSQL install, create that database first if it does not exist (for example, `createdb nucleobridge`). The two URLs may be the same locally; a managed provider usually gives separate pooled and direct URLs.

**Step 5.** For local sign-in without a real inbox, remove the placeholder text from `EMAIL_SERVER_USER` and `EMAIL_SERVER_PASSWORD` in `.env`. The mail helper will print the six-digit code in the dev-server terminal instead of trying SMTP. Leave the payment, AI, storage, and reconcile keys as placeholders until those features exist.

```bash
# 6. Generate the Prisma client
npm run prisma:generate

# 7. Apply the checked-in migrations
npm run prisma:migrate

# 8. Start the development server
npm run dev
```

Open `http://localhost:3000`.

### Main routes

| Route | Purpose |
|---|---|
| `/` | Public home page and hardcoded case-study preview. |
| `/auth?view=login` | Password and email-code sign-in. |
| `/auth?view=signup` | Account creation. |
| `/auth?view=verify-email` | Six-digit email verification. |
| `/auth?view=forgot-password` | Password-reset request. |
| `/auth?view=reset-password&token=...` | Password-reset completion. |
| `/dashboard` | Learner dashboard and account-deletion control. |
| `/privacy`, `/terms` | Adapted legal pages; still require counsel review. |
| `/admin`, `/admin/case-studies` | Protected admin area for `ADMIN` users only. |

### Notes

- There is no seed script and no `db:seed` command.
- If port 3000 is already in use, Next.js starts on another port. Set `NEXTAUTH_URL` to that origin so verification, reset, and welcome links point at the running server.
- Set `CRON_SECRET` to a high-entropy value before invoking the purge route. Set `EMAIL_SERVER_SECURE` to `true` for implicit TLS on port 465, or `false` for STARTTLS on port 587.
- `NEXTAUTH_SECRET` is present in the template but is not used by the current custom auth implementation.
- The schema includes a nullable `Entitlement.userId` with `onDelete: SetNull`, but the corresponding migration has not yet been applied to the live database. See the known defects below.

---

## 4. Environment Variables

Names only. Do not commit values. The current-use column records what the code actually reads, not what a later task will need.

| Variable | Current use |
|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection string used by the Prisma client. |
| `DIRECT_DATABASE_URL` | Direct, unpooled connection string used for migrations. |
| `NEXTAUTH_URL` | Base URL used to build verification, reset, and welcome links. It is not an Auth.js session setting. |
| `NEXTAUTH_SECRET` | Template only. No Auth.js signing exists. |
| `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM` | SMTP transport used by `src/lib/mail.ts`. Missing credentials trigger the console mock. |
| `EMAIL_SERVER_SECURE` | Read by `src/lib/mail.ts`; `true` for implicit TLS on port 465, `false` for STARTTLS on port 587. |
| `SIGNUPS_ENABLED` | Emergency switch that blocks new account creation when set to `"false"`. |
| `CRON_SECRET` | Bearer secret for `POST /api/cron/purge-accounts`. |
| `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_WEBHOOK_HASH` | Reserved; no payment code exists yet. |
| `FREE_MODEL_API_KEY`, `PAID_MODEL_API_KEY`, `EMBEDDING_MODEL_API_KEY` | Reserved; no AI or embedding code exists yet. |
| `DATASET_STORAGE_URL`, `DATASET_STORAGE_SECRET_KEY` | Reserved; no dataset storage code exists yet. |
| `RECONCILE_JOB_SECRET` | Reserved; the payment reconcile job is not built. |

---

## 5. Scope Boundaries

- **No cloud or Docker execution.** All bioinformatics code is intended to run client-side in browser WebAssembly.
- **No video or heavy media.** Lessons are text- and execution-driven.
- **No real patient or clinical genomic data.** Only synthetic or de-identified public datasets are permitted.
- **No custom file uploads.** This avoids malware, runaway storage costs, and inconsistent check environments.
- **No auto-renewing subscriptions.** PRO is a fixed-duration time pass renewed manually.
- **No certificates, leaderboards, forums, or other gamification features.** Version one focuses on individual competence verification.
- **No live human grading or synchronous instructors.** Checks are deterministic; the AI mentor is the final hint rung.
- **No native mobile or desktop installers, and no offline-first product.** The browser cache is an optimisation, not an offline product.
- **No metrics dashboard.** The owner-approved admin case-study tier manager is an explicit override recorded in `.agents/rules/decisions.md`; it is not a general admin interface.

---

## 6. Known Defects, Gaps, and Open Decisions

1. **Critical: the paid-content invariant is not implemented.** There is no `assertStepAccess`, no paid bundle/dataset/mentor/sync route, no Flutterwave checkout or webhook, and no PRO entitlement enforcement. PRD goal G-10 cannot be tested yet.
2. **Critical: the nullable `Entitlement.userId` migration is pending.** `prisma/schema.prisma` has been updated to `String?` with `onDelete: SetNull`, but the migration has not been applied to the live database. The account-purge transaction can fail on an account with an active entitlement.
3. **High: there are no automated tests or CI.** `package.json` has no test script, and no test or spec files exist. The security and compliance evidence is manual. The required G-10 paid-access test must land with the first protected route.
4. **High: rate limiting is not production-safe.** Counters live in an in-memory `Map`, reset on process restart, do not coordinate across serverless instances, and key only on the first `x-forwarded-for` value, which can be spoofed unless the reverse proxy strips client-supplied headers.
5. **High: expired `LoginCode` rows have no daily purge job.** They are rejected at runtime but accumulate in PostgreSQL.
6. **High: the home page overstates the product and one call to action is dead.** It says "Wasm Runtime Engine: Ready" and "24h Offline Resilience Cache" even though neither exists, and "Browse Catalog" points at a missing `/catalog` route.
7. **High: production delivery is unverified.** No production build, deployment, managed PostgreSQL, real inbox, real payment, or 4 GB device run is recorded. Gmail SMTP has daily sending limits, and placeholder credentials can make OTP requests fail instead of using the console mock.
8. **Medium: terms acceptance is not persisted.** The signup form and API require the checkbox, but the `User` model has no `termsAcceptedAt` or `termsVersion` field, so the platform cannot prove which learner accepted which version.
9. **Medium: the Terms and Privacy pages are adapted templates, not reviewed legal documents.** Qualified counsel must review them before launch.
10. **Medium: the purge cron endpoint relies only on a shared bearer secret.** It has no IP allowlist or signed-JWT verification.
11. **Medium: the environment template still contains stale entries.** `NEXTAUTH_SECRET` is unused; the shipped SMTP placeholders can trigger a failed connection instead of the console mock; the reserved payment, AI, and storage keys are placeholders for unbuilt features.
12. **Low: the viewport blocks pinch zoom.** `src/app/layout.tsx` sets `maximumScale: 1`, which removes a core accessibility control on the phones this product targets.
13. **Low: six-digit verification codes use unsalted SHA-256 rather than a keyed HMAC.** The ten-minute expiry, five-attempt limit, and atomic consumption mitigate this, but a database reader can build a small lookup table.
14. **Low: the auth page is a single ~1,250-line client component.** It works, but splitting the views would reduce regression risk.

### Open owner decisions

The host, database provider, object storage, email service, scheduler, AI models, PRO price and duration, AI limits, and Flutterwave gateway facts remain open in `.agents/rules/decisions.md`. They block production readiness but not local development.

---

## 7. Documentation

- The PRD is [`nucleobridge-prd.md`](nucleobridge-prd.md).
- Each task record has its own README with the full rationale, evidence index, and defect list:
  - [`task-01-design-system`](task-01-design-system/README.md)
  - [`task-02-repository-and-scaffold`](task-02-repository-and-scaffold/README.md)
  - [`task-03-client-validation`](task-03-client-validation/README.md)
  - [`task-04-server-security`](task-04-server-security/README.md)
  - [`task-05-sessions-compliance-defence`](task-05-sessions-compliance-defence/README.md)
- The detailed working rules are in [`.agents/rules/`](.agents/rules/).
