# Task 01: Design System & Token Architecture

*A deterministic, multi-theme design token pipeline bridging Figma to production CSS for NucleoBridge.*

---

## 1. What This Task Was

NucleoBridge is an in-browser bioinformatics learning platform built for students running on low-resource hardware (4 GB RAM laptops, mobile hotspots, and unstable power). 

Before building frontend components or client-side WebAssembly runtimes, we needed a foundational design system that:
1. Translates Figma design decisions into production-ready CSS variables without manual transcription.
2. Enforces a strict architectural boundary between raw primitive swatches and semantic UI roles.
3. Supports automatic Light and Dark themes natively via browser preferences (`prefers-color-scheme`) without runtime JavaScript dependencies.
4. Delivers accessible typography (WCAG AAA compliant for large text) optimized for readability on small and low-resolution screens.

---

## 2. What Was Built

| Deliverable | Path | Description |
|---|---|---|
| **Token Pipeline Source** | [`design-tokens/`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-01-design-system/design-tokens) | Multi-mode JSON token exports (`Primitives.Mode 1`, `Color Roles.Light`, `Color Roles.Dark`, `text.styles`, `effect.styles`, `manifest.json`). |
| **Token Compiler Engine** | [`scripts/compile-design-tokens.js`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-01-design-system/scripts/compile-design-tokens.js) | Node.js script that parses multi-file token schemas, resolves token aliases in memory, and generates valid CSS custom properties. |
| **Production Stylesheet** | [`main-tokens.css`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-01-design-system/main-tokens.css) | Single source of truth CSS file containing 53 Light semantic roles, 53 Dark semantic roles, 15 typography scales + utility classes, and 3 elevation shadows. |
| **Verification Testbed** | [`login.html`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-01-design-system/login.html) | Zero-hex-code interactive login page demonstrating surface-to-background contrast, responsive typography, and instant theme toggling. |
| **Engineering Docs & Evidence** | [`docs/`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-01-design-system/docs) & [`evidence/`](file:///c:/Users/Chijioke%20Uhegwu/Desktop/Product%20Folder/Nucleobridge/task-01-design-system/evidence) | Full audit trail: colour role contracts, typography scale rationale, shadow specifications, contrast audits, and defect retrospectives. |

---

## 3. What Was Decided (Architectural Decisions & Trade-Offs)

### 1. Zero Primitive Exposure (Strict Architectural Boundary)
- **Decision:** The compiler loads `Primitives.Mode 1.tokens.json` (230 swatches) strictly into an in-memory resolution map. It **never** writes primitive CSS variables (e.g., `--palette-primary-40`, `--neutral-90`) to the final CSS file.
- **Why:** Exposing raw color scales enables developers to bypass semantic roles and hardcode static palette references into components. With zero primitives exposed, components are forced to consume semantic tokens (`--color-surface`, `--color-primary`, `--color-outline`), guaranteeing flawless theme swaps.

### 2. Single-Variable-Name Theme Swapping
- **Decision:** Both Light and Dark modes declare the **exact same CSS variable names**. Light roles are assigned under `:root`, while Dark roles override those exact names under `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`.
- **Why:** Eliminates runtime JavaScript theme management for standard users while enabling zero-re-render instant dark mode swaps.

### 3. Pinned Primary 40 Brand Anchor (`#0F6E56`)
- **Decision:** The primary brand color (`#0F6E56`, a deep green-teal) was pinned to tone **Primary 40** during algorithmic tonal generation rather than letting the generator pick an arbitrary tone.
- **Why:** Guarantees that our brand identity remains exact at key tone 40 while automatically generating accessible, mathematically balanced secondary tones (Primary 80 for Dark mode, Primary 90 for containers, Primary 20 for on-container).

### 4. Uniform 1.5 Typography Vertical Rhythm
- **Decision:** Applied a fixed `1.5` line-height multiplier (`line-height = font-size * 1.5`) across all 15 styles in the DM Sans type scale (Display, Headline, Title, Body, Label).
- **Why:** Maintains consistent vertical cadence across documentation, code snippets, and UI controls, eliminating arbitrary ad-hoc line-height offsets.

### 5. Chromatic Elevation Shadows
- **Decision:** Shadows use a tinted alpha of the primary brand color (`#0F6E56` at 12%, 18%, 20%) rather than neutral black (`#000000`).
- **Why:** Adds organic, cohesive visual depth to elevated cards and modals without muddying dark or light surfaces.

---

## 4. What Was Got Wrong (Defects & Retrospective)

### 1. The Incomplete Export Defect
- **What happened:** The first Figma export (`05-tokens-incomplete.json`) was generated with an unconfigured plugin scope and completely omitted color objects, leaving only typography and effects.
- **Correction:** Audited the payload before writing the parser, re-exported using explicit variable collection scopes, and verified the output as `06-tokens-complete.json`.

### 2. The Active-Canvas Single-Theme Trap
- **What happened:** The initial export plugin (Design Tokens) dumped tokens from the active canvas state only into a flat JSON. When converted, all CSS variables resolved only to Dark theme values inside a single `:root` block, making theme switching impossible.
- **Correction:** Migrated to the *Design Tokens Manager* workflow, producing explicitly separated mode files (`Color Roles.Light.tokens.json` and `Color Roles.Dark.tokens.json`). Refactored the Node.js compiler to generate dual-mode CSS with `:root` and `@media (prefers-color-scheme: dark)`.

### 3. First-Pass Primitive Variable Leakage
- **What happened:** In the first version of the conversion script (`convert-tokens.js`), primitives were outputted alongside semantic roles as `--palette-*` variables. A code inspection revealed component styles were starting to reference `--palette-primary-70` directly.
- **Correction:** Enforced a strict architectural hard boundary in `compile-design-tokens.js` where raw primitives exist only as an in-memory lookup table. Automated verification confirmed **0 primitive variables** in `main-tokens.css`.

### 4. Vendor Export Typo Handling
- **What happened:** The Figma tokens export included a known typo: `On_Terrtiary_Fixed` (double 'r'). 
- **Correction:** Rather than manually altering the exported source JSON, the compiler automatically registers a normalized alias (`--color-on-tertiary-fixed`) alongside the raw export name, ensuring forward compatibility without breaking source file parity.
