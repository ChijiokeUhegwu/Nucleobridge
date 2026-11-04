# docs/schema.md

## 1. User
**Columns:**
*   `id`: UUID (Cannot be empty)
*   `email`: String (Cannot be empty)
*   `first_name`: String (Cannot be empty)
*   `last_name`: String (Cannot be empty)
*   `password_hash`: String (Cannot be empty)
*   `created_at`: DateTime (Cannot be empty)

**Relationships:**
*   One-to-Many with `Session`
*   One-to-Many with `Payment`
*   One-to-Many with `PaymentAttempt`
*   One-to-Many with `DocumentChunk`

**Indexes:**
*   `email` (Unique): Required for instantaneous authentication lookups; costs a B-tree insertion and uniqueness verification on every new user registration.

## 2. Session
**Columns:**
*   `id`: UUID (Cannot be empty)
*   `user_id`: UUID (Cannot be empty)
*   `token`: String (Cannot be empty)
*   `expires_at`: DateTime (Cannot be empty)
*   `created_at`: DateTime (Cannot be empty)

**Relationships:**
*   Many-to-One with `User`

**Indexes:**
*   `token` (Unique): Required for validating API requests on every protected route; costs a marginal write latency penalty during login as the index updates.

## 3. Payment (Money)
**Columns:**
*   `id`: UUID (Cannot be empty)
*   `user_id`: UUID (Cannot be empty)
*   `amount`: Decimal (Cannot be empty)
*   `currency`: String (Cannot be empty)
*   `flutterwave_ref`: String (Cannot be empty)
*   `status`: String (Cannot be empty)
*   `created_at`: DateTime (Cannot be empty)

**Relationships:**
*   Many-to-One with `User`

**Indexes:**
*   `flutterwave_ref` (Unique): Crucial for idempotent webhook reconciliation to prevent double-crediting; costs a minor write delay upon transaction finalization.

## 4. PaymentAttempt (Money-Attempts)
**Columns:**
*   `id`: UUID (Cannot be empty)
*   `user_id`: UUID (Cannot be empty)
*   `amount`: Decimal (Cannot be empty)
*   `currency`: String (Cannot be empty)
*   `status`: String (Cannot be empty)
*   `provider_error`: String (Can be empty)
*   `created_at`: DateTime (Cannot be empty)

**Relationships:**
*   Many-to-One with `User`

**Indexes:**
*   `user_id`: Speeds up dashboard queries for users viewing their billing history; costs a slight write overhead during high-frequency failed checkout events.

## 5. DocumentChunk (Retrieval System)
**Columns:**
*   `id`: UUID (Cannot be empty)
*   `user_id`: UUID (Cannot be empty)
*   `content`: Text (Cannot be empty)
*   `embedding`: Vector (Can be empty initially, updated post-processing)
*   `source_file_id`: String (Cannot be empty)

**Relationships:**
*   Many-to-One with `User`

**Indexes:**
*   `embedding` (HNSW/IVFFlat): Essential for performing rapid nearest-neighbor vector similarity searches; highly computationally expensive on writes as the vector graph must be continuously recalculated and rebalanced upon insertion.

## Denormalization: Storing Facts Twice
The `amount` and `currency` values are deliberately stored twice: once in `PaymentAttempt` and again in `Payment`. I accepted this duplication because the two tables track fundamentally different lifecycle states. `PaymentAttempt` acts as an immutable log of user intent at a specific moment in time (e.g., initiating checkout for a premium subscription). `Payment` represents the finalized ledger entry after provider clearance. If pricing structures change or a user alters their cart mid-flight, decoupling these tables ensures the historical forensic record of the failed checkout intent remains perfectly intact and independent of successful ledger states.

## The Role of the Money-Attempts Table
The money-attempts table serves two critical functions: it highlights exact drop-off points in the funnel where network latency or UX friction costs the business revenue, and it establishes a strict forensic audit trail. If a tax authority mandates an accounting of a specific transaction from fourteen months ago, relying solely on completed payments provides an incomplete narrative. With an independent attempts log, I can immediately pull the immutable timestamps, the user's initial checkout intent, the specific provider error codes (like a declined card or a timeout), and the exact sequence of events leading up to any finalized transaction. This proves to auditors that the platform's revenue recognition matches technical reality, differentiating genuine missing funds from abandoned carts or upstream provider outages.