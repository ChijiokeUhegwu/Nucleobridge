# docs/model-choices.md

**Task Allocation**
- **Google Antigravity:** Used for the initial foundational scaffolding of the Nucleobridge application, establishing the folder structure, base layout, and strict design system integration.
- **Open Code:** Used for building the subsequent authentication flow, which included updating the Prisma schema and implementing the Sign Up, Login, and Password Reset routes.

**Observed Differences**
The core difference between the two agents lies in their execution latency and planning depth. Antigravity was noticeably slower to begin writing code. Before executing any file creation or terminal commands, it spent significant time reading the provided context files, analyzing the strict styling rules, and formulating a structured plan. This methodical, analysis-heavy approach made it ideal for the initial scaffold, where establishing the correct architectural foundation and adhering strictly to the design tokens was critical. 

Conversely, Open Code prioritized immediate execution. It optimized for writing code quickly, jumping straight into generating the authentication logic and database queries without an extensive planning phase. This makes Open Code highly effective for rapidly building specific, isolated features once the broader project constraints and baseline architecture have already been safely established by a planning-focused agent like Antigravity.