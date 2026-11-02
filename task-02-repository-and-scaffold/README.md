# Task 02: Repository and Scaffold

## 1. What This Is

NucleoBridge is a freemium, browser-based bioinformatics learning platform for self-directed learners on low-resource hardware, and the one thing that must work is that paid lesson content reaches only learners with an active PRO entitlement.

## 2. Status

This task delivered a runnable foundation and a development-only authentication slice, not a working learning platform. The paid-content invariant above is not implemented yet because the paid content, access guard, and payment path belong to later tasks.

| State | Area | What is true now |
|---|---|---|
| **Finished** | Repository and application scaffold | Next.js 14 App Router, TypeScript strict mode, `@/*` alias, Prisma client singleton, package scripts, and `.env.example` exist at the repository root. `npm run dev` reached the ready state in `evidence/03-server-start.txt`. |
| **Finished** | Data model and migration | `prisma/schema.prisma` contains the 22 models from PRD sections 8 and 10 plus the owner-approved `PasswordResetToken` model (23 total), with enums, relations, indexes, and `ContentChunk.embedding` as `Unsupported("vector(768)")`. The checked-in `init_auth` migration creates the tables and the `vector` extension. |
| **Finished** | Design-system integration | The semantic tokens from task-01 are copied to `src/styles/main-tokens.css`. Application CSS consumes semantic roles, not primitive palette variables. The visitor home screen is a fixed `100vh` layout with no primitive colour leakage. |
| **Finished** | Authentication slice in development | Signup, password login, six-digit email-code request and verification, forgot-password, reset-password, session lookup, and signout routes exist. A single `/auth` page renders the login, signup, forgot-password, and reset-password views from the `view` query parameter; the old routes redirect to it. Passwords use bcrypt; OTPs and reset tokens are stored as SHA-256 hashes. The recorded response log covers signup, password login, and the OTP routes; forgot-password and reset-password are implemented but are not covered by that log. |
| **Finished** | Database-write proof | Signup returned `201` with a Prisma `INSERT INTO "User"` in `evidence/11-write-succeeded-logs.txt`; login and OTP calls returned `200`; persisted rows are shown in `evidence/12-database-rows.png`. A broken `DATABASE_URL` returned `500` and wrote nothing (`evidence/13-write-failed-logs.txt`, `docs/false-success.md`). |
| **Half done** | Session and auth hardening | The flow works in development, but the session cookie is an unsigned user ID, the password endpoints have no rate limits, and email delivery is not production-ready. See defects 1, 4, and 5. |
| **Half done** | Visitor home and dashboard | The home page is `100vh` and uses semantic tokens, but the catalogue is hardcoded in `src/lib/catalog-preview.ts`, "Browse Catalog" points at a missing `/catalog` route, and the footer claims a Wasm runtime and a 24-hour offline cache that do not exist. The dashboard is a client-side session check over the same hardcoded cards and has no step links. See defects 2 and 3. |
| **Half done** | Database and runtime verification | The migration and writes were verified against a local PostgreSQL database only. No managed PostgreSQL instance, production build, deployment, real inbox, real payment, or 4 GB device was recorded. The only recorded first load is 19,815 ms in `next dev` (`docs/performance-note.md`); production performance is unmeasured. |
| **Not started** | Five learning features | Guided step page, check runner, autosave/resume and cross-device sync, hint ladder with AI mentor, and progress map. |
| **Not started** | Browser runtime | Web Worker, Pyodide, WebR, Biowasm, client-side check execution, and IndexedDB resilience cache. |
| **Not started** | Paid path | Catalogue, step, dataset, mentor, sync, and billing routes; `assertStepAccess`; Flutterwave checkout, webhook, and reconcile job; entitlement enforcement. |
| **Not started** | Content and AI | Content importer, chunking, embeddings, vector search, mentor routing, token ceilings, and output checks. |
| **Not started** | Operations and verification | Instrumentation events, "Delete my data", owner scripts, automated tests, CI, and the real-device/real-inbox/real-payment gates. |

Fixed during the task and kept in evidence: the scaffold first started from a nested folder, port 3000 was occupied, the root page was missing (404), and a changed `DATABASE_URL` caused a 500 with no write. Those issues are resolved; the failure and correction records remain in `evidence/05` through `evidence/13`.

**What this folder contains.** `docs/` holds the task write-ups (`scaffold-prompt.md`, `model-choices.md`, `performance-note.md`, `false-success.md`, and `working-tree.md`). `evidence/` holds the terminal logs, the Prisma Studio screenshot, the branch drawing, and the walkthrough video. The code produced by the task lives at the repository root (`src/`, `prisma/`, `package.json`, `tsconfig.json`, `next.config.mjs`, and `.env.example`).

**Evidence index.** `evidence/01-agent-plan.txt` records the context review and approval stop. `evidence/02-files-created.txt` and `evidence/02-scaffold-summary.txt` record the scaffold and the zero-primitive style audit. `evidence/04-first-load.txt` and `evidence/10-404-resolved.txt` record the root `200`. `evidence/11-write-succeeded-logs.txt` and `evidence/12-database-rows.png` record the successful database write. `evidence/14-working-tree-drawing.jpg` and `evidence/21-walkthrough.mp4` record the branch-flow drawing and the walkthrough.

**Review.** The scaffold was followed by the authentication slice on `feature-authentication`, merged in PR [#1](https://github.com/ChijiokeUhegwu/Nucleobridge/pull/1).

## 3. The Stack, and Why

| Choice | Why this, rather than the alternative |
|---|---|
| **Next.js 14 App Router with TypeScript** | One deployable holds the pages and server route handlers with shared types, rather than a separate SPA and API with a second deployment, a second origin, and CORS surface. |
| **Node.js runtime for route handlers** | Prisma, bcrypt, and Nodemailer need Node APIs, rather than the edge runtime that would force different libraries and break the approved server stack. |
| **PostgreSQL with pgvector** | Relational records and 768-dimensional embeddings stay in one transactional database, rather than a separate vector service such as Pinecone with its synchronization drift and extra billing relationship. |
| **Prisma 5** | The schema, relations, and migrations are typed and reproducible, rather than hand-written SQL everywhere; raw SQL is reserved for `ContentChunk.embedding`. |
| **bcryptjs** | Adaptive password hashing works without a native build step on Windows, rather than a plain hash or a hand-rolled `crypto.scrypt` solution with custom salting, comparison, and upgrade handling. |
| **Nodemailer over SMTP** | No email provider is chosen in the PRD or `.agents/rules/decisions.md`, so a generic SMTP transport keeps the provider replaceable, rather than a provider-specific SDK that would lock the choice before the owner makes it. |
| **CSS Modules with the task-01 semantic tokens** | This preserves the light/dark token contract and keeps primitive palette values out of component code, rather than Tailwind or ad hoc CSS that would duplicate the design system and invite hardcoded values. |
| **Checked-in Prisma migration** | A fresh clone applies the same schema with the checked-in `init_auth` migration, rather than `prisma db push`, which would leave no migration history to apply or review. |

## 4. Getting Started

### Prerequisites

- Node.js 20.x or newer.
- PostgreSQL with the `vector` extension available. The migration runs `CREATE EXTENSION IF NOT EXISTS "vector"`, so the database user must be allowed to create it, or the extension must already be installed.

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

**Step 5.** For local sign-in without a real inbox, remove the placeholder text from `EMAIL_SERVER_USER` and `EMAIL_SERVER_PASSWORD` in `.env`. The mail helper will then print the six-digit code in the dev-server terminal instead of trying SMTP. Leave the payment, AI, storage, and reconcile keys as placeholders until those features exist.

```bash
# 6. Generate the Prisma client
npm run prisma:generate

# 7. Apply the checked-in migration
npm run prisma:migrate

# 8. Start the development server
npm run dev
```

Open `http://localhost:3000`. Create an account at `/auth?view=signup`, or sign in at `/auth?view=login` with either the password form or the six-digit email-code form.

**Notes.**

- There is no seed script and no `db:seed` command. The visitor catalogue is a hardcoded preview in `src/lib/catalog-preview.ts`.
- If port 3000 is already in use, Next.js will start on another port and print the URL. Set `NEXTAUTH_URL` to that URL if you want the password-reset and welcome links to point at the running server.
- The `init_auth` migration is the only migration in the repository. If the migration fails on `CREATE EXTENSION "vector"`, install pgvector in the database before retrying.

## 5. Environment Variables

Names only. Do not commit values. The status column records what the current code actually reads, not what a later task will need.

| Variable | What it is for | Current use |
|---|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection string used by the Prisma client at runtime. | Used by `prisma/schema.prisma`. |
| `DIRECT_DATABASE_URL` | Direct, unpooled PostgreSQL connection string used for migrations. | Used by `prisma/schema.prisma`. |
| `NEXTAUTH_URL` | Base URL used to build password-reset and welcome links. | Used in `src/lib/mail.ts` and the forgot-password route. It is not an Auth.js session setting. |
| `NEXTAUTH_SECRET` | Secret for signing Auth.js sessions. | Template only. No Auth.js session signing exists; see defect 1. |
| `FLUTTERWAVE_PUBLIC_KEY` | Public key for Flutterwave checkout. | Reserved. No payment code exists yet. |
| `FLUTTERWAVE_SECRET_KEY` | Secret key for verifying and refunding Flutterwave transactions. | Reserved. |
| `FLUTTERWAVE_WEBHOOK_HASH` | Secret hash for validating Flutterwave webhooks. | Reserved. |
| `FREE_MODEL_API_KEY` | API key for the free AI pool. | Reserved. |
| `PAID_MODEL_API_KEY` | API key for the paid AI pool. | Reserved. |
| `EMBEDDING_MODEL_API_KEY` | API key for the embedding provider. | Reserved. |
| `DATASET_STORAGE_URL` | Base URL for private dataset storage. | Reserved. |
| `DATASET_STORAGE_SECRET_KEY` | Secret for signed dataset downloads. | Reserved. |
| `EMAIL_SERVER_HOST` | SMTP host for sign-in codes, password resets, and welcome mail. | Used by `src/lib/mail.ts`. |
| `EMAIL_SERVER_PORT` | SMTP port. | Used by `src/lib/mail.ts`. |
| `EMAIL_SERVER_USER` | SMTP username. | Used by `src/lib/mail.ts`. When not set, mail is mocked to the server console. |
| `EMAIL_SERVER_PASSWORD` | SMTP password or API token. | Used by `src/lib/mail.ts`. When not set, mail is mocked to the server console. |
| `EMAIL_FROM` | Sender address on outgoing mail. | Used by `src/lib/mail.ts`. |
| `EMAIL_SERVER_SECURE` | Forces SMTP TLS on or off. | Read by `src/lib/mail.ts`, but it is missing from `.env.example`; see defect 4. |
| `RECONCILE_JOB_SECRET` | Bearer secret for the payment reconcile job. | Reserved. The job is not built. |
| `SIGNUPS_ENABLED` | Emergency switch that blocks new account creation when turned off. | Used in the signup and OTP verify routes. See defect 6. |

## 6. What This Deliberately Does Not Do

- **It does not build the five learning features.** The guided step page, check runner, autosave/resume and sync, hint ladder with AI mentor, and progress map are later milestones. Task 02 exists to make the repository and database foundation real first.
- **It does not execute code in the browser.** There is no Web Worker, Pyodide, WebR, Biowasm, client-side check engine, or IndexedDB cache. Those need the browser-runtime design and a real 4 GB device gate, neither of which was part of this scaffold.
- **It does not implement the paid path.** There is no authored paid content yet, so there is no bundle, dataset, mentor, or sync route to guard. `assertStepAccess` and the Flutterwave flow belong to the access and payment tasks. The product's one critical invariant is therefore not yet testable in the application.
- **It does not implement the content importer, vector search, or AI mentor.** The schema has the `ContentChunk` vector column, but no importer, embedding call, retrieval query, mentor routing, model choice, token ceiling, or output filter exists. The AI provider keys in the template are reserved.
- **It does not record instrumentation, delete learner data, run owner scripts, or provide an admin/metrics screen.** Those are later compliance and operations work. Version one deliberately has no metrics dashboard screen.
- **It does not claim production readiness.** No production build, deployment, managed database, real inbox, real payment, or 4 GB device run is recorded. The evidence is from `next dev`, HTTP responses, Prisma logs, and Prisma Studio.
- **It does not add the out-of-scope product surface.** No native or installable app, offline-first product, video lessons, custom uploads, patient data, certificates, leaderboards, forums, live human grading, coupons, multiple plans, or auto-renewing subscriptions.

## 7. Known Defects

These are current defects in the checkout, not a wishlist and not a repeat of issues already fixed during the task. Code paths are relative to the repository root; this README lives in `task-02-repository-and-scaffold/`. Line numbers refer to the files as committed now; the file is the source of truth if a line moves.

1. **Critical: the session cookie is an unsigned user ID.** `src/lib/session.ts:4-33` stores `nb_session_user_id` and `getSessionUser()` trusts whatever value is present. The same raw user ID is set by `src/app/api/auth/signup/route.ts:101`, `src/app/api/auth/login-password/route.ts:57`, and `src/app/api/auth/otp/verify/route.ts:108`. There is no signature, no JWT, no server-side session row, and no rotation. Any leak of a user ID is a full account takeover. Fix this before another learner-facing feature is added.

2. **High: `/catalog` is a dead link on the public home page.** `src/app/page.tsx:109` points "Browse Catalog" at `/catalog`. There is no `src/app/catalog` route and no catalogue API, so one of the two calls to action on the only public screen returns a 404.

3. **High: the home page claims runtime and offline features that are not built.** `src/app/page.tsx:122` says "Wasm Runtime Engine: Ready" and `src/app/page.tsx:135` says "24h Offline Resilience Cache". There is no Web Worker, WebAssembly loader, or IndexedDB cache under `src/`. This is the same false-success pattern that `docs/false-success.md` warns about, applied to the product status line.

4. **High: without real SMTP configuration, email delivery either fails or silently logs the code.** `src/lib/mail.ts:14-16` treats missing credentials, or credentials containing a known placeholder marker, as "not configured." `src/lib/mail.ts:48-59` and `src/lib/mail.ts:98-109` print codes to the console and return `true` when no transporter exists. `.env.example:32-36` ships non-empty placeholder credentials that do not match that marker, so a fresh copy attempts SMTP to the placeholder host and the OTP request returns `500` (`src/app/api/auth/otp/request/route.ts:58-64`). `src/lib/mail.ts:10` also reads `EMAIL_SERVER_SECURE`, which `.env.example` does not list. No real inbox was verified.

5. **High: there are no rate limits on password signup, password login, or forgot-password.** `src/app/api/auth/login-password/route.ts` has no attempt counter or delay. `src/app/api/auth/signup/route.ts` and `src/app/api/auth/forgot-password/route.ts` have no limiter. The OTP path limits three codes per email per hour (`src/app/api/auth/otp/request/route.ts:27-41`) and five wrong attempts per code (`src/app/api/auth/otp/verify/route.ts:45-51`), but there is no IP-based or new-account limit. This does not meet the rules' requirement for sign-in-code and new-account rate limits.

6. **Medium: disabling signups burns a valid OTP before rejecting a new learner.** `src/app/api/auth/otp/verify/route.ts:70-74` marks the code consumed, then `src/app/api/auth/otp/verify/route.ts:83-88` returns `403` for a new email when signups are paused. The learner loses the code, and the code row still counts toward the three-per-hour request limit. The switch should be checked before the code is consumed.

7. **High for release readiness: there are no automated tests and no test script.** `package.json:6-13` has no `test` script, and there are no `*.test.*` or `*.spec.*` files in the repository. PRD goal G-10 and `.agents/rules/testing.md` require an automated test that proves paid content is not served without PRO. That test cannot exist until the access guard and paid routes exist, but the harness should land with the first protected route.

8. **Medium: the repository-root README is stale and will send a new contributor down the wrong path.** `../README.md:69` instructs `npm run db:seed`, which `package.json:6-13` does not define. `../README.md:127-138` still says there is no root `package.json`, no `prisma/schema.prisma`, and that the task folders are blank. `../README.md:31` names Neon and Supabase even though the provider remains an open question in `.agents/rules/decisions.md` (Q11). This task-02 README is the accurate scaffold record; the root README should be updated or removed before the next hand-off.

9. **Low: the viewport disables pinch zoom.** `src/app/layout.tsx:10-14` sets `maximumScale: 1`, which blocks zoom on the mobile devices this product targets. Remove `maximumScale` or allow a usable maximum.

10. **Low: the zero-hex audit excludes the HTML email templates.** `src/lib/mail.ts:68-77`, `src/lib/mail.ts:119-128`, and `src/lib/mail.ts:181-193` contain hardcoded brand hex values, while `evidence/02-scaffold-summary.txt:21` says zero hardcoded hex values were found in app code and styles. The CSS is clean; the claim is scoped too broadly. Either move the email colours to documented email tokens or narrow the audit claim.

11. **Low: reset and welcome links default to a hardcoded localhost URL even when Next.js falls back to another port.** `src/lib/mail.ts:148` and `src/app/api/auth/forgot-password/route.ts:48` fall back to that localhost URL. The task's own port-collision evidence (`evidence/07-port-conflict.txt`) shows this is a real local setup, not a hypothetical. Require `NEXTAUTH_URL` in development or build links from the request origin.

12. **Medium: the Terms and Privacy Policy are adapted templates, not reviewed legal documents.** `src/app/terms/page.tsx` and `src/app/privacy/page.tsx` adapt an external template and assume Nigerian governing law, the `support@nucleobridge.org` and `privacy@nucleobridge.org` contact addresses, a minimum age of 16, and a ₦50,000 liability cap. The owner must have qualified counsel review both documents before launch.
