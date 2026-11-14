# docs/what-i-do-not-know.md

## 1. Scheduled Job Resilience During Server Downtime
*   **What it is:** The behavior of my account-deletion scheduled job (cron) if the server is offline or the serverless function is asleep at the exact moment the timer fires.
*   **How I know I do not understand it:** I set up the hard-delete cron job to run daily, but I do not know if Next.js/Vercel queues the missed execution for when the server wakes up, or if that day's purge is simply skipped entirely until the next 24-hour cycle. 
*   **What I would need to learn it:** I need to study serverless cron architectures, distributed task queues (like BullMQ or Upstash), and how cloud providers handle missed triggers during cold starts or deployment downtimes.

## 2. ORM State During a Partial Migration Failure
*   **What it is:** How Prisma and PostgreSQL handle a database migration that crashes halfway through execution.
*   **How I know I do not understand it:** I run `npx prisma migrate dev` to update my schema, but if a migration involves five steps and fails on step three, I do not know if Prisma wraps everything in a transactional DDL (rolling it back completely) or if my database is left in a corrupted, unrecoverable halfway state.
*   **What I would need to learn it:** I need to learn PostgreSQL's specific capabilities regarding Transactional DDLs and read the Prisma Migration Engine source code or documentation to see exactly how it executes SQL under the hood.

## 3. Rate Limit Storage Volatility
*   **What it is:** The persistence of the counters used to prevent brute-force attacks on my authentication routes.
*   **How I know I do not understand it:** If my rate limit is stored in application memory, I do not know if a server restart, a Vercel deployment, or a serverless cold start completely wipes the memory—effectively resetting the limit to zero and giving an attacker a fresh window.
*   **What I would need to learn it:** I need to learn how to implement distributed, persistent caching (like Redis) for rate limiting, and how serverless edge functions handle memory across multiple geographic nodes.

## 4. Session Cookie Cryptographic Transport Security
*   **What it is:** The physical and cryptographic mechanisms that protect the raw session token while it travels between the browser and the server.
*   **How I know I do not understand it:** I successfully generate a raw token, hash it for the database, and send the raw token to the browser with `HttpOnly` and `Secure` flags. However, I do not actually know how the underlying TLS/SSL protocol encrypts that cookie payload over the wire, nor do I know if I should be cryptographically signing (HMAC) the cookie value itself to detect tampering before hitting the database.
*   **What I would need to learn it:** I need to study cryptographic signing protocols (like HMAC-SHA256) for cookie payloads and review the OSI model to understand exactly how HTTPS/TLS encrypts HTTP headers.

## 5. Legal Resilience of the Retention Matrix
*   **What it is:** Whether my decision to permanently retain financial data (Payments) while scrubbing the associated User record actually complies with privacy laws like GDPR or NDPR.
*   **How I know I do not understand it:** I built the system to anonymize the user but keep the payment records to preserve financial integrity. I do not know if a payment ID and timestamp can technically still be considered Personally Identifiable Information (PII) if a lawyer or auditor proves it can be reverse-engineered by cross-referencing it with the Flutterwave dashboard.
*   **What I would need to learn it:** I would need to consult a data privacy lawyer and study the legal definitions of "Pseudonymization" vs. "Anonymization" under the GDPR and NDPR frameworks.

## 6. SMTP Background Job Idempotency
*   **What it is:** How NodeMailer and the SMTP protocol handle sudden network drops mid-transmission.
*   **How I know I do not understand it:** I configured NodeMailer to dispatch verification emails asynchronously to avoid blocking the API response. If the connection to the SMTP server drops exactly *after* the payload is sent but *before* the success acknowledgement is received, I do not know if my code considers it a failure and sends it twice, resulting in duplicate emails.
*   **What I would need to learn it:** I need to understand the exact handshake states of the SMTP protocol and learn how to use transactional email APIs (like Resend or SendGrid webhooks) for guaranteed exactly-once delivery.

## 7. Transaction Deadlocks in Prisma
*   **What it is:** Concurrent write conflicts occurring during the automated account deletion process.
*   **How I know I do not understand it:** I wrote a Prisma `$transaction` that cascades through the database, deleting sessions, document chunks, and the user stub. I do not know what happens if a user manages to trigger an insert (like generating a new bioinformatics case study chunk) at the exact millisecond the background job is trying to delete their records. I don't know which query wins or if it causes a database deadlock.
*   **What I would need to learn it:** I need to deeply study PostgreSQL isolation levels (like Read Committed vs. Serializable), row-level locking (`SELECT FOR UPDATE`), and how Prisma resolves race conditions.

## 8. PGVector Scaling Under Load
*   **What it is:** The performance degradation and memory limits of vector embeddings used for the NucleoBridge Socratic AI mentor.
*   **How I know I do not understand it:** I integrated PGVector to store embeddings for context-aware guidance. While I have not integrated any dataset into the platform to confirm how it works, I do not know at what specific row count the Exact Nearest Neighbor (KNN) search becomes too computationally expensive for my Neon Postgres instance, forcing me to switch to Approximate Nearest Neighbor (ANN) indexes.
*   **What I would need to learn it:** I need to learn how to read PostgreSQL query `EXPLAIN` plans for vector searches, and study the mathematical and memory tradeoffs between HNSW and IVFFlat indexing strategies in PGVector.