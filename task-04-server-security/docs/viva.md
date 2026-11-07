# docs/viva.md

## Databases

**A query that was running in ten milliseconds suddenly takes thirty seconds. Walk me through your debugging process.**
I would first run `EXPLAIN ANALYZE` on the query to view the execution plan and see if the database is unexpectedly performing a sequential scan instead of an index scan. Sudden degradation usually points to outdated table statistics, so I would run `ANALYZE` on the table to help the query planner. If the statistics are fine, I would check if the table recently crossed a size threshold causing memory spills to disk, look for dead tuples causing bloat (which requires running `VACUUM`), or check system metrics for CPU spikes or lock contention from other transactions. 

**How would you index a table to optimise both a query filtering on one column and a query filtering on that column plus a second one?**
I would create a single composite (multi-column) index containing both columns. The order is critical: the column that is queried by itself must be placed first in the index. For example, an index on `(column_A, column_B)` will perfectly optimize a query filtering `WHERE column_A = X`, as well as a query filtering `WHERE column_A = X AND column_B = Y`.

**Why does the order of columns in a composite index matter?**
A B-tree index sorts data strictly left-to-right. An index on `(Last_Name, First_Name)` organizes the data alphabetically by last name, and then by first name within those groups. If a query only filters by `First_Name`, the database cannot use this index efficiently because the primary sorting mechanism (Last Name) is ignored, forcing a full scan. You can only traverse the index if you provide the leftmost columns.

**Why not create an index for every frequently filtered column?**
Indexes drastically increase the cost of write operations (`INSERT`, `UPDATE`, `DELETE`). Every time a row is modified, the database must synchronously update the main table and physically restructure every associated B-tree index before returning a success state. Over-indexing consumes excessive disk space and severely degrades the application's write latency, creating a strict trade-off between read speed and write throughput.

**What is the N plus one problem, and how do you solve it?**
The N+1 problem occurs when an application executes one database query to fetch a list of $N$ items, and then loops through that list, executing an additional query for each item to fetch related data (resulting in $N+1$ total queries). This creates massive network latency. I solve it by utilizing SQL `JOIN`s to fetch all data in a single round trip, or by using a batching strategy like an `IN (...)` clause. Modern ORMs like Prisma handle this automatically when using the `include` relation syntax.

**Can you explain how you would migrate a large database with minimal downtime?**
I would use the expand-and-contract pattern. First, I add the new schema (like a new column) without modifying the old one. Second, I update the application to write to both the old and new columns, but continue reading from the old one. Third, I run a background script to backfill historical data from the old column into the new one. Fourth, I update the application to read from the new column. Finally, after verifying stability, I run a cleanup migration to drop the old column.


## Queues and Email

**What is the difference between at-least-once and exactly-once task execution?**
At-least-once guarantees that a message will be delivered and processed, but in the event of a network timeout or worker crash, the system will retry the task, potentially executing it multiple times. Exactly-once guarantees the task is executed one time only, which requires highly complex distributed state tracking and consensus protocols. Most robust systems rely on at-least-once delivery paired with idempotent worker logic.

**How do you make a queue job handler idempotent?**
An idempotent handler produces the exact same end-state regardless of how many times it is executed. I achieve this by checking the system state before acting. For example, before sending a welcome email, the handler queries the database to check `has_received_welcome_email`. If true, it gracefully exits. Alternatively, I use database constraints like unique keys or `UPSERT` operations to guarantee that duplicate processing attempts safely overwrite or bounce off the existing data.

**A queue is backing up and jobs are being enqueued faster than workers can process them. What do you do?**
First, I temporarily scale up the number of worker instances consuming the queue to increase throughput. Second, I check telemetry to see if the workers themselves are blocked by a downstream dependency, such as an external API rate limit or a slow database query. If the enqueue rate is a malicious spike, I implement API rate limiting at the ingress layer. 

**What is a dead-letter queue, and how do you use it in production?**
A dead-letter queue (DLQ) is a secondary queue where messages are automatically routed after they fail processing multiple times and exhaust their retry limit. In production, I monitor the DLQ to catch systematic failures or code defects without blocking the main queue. Once the underlying bug is fixed or the third-party API recovers, I can manually redrive (re-enqueue) the failed jobs from the DLQ back into the main queue for successful processing.

**What is the problem with sending an email synchronously inside a registration flow, and how would you redesign it?**
Sending it synchronously ties the application's response time to the latency of an external SMTP server. If the mail server is slow or experiencing an outage, the HTTP request hangs, frustrating the user and potentially holding database connections open. I would redesign this by having the registration route commit the user to the database, immediately dispatch an "email delivery" event to a background queue, and instantly return a 200 OK to the client.


## Migrations

**What is a forward-only migration, and why would you never edit one that has already run?**
A forward-only migration strategy dictates that schema changes are immutable; you never roll back or edit the past. You never edit a migration that has already run because the physical database has already applied that specific SQL. If you change the file locally, your codebase no longer matches reality. When deployed to a new environment, the setup will fail or behave unpredictably. If a mistake was made in migration 3, you fix it by writing migration 4.

**What happens when a migration fails halfway through?**
In transactional databases like PostgreSQL, DDL operations (Data Definition Language) are wrapped in a transaction. If the migration fails halfway through, the database completely rolls back all changes, leaving the schema untouched and safe. In non-transactional databases like MySQL, DDL statements auto-commit, meaning a halfway failure leaves the database in a corrupted, half-migrated state requiring dangerous manual intervention to fix.

**What is the difference between generating your ORM client and running a migration?**
Running a migration executes SQL directly against the database engine, physically altering tables, columns, and indexes. Generating the ORM client (like `prisma generate`) does not touch the database at all; it merely parses the schema file to update the application's internal TypeScript definitions and query engine. Migrations change the physical storage; client generation updates the application's understanding of that storage.