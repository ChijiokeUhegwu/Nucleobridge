# Task 03: Client Validation

## 1. What This Is

NucleoBridge is a freemium, browser-based bioinformatics learning platform for self-directed learners on low-resource hardware, and the one thing that must work is that paid lesson content reaches only learners with an active PRO entitlement.

## 2. Status

This task record covers the client-side auth-form validation, the password strength feedback, and the single-page auth refactor. It does not cover the in-browser lesson check runner or the WebAssembly runtime, despite the task name.

| State | Area | What is true now |
|---|---|---|
| **Finished** | Single auth page | `src/app/auth/page.tsx` renders the login, signup, forgot-password, and reset-password views from `?view=login`, `?view=signup`, `?view=forgot-password`, and `?view=reset-password`. The old `/login`, `/signup`, `/forgot-password`, and `/reset-password` routes are 307 redirects in `next.config.mjs`, so existing links and reset-email links still work. |
| **Finished** | Signup form and client validation | The form requires first and last names of at least two characters, a valid email address, and a password with at least eight characters, one number, and one special character. The Confirm Password field is gone. The signup and password sign-in fields each have one static show/hide toggle, and the browser's native reveal control is suppressed (`src/styles/auth-forms.module.css:155`). The submit button stays visible and uses `aria-disabled` until `formIsComplete`; clicking it before terms acceptance is intercepted and shows "Please accept the Terms and Conditions to continue." above the button (`src/app/auth/page.tsx:62`, `src/app/auth/page.tsx:676`, `src/app/auth/page.tsx:730`, `src/app/auth/page.tsx:972`). The signup API re-checks email, password length and complexity, and `acceptedTerms === true` (`src/app/api/auth/signup/route.ts:23-58`). |
| **Finished** | Password strength feedback | A progress meter and checklist render only when `password.length > 0`. The three conditions are length >= 8, one special character, and one number. 0–1 met shows a 33% red "Weak password" bar; 2 shows 66% orange "Almost there"; 3 shows 100% green "Strong password". Met requirements use a solid primary checkmark; unmet ones use a hollow outline circle (`src/app/auth/page.tsx:654-700`, `src/app/auth/page.tsx:908-941`, `src/styles/auth-forms.module.css:224-290`). The hidden-button experiment and the return to a visible disabled button are recorded in `evidence/13`-`14` and `docs/password-and-button.md`. |
| **Finished** | Terms and Privacy pages | `/terms` and `/privacy` contain adapted NucleoBridge legal text, and the signup label links to both (`src/app/auth/page.tsx:958-967`). The pages use the shared semantic-token layout in `src/styles/legal.module.css`. Legal review is still required; see defect 5. |
| **Finished** | Page-count record | The auth refactor took the application from 6 pages to 3 at the time recorded in `evidence/02-page-count-after.txt`. The later legal pages bring the current total to 5: `/`, `/auth`, `/dashboard`, `/terms`, and `/privacy`. |
| **Half done** | Evidence quality | New recordings cover the hidden-versus-disabled button decision, a five-case form attack audit, the direct cURL request, the commit/rollback log, and a walkthrough (`evidence/13`-`18`). Remaining gaps: `evidence/03-url-states.png` predates the Confirm Password removal and Terms checkbox; `evidence/04-form-switch-logs.txt` records only one view request and has terminal encoding artifacts; `docs/terms-note.md` has an encoding artifact; and `evidence/16-direct-request-command-and-response.txt` sends `termsAccepted` while the route reads `acceptedTerms`, so it does not prove the terms check. `docs/accessibility-audit.md:6` also still claims `pointer-events: none`, which the click-intercept button no longer uses. |
| **Half done** | Server-side validation | The signup route re-checks email format, password length and complexity, and terms acceptance, but it does not enforce the client's two-character name minimum, and the name, email, and password inputs have no maximum length. See defects 10 and 11. |
| **Half done** | Security and auth hardening | The inherited session cookie is still an unsigned user ID, password signup/login/forgot-password have no rate limits, and email delivery is still a development mock when SMTP is not configured. See defects 1–3. |
| **Half done** | Terms acceptance record | The checkbox is validated on the client and the server, but the acceptance itself is not stored. The `User` model has no `termsAcceptedAt` field (`prisma/schema.prisma:109-126`). See defect 4. |
| **Not started** | Lesson client validation | The in-browser check runner, output/property/method checks, Pyodide/WebR/Biowasm execution, and Web Worker harness are not built. This task only validates auth forms. |
| **Not started** | Five learning features | Guided step page, check runner, autosave/resume and cross-device sync, hint ladder with AI mentor, and progress map. |
| **Not started** | Paid path, content, AI, and operations | Access guard, Flutterwave flow, content importer, vector search, mentor routing, instrumentation, delete-my-data behavior, owner scripts, automated tests, and CI. |

**What this folder contains.** `docs/` holds the field justification, SPA rationale, terms note, validation rules, accessibility audit, enumeration, format-validation, number-input rationale, and the password/button decision (`password-and-button.md`), plus `client-side-is-not-security.md` and `interview-answers.md`. `evidence/` holds the page-count records, URL-state screenshot, form-switch log, hidden- and disabled-button recordings, form attack audit, direct-request transcript, commit/rollback log, and walkthrough. The code produced by this task lives at the repository root (`src/app/auth/page.tsx`, `src/lib/auth-routes.ts`, `src/app/api/auth/signup/route.ts`, `src/styles/auth-forms.module.css`, `src/styles/legal.module.css`, `src/app/terms`, `src/app/privacy`, and `next.config.mjs`).

**Evidence index.** `evidence/01-page-count-before.txt` records the six original pages. `evidence/02-page-count-after.txt` records the three-page auth refactor. `evidence/03-url-states.png` shows `/auth?view=login`, `/auth?view=forgot-password`, and `/auth?view=signup`; its signup screenshot is stale. `evidence/04-form-switch-logs.txt` records the form-switch server log. `evidence/05`-`12` record the empty-field, length, email, number-input, and screen-reader evidence. `evidence/13-button-hidden-version.mp4` and `.png` record the hidden-button experiment; `evidence/14-button-disabled-version.mp4` records the final visible disabled button. `evidence/15-form-attack-results.txt` records five manual edge-case probes. `evidence/16-direct-request-command-and-response.txt` and `.png` record the cURL request that bypassed the browser. `evidence/17-commit-list-and-rollback.txt` records the branch history, and `evidence/18-walkthrough.mp4` records the walkthrough. The written rationale is in `docs/field-justification.md`, `docs/spa-rationale.md`, `docs/terms-note.md`, `docs/validation-rules.md`, `docs/accessibility-audit.md`, `docs/enumeration.md`, `docs/format-validation.md`, `docs/number-input-rationale.md`, `docs/password-and-button.md`, `docs/client-side-is-not-security.md`, and `docs/interview-answers.md`.

## 3. The Stack, and Why

| Choice | Why this, rather than the alternative |
|---|---|
| **One `/auth` client page with `useSearchParams`** | The four auth forms share one shell and switch instantly from the `?view=` query, rather than forcing a server round-trip and a full repaint through four separate pages. |
| **A query-parameter view contract with 307 redirects** | `/auth?view=login` and the other views are deep-linkable and survive refresh; keeping redirects in `next.config.mjs` preserves old bookmarks and password-reset links instead of breaking them. |
| **Native HTML constraints plus computed validation state** | The form uses `required`, `type="email"`, `minLength`, and derived booleans (`formIsComplete`, `lengthValid`, `specialValid`, `numberValid`) rather than adding Zod or React Hook Form for a handful of fields. |
| **Live password strength meter and checklist** | Three derived booleans drive a custom progress bar and checklist, using `--color-error`, `--color-warning`, and `--color-primary` rather than bespoke hex values or a chart/component package. The block is tied to `password.length > 0`, so it stays out of the initial form. |
| **Visible, `aria-disabled` submit with click interception** | The sign-up button stays in the layout and tab order; clicking before terms acceptance calls `preventDefault` and shows the terms error above the button, rather than hiding the primary action or letting a disabled control silently do nothing. |
| **One static password visibility toggle** | The signup and password sign-in fields use the same absolutely positioned eye button; `::-ms-reveal` and `::-ms-clear` are suppressed so Edge cannot add a second native reveal control when text is entered. |
| **Server-side `acceptedTerms` and password checks** | The client disabled state is UX only; the API re-checks email, password length and complexity, and acceptance before writing, rather than trusting the browser. Name-length parity and shared schema validation remain later work; see defects 10 and 11. |
| **CSS Modules with the task-01 semantic tokens** | The password toggle, strength meter, checklist icons, checkbox row, and legal pages use the existing `--color-*` roles, rather than introducing a new component library or hardcoded colours. |
| **Static server-rendered legal pages** | Terms and Privacy are content pages that need no client state, rather than modal views inside the auth client bundle. |
| **No new packages** | The work uses React state, HTML constraint validation, Next.js routing, and the existing Prisma/bcrypt stack, rather than adding a dependency for every form control. |

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

Open `http://localhost:3000`. The auth views are at:

- `http://localhost:3000/auth?view=login`
- `http://localhost:3000/auth?view=signup`
- `http://localhost:3000/auth?view=forgot-password`
- `http://localhost:3000/auth?view=reset-password&token=...`
- `http://localhost:3000/terms`
- `http://localhost:3000/privacy`

The old `/login`, `/signup`, `/forgot-password`, and `/reset-password` URLs redirect to the matching `/auth` view.

**Notes.**

- There is no seed script and no `db:seed` command. The visitor catalogue is a hardcoded preview in `src/lib/catalog-preview.ts`.
- If port 3000 is already in use, Next.js will start on another port and print the URL. Set `NEXTAUTH_URL` to that URL if you want the password-reset and welcome links to point at the running server.
- The `init_auth` migration is the only migration in the repository. If the migration fails on `CREATE EXTENSION "vector"`, install pgvector in the database before retrying.
- The legal pages are static content. They do not require a database connection.
- The signup password field shows its strength meter and checklist only after typing begins; the signup button remains visible and disabled until the form is valid and the terms box is checked. Clicking the disabled button before accepting terms displays the terms message above it.
- The signup and password sign-in fields each have one show/hide toggle. The browser's native reveal control is hidden so only the app's static toggle appears.

## 5. Environment Variables

Names only. Do not commit values. The current-use column records what the code actually reads, not what a later task will need.

| Variable | What it is for | Current use |
|---|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection string used by the Prisma client at runtime. | Used by `prisma/schema.prisma`. |
| `DIRECT_DATABASE_URL` | Direct, unpooled PostgreSQL connection string used for migrations. | Used by `prisma/schema.prisma`. |
| `NEXTAUTH_URL` | Base URL used to build password-reset and welcome links. | Used in `src/lib/mail.ts` and the forgot-password route. |
| `NEXTAUTH_SECRET` | Secret for signing Auth.js sessions. | Template only; no Auth.js session signing exists. |
| `EMAIL_SERVER_HOST` | SMTP host for sign-in codes, password resets, and welcome mail. | Used by `src/lib/mail.ts`. |
| `EMAIL_SERVER_PORT` | SMTP port. | Used by `src/lib/mail.ts`. |
| `EMAIL_SERVER_USER` | SMTP username. | Used by `src/lib/mail.ts`. When not set, mail is mocked to the server console. |
| `EMAIL_SERVER_PASSWORD` | SMTP password or API token. | Used by `src/lib/mail.ts`. When not set, mail is mocked to the server console. |
| `EMAIL_FROM` | Sender address on outgoing mail. | Used by `src/lib/mail.ts`. |
| `EMAIL_SERVER_SECURE` | Forces SMTP TLS on or off. | Read by `src/lib/mail.ts`, but missing from `.env.example`. |
| `SIGNUPS_ENABLED` | Emergency switch that blocks new account creation when turned off. | Used in the signup and OTP verify routes. |
| `FLUTTERWAVE_PUBLIC_KEY` | Public key for Flutterwave checkout. | Reserved; no payment code exists yet. |
| `FLUTTERWAVE_SECRET_KEY` | Secret key for verifying and refunding Flutterwave transactions. | Reserved. |
| `FLUTTERWAVE_WEBHOOK_HASH` | Secret hash for validating Flutterwave webhooks. | Reserved. |
| `FREE_MODEL_API_KEY` | API key for the free AI pool. | Reserved. |
| `PAID_MODEL_API_KEY` | API key for the paid AI pool. | Reserved. |
| `EMBEDDING_MODEL_API_KEY` | API key for the embedding provider. | Reserved. |
| `DATASET_STORAGE_URL` | Base URL for private dataset storage. | Reserved. |
| `DATASET_STORAGE_SECRET_KEY` | Secret for signed dataset downloads. | Reserved. |
| `RECONCILE_JOB_SECRET` | Bearer secret for the payment reconcile job. | Reserved; the job is not built. |

## 6. What This Deliberately Does Not Do

- **It does not implement lesson client validation.** The task name covers auth-form validation only. There is no Pyodide, WebR, Biowasm, Web Worker, check runner, or in-browser code execution.
- **It does not build the five learning features.** The guided step page, check runner, autosave/resume and sync, hint ladder with AI mentor, and progress map remain later work.
- **It does not implement the paid path.** There is no `assertStepAccess`, no Flutterwave checkout or webhook, and no PRO entitlement enforcement beyond the existing schema.
- **It does not implement the content importer, vector search, or AI mentor.** The schema has the `ContentChunk` vector column, but no importer, embedding call, retrieval query, mentor routing, token ceiling, or output filter exists.
- **It does not persist terms acceptance.** The checkbox is enforced, but no `termsAcceptedAt` column exists, so there is no durable record of which learner accepted which version. A schema change needs owner approval.
- **It does not add production auth hardening.** There are no rate limits on password signup/login/forgot-password, the session cookie is not signed, and email delivery is not production-ready.
- **It does not add a validation library, a shared schema, or legal advice.** The form uses native constraints and derived booleans, while the signup API repeats the important checks by hand; the two rule sets can drift. The legal pages are adapted templates that still need counsel review.
- **It does not add an automated test suite.** `package.json` has no test script and there are no test files; the password rules, strength meter, and click interception are verified manually and in the evidence recordings.
- **It does not claim production readiness.** No automated test, production email, real payment, managed database, or 4 GB device run is recorded.

## 7. Known Defects

These are current defects in the checkout, not a wishlist. Code paths are relative to the repository root; this README lives in `task-03-client-validation/`. Line numbers refer to the working tree at the time of this update; the file is the source of truth if a line moves.

1. **Critical: the session cookie is an unsigned user ID.** `src/lib/session.ts:4-33` stores `nb_session_user_id` and `getSessionUser()` trusts whatever value is present. The same raw user ID is set by `src/app/api/auth/signup/route.ts:115`, `src/app/api/auth/login-password/route.ts:57`, and `src/app/api/auth/otp/verify/route.ts:108`. Any leak of a user ID is a full account takeover. This is inherited from task-02.

2. **High: no rate limits on password signup, password login, or forgot-password.** `src/app/api/auth/login-password/route.ts` has no attempt counter or delay. `src/app/api/auth/signup/route.ts` and `src/app/api/auth/forgot-password/route.ts` have no limiter. The OTP path limits three codes per email per hour (`src/app/api/auth/otp/request/route.ts:27-41`) and five wrong attempts per code (`src/app/api/auth/otp/verify/route.ts:45-51`), but there is no IP-based or new-account limit.

3. **High: without real SMTP configuration, email delivery either fails or silently logs the code.** `src/lib/mail.ts:14-16` treats missing credentials, or credentials containing a known placeholder marker, as "not configured." `src/lib/mail.ts:48-59` and `src/lib/mail.ts:98-109` print codes to the console and return `true` when no transporter exists. `.env.example:32-36` ships placeholder credentials that do not match that marker, so a fresh copy attempts SMTP to the placeholder host and the OTP request returns `500` (`src/app/api/auth/otp/request/route.ts:58-64`). `src/lib/mail.ts:10` also reads `EMAIL_SERVER_SECURE`, which `.env.example` does not list.

4. **High: terms acceptance is not persisted.** The client requires the checkbox and the API rejects `acceptedTerms !== true` (`src/app/auth/page.tsx:958-967`, `src/app/api/auth/signup/route.ts:53`), but `prisma/schema.prisma:109-126` has no `termsAcceptedAt`, `termsVersion`, or equivalent field. The business cannot prove which learner accepted which terms version. Adding the field requires a schema change and owner approval.

5. **Medium: the Terms and Privacy pages are adapted templates, not reviewed legal documents.** `src/app/terms/page.tsx` and `src/app/privacy/page.tsx` assume Nigerian governing law, `support@nucleobridge.org` and `privacy@nucleobridge.org` contact addresses, a minimum age of 16, and a ₦50,000 liability cap. The owner must have qualified counsel review both documents before launch. The source note is in `docs/terms-note.md`.

6. **Medium: parts of the task-03 evidence and supporting docs are stale or inconsistent.** `evidence/03-url-states.png` shows the old signup form with a Confirm Password field and no Terms checkbox. `evidence/04-form-switch-logs.txt` records only `/auth?view=forgot-password` and contains terminal encoding artifacts. `docs/terms-note.md` contains an encoding artifact. `evidence/16-direct-request-command-and-response.txt` sends `termsAccepted` while the route reads `acceptedTerms`, so that recording proves the email rejection but not the terms check. `evidence/15-form-attack-results.txt` also reports a spaces-only password as accepted; the current client rejects all-space values through `isBlank`, so that finding predates the current rule. `docs/accessibility-audit.md:6` still says `aria-disabled` is enforced with `pointer-events: none`, while the current signup button must receive clicks to show the terms message. The page-count evidence records 3 pages at the time; `/terms` and `/privacy` now make 5.

7. **Medium: there are no automated tests for the validation logic.** `package.json:6-13` has no `test` script, and there are no `*.test.*` or `*.spec.*` files in the repository. The computed `formIsComplete` and strength checks (`src/app/auth/page.tsx:654-700`), the click interception (`src/app/auth/page.tsx:730`), and the server checks (`src/app/api/auth/signup/route.ts:23-56`) are untested.

8. **Medium: the task docs cite GDPR/CCPA while the product uses the NDPA.** `docs/validation-rules.md:16` says the checkbox protects against "GDPR/CCPA compliance violations." The privacy page cites the Nigeria Data Protection Act 2023. The compliance rationale should be aligned with the actual market and legal review.

9. **Medium: the "Delete my data" control described in the legal pages is not implemented.** `src/app/privacy/page.tsx:273` and `src/app/terms/page.tsx:383` describe a user data deletion path, but the app has no account-area delete button or delete route. For now, learners can only exercise the right by emailing the published contact address.

10. **Medium: the signup API does not enforce the client's name-length rule.** The client requires first and last names to have at least two non-space characters (`src/app/auth/page.tsx:32-42`), but the API only checks that the trimmed values are non-empty (`src/app/api/auth/signup/route.ts:12-16`). A direct request with a valid email can create an account with one-character names; the cURL transcript stops earlier because its email is invalid.

11. **Low: the auth fields have no maximum length and some values are submitted untrimmed.** `evidence/15-form-attack-results.txt` records that very long strings and trailing whitespace are accepted; no `maxLength` attribute exists on the name, email, or password inputs. The server trims names and the email address, but the password is hashed as typed. Add length caps and normalize values before validation.

12. **Low: the auth page is a single ~1,250-line client component.** `src/app/auth/page.tsx` contains four views, both password toggles, the strength meter, and all auth state. It works, but splitting the views into components would reduce regression risk when the forms change again.
