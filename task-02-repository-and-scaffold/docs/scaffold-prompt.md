# Scaffolding Prompt

## First draft:
You are a software engineer that has built several high-end applications. You understand what it means to scaffold an application and get it running in minutes so that you can test the database connections and confirm that everything is adequately connected. Before you proceed with anything, I need you to read through the following instructions carefully in order: 

1. Read all context files and design system files before writing any code. The context files include all files in the .agents folder, AGENTS.md, and nucleobridge-prd.md. the design system is task-01-design-system\main-tokens.css
2. Summarise its understanding and wait for your approval.
3. Treat those files as the only source of truth.
4. Ask rather than assume when two files disagree.
5. Use the design system tokens with no hardcoded styling values.
6. Build only the project setup and a minimal home screen. Not the product.
7. List every file you create and every assumption you made during the build process.
8. Audit your own response against these instructions.


## Final Prompt:
You are scaffolding the Nucleobridge application using Node.js, Prisma ORM, and PostgreSQL 18. Before writing any code, execute the following strictly in order:

1. Read all context files (`.agents/` folder, `AGENTS.md`, `nucleobridge-prd.md`) and the design system (`task-01-design-system/main-tokens.css`). Treat these files as the absolute single source of truth. 
2. If any files disagree, ask me for clarification immediately. Do not make assumptions.
3. Summarize your understanding of the project requirements, architecture, and design rules. STOP and wait for my explicit approval before writing any code.
4. Once approved, build the foundational project setup, establish a clean folder structure, and create a base layout.
5. Build a minimalistic home screen that takes up exactly 100vh.
6. STYLE RULES: You must strictly apply colors using ONLY the semantic design tokens from `main-tokens.css`. Hardcoded values and primitive palette variables are strictly forbidden.
7. Output a list of every file you created and document any technical assumptions you made during the build.
8. Audit your own final response against this exact prompt to guarantee no steps were missed.

## Difference between the two prompts
The revised prompt improved my original draft by adding clear structure and critical missing details so the AI doesn't guess how to build my app. My specific tech stack—Node.js, Prisma ORM, and PostgreSQL 18—were added in the updated prompt which is important because the agent might set up the wrong database or framework without it. The instructions to build a folder structure, create a base layout, and ensure the minimalistic home screen is exactly `100vh` were also added, as they were missing from my version. Finally, the styling rules were sharpened to explicitly forbid hardcoded values and primitive palette variables, ensuring the agent strictly follows my design system tokens without breaking my color architecture.