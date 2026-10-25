# NucleoBridge

## 1. What This Is
NucleoBridge is an interactive, gamified bioinformatics education platform targeted at self-directed African students and professionals operating on low-resource hardware (4 GB RAM laptops or mobile phones), unstable power, and metered data bundles. It provides hands-on, interactive case studies where in-browser WebAssembly tool execution (Python, R, and CLI utilities) and automated step verification must run and evaluate reliably without human intervention, expensive cloud sandboxes, or answer leakage.

---

## 2. Status

| Stage | Component / Task | State | Notes |
|---|---|---|---|
| **Finished** | Product Requirements Document (`nucleobridge-prd.md`) | Completed | Comprehensive PRD defining 5 learning features, 7 milestones (M0–M7), database schema, API contracts, payment flows, and security constraints. |
| **Finished** | Repository Structure Scaffolding | Completed | Created task workstream folders (`task-01` through `task-05`) with designated `docs/` and `evidence/` subdirectories. |
| **Half Done** | Workstream Documentation & Setup | In Progress | Task directories and placeholder files are staged, but task documentation and step logs have not yet been populated. |
| **Not Started** | Design System (`task-01-design-system`) | Not Started | CSS design tokens, typography, component library, responsive layout, and accessibility rules are yet to be built. |
| **Not Started** | Repository Scaffold & Database (`task-02-repository-and-scaffold`) | Not Started | Next.js App Router initialization, TypeScript configuration, Prisma schema, PostgreSQL/pgvector setup, and initial migration have not been executed. |
| **Not Started** | Client Validation & Wasm Runtime (`task-03-client-validation`) | Not Started | Web Worker execution harness (Pyodide, WebR, Biowasm), check runners (output, property, method checks), IndexedDB autosave/resume, and hint ladder UI are unwritten. |
| **Not Started** | Server Security & Access Control (`task-04-server-security`) | Not Started | Next.js route handlers (`/api/steps/*`, `/api/mentor`, `/api/billing/*`), `assertStepAccess` guard, Flutterwave HMAC verification, and LLM rate limiters are not implemented. |
| **Not Started** | Sessions, Compliance & Defences (`task-05-sessions-compliance-defence`) | Not Started | Auth.js 6-digit email code flow, 30-day JWT sessions, cross-device sync conflict resolution, NDPA 2023 "Delete my data" handler, and red-team test suite are pending. |

---

## 3. The Stack (With Reasons)

- **Framework & API: Next.js (App Router, Node.js runtime) with TypeScript**  
  *Why:* Unifies server-side route handlers and client React components within a single codebase with shared type contracts, avoiding the deployment overhead and CORS complexities of a separate SPA and backend API.
- **Client Execution Sandbox: Web Worker with WebAssembly (Pyodide, WebR, Biowasm)**  
  *Why:* Executes real Python, R, and CLI tools (e.g., `samtools`) directly in the learner's browser with zero installation, avoiding cloud-hosted sandboxes (Docker/VMs) that rack up unsustainable per-second cloud costs and break when a learner's power or internet fluctuates.
- **Code Editor: CodeMirror 6**  
  *Why:* Provides a modular, high-performance editor with minimal memory and bundle footprint, unlike Monaco Editor which causes heavy memory spikes that freeze or crash 4 GB RAM laptops.
- **Database & Vector Search: PostgreSQL with pgvector (via Neon / Supabase)**  
  *Why:* Allows relational app data, payments, and 768-dimensional curriculum embeddings to live inside one transactional engine, avoiding multi-database synchronization drift and extra billing tiers from separate vector databases like Pinecone.
- **Database ORM: Prisma**  
  *Why:* Enforces end-to-end type safety, reliable relation queries, and reproducible schema migrations across development and production, reserving raw SQL strictly for pgvector cosine-similarity queries.
- **Local Persistence & Offline Resilience: IndexedDB + Service Worker**  
  *Why:* Provides structured, asynchronous client storage for command logs, step snapshots, and cached lesson bundles up to hundreds of megabytes, unlike LocalStorage which is synchronous, blocking, and capped at 5 MB.
- **Authentication: Auth.js (Passwordless Email One-Time Code)**  
  *Why:* Delivers friction-free login via a 6-digit time-limited code for learners accessing email on their phones while studying on laptops, removing the risk and user-friction of forgotten passwords.
- **Payments: Flutterwave (Hosted Checkout Redirect)**  
  *Why:* Native support for Nigerian payment rails (Naira bank transfer, debit card, USSD), using an external hosted redirect rather than an inline popup iframe to comply with strict Cross-Origin Opener/Embedder Policies (COOP/COEP) required by WebAssembly workers.
- **AI Mentor: Multi-tier LLM Routing (Free-tier Model, Paid Model, 768-dim Embedding Provider)**  
  *Why:* Socratic RAG pipeline that retrieves academy-authored records and guides learners without disclosing full answers, isolating providers behind a modular gateway with strict token caps and cooling-off intervals.

---

## 4. Getting Started

Follow these exact commands from a clean environment to clone, configure, and launch the platform locally:

```bash
# 1. Clone the repository
git clone https://github.com/ChijiokeUhegwu/Nucleobridge.git
cd Nucleobridge

# 2. Verify Node.js prerequisite (v20.x or higher required)
node -v

# 3. Install project dependencies
npm install

# 4. Configure local environment variables
cp .env.example .env

# 5. Generate Prisma Client and apply database schema
npx prisma generate
npx prisma migrate dev --name init

# 6. Seed initial course catalog, tools, and test plans
npm run db:seed

# 7. Start the local development server
npm run dev
```

Once running, navigate to `http://localhost:3000` in your web browser.

> [!NOTE]
> Because task implementation is actively underway, running `npm install` and `npm run dev` requires the completion of `task-02-repository-and-scaffold`.

---

## 5. Environment Variables

All variables must be defined in your `.env` file for full platform functionality. Never commit secrets or actual values to version control.

| Variable Name | Purpose |
|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection string used by the Next.js runtime for transactional queries. |
| `DIRECT_DATABASE_URL` | Direct, unpooled PostgreSQL connection string required by Prisma for migrations. |
| `NEXTAUTH_SECRET` | Secret key used by Auth.js to sign and verify session JWTs. |
| `NEXTAUTH_URL` | Canonical base URL of the application for authentication redirects and callbacks. |
| `FLUTTERWAVE_PUBLIC_KEY` | Public API key used for initiating Flutterwave checkout transactions. |
| `FLUTTERWAVE_SECRET_KEY` | Secret API key used for verifying transactions and executing refunds on Flutterwave. |
| `FLUTTERWAVE_WEBHOOK_HASH` | Secret hash used to validate incoming HMAC SHA-512 signatures on webhook events. |
| `FREE_MODEL_API_KEY` | API key for the free-tier LLM provider (serving free users and fallback requests). |
| `PAID_MODEL_API_KEY` | API key for the high-capacity LLM provider serving PRO subscribers. |
| `EMBEDDING_MODEL_API_KEY` | API key for generating 768-dimensional embeddings for lesson retrieval. |
| `DATASET_STORAGE_URL` | Base URL for private object storage hosting curated bioinformatics datasets. |
| `DATASET_STORAGE_SECRET_KEY` | Secret key used to generate short-lived (10-minute) signed download links for datasets. |
| `EMAIL_SERVER_HOST` | Host address of the SMTP provider used to dispatch 6-digit login codes. |
| `EMAIL_SERVER_PORT` | Port number of the SMTP email server. |
| `EMAIL_SERVER_USER` | Username credential for the SMTP service. |
| `EMAIL_SERVER_PASSWORD` | Password or API token for the SMTP service. |
| `EMAIL_FROM` | Sender address appearing on sign-in code emails sent to learners. |
| `RECONCILE_JOB_SECRET` | Bearer token required in the authorization header to invoke the payment reconciliation route (`/api/jobs/reconcile`). |
| `SIGNUPS_ENABLED` | Global boolean switch (`true` / `false`) allowing the owner to pause new account creation during maintenance. |

---

## 6. What This Deliberately Does Not Do (Scope Boundaries)

- **No Cloud-Based Docker Containers or Remote VM Execution:** All bioinformatics code runs client-side in browser WebAssembly to protect learners on metered bandwidth and eliminate heavy recurring server bills.
- **No Video Streaming or Heavy Media:** High-resolution video lessons demand massive bandwidth that exhausts learners' limited data packages (often ~1.5 GB); all pedagogy is text- and execution-driven Markdown.
- **No Real Patient or Clinical Genomic Data:** To eliminate bioethics and regulatory liability, only synthetic or de-identified public datasets are permitted.
- **No Custom User File Uploads:** Uploading arbitrary files is blocked to prevent malware propagation, runaway storage costs, and inconsistent check environments.
- **No Auto-Renewing Subscriptions or Recurring Card Debits:** Nigerian debit cards experience frequent automated recurring charge failures; PRO is strictly sold as a fixed-duration time pass renewed manually by the learner.
- **No Certificates, Public Leaderboards, or Community Forums:** Version one focuses strictly on individual competence verification, avoiding vanity mechanics and moderation liabilities.
- **No Live Human Grading or Synchronous Instructors:** Evaluated synchronously in-browser via deterministic checks, backed by the Socratic AI mentor for 24/7 self-paced unblocking.
- **No Native Mobile or Desktop Installers:** Strictly a modern responsive web application running via web standards with offline resilience caching.

---

## 7. Known Defects

The following defects and gaps represent the honest, current state of the codebase:

1. **Empty Workspace Root Scaffold ([`README.md`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/README.md) & Root Directory):**  
   The application repository does not yet contain a root `package.json`, `tsconfig.json`, or Next.js directory tree. Execution commands cannot run until `task-02-repository-and-scaffold` is applied.
2. **Environment Template Pending ([`.gitignore`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/.gitignore)):**  
   [`.gitignore`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/.gitignore) has now been configured to ignore `nucleobridge-prd.md`, `.env` files, build artifacts, and `node_modules`, but a corresponding `.env.example` template is not yet committed to the repository.
3. **Unimplemented Task Workstreams:**  
   - [`task-01-design-system`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-01-design-system): Contains blank `README.md` and empty `docs/` and `evidence/` directories.
   - [`task-02-repository-and-scaffold`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-02-repository-and-scaffold): Contains blank `README.md` and empty subdirectories.
   - [`task-03-client-validation`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-03-client-validation): Contains blank `README.md` and empty subdirectories.
   - [`task-04-server-security`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-04-server-security): Contains blank `README.md` and empty subdirectories.
   - [`task-05-sessions-compliance-defence`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-05-sessions-compliance-defence): Contains blank `README.md` and empty subdirectories.
4. **Missing Prisma Schema File:**  
   While the data model is comprehensively specified in [`nucleobridge-prd.md:L554-L990`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/nucleobridge-prd.md#L554-L990), there is no `prisma/schema.prisma` file present on disk to run migrations against.
5. **Unvalidated WebAssembly Memory Consumption (M0 Spike Pending):**  
   The client-side WebAssembly runtime (Pyodide, WebR, Biowasm) has not yet been benchmarked on a physical 4 GB RAM device under metered conditions; memory stability under browser worker execution remains unverified.
