# Task 02: Repository Scaffold & Database Setup

*Foundational Next.js App Router, TypeScript, Prisma/PostgreSQL, semantic design-token integration, and the first verified database writes for NucleoBridge.*

---

## 1. What This Task Was

NucleoBridge is an in-browser bioinformatics learning platform for learners on low-resource hardware (4 GB RAM laptops, mobile devices, metered connections, and unstable power). Before the lesson runtime, automated checks, AI mentor, payments, or progress map could be built, the project needed a foundation that could actually start, connect to PostgreSQL, and render a visitor-facing screen using the completed design system from `task-01-design-system`.

This stage delivered that foundation:

1. A repository and Next.js App Router project that runs locally with TypeScript.
2. A Prisma data model that matches the PRD, including PostgreSQL/pgvector.
3. Semantic design-token integration with no primitive colour leakage.
4. A minimalistic, exactly `100vh` home screen for visitors.
5. A real database-write verification path through an authentication slice.
6. A documented record of defects, decisions, and evidence.

**Scope boundary.** This task did not build the five learning features (guided step page, check runner, autosave/sync, hint ladder with AI mentor, or progress map), payments, the content importer, or the WebAssembly runtime. The authentication slice described in section 2.6 was added to prove that Prisma reads and writes reach PostgreSQL and to exercise the signup, login, and password-reset paths. Full session hardening, compliance, and production defences belong to later tasks.

---

## 2. Operations Carried Out

### 2.1 Context review and approval gate

- Read `AGENTS.md`, `nucleobridge-prd.md`, the files in `.agents/rules/`, and the task-01 design system (`main-tokens.css`).
- Summarised the product requirements, architecture, access rules, and design constraints before writing code.
- Raised the points where the scaffold prompt and the source files differed: the PostgreSQL version, Node.js versus the Next.js App Router, the scope of the visitor home screen, and the file-location table in `structure.md`.
- Stopped and waited for explicit owner approval instead of assuming the answers.

Evidence: [`evidence/01-agent-plan.txt`](evidence/01-agent-plan.txt), [`docs/scaffold-prompt.md`](docs/scaffold-prompt.md), [`docs/model-choices.md`](docs/model-choices.md).

### 2.2 Repository and application scaffold

- Created the root toolchain files: `package.json`, `tsconfig.json`, `next.config.mjs`, `next-env.d.ts`, and `.env.example`.
- Created the App Router source structure under `src/app/`, shared server helpers under `src/lib/`, and the design-token copy under `src/styles/`.
- Created `src/lib/prisma.ts` as a global singleton so development hot reloads do not exhaust database connections.
- Kept secrets server-only. `.env.example` names the required variables without containing real values; `.env` remains ignored by Git.

Evidence: [`evidence/02-files-created.txt`](evidence/02-files-created.txt), [`evidence/02-scaffold-summary.txt`](evidence/02-scaffold-summary.txt).

### 2.3 Database and schema setup

- Wrote `prisma/schema.prisma` from the approved data model in PRD sections 8 and 10: the 22 original models, their enums, relations, indexes, and delete/restrict rules.
- Enabled PostgreSQL with pgvector; `ContentChunk` carries the `Unsupported("vector(768)")` embedding column. Vector reads and writes are reserved for raw SQL, as `schema.md` requires.
- Added the `init_auth` migration under `prisma/migrations/20261030105045_init_auth/`.
- Used the pooled runtime connection (`DATABASE_URL`) and the direct migration connection (`DIRECT_DATABASE_URL`). The database provider was not locked in; the URLs stay compatible with managed PostgreSQL providers.
- Applied the owner-approved auth amendment to the model: `firstName`, `lastName`, and `passwordHash` on `User`, plus the `PasswordResetToken` model. The schema therefore contains 23 models after the amendment (22 from the PRD plus `PasswordResetToken`).

Evidence: [`../prisma/schema.prisma`](../prisma/schema.prisma), [`../prisma/migrations`](../prisma/migrations), [`evidence/11-write-succeeded-logs.txt`](evidence/11-write-succeeded-logs.txt), [`evidence/12-database-rows.png`](evidence/12-database-rows.png).

### 2.4 Design-system integration

- Copied the compiled semantic tokens from task-01 into `src/styles/main-tokens.css`.
- Imported the token stylesheet through `src/app/globals.css` and applied a zero-hex universal reset.
- Built `src/app/layout.tsx` with the DM Sans font, viewport settings, and metadata.
- Enforced the architectural boundary from task-01: page styles consume semantic tokens only. No `--palette-*` variables and no hardcoded `#hex`, `rgb()`, or `hsl()` values were introduced into application styling.

Evidence: [`evidence/02-scaffold-summary.txt`](evidence/02-scaffold-summary.txt).

### 2.5 Visitor home screen

- Built `src/app/page.tsx` and `src/app/page.module.css` as a zero-scroll, exactly `100vh` screen with a brand header, hero copy, case-study preview cards with access labels, and a status footer.
- The screen shows case-study titles, summaries, and access labels only. It does not expose lesson content, checks, hints, or paid material, matching the signed-out visitor rule in `access-and-routes.md`.
- Verified the root route returns `200` after fixing the missing page (see section 2.7).

Evidence: [`evidence/04-first-load.txt`](evidence/04-first-load.txt), [`evidence/10-404-resolved.txt`](evidence/10-404-resolved.txt).

### 2.6 Database write verification through the authentication slice

To prove the database connection and Prisma wiring were real, the stage continued with a thin authentication slice:

- `POST /api/auth/signup` creates a user, hashes the password, and returns `201 Created`.
- `POST /api/auth/login-password` verifies a password and starts a session.
- `POST /api/auth/otp/request` and `POST /api/auth/otp/verify` implement the six-digit email-code path.
- `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` implement the reset-token flow.
- Added the matching pages (`/signup`, `/login`, `/forgot-password`, `/reset-password`) and shared authentication helpers in `src/lib/auth.ts` and `src/lib/mail.ts`.
- Passwords use bcrypt hashes. OTP codes and reset tokens are stored as SHA-256 hashes, never as plain text. Email delivery uses a Nodemailer SMTP transport configured from environment variables, with a mock fallback when credentials are absent.

The verification used the database itself, not just the UI:

- The signup request returned `201` and the Prisma log showed an `INSERT INTO "User"` statement.
- A successful login and the OTP request/verify routes returned `200`.
- Prisma Studio showed the persisted user rows.
- A broken `DATABASE_URL` produced a `500` and no write. That failure is documented in [`docs/false-success.md`](docs/false-success.md) as a warning against optimistic UI that reports success without checking the server response.

Evidence: [`evidence/11-write-succeeded-logs.txt`](evidence/11-write-succeeded-logs.txt), [`evidence/12-database-rows.png`](evidence/12-database-rows.png), [`docs/false-success.md`](docs/false-success.md).

### 2.7 Troubleshooting and environment fixes

- **Nested-folder start failure.** Running `npm run dev` from the repository root failed with `ENOENT` because `package.json` was inside a nested `nested-app` folder. The server was started from the folder that contained the manifest, and the final scaffold lives at the repository root.
- **Port 3000 collision.** Next.js found port 3000 occupied and offered port 3001. The listening process was identified with `netstat -ano`, stopped, and the port situation was rechecked before trusting the running URL.
- **404 on the root route.** The root route returned `404` because `src/app/page.tsx` was missing. The page was added, recompiled, and verified as `200`.
- **Broken database connection.** A changed `DATABASE_URL` caused Prisma to throw an initialisation error. The UI showed an error and no data was written. The environment was corrected and the flow was re-run, producing the `201` and insert evidence above.

Evidence: [`evidence/05-nested-folder-error.txt`](evidence/05-nested-folder-error.txt), [`evidence/06-nested-folder-fixed.txt`](evidence/06-nested-folder-fixed.txt), [`evidence/07-port-conflict.txt`](evidence/07-port-conflict.txt), [`evidence/08-port-conflict-resolved.txt`](evidence/08-port-conflict-resolved.txt), [`evidence/09-404-error.txt`](evidence/09-404-error.txt), [`evidence/10-404-resolved.txt`](evidence/10-404-resolved.txt), [`docs/false-success.md`](docs/false-success.md).

### 2.8 Documentation and evidence capture

- Recorded the scaffold prompt and the reasoning behind its revision in [`docs/scaffold-prompt.md`](docs/scaffold-prompt.md).
- Recorded the agent split (Antigravity for the scaffold, Open Code for the authentication slice) in [`docs/model-choices.md`](docs/model-choices.md).
- Recorded the development-mode performance gap in [`docs/performance-note.md`](docs/performance-note.md).
- Recorded the false-success risk in [`docs/false-success.md`](docs/false-success.md).
- Recorded the single-branch working-tree risk in [`docs/working-tree.md`](docs/working-tree.md).
- Captured terminal logs, a Prisma Studio screenshot, a hand-drawn working-tree diagram, and a walkthrough video in [`evidence/`](evidence/).

---

## 3. What Was Built (Deliverables)

### 3.1 Application scaffold

| Deliverable | Path | Purpose |
|---|---|---|
| Project manifest | [`package.json`](../package.json) | Next.js 14, React 18, TypeScript, Prisma, bcrypt, and Nodemailer dependencies and scripts. |
| TypeScript configuration | [`tsconfig.json`](../tsconfig.json) | Strict TypeScript settings and the `@/*` alias to `src/*`. |
| Next.js configuration | [`next.config.mjs`](../next.config.mjs) | React strict mode and removal of the `X-Powered-By` header. |
| Ambient types | [`next-env.d.ts`](../next-env.d.ts) | Next.js TypeScript declarations. |
| Environment template | [`.env.example`](../.env.example) | Server-only names for database, auth, payment, AI, storage, email, and job secrets. |
| Prisma client singleton | [`src/lib/prisma.ts`](../src/lib/prisma.ts) | One PrismaClient instance across development hot reloads. |

### 3.2 Data model

| Deliverable | Path | Purpose |
|---|---|---|
| Prisma schema | [`prisma/schema.prisma`](../prisma/schema.prisma) | The approved 23-model schema with enums, relations, indexes, pgvector, and soft-delete invariants. |
| Initial auth migration | [`prisma/migrations/20261030105045_init_auth`](../prisma/migrations/20261030105045_init_auth) | Creates the database tables, enums, indexes, and the `vector` extension. |

### 3.3 Design system and visitor interface

| Deliverable | Path | Purpose |
|---|---|---|
| Semantic token stylesheet | [`src/styles/main-tokens.css`](../src/styles/main-tokens.css) | Light and dark semantic roles, typography utilities, and elevation shadows from task-01. |
| Global reset | [`src/app/globals.css`](../src/app/globals.css) | Document-level bindings using semantic tokens only. |
| Root layout | [`src/app/layout.tsx`](../src/app/layout.tsx) | App Router HTML shell, DM Sans, metadata, and viewport settings. |
| Visitor home screen | [`src/app/page.tsx`](../src/app/page.tsx) | Exactly `100vh`, catalogue preview, access labels, and sign-in entry point. |
| Home screen styles | [`src/app/page.module.css`](../src/app/page.module.css) | Scoped responsive styles with zero primitive colour references. |

### 3.4 Authentication and database-write proof

| Deliverable | Path | Purpose |
|---|---|---|
| Sign-up API | [`src/app/api/auth/signup/route.ts`](../src/app/api/auth/signup/route.ts) | Creates the user and returns `201` after a successful insert. |
| Password login API | [`src/app/api/auth/login-password/route.ts`](../src/app/api/auth/login-password/route.ts) | Verifies the bcrypt password and starts a session. |
| OTP request API | [`src/app/api/auth/otp/request/route.ts`](../src/app/api/auth/otp/request/route.ts) | Creates and emails a six-digit code under the PRD limits. |
| OTP verify API | [`src/app/api/auth/otp/verify/route.ts`](../src/app/api/auth/otp/verify/route.ts) | Checks the code hash, expiry, and attempt limit. |
| Forgot-password API | [`src/app/api/auth/forgot-password/route.ts`](../src/app/api/auth/forgot-password/route.ts) | Creates a single-use reset token without revealing account existence. |
| Reset-password API | [`src/app/api/auth/reset-password/route.ts`](../src/app/api/auth/reset-password/route.ts) | Validates the token and replaces the password hash. |
| Authentication helpers | [`src/lib/auth.ts`](../src/lib/auth.ts) | Password hashing, OTP generation, and token hashing. |
| Mail helpers | [`src/lib/mail.ts`](../src/lib/mail.ts) | SMTP delivery for OTP and password-reset messages, with a mock fallback. |
| Auth pages and styles | [`src/app/signup/page.tsx`](../src/app/signup/page.tsx), [`src/app/login/page.tsx`](../src/app/login/page.tsx), [`src/app/forgot-password/page.tsx`](../src/app/forgot-password/page.tsx), [`src/app/reset-password/page.tsx`](../src/app/reset-password/page.tsx), [`src/styles/auth-forms.module.css`](../src/styles/auth-forms.module.css) | Learner-facing forms for the authentication flow. |

The password-based part of the slice implements the owner-approved Option B amendment recorded in [`decisions.md`](../.agents/rules/decisions.md). It does not replace the PRD's passwordless email-code path; both sign-in methods were implemented.

