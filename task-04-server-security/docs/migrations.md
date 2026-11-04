# docs/migrations.md

## Schema Drift Explanation
The drift error occurred because the Prisma Client and the underlying PostgreSQL database went out of sync. When I added `favoriteColor` to the schema and ran `prisma generate`, the application's TypeScript definitions and query engine rebuilt themselves to expect that column to exist. However, because I intentionally skipped running `prisma migrate dev`, the actual SQL `ALTER TABLE` command was never executed on the database. When the updated application attempted to write to `favoriteColor`, the database rejected it because, from the database's perspective, the column physically does not exist.

## Why Migrations are Forward-Only
Migrations must be strictly forward-only because databases act as the central state of an application in production. If you attempt to rewrite history by rolling back or altering past migrations, you risk irreversible data loss (e.g., dropping a column that users have already populated) and create catastrophic state mismatches between the production database and the codebase. If a mistake is made, the correct approach is to write a *new*, forward-moving migration that fixes the error, preserving the immutable audit trail of how the schema evolved over time.

## Why We Never Edit an Already-Run Migration
Once a migration has been executed against a database (especially in production or staging), its SQL file becomes a permanent historical record. If a developer retroactively edits that file, the local codebase will no longer match the physical state of the database. The ORM tracks which migrations have run via a migrations table; it will not re-run a modified file. Editing past migrations silently corrupts the schema's source of truth, guaranteeing deployment failures when a new environment attempts to build the database from scratch. 

## Manual Execution vs. Agent Automation
I require migrations to be run by hand, explicitly prohibiting AI agents from executing them automatically. Generating schema changes automatically is highly dangerous because AI lacks the broader business context regarding data retention. An agent might casually drop a table or column to resolve a type error, instantly wiping out critical production data. Running migrations manually enforces a "propose-and-stop" safeguard, ensuring a human reviews the destructive potential of the SQL before execution. 

## The Cost of Manual Execution
The honest cost of this choice is speed and human error. Running migrations manually slows down the development loop and introduces friction during rapid prototyping. Furthermore, because it relies on human memory, developers will inevitably forget to run `prisma migrate dev` after updating a schema file, leading to the exact schema drift errors demonstrated in this task. We trade velocity and convenience for absolute data safety.