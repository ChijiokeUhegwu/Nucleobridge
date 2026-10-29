# Task 02: Repository Scaffold & Database Setup

*Foundational Next.js App Router, TypeScript, Prisma ORM, and Semantic Design Token Setup for NucleoBridge.*

---

## 1. What This Task Is

NucleoBridge is an in-browser bioinformatics learning platform designed for students operating on low-resource hardware (4 GB RAM laptops, mobile hotspots, and unstable power). 

This task establishes the foundational application scaffolding:
1. **Next.js App Router (Node.js runtime) with TypeScript:** Unified full-stack framework with typed routing, server components for authentication, and client-side execution shells.
2. **Prisma ORM & PostgreSQL with pgvector:** Complete 22-model Prisma schema adhering strictly to `nucleobridge-prd.md` (Sections 8 & 10) and `schema.md`, including vector embedding structures (`Unsupported("vector(768)")`) for Socratic RAG retrieval.
3. **Design System Integration:** Import and consumption of compiled design tokens from `task-01-design-system/main-tokens.css` with a hard architectural ban on primitive colors and raw hex codes.
4. **Base Layout & 100vh Minimal Home Screen:** Zero-scroll viewport layout (`height: 100vh`) displaying the course catalog preview and sign-in entry point for visitors under PRD access rules (FR-A.1, D3).

---

## 2. Deliverables & File Map

| Path | Purpose |
|---|---|
| `package.json` | Project manifest configured for Next.js, React 18, TypeScript, and Prisma ORM. |
| `tsconfig.json` | Strict TypeScript configuration with `@/*` path aliasing to `src/*`. |
| `next.config.mjs` | Next.js configuration enabling strict mode and removing header fingerprinting. |
| `.env.example` | Complete environment variable template with server-only key isolation. |
| `prisma/schema.prisma` | Full 22-model schema including vector extensions, relational restrictions, and soft-delete invariants. |
| `src/lib/prisma.ts` | Global singleton PrismaClient instance preventing connection pooling exhaustion. |
| `src/styles/main-tokens.css` | Local production copy of compiled semantic design tokens (Light and Dark modes). |
| `src/app/globals.css` | Zero-hex universal CSS reset and document root bindings using semantic tokens. |
| `src/app/layout.tsx` | Next.js root layout with DM Sans font inclusion and SEO metadata. |
| `src/app/page.tsx` | Minimalistic 100vh home screen with catalog preview and access badges. |
| `src/app/page.module.css` | Scoped modular styles strictly referencing semantic design tokens. |
| `next-env.d.ts` | Next.js ambient TypeScript declarations. |

---

## 3. Style Rules & Architectural Invariants Enforced

1. **Zero Primitive Color Exposure:**
   - No `--palette-*` variables or hardcoded `#hex` / `rgb()` values are used anywhere in application or page styling.
   - 100% of background, text, border, and badge colors strictly use semantic tokens (`--color-surface`, `--color-background`, `--color-primary`, `--color-on-surface`, `--color-outline`, etc.).
2. **Dual-Theme Support:**
   - Semantic color tokens automatically switch between Light and Dark modes via identical variable names under `:root` and `@media (prefers-color-scheme: dark)` / `[data-theme="dark"]`.
3. **100vh Viewport Constraint:**
   - The landing screen is strictly constrained to `100vh` without vertical or horizontal scrollbars, ensuring instant focus and responsiveness across display sizes.
4. **Data Model Integrity:**
   - All 22 models and enums strictly match `nucleobridge-prd.md` sections 8 and 10 and `schema.md`. No unauthorized models, fields, or indexes were introduced.

