# NucleoBridge Technical Handbook

## 1. Typography, shadows, and the design system export.

### 1. The Concept

A design system is the set of decisions that must stay the same everywhere: what green means, which grey is allowed on a dark surface, how large a heading is, how much shadow a card receives, and how much space sits between lines. A **token** is a named value that stores one of those decisions. A **semantic token** names the job, not the colour: `--color-error`, `--color-on-error-container`, `--color-surface`, `--shadow-soft`. A **primitive** is the raw palette value underneath, such as a specific green at tone 40. The system deliberately hides primitives from application code so a component cannot say “use palette-green-70”; it must say “use the surface colour” or “use the error colour.”

Typography is part of the same system. NucleoBridge uses five roles — Display, Headline, Title, Body, and Label — with large, medium, and small sizes. That is fifteen text styles. Every style uses a 1.5 line-height multiplier. Elevation is also tokenised: Soft, Medium, and Hard shadows use a tinted alpha of the primary brand colour rather than neutral black, so cards and dialogs feel related to the product rather than pasted on top of it.

The **design system export** is the bridge between the design tool and the code. The design tool exports JSON files under `task-01-design-system/design-tokens/`. A Node compiler resolves those files and writes `task-01-design-system/main-tokens.css`. That file is copied to `src/styles/main-tokens.css`, which is the production stylesheet the application actually consumes.

### 2. Why it Exists

Hardcoded styling fails in four predictable ways. First, it drifts: one developer uses `#777`, another uses `#767676`, and the product slowly loses a single visual identity. Second, it breaks themes: a grey that looks correct on a white card can disappear on a dark surface. Third, it hides accessibility failures: a colour chosen by eye may not meet contrast requirements, especially for the small warning text a learner needs most. Fourth, it makes change expensive: rebranding or fixing contrast means searching every file instead of changing one semantic role.

The semantic layer exists so the same component can survive a light theme, a dark theme, and a future brand change without being rewritten. The compiler’s hard boundary against primitive variables exists because an exposed primitive is an invitation to bypass the system. The 1.5 line-height multiplier exists so headings, body text, labels, and code-adjacent controls share a predictable vertical rhythm. The tinted shadows exist so elevation reads as part of the green brand system rather than as a generic black drop shadow.

If this layer is skipped, the cost is not “the page looks slightly off.” The cost is a learner missing a warning on a dark screen, a support ticket about unreadable instructions, a redesign that takes weeks because every colour is scattered, and a design review that cannot tell whether the code matches the exported design.

### 3. A Real Scenario

Dr. Aris was reviewing a variant-calling case study on a projector in a dark teaching lab. The step contained a warning: “This command overwrites the filtered VCF. Run it only after you have saved your own copy.” The warning had been styled with a hardcoded `#777` on a white mockup. On the dark projector it was nearly invisible, and a student, Amina, missed it and overwrote an intermediate file she had spent forty minutes producing.

The fix was not “make that one grey lighter.” The team changed the warning to the semantic error pair: `--color-error` for the text and `--color-on-error-container` on an error-container surface, with the `text-body-medium` style. The same markup then worked in light and dark mode because the role names stayed stable while the theme values swapped. Amina could see the warning on the next run, and the exported token file ensured the Figma design and the CSS were using the same decision instead of two near-matching greys.

### 4. How it is Done

The pipeline starts with the design-tool exports in `task-01-design-system/design-tokens/`: `Primitives.Mode 1.tokens.json`, `Color Roles.Light.tokens.json`, `Color Roles.Dark.tokens.json`, `text.styles.tokens.json`, `effect.styles.tokens.json`, and `manifest.json`. The compiler is `task-01-design-system/scripts/compile-design-tokens.js`. It loads the primitive palette into an in-memory lookup table, resolves aliases, and writes semantic CSS variables. It does not write primitive variables to the output. That is why application code cannot depend on a raw palette step even if it tries.

The compiler writes `task-01-design-system/main-tokens.css`; that file is copied to `src/styles/main-tokens.css`. The application imports the copied file from `src/app/globals.css` at the top. Light roles live under `:root`; dark roles override the same variable names under `@media (prefers-color-scheme: dark)` and, where used, `[data-theme="dark"]`. Because the names are identical, a component written once works in both themes without JavaScript. The 15 typography styles are exposed as utility classes such as `.text-title-large`, `.text-body-medium`, and `.text-label-small`. The three elevation shadows are available as `--shadow-soft`, `--shadow-medium`, and `--shadow-hard`.

Components use CSS Modules, not Tailwind. This repository contains no Tailwind configuration and no utility-class build step. If a prompt or a hand-off note mentions Tailwind, check `package.json` and the task-02 README: the shipped choice is CSS Modules over the task-01 tokens. The discipline is the same either way: no raw hex, no arbitrary font sizes, no ad-hoc shadows. Write `color: var(--color-on-surface)` and `box-shadow: var(--shadow-soft)`, and use a `.text-*` class or the matching font tokens.

When the design changes, change the token source or the relevant semantic role, recompile, and let the CSS variable names carry the change through every component. When a component needs a new role, add the role deliberately; do not reach into the palette.

### 5. Where it Goes Wrong

The primary failure is **primitive leakage**. Someone sees `--palette-primary-70` in a token file, uses it directly, and the component no longer follows the theme or the semantic contract. The second failure is **hardcoded styling**: a hex value or `12px` font size copied from a mockup. The code may look correct on one screen and fail contrast, dark mode, or the type hierarchy everywhere else. The third failure is **token drift**: the design export changes but the CSS is edited by hand, so the two sources disagree. Another is an **incomplete or single-theme export**: if the design tool exports only the active canvas, you get one theme’s values in a single `:root` block and theme switching silently stops working. The fourth is **too much elevation**: every card gets the hard shadow, and the interface becomes visually noisy, which makes real warnings harder to notice.

The business cost is concrete. Inaccessible warning text can cause a learner to lose work. Inconsistent type and spacing make the product feel unfinished, which is dangerous for a paid learning platform. A design change that requires a search-and-replace across dozens of files delays releases. A broken token reference can make a whole section render with the browser’s default colour, which looks like a production outage even when the logic is fine.

### 6. My Own Mistake

**What I Got Wrong:** I initially exported the design tokens using Figma's Design Tokens plugin, but discovered it only captured the dark theme. I then switched to the Design Tokens Manager plugin, which allowed me to export a granular, well-structured directory of JSON files that separated primitives, light and dark color roles, typography, and effects to make systematically compiling them into CSS variables much easier.

## 2. Scaffolding, the development server, and database diagnostics.

### 1. The Concept

**Scaffolding** is the smallest working skeleton of the application: the package manifest, the Next.js App Router structure, TypeScript configuration, the path alias, the Prisma client, the environment template, and the scripts that start and check the project. It is not the product. It is the thing that lets you prove the product’s foundations are connected before you build features.

The **development server** is `next dev`. It compiles routes on demand, serves the app on a local port, and prints errors in the terminal. It is not the production server. The **database diagnostics** are the tools that tell you whether a write actually happened: the Prisma client logs, the HTTP status code, Prisma Studio, and a direct row lookup. A green toast in the browser is not proof of a database write.

### 2. Why it Exists

Scaffolding exists because a feature built on an unverified foundation produces **false success**. A form can catch an error and show a red banner, but the same form can also show a green success message while the database connection is dead. Without a scaffold that proves the route, the client, the environment, and the database independently, you do not know which layer failed.

The development server exists to shorten the feedback loop, but it also creates misleading performance numbers. `next dev` compiles modules on demand, so the first request can take many seconds; that is compilation, not production latency. Database diagnostics exist because a Prisma error, a missing environment variable, and a failed migration all look similar at the UI layer. Prisma Studio, the query log, and the HTTP status narrow the failure to one layer.

A single Prisma client exists because Next.js hot reloading can otherwise create a new client on every edit and exhaust the database connection pool. The pooled and direct URLs exist because the app and migrations have different connection needs: the app uses the pool, while migrations need a direct connection that can hold a session and run DDL.

### 3. A Real Scenario

Kwame cloned NucleoBridge into `Desktop/Nucleobridge/Nucleobridge`, then ran `npm run dev` from the parent folder. The browser showed a 404 even though the terminal said the server was ready. He had started the server one directory above the App Router. He stopped it, changed into the repository root, and the root page loaded.

Later, his sign-up form returned a generic “An unexpected error occurred” message. The UI was honest, but it did not prove whether the user row existed. Kwame opened the terminal and saw Prisma’s `InitializationError: Environment variable not found: DATABASE_URL`; his `.env` had never been copied from `.env.example`. He copied the template, set both database URLs, ran the Prisma generate and migrate scripts, and tried again. This time the route returned `201`, the terminal showed the `INSERT INTO "User"` query, and Prisma Studio showed the new row. The difference between the two attempts was not the form; it was the diagnostics.

### 4. How it is Done

The scaffold uses Next.js 14 with the App Router and TypeScript strict mode. `tsconfig.json` defines the `@/*` alias so imports such as `@/lib/prisma` resolve from `src/`. `package.json` exposes `dev`, `build`, `start`, `lint`, `prisma:generate`, and `prisma:migrate`. The Prisma client lives in `src/lib/prisma.ts`; it stores the client on `globalThis` outside production so hot reloads reuse one connection pool.

The environment template is `.env.example`. `DATABASE_URL` is the pooled runtime connection. `DIRECT_DATABASE_URL` is the direct connection used by migrations. The two can be the same locally; a managed provider usually gives you a pooler and a direct host. `NEXTAUTH_URL` builds reset and verification links. `SIGNUPS_ENABLED` is the emergency switch for new accounts. Never commit `.env`, because it holds the database password and the SMTP app password.

The setup sequence is:

```bash
npm install
Copy-Item .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

`prisma:generate` creates the typed client from the schema. `prisma:migrate` applies the checked-in migrations. If you generate after a schema change but do not migrate, the client expects a column that the database does not have. If you migrate but do not generate, the TypeScript types are stale. The two steps are not interchangeable. The `npm run prisma:migrate` in the setup list is for the initial local database; a schema change later follows the manual migration rule in section 5, so a destructive change is reviewed before it runs.

For diagnostics, use three signals together: the HTTP status (`201` for a created user, `500` for a server failure), the Prisma query log, and a row read in Prisma Studio (`npx prisma studio`). If the UI says success but there is no row, the write did not happen. If the UI says failure but the row exists, the response handling is wrong. If `next dev` reports a port conflict, use the URL the terminal prints and set `NEXTAUTH_URL` to that origin so email links point at the running server. The first development request can take tens of seconds because `next dev` is compiling; a production build is the only fair performance measurement.

### 5. Where it Goes Wrong

The primary failure is **trusting the screen**. A form can show a success toast after a failed fetch if the code is optimistic, and a demo can look perfect while no user exists. The second failure is **running from the wrong directory**, which creates a second nested project or a 404 while the real app is elsewhere. The third is **schema drift**: adding a field to `schema.prisma`, running `prisma generate`, and forgetting the migration. The database has no column; every write to that field fails. The fourth is **connection exhaustion**: creating a new Prisma client in every hot reload or request path. The fifth is **port and URL confusion**: the app runs on a fallback port, but the reset email still points at `localhost:3000`.

The business cost is lost accounts, duplicated databases, misleading demos, and hours spent debugging the wrong layer. A false-success demo is worse than an obvious error because it teaches the team to trust a signal that is not connected to reality.

### 6. My Own Mistake

**What I Got Wrong:** I created a temporary API route to diagnose a database insertion error but placed the file in the wrong directory and misconfigured the HTTP method, resulting in a confusing 404 error instead of hitting the database.

## 3. Information design, the browser head, and responsive type.

### 1. The Concept

**Information design** is the order and emphasis of the page: what the learner sees first, what looks clickable, what is decorative, and what the next action is. A page can be technically correct and still fail because the primary action is buried, a badge looks like a button, or a heading wraps into a single dangling word.

The **browser head** is the metadata the page sends before the visible content: the title, description, Open Graph tags, favicon, viewport settings, preconnect hints, and stylesheet links. It controls how the page appears in a tab, a search result, a social preview, and on a phone.

**Responsive type** means the text remains readable and the layout remains usable across a 5-inch phone, a 4 GB laptop, and a projector. In NucleoBridge, the type scale itself is a fixed fifteen-style system; the responsiveness comes from layout breakpoints, line-length limits, `rem`-based controls, and a viewport that respects the device. There is no fluid `clamp()` type scale in the current tokens.

### 2. Why it Exists

Information design exists because a learner under time pressure does not read every word. If the page presents two equally loud buttons, a decorative pill, and a heading that stretches across the screen, the learner has to spend attention decoding the interface instead of the bioinformatics task. That attention cost becomes drop-off.

The browser head exists because the browser needs to know the page’s language, title, icon, and viewport before it can render a usable page. A missing viewport tells a phone to render a 980-pixel desktop layout and shrink it; the text becomes tiny and the learner pinches to read. Disabling zoom makes that worse. A missing title or description makes links look untrustworthy in search results and chat previews. Preconnect and `display=swap` reduce font delay on slow connections, which matters on metered mobile data.

Responsive type exists because the same content is read on very different screens. The system uses fixed type tokens so headings do not silently change size from page to page, then uses breakpoints and `max-width` so those sizes sit in a layout that fits the screen. The goal is not “make every font fluid”; it is “keep the hierarchy stable and the reading measure comfortable.”

### 3. A Real Scenario

Amina opened a guided RNA-seq step on a 5-inch phone during a commute. The page had no viewport metadata, so the browser rendered a desktop-width layout and shrank it. The heading “Quality control before alignment” wrapped into a narrow column with one dangling word, and a decorative “Bioinformatics in Browser” pill sat next to the logo looking exactly like a button. Amina tapped the pill, nothing happened, and she assumed the lesson was broken.

The team fixed the information design rather than adding a tooltip. They removed the decorative pill, because it looked interactive while doing nothing. They set a `max-width` on the main heading so it wrapped into a deliberate block, used `rem` padding for controls so they scaled with the learner’s font settings, and added the viewport settings the browser needed. The primary “Start step” action became the only visually dominant control above the fold. Amina found the start action on the next visit and the heading no longer broke into an orphaned word.

### 4. How it is Done

The browser head is defined in `src/app/layout.tsx`. Next.js metadata supplies a default title, a title template, a description, Open Graph fields, and a favicon. The viewport export sets `width: 'device-width'` and `initialScale: 1`. The current file also sets `maximumScale: 1`; that is a known defect, because it prevents pinch zoom. Remove `maximumScale` or set a usable maximum before treating the page as accessible. The `<head>` also contains `preconnect` hints for Google Fonts and a DM Sans stylesheet with `display=swap`.

The visual system comes from `src/app/globals.css`, which imports `src/styles/main-tokens.css`. Components use CSS Modules. There is no Tailwind in this repository; the styling layer is semantic CSS variables plus scoped module classes. The type hierarchy uses the `.text-display-*`, `.text-headline-*`, `.text-title-*`, `.text-body-*`, and `.text-label-*` utility classes. A component should pick the role that matches the content, not a font size that looks close.

For responsive layout, use CSS media queries and layout constraints. The dashboard uses a 64-pixel header, a maximum-width main column, and a single-column catalogue below 820 pixels. The auth page uses a single-column card capped at 440 pixels, which stays usable on a narrow screen without a separate mobile layout. Button padding is written in `rem` so it grows with the browser’s base font size. Headings get a measured `max-width` (the task-02 information design uses 45rem) so long text wraps deliberately instead of stretching across a wide monitor. Forms use explicit labels, `aria-describedby` for errors, and `aria-invalid` for the field state.

For information hierarchy, apply the rules from `task-02-repository-and-scaffold/docs/information-design.md`: remove decorative elements that look interactive, collapse competing sign-in and sign-up calls to action into one primary path, and apply the design system’s button label token instead of an arbitrary label size. Dark mode is handled by the same semantic variables; do not add a second set of component-specific dark styles.

### 5. Where it Goes Wrong

The primary failure is **blocking zoom**. `maximumScale: 1` looks harmless in a viewport export, but it removes a core accessibility control for low-vision learners. The second is **desktop-only layout**: fixed widths, no breakpoints, and a missing viewport produce tiny text and horizontal scrolling on phones. The third is **false affordance**: a decorative pill or badge styled like a button teaches the learner to tap the wrong thing. The fourth is **uncontrolled line length**: a heading with no maximum width becomes a wall of text or a one-word final line. The fifth is **inconsistent hierarchy**: every section uses the largest headline, so nothing is actually emphasised.

The cost is drop-off at the first screen, accessibility complaints, support messages about “buttons that do nothing,” and a product that looks untrustworthy on the exact low-cost devices the platform targets.

### 6. My Own Mistake

**What I Got Wrong:** I forgot to dynamically update the Next.js metadata for the administrative routes, meaning the browser tab title still showed the generic user dashboard title even when I was inside the admin view.

## 4. The working tree, branching, and client-side validation.

### 1. The Concept

The **working tree** is the set of files as they exist on disk right now, including changes you have not committed. The **index** is the staging area: the exact snapshot you are preparing for the next commit. A **branch** is a movable name for a line of commits. A **merge** combines two lines of history. A **working tree** with one branch means every change lands on the only line of code you have.

**Client-side validation** is the browser-side check that happens before a request is sent. It uses HTML constraints (`required`, `type="email"`, `minLength`) and React state to show an error, disable a button, or prevent submission. It is a user-experience feature. It is not a security boundary, because a request can be sent with cURL and never touch your React form.

### 2. Why it Exists

Branching exists because a production application is a live service. If every experiment lands on `main`, a broken migration or an unfinished form reaches learners immediately. A branch lets you isolate a task, test it, and drop it without contaminating the deployable line. The working tree and index exist so you can choose exactly what goes into a commit; without that control, a secret, an unrelated schema edit, or a debug file rides along with a feature.

Client-side validation exists to catch mistakes at the point of entry. If a learner types `kwame@gmail` without a top-level domain, the browser can show the error immediately, before an SMTP request bounces, before a database lookup, and before a server round trip. It also protects the happy path: a visible disabled button and inline error tell the learner what to fix without waiting for the network.

But client validation cannot be the only validation. A malicious actor can send a POST directly to `/api/auth/signup` with a malformed email, a blank password, or `acceptedTerms: false`. If the server trusts the browser, every one of those rules is bypassed. The server must repeat the checks because the server is the only boundary the attacker cannot edit.

### 3. A Real Scenario

Kwame was a bioinformatics student and a junior developer on the platform. He was fixing the signup form on a branch called `fix/signup-validation`. His working tree also contained an unrelated Prisma schema edit and a local `.env` change from a database experiment. If he ran `git add .`, the commit would mix the form fix with a schema change and a secret.

He used `git status` to see the three groups, staged only the auth page and its validation helper, and committed one logical change. The schema edit stayed uncommitted for a separate task. The `.env` stayed ignored.

That same afternoon, his classmate Amina tried to sign up with `amina@` and the password `rna`. The client showed the email-format error and the password-strength checklist before she submitted. A few minutes later, Kwame sent a direct cURL request with the same malformed payload, bypassing the browser. The signup route’s Zod schema rejected the email, the short password, and the missing terms flag before any database query ran. The client rule protected Amina’s experience; the server rule protected the system.

### 4. How it is Done

For the working tree, start with `git status`. Create a branch per task, for example `git switch -c fix/signup-validation`. Stage named files, not the whole directory: `git add src/app/auth/page.tsx src/lib/auth-validation.ts`. Commit one logical change with a plain-English message so the owner can review and revert it. Do not commit `.env`, secrets, or learner data, because a commit cannot be taken back. Do not push to `main`, and do not force-push shared history, because those actions bypass review and destroy other people’s work. The repository’s `.gitignore` already excludes environment files and local agent files; that is a safety net, not permission to stage blindly.

The auth page is `src/app/auth/page.tsx`. It uses HTML constraints and derived state rather than a form library. `EMAIL_PATTERN` checks the email shape. `normalizeEmail` trims and lowercases. `isBlank` rejects whitespace-only values. `validateEmail` returns the missing or format message. `validateSignupPassword` enforces at least eight characters, one number, and one special character. The signup form computes `formIsComplete`, renders a visible button with `aria-disabled` until the form is complete, and intercepts the click before terms acceptance to show the terms message. The password strength meter and checklist are derived from the same three booleans, so the UI and the rule cannot disagree.

The client validation is deliberately different on signup and login. Signup validates email format and password strength while the learner types, because the data is new and mistakes are likely. Login validates on submit, because a returning learner typing a familiar email should not be shown a red error at every intermediate character. The app never checks whether an email exists in real time; that would let an attacker enumerate accounts and would not prove inbox ownership anyway.

The server repeats the rules in `src/lib/auth-validation.ts` with Zod. `signupSchema`, `loginSchema`, `forgotPasswordSchema`, and the OTP schemas parse the request body before the route touches Prisma or Argon2. `safeParse` returns structured errors; `validationErrorResponse` turns them into a `400`. The signup route re-checks email format, password length and complexity, and terms acceptance; the schema field is `terms: true`, mapped from the client’s `acceptedTerms`. If you change a client rule, change the server schema in the same commit or the two rule sets will drift.

### 5. Where it Goes Wrong

The primary failure is **client-only validation**. A cURL request bypasses the form, so any rule that exists only in the browser is not a rule. The second is **rule drift**: the client requires two-character names but the server accepts one-character names, or the client adds a maximum length that the server does not enforce. The third is **a mixed working tree**: an unrelated schema edit or a `.env` file is committed with a feature, so the commit cannot be reviewed or reverted cleanly. The fourth is **long-lived branches**: the longer a branch lives, the more likely it is to conflict with `main` and the more expensive the merge becomes. The fifth is **pushing directly to the production branch**, which turns an experiment into a live incident.

The business cost is a security bypass, corrupted or low-quality account data, SMTP bounces from invalid emails, a support queue full of “the form is broken” messages, and a release that cannot be rolled back because the commit contains unrelated changes.

### 6. My Own Mistake

**What I Got Wrong:**  I unnecessarily installed a global state management library (Zustand) just to pass a single email string from a failed login to the reset form, over-engineering what should have been handled by standard React state or Next.js URL parameters.

## 5. Migrations, schema design, and email delivery.

### 1. The Concept

A **migration** is a versioned, executable change to the database schema. It is SQL that moves a database from one known state to another: add a column, create a table, add an index, change a relation. Prisma stores migrations in `prisma/migrations/` and records which ones have run. A **schema** is the shape of the data: tables, columns, types, relations, constraints, and indexes. **Email delivery** is the transport that sends sign-in codes, verification codes, and password-reset links through SMTP.

### 2. Why it Exists

Migrations exist because a database is not a text file. If one developer adds a column by hand in Prisma Studio and another developer does not, the two environments diverge. The code may work locally and fail in production because a column, index, or enum is missing. A migration makes the change reproducible: a fresh clone can apply the same history and reach the same shape.

Schema design exists because the shape determines what the application can enforce. A unique email prevents duplicate accounts. A unique session token hash prevents two sessions from sharing an identity. A `Restrict` relation prevents a step from being deleted while learner progress points at it. A `SetNull` relation lets a payment record survive account deletion without the learner link. A missing index turns a login or payment lookup into a full table scan.

Email delivery exists because NucleoBridge uses email as the sign-in channel and the recovery channel. If SMTP is misconfigured, the learner cannot sign in at all. If codes are stored in plaintext, a database leak hands over live credentials. If an email send blocks the HTTP request, a slow SMTP server makes the whole app feel broken. The design uses short-lived hashed codes and background sending because the identity proof must be cheap to verify, safe to store, and independent of the request latency.

### 3. A Real Scenario

Dr. Aris imported a new RNA-seq case study that needed to mount two reference datasets on the same step. The relation between a step and a dataset did not yet exist in the development database. A developer ran a migration while switched to the wrong branch and against a different database than the one the app was using. The schema changed in one place, but the application still talked to the other. The app threw a Prisma error when the importer tried to create the relation, and a learner, Kwame, could not open the step because the bundle query failed.

The team fixed the process, not just the error. They checked the migration status, confirmed which database the app was using, applied the forward-only migration to that database, regenerated the Prisma client, and re-ran the importer. The relation was created with the intended `onDelete` behaviour. Separately, Kwame could not receive his sign-in code because the SMTP credentials were still placeholders. The terminal showed the mock-email warning with the code, which is useful in development but useless to a real learner. They configured the SMTP app password and moved the send into a background call; the next code arrived in his inbox.

### 4. How it is Done

The schema is `prisma/schema.prisma`. The migration history is `prisma/migrations/`. The normal development flow, using a descriptive name for the change, is:

```bash
npx prisma migrate dev --name add_step_dataset
npx prisma generate
```

In this project, migrations are run by hand. The owner requires a human to read the SQL before it touches a database, because an agent can generate a destructive change without understanding retention. Never edit a migration that has already run; the migration table will not re-run the edited file, and a fresh environment will build a different schema. If a migration is wrong, write a new forward migration that corrects it.

`DATABASE_URL` is the pooled runtime URL; `DIRECT_DATABASE_URL` is the direct URL for migrations. The two can be the same locally, but a pooled connection can fail on DDL in a managed environment. Use the direct URL for migrations.

Schema design follows a few hard rules. `User.email` is unique because it is the account key. `Session.tokenHash` is unique because a token must map to one session. `Payment.reference` and `PaymentEvent.eventKey` are unique because the payment flow is idempotent and a duplicate event must not grant access twice. `CaseStudy` and `Step` use `archivedAt` rather than hard deletion, because learner progress, snapshots, and mentor messages point at them. `Step` relations from learner rows use `Restrict`, because deleting a step must not wipe learner history. `Payment.userId` and `Entitlement.userId` use `SetNull`, because financial and membership records must survive account deletion. `Session` and `PasswordResetToken` cascade from the user, because those credentials must disappear with the account. Indexes go on lookup and sort paths: the unique email, the session token hash, the payment reference, the event key, the user-and-step progress key, and the user-and-end-date entitlement index.

The email layer is `src/lib/mail.ts`. It builds a Nodemailer transport from `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_SECURE`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, and `EMAIL_FROM`. When the credentials are missing or still contain placeholder markers, the helper logs the message to the server console and returns `true`; that is a development mock, not production delivery. The welcome helper uses `escapeHtml` for the learner’s first name and the login URL before putting them into HTML; the OTP, verification, and reset values are generated by the server, not supplied by the learner. Sign-in codes are six digits from `crypto.randomInt`, stored as a SHA-256 hash with a ten-minute expiry. Password-reset tokens are random 32-byte values, stored as a SHA-256 hash with a one-hour expiry. The reset link is built from `NEXTAUTH_URL`; if the app runs on a fallback port, the link must point at that origin. Sending is moved into a background promise in the registration and verification routes so the HTTP response does not wait on Gmail.

### 5. Where it Goes Wrong

The primary failure is **migration drift**: the Prisma client and the database disagree because one of `migrate` or `generate` was skipped. The second is **running the migration against the wrong database or branch**, which produces a schema that the running app cannot use. The third is **editing an applied migration**, which silently corrupts the history. The fourth is **destructive relation design**: a cascade from a user or step deletes records that must survive, such as payment rows or learner progress. The fifth is **missing indexes**, which turns a login or payment lookup into a slow scan under load.

On the email side, the primary failure is **placeholder SMTP in production**. The form returns an error, or worse, the mock logs the code while the learner waits for an email that will never arrive. Gmail also has daily sending limits; a signup spike can block delivery. Sending inline makes the request wait on SMTP and creates a timeout spiral. Storing a code in plaintext means anyone with database read access can sign in as the learner.

The business cost is data loss, duplicate or orphaned accounts, learners locked out of a platform whose only door is email, bounced-email damage to the domain’s sender reputation, and a migration incident that is difficult to reverse because the history was edited.

### 6. My Own Mistake

**What I Got Wrong:** I deleted the phoneNumber and favoriteColor columns directly from my schema.prisma file but initially failed to run npx prisma migrate dev, causing a severe structural drift error between my Prisma client and the actual PostgreSQL database.

## 6. Server-side validation, hashing, rate limiting and verification.

### 1. The Concept

**Server-side validation** is the check that runs on the server after the request body is parsed and before any database query, business logic, or expensive cryptography. **Hashing** is a one-way transformation: the server stores a fingerprint of a password, never the password. A **salt** is a random value mixed into each hash so two identical passwords produce different stored values. **Rate limiting** caps how many requests a client can make in a window. **Verification** proves the learner controls the email address they claim.

NucleoBridge uses Zod at the request boundary, Argon2id for passwords, SHA-256 for short-lived one-time codes and reset tokens, a five-request-per-fifteen-minute in-memory limiter, and a six-digit email code with a ten-minute expiry.

### 2. Why it Exists

Client validation can be bypassed, so the server must validate because it is the only code the attacker cannot edit. Validation must run before the database because an unvalidated query can write bad data or leak through an unexpected error. It must run before Argon2 because an oversized password or malformed payload can burn CPU and create a denial-of-service path.

Passwords need a slow, salted hash because a fast hash such as SHA-256 is designed for speed. A GPU can test billions of SHA-256 guesses per second; Argon2id’s memory cost makes each guess expensive, so a stolen database is much harder to crack. Salting prevents one precomputed table from cracking every user who chose the same password. Legacy bcrypt support exists because older accounts may still have bcrypt hashes; the login path verifies them and rehashes to Argon2id after a successful login.

Rate limiting exists because a correct password check is still guessable if an attacker can make unlimited attempts. Verification exists because an account keyed only by an email string is not proof that the person owns the inbox; without it, bots can create accounts with mistyped or disposable addresses, and transactional email bounces damage deliverability.

### 3. A Real Scenario

Kwame used the password `Rna-seek-2019` on another site. That site was breached, and the password appeared in a credential-stuffing list. A bot tried the same email and password against NucleoBridge. Three independent controls mattered. The password had already been rejected at signup by the Have I Been Pwned check, so Kwame had chosen a different one. The login route validated the payload with Zod before touching the database. Argon2id made each guess roughly 150 milliseconds instead of under a millisecond, and the in-memory limiter stopped the source after five attempts in fifteen minutes. When the attacker tried a direct request with a malformed payload, the server rejected it before Prisma or Argon2 ran. Kwame’s account survived because the defense was layered, not because one check was perfect.

### 4. How it is Done

The boundary schemas live in `src/lib/auth-validation.ts`. They are Zod objects for signup, login, forgot-password, OTP request, OTP verification, and password reset. The routes call `safeParse` on the parsed JSON body and return `validationErrorResponse` on failure. The signup schema enforces names of at least two characters, an email shape, a password with at least eight characters, one number, and one special character, and terms acceptance (`terms: true`, mapped from the client’s `acceptedTerms`). The routes normalize the email with trim and lowercase before the database lookup. Passwords are trimmed of leading and trailing whitespace to avoid paste errors; the remaining value is hashed exactly as the learner intended.

Password hashing is in `src/lib/auth.ts`. `hashPassword` uses `@node-rs/argon2` with the OWASP baseline: 19 MiB of memory, time cost 2, parallelism 1, and a 32-byte output. Argon2id generates a unique salt automatically and stores it inside the encoded hash. `verifyPassword` detects a bcrypt hash and verifies it with `bcryptjs` for legacy accounts; otherwise it verifies the Argon2id hash. `needsPasswordRehash` returns true for a non-Argon2id hash or an Argon2id hash below the current parameters, and the login route rehashes after a successful verification.

The breach check is `isPasswordBreached` in the same file. It computes SHA-1 locally, sends only the first five hex characters to the HIBP range API, receives the matching suffix range, and compares the remaining hash locally. The plaintext password and the full hash never leave the server. If the password is found, signup returns a 400 and does not create the account.

Rate limiting is `src/lib/rate-limit.ts`. It uses an in-memory `Map` keyed by the first `x-forwarded-for` value and allows five requests per fifteen minutes. It is deliberately simple and fast, but it resets on process restart and does not share state across serverless instances. It also trusts `x-forwarded-for`; in production the reverse proxy must strip untrusted client headers and append the verified ingress IP. IP-only limits are not enough: attackers can rotate IPs, and a university NAT can put hundreds of legitimate learners behind one address. Serious deployments key on email, account, and session identifiers as well, and store counters in Redis or another shared store.

Verification uses a six-digit code from `crypto.randomInt(100000, 1000000)`. The database stores only the SHA-256 hash and a ten-minute expiry. The verify route checks the hash, rejects an expired or consumed code, increments the wrong-attempt counter, kills the code after five wrong tries, and marks the code consumed on success. The user row gets `emailVerified: true` and `emailVerifiedAt`. Password-reset tokens follow the same pattern: random 32-byte token, SHA-256 hash, one-hour expiry, single use. The login and forgot-password responses use generic messages such as “Invalid email or password” or “If an account exists…” so an attacker cannot distinguish a missing account from a wrong password.

### 5. Where it Goes Wrong

The primary failure is **client-only validation**, which a direct request bypasses. The second is **cheap password hashing**: SHA-256 or MD5 turns a leaked database into a fast offline cracking problem. The third is **missing salt**, which lets one rainbow table or one shared-password attack cover many accounts. The fourth is **an in-memory limiter treated as production security**: a restart clears it, and a serverless deployment may give each request a fresh map. The fifth is **trusting `x-forwarded-for`**, which an attacker can spoof. The sixth is **plaintext one-time codes or reset tokens**, which turn a database read into account takeover. The seventh is **timing or error-message leaks** that reveal whether an email exists; the signup route currently returns a specific 409 when the email is already registered, which is an enumeration signal. If that matters for your threat model, return a neutral response and send a sign-in email instead.

The business cost is account takeover, credential-stuffing waves, CPU exhaustion from unvalidated Argon2 calls, a spam-filled user table, locked-out learners on shared campus networks, and a breach that destroys trust in a platform that stores learner code and payment references.

### 6. My Own Mistake

**What I Got Wrong:** I wrote my Argon2id hashing test script using older CommonJS require() syntax, which immediately crashed with a ReferenceError because my Next.js project was strictly configured for modern ES Modules. I also crashed my SMTP setup by trying to use my standard Google password instead of a dedicated App Password.

## 7. Sessions, logout, account deletion and compliance.

### 1. The Concept

A **session** is the server’s record that a browser is signed in. NucleoBridge does not put the user ID in the cookie. It creates a random token, sends the raw token to the browser in an HttpOnly cookie, and stores only the SHA-256 hash of that token in the `Session` table. **Logout** means two things: clear the browser cookie and delete the server-side session row. **Account deletion** is a request to erase the learner’s records. NucleoBridge uses a 30-day grace period, then a purge job. **Compliance** means the deletion and retention rules match the law and the promises made to the learner, including the parts the app cannot erase.

### 2. Why it Exists

Sessions exist because HTTP is stateless. Without a server-side record, the browser would have to send the password on every request, or the server would have to trust a self-contained token that cannot be revoked. The token hash exists because a database leak should not hand an attacker live session cookies. The expiry exists because a stolen token should not work forever.

Logout must delete the server row because clearing only the browser cookie leaves a copied token valid on another device. The password-reset flow deletes all sessions for the same reason: a reset usually means the account may be compromised, so every old device must be evicted.

Account deletion exists because the learner has a right to erasure, and because keeping every record forever is both a privacy risk and a storage cost. The grace period exists because the purge job needs a clear, auditable state and because the owner chose a 30-day window before the hard delete; the account is locked from the moment of confirmation, so this is not a period for continued use or an in-app cancel. The separate retention rules exist because some records cannot be erased: tax and accounting rules require payment and membership records, and the business may need them to defend legal claims. The app removes the learner link from those rows instead of pretending they are gone.

Backups and AI providers are part of the same concept. A backup is a copy the deletion cannot edit directly; the policy must state how long a deleted row can survive there. An AI provider holds its own copy of mentor questions; the app cannot delete it. A privacy document that promises “everything, everywhere, immediately” is false.

### 3. A Real Scenario

Zainab signed in to NucleoBridge on a shared lab computer before a phylogenetics practical. She copied a paper link, clicked Sign Out, and left. While the session was still open, a second student had copied the session cookie from the browser profile and tried to use it from another machine.

The attacker’s request failed because Zainab’s logout had deleted the `Session` row tied to that token. If the app had only cleared the browser cookie, the copied token would still have worked. The cookie was also HttpOnly and SameSite=Lax, so a cross-site script could not read it easily and a cross-site POST would not carry it. The server checked that the user still existed and had not requested deletion on every request, so a deleted or suspended account could not keep using an old session.

Months later, Zainab used the account-area “Delete my data” button. Her email and names were replaced immediately, her password hash and verification code were removed, and her sessions and reset tokens were deleted. The account was locked, but the learner records stayed under a random ID for 30 days. At the end of the grace period, the purge job deleted her progress, snapshots, attempts, mentor messages, hint counts, and account-linked events. Her payment and membership rows survived without her user link because the business must keep financial records. The privacy document told her that the AI provider’s copy of a mentor question could not be removed, and that encrypted backups could hold an older copy for up to seven days.

### 4. How it is Done

The session code is `src/lib/session.ts`. `SESSION_COOKIE_NAME` is `nb_session`. A session lasts 30 days. `createSession` generates 32 random bytes with `crypto.randomBytes(32)`, hashes the token with SHA-256, stores the hash and expiry in the `Session` table, and returns the raw token to the caller. `setSessionCookie` writes the raw token with `httpOnly: true`, `secure` in production, `sameSite: 'lax'`, `path: '/'`, and `maxAge` equal to 30 days. `getSessionUser` reads the cookie, hashes it, looks up the session with the user, rejects an expired session and deletes it, rejects a missing user or a user with `deletionRequestedAt`, and returns the user.

Logout is `POST /api/auth/signout`. It calls `invalidateExistingSession`, which extracts every session token from the cookie store and request header and deletes each matching `Session` row. It then clears the root cookie and any legacy subpath cookies. The client should redirect only after the server responds successfully; a failed network request means the server session may still be alive, and the learner should be told that. Password reset calls `prisma.session.deleteMany({ where: { userId } })` in the same transaction that updates the password and consumes the reset token, so every old device is evicted.

Account deletion is `src/lib/account-deletion.ts`. `DELETION_GRACE_PERIOD_DAYS` is 30. `requestAccountDeletion` runs a transaction that sets `deletionRequestedAt`, replaces the email with a random `deleted-<uuid>@example.com`, sets the names to “Deleted” and “User”, nulls the password hash and verification code, and deletes sessions and password-reset tokens. `getSessionUser` rejects a user with `deletionRequestedAt` set, so the account is locked immediately. The purge job, `purgeExpiredAccounts`, finds users whose `deletionRequestedAt` is at least 30 days old, deletes the learner rows in a transaction, and deletes the user row. `Payment.userId` and `Entitlement.userId` use `onDelete: SetNull` so the financial and membership rows survive without the learner link. The retention matrix in `task-05-sessions-compliance-defence/docs/retention-matrix.md` lists every table and column; the privacy document in `privacy.md` states the grace period, purge list, retained records, backup window, and AI-provider limit in plain language.

Compliance is not a single checkbox. The NDPA 2023 gives a right to erasure, but that right is qualified by legal obligations and legal claims. Payment and membership records are retained permanently by owner decision, delinked from the user and kept for tax, accounting, audit, fraud, and disputes. The retained rows are pseudonymous, not anonymous; a payment reference can still be linked through Flutterwave. The 30-day grace row is also pseudonymous and remains personal data until purge. Learner events have a 180-day cap, but events linked to a deleted account are purged at deletion. Backup policy is a 7-day encrypted window with a 24-hour deletion-propagation requirement; the detail is in the retention matrix. The AI provider’s copy is outside the app’s control, and the privacy document says so.

### 5. Where it Goes Wrong

The primary failure is **an unsigned or unhashed session cookie**. The earlier scaffold used `nb_session_user_id`; the current `session.ts` no longer does. If a cookie contains a raw user ID and the server trusts it, anyone who guesses or steals an ID becomes that user. The second is **logout that only clears the browser cookie**; the server row remains valid for an attacker who copied the token. The third is **no user existence check** on each request, so a deleted or suspended account keeps working until the cookie expires. The fourth is **no expiry or rotation**, so a stolen token remains valid indefinitely. The fifth is **cascading deletion of financial records**, which destroys the records the business is legally required to keep. The sixth is **overpromising deletion**: telling the learner that every copy is gone when backups, Flutterwave, or an AI provider still hold one. The seventh is **retaining identifiable data and calling it anonymous**, which is a compliance failure, not a data-minimisation success.

The business cost is account takeover, regulatory exposure under the NDPA, refund and tax disputes with no audit trail, a privacy complaint that the published policy and the code disagree, and a loss of trust that no UI polish can repair.

### 6. My Own Mistake

**What I Got Wrong:** I initially planned to have administrators manually type the /admin URL into the address bar to access the protected route after logging in, rather than architecting a seamless, automated role-based login fork to route them correctly.
