# Conversion of JSON file to CSS variables

Write a Javascript script that you will use to convert the design system in @./task-01-design-system/evidence/06-tokens-complete.json to CSS variables.
Take note of the primitive colors in the system and the color roles. Using standard system practise, remember that the color roles are what will be used directly on the UI and the primitive will not be used directly on the UI.
Use CSS variables and ensure that this design system remains the source of truth for UI implementation.

# Agent Prompt (for the node.js utility script to convert the design system in @./task-01-design-system/evidence/tokens-complete.json to CSS variables)
Write a Node.js utility script to parse our exported design tokens JSON file @./task-01-design-system/evidence/06-tokens-complete.json and convert it into a valid CSS file containing custom properties (CSS variables). The script must map the system's primitive color values to their assigned semantic color roles. Crucially, you must configure the generated CSS so that only the semantic color roles (e.g., `--color-surface`, `--color-primary`, `--color-on-primary`) are accessible for use on the interface. The script must not output or expose the underlying primitive colors (e.g., `--neutral-90`, `--primary-40`) as usable CSS variables for components. This strict boundary is required to ensure that primitive colors are never used directly in the interface and the design system remains the absolute single source of truth. Save the file at @./task-01-design-system/second-tokens.css

# Prompt to convert the directory of json files into css variables
Write a Node.js utility script to parse a directory of exported Figma design token JSON files (@./task-01-design-system/design-tokens) and compile them into a single, valid CSS file named `@./task-01-design-system/main-tokens.css`.

The target directory contains the following file structure:
- `manifest.json`
- `Primitives.Mode 1.tokens.json`
- `Color Roles.Light.tokens.json`
- `Color Roles.Dark.tokens.json`
- `text.styles.tokens.json`
- `effect.styles.tokens.json`

The script must execute the following logic:

1. ZERO PRIMITIVE EXPOSURE (CRITICAL ARCHITECTURE): 
Parse `Primitives.Mode 1.tokens.json` into memory to build a reference map of raw hex values. You MUST NOT output or expose these primitive colors (e.g., --palette-primary-40, --neutral-90) as usable CSS variables in the final CSS file. The primitive values exist solely to resolve the semantic roles.

2. LIGHT THEME GENERATION:
Parse `Color Roles.Light.tokens.json`. Traverse the semantic roles, resolve their aliased values using your in-memory primitive map, and output them as CSS variables (e.g., `--color-primary`, `--color-surface`) containing the raw hex codes. Place these inside a standard `:root { }` block.

3. DARK THEME GENERATION:
Parse `Color Roles.Dark.tokens.json`. Traverse the semantic roles, resolve their aliased values using your primitive map, and output them using the exact same CSS variable names (e.g., `--color-primary`, `--color-surface`). Place these inside a `@media (prefers-color-scheme: dark) { :root { ... } }` block.

4. TYPOGRAPHY & EFFECTS:
Parse `text.styles.tokens.json` and `effect.styles.tokens.json`. Output the typography scales (font-size, line-height, weight, family) and shadow definitions as CSS variables within the main `:root` block. Additionally, generate standard CSS utility classes for the typography roles (e.g., `.text-display-large { font-family: var(--font-family-base); font-size: ... }`).

Ensure the generated `@./task-01-design-system/main-tokens.css` file strictly enforces that semantic color roles are the only accessible colors for interface components.

# Creating a simple webpage without the design system
Just create a simple login page using the color system. Use html css and js only

# Creating a simple webpage that explicitly references the complete design system

Create a simple login page using only HTML, CSS, and JS. Link it directly to our generated `@./task-01-design-system/main-tokens.css` file. 

Crucial rule: You must STRICTLY use the semantic color variables (e.g., var(--color-background), var(--color-surface), var(--color-primary), var(--color-on-surface)) for all colors. Do not use any hardcoded hex codes. 

Include a card container, email/password inputs, and a primary submit button. The goal is to visually verify that our Light/Dark mode `@media` queries are working properly, so ensure there is clear contrast between the page background and the login card surface.