---

## 4. What Was Decided (Architectural Decisions & Trade-offs)

### 1. Next.js App Router on the Node.js runtime
- **Decision:** Scaffold a Next.js App Router application with TypeScript and keep route handlers on the Node.js runtime.
- **Why:** Prisma, email, payments, and session checks need Node APIs. The PRD and `structure.md` require Next.js, while the prompt's "Node.js" wording describes the runtime rather than a separate server framework.

### 2. Provider-agnostic PostgreSQL with pgvector
- **Decision:** Use standard pooled and direct PostgreSQL connection strings and keep the database provider open. Do not hard-code a provider or a specific PostgreSQL major version in application code.
- **Why:** The PRD requires managed PostgreSQL with pgvector but leaves the provider open in `decisions.md` (Q11). Standard URLs keep local, test, and managed environments interchangeable.

### 3. Reproduce the approved data model, then gate every change
- **Decision:** Reproduce the PRD's 22-model schema exactly, then add only the owner-approved authentication amendment: `firstName`, `lastName`, `passwordHash`, and `PasswordResetToken`.
- **Why:** `schema.md` treats the PRD model as the only approved model. The amendment is recorded in `decisions.md` and keeps the learner's display name and password-reset flow available without inventing models.

### 4. Keep Prisma on the server and use one client instance
- **Decision:** Keep the Prisma client in `src/lib/prisma.ts` as a global singleton and never import database code from a client component.
- **Why:** A singleton prevents connection exhaustion during hot reload, and keeping database access server-side protects secrets and paid content.

### 5. Zero primitive colour exposure
- **Decision:** Copy the compiled semantic tokens into `src/styles/main-tokens.css` and consume only semantic variables in application CSS.
- **Why:** Task-01 established that primitive palette variables must stay out of component code. This keeps Light/Dark swapping reliable and prevents hardcoded brand colours from spreading through the application.

### 6. The visitor home screen is a catalogue, not a lesson
- **Decision:** Build the root screen as a `100vh` visitor catalogue with case-study titles, summaries, and access labels, plus a sign-in entry point.
- **Why:** Signed-out visitors may see the catalogue and access labels, but no lesson content. The fixed-height layout also matches the low-resource, minimal-scroll design direction.

### 7. Verify database writes with server evidence
- **Decision:** Treat a `201 Created` response, a matching Prisma `INSERT`, and a visible row in Prisma Studio as the proof that the database write worked. Do not trust a green UI banner alone.
- **Why:** The `DATABASE_URL` failure showed how an optimistic interface could report success while the write failed. Server status codes and database logs are the reliable evidence.

### 8. Keep the working tree reviewable
- **Decision:** Record the single-branch working-tree risk and recommend feature branches, pull requests, and a tested main branch before production merges.
- **Why:** Once `main` is deployed, a broken commit becomes visible to learners immediately. The drawing and explanation are in [`evidence/14-working-tree-drawing.jpg`](evidence/14-working-tree-drawing.jpg) and [`docs/working-tree.md`](docs/working-tree.md).

---

## 5. What Was Got Wrong (Defects & Retrospective)

### 1. The scaffold started in a nested folder
- **What happened:** `npm run dev` at the repository root failed with `ENOENT` because `package.json` was inside a nested `nested-app` folder.
- **Correction:** Start the server from the directory that contains the manifest, and keep the final scaffold at the repository root. The failure and corrected startup are retained in evidence.

### 2. Port 3000 was already occupied
- **What happened:** Next.js reported that port 3000 was in use and fell back to port 3001. The first compile on the fallback port took 58.9 seconds, so a tester could easily test the wrong server or mistake a slow cold start for a broken build.
- **Correction:** Identify the listening process with `netstat -ano`, stop it, and confirm the actual URL before recording results.

### 3. The root route returned 404
- **What happened:** The first root request returned `404` because `src/app/page.tsx` was missing from the App Router directory.
- **Correction:** Add the missing page, wait for the route to compile, and verify `GET /` returns `200` with the expected layout.

### 4. A broken database URL produced a false-success risk
- **What happened:** After `DATABASE_URL` was altered, the signup route failed with a Prisma initialisation error and returned `500`. No row was written. The UI showed an error in this build, but the episode demonstrated how an optimistic interface could have shown a success state and hidden the failed write.
- **Correction:** Restore the environment, re-run the flow, and require a `201` plus an `INSERT` log before treating the database as connected. The full retrospective is in [`docs/false-success.md`](docs/false-success.md).

### 5. Development-mode load time was far from the target
- **What happened:** The first home-page load took 19,815 ms. The performance target was in the tens of milliseconds.
- **Correction:** Record the cause: `next dev` compiles 470 modules on demand, and the first Prisma connection adds cold-start cost. A production build (`next build` and `next start`) is required before judging the target. The analysis is in [`docs/performance-note.md`](docs/performance-note.md).

### 6. The single-branch working-tree risk
- **What happened:** The repository did not yet enforce a branch and merge workflow. A single branch would expose every experimental change directly to the only line of code.
- **Correction:** Document the risk and the safer feature-branch, pull-request, and tested-main flow in [`docs/working-tree.md`](docs/working-tree.md).

---

## 6. Verification and Evidence

| Evidence | What it proves |
|---|---|
| [`01-agent-plan.txt`](evidence/01-agent-plan.txt) | Context review, discrepancy list, requirement summary, and the approval stop before code. |
| [`02-files-created.txt`](evidence/02-files-created.txt) | The scaffold files created and the initial file-level verification. |
| [`02-scaffold-summary.txt`](evidence/02-scaffold-summary.txt) | Deliverable list, zero-hex/zero-primitive style audit, and the `100vh` constraint. |
| [`03-server-start.txt`](evidence/03-server-start.txt) | The Next.js development server reached the ready state. |
| [`04-first-load.txt`](evidence/04-first-load.txt) | The first home-page compile and `200` response. |
| [`05-nested-folder-error.txt`](evidence/05-nested-folder-error.txt) / [`06-nested-folder-fixed.txt`](evidence/06-nested-folder-fixed.txt) | The nested-folder `ENOENT` failure and the corrected startup directory. |
| [`07-port-conflict.txt`](evidence/07-port-conflict.txt) / [`08-port-conflict-resolved.txt`](evidence/08-port-conflict-resolved.txt) | The port 3000 collision, the listening process, and the fallback port. |
| [`09-404-error.txt`](evidence/09-404-error.txt) / [`10-404-resolved.txt`](evidence/10-404-resolved.txt) | The missing `page.tsx`, the 404, and the resolved `200`. |
| [`11-write-succeeded-logs.txt`](evidence/11-write-succeeded-logs.txt) | `201` signup with a Prisma `INSERT`, plus `200` login and OTP routes. |
| [`12-database-rows.png`](evidence/12-database-rows.png) | Persisted user rows in Prisma Studio, including hashed passwords. |
| [`14-working-tree-drawing.jpg`](evidence/14-working-tree-drawing.jpg) | The hand-drawn working-tree and branch-flow diagram. |
| [`21-walkthrough.mp4`](evidence/21-walkthrough.mp4) | The recorded walkthrough of the running application and database flow. |

Supporting write-ups:

- [`docs/scaffold-prompt.md`](docs/scaffold-prompt.md) — the original and revised scaffold prompts.
- [`docs/model-choices.md`](docs/model-choices.md) — the Antigravity/Open Code task split and execution observations.
- [`docs/performance-note.md`](docs/performance-note.md) — the first-load timing analysis.
- [`docs/false-success.md`](docs/false-success.md) — the database failure and false-success risk.
- [`docs/working-tree.md`](docs/working-tree.md) — the single-branch working-tree risk.

**Manual verification note.** The evidence above is from the development server, HTTP responses, Prisma logs, and Prisma Studio. No production build, real-inbox delivery, real payment, or WebAssembly runtime was verified at this stage; those are later gates.

---

## 7. Hand-off State

At the end of this stage, the repository had:

- A runnable Next.js App Router application with TypeScript.
- A PostgreSQL/Prisma schema and the `init_auth` migration.
- Semantic Light/Dark tokens consumed without primitive leakage.
- A `100vh` visitor home screen that exposes catalogue titles and access labels only.
- A verified authentication slice that persists users, hashes passwords, stores hashed OTP/reset tokens, and sends email through the configured SMTP transport.
- A documented defect and evidence trail for the next task.

Still outside this stage: the guided step page, in-browser WebAssembly execution, the check runner, autosave/resume and sync, the hint ladder and AI mentor, the progress map, the catalog API, Flutterwave payments, and the full task-05 session/compliance hardening.

**Documentation note.** This README and the files under `docs/` and `evidence/` are the task-02 record. The root `README.md` contains the project-wide overview and status table.

**Pull Request URL:** https://github.com/ChijiokeUhegwu/Nucleobridge/pull/1
