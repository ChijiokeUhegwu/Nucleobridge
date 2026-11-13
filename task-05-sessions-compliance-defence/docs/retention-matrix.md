# Retention Matrix

**Document:** `task-05-sessions-compliance-defence/docs/retention-matrix.md`
**Status:** Compliance record. Owner decisions recorded 13 November 2026.
**Schema source:** `prisma/schema.prisma` (24 tables).
**Scope:** every table and every significant column, in one list. Authored-content tables are included because they are in the schema; they are not personal data.
**Governing sources:** PRD sections 5, 7, 8, 9, 10, 12, and 14; `.agents/rules/schema.md`; `.agents/rules/security-privacy.md`; `.agents/rules/payments.md`; `.agents/rules/instrumentation.md`; `.agents/rules/access-and-routes.md`; `.agents/rules/decisions.md`; `src/lib/account-deletion.ts`; `src/lib/session.ts`; the published Privacy Policy and Terms.

## 0. Summary

- Learner-owned rows are purged when the account is purged. Identity fields are replaced (pseudonymised) at the deletion request; the row is hard-deleted 30 days later.
- Payment, payment-event, and membership rows are retained permanently under the owner decision of 13 November 2026. `Payment.userId` and `Entitlement.userId` are set to NULL; `PaymentEvent` has no learner link. They are kept under a legal obligation, not because they are anonymous.
- Learner events are kept for 180 days, except events linked to a deleted account, which are purged at deletion.
- Login codes are valid for 10 minutes. The PRD requires daily deletion of expired rows; the cleanup is not implemented in version one.
- Backups live in the managed PostgreSQL provider's encrypted backup storage in the same region. Backups are daily, deletion propagation is within 24 hours, and snapshots are retained for 7 days.
- The purge no longer deletes `Payment` or `Entitlement` rows. `Payment.userId` and `Entitlement.userId` are set to NULL, so the financial and membership records survive without the learner link. The `Entitlement` schema change is in `prisma/schema.prisma`; the migration is still pending and must be applied before launch. See section 7.

## 1. Labels used in the list

| Label | Meaning |
|---|---|
| **PURGED** | The row is hard-deleted and is not retained. |
| **PURGED (pseudonymised first)** | Direct identifiers are replaced or nulled at the deletion request; the row and its remaining columns are hard-deleted after the 30-day grace period. The code calls this step "anonymisation"; strictly it is pseudonymisation because the row remains linked to the learner's other records until the purge. |
| **RETAINED** | The row is kept beyond the learner's account deletion, or is authored content that is never learner data. |
| **RETAINED (delinked)** | The financial or membership row is kept; the learner link (`userId`) is set to NULL. |
| **RETAINED (archive only)** | Authored content. The app soft-deletes with `archivedAt`; it never hard-deletes. |
| **Contract** | Processing is necessary to provide the learning service the learner signed up for. |
| **Legal obligation** | Processing is necessary to comply with tax, accounting, audit, or other legal record-keeping duties. The exact statute and period are to be confirmed by the owner's accountant (Q7, D13). |
| **Legitimate interests** | Processing is necessary for security, fraud prevention, cost control, product improvement, or the establishment and defence of legal claims, balanced against the learner's rights. |
| **Not personal data** | Authored lesson content, plans, datasets, tool documentation, and content chunks. These are business records, not records about a learner. |

The published Privacy Policy states the general lawful bases as performance of a contract, legitimate interests, legal obligation, and consent where required. This matrix applies those bases table by table. Where no fixed period is stated, the row is retained for the life of the account or the life of the content, not indefinitely for a separate purpose.

## 2. The list

| # | Table | Column(s) | Disposition | Reason | Basis if retained | Retention period |
|---|---|---|---|---|---|---|
| 1 | `User` | `id` | PURGED | Pseudonymous account key. It is needed during the grace period to find and purge the learner's child rows. | No retention basis after deletion; accountability during the 30-day grace. | Hard-deleted 30 days after `deletionRequestedAt`. |
| 2 | `User` | `email`, `firstName`, `lastName` | PURGED (pseudonymised first) | Direct identifiers. They are replaced with `deleted-<uuid>@example.com`, `Deleted`, and `User` at the deletion request. | Erasure; contract only while the account is active. | Identifiers replaced immediately; row purged at day 30. |
| 3 | `User` | `passwordHash`, `emailVerificationCodeHash` | PURGED (pseudonymised first) | Credentials and secrets. They must not survive a deletion request. | Security; erasure. | Nulled immediately; row purged at day 30. |
| 4 | `User` | `emailVerified`, `emailVerifiedAt`, `emailVerificationExpiresAt` | PURGED (pseudonymised first) | Verification state has no purpose after deletion. `emailVerified` is reset and `emailVerificationExpiresAt` is nulled. `emailVerifiedAt` is not cleared by the current code; it remains until the purge. | Erasure. | Reset or nulled immediately where the code does so; `emailVerifiedAt` remains until the row is purged at day 30. |
| 5 | `User` | `createdAt` | PURGED | Account creation time; part of the same row. | No separate retention basis; contract/accountability only while active. | Purged with the row at day 30. |
| 6 | `User` | `deletionRequestedAt` | PURGED | Drives the 30-day purge and evidences when the request was made. | Legal obligation/accountability for the purge window. | Purged with the row at day 30. |
| 7 | `Session` | `id`, `userId`, `tokenHash` | PURGED | Server-side session record. `tokenHash` is a SHA-256 digest, never the raw cookie token. | No retention basis; contract/security only while the session is valid. | Maximum 30 days; deleted immediately on sign-out, password reset, or account deletion. Expired rows are deleted lazily when next presented. |
| 8 | `Session` | `expiresAt`, `createdAt` | PURGED | Session lifetime metadata; part of the same row. | No separate retention basis. | Same as row 7. |
| 9 | `PasswordResetToken` | `id`, `userId`, `tokenHash` | PURGED | Single-use password-reset secret. The raw token is never stored. | No retention basis after use or expiry; contract/security. | Valid for 1 hour. Deleted when replaced, on account deletion, or with the user purge. Used and expired rows have no scheduled purge in version one (gap). |
| 10 | `PasswordResetToken` | `expiresAt`, `usedAt`, `createdAt` | PURGED | Reset-token lifecycle metadata; part of the same row. | No separate retention basis. | Same as row 9. |
| 11 | `LoginCode` | `id`, `email`, `codeHash` | PURGED | One-time sign-in code. The code is hashed; the plain code is never stored. | No retention basis after expiry; contract/security. | Valid for 10 minutes. PRD section 8 requires daily deletion of expired rows; the scheduled cleanup is not implemented in version one (gap). |
| 12 | `LoginCode` | `expiresAt`, `attempts`, `consumedAt`, `createdAt` | PURGED | Code lifetime, failed-try count, and consumption time; part of the same row. | No separate retention basis. | Same as row 11. |
| 13 | `CaseStudy` | `id`, `slug`, `title`, `summary`, `orderIndex`, `accessMode`, `freeStepCount`, `version`, `published`, `archivedAt` | RETAINED (archive only) | Authored catalog content and access configuration. Learner progress references it. | Business record for course delivery; not personal data. | Indefinite. Soft-deleted with `archivedAt`; never hard-deleted. |
| 14 | `Step` | `id`, `caseStudyId`, `slug`, `orderIndex`, `title`, `access`, `instructionsMd`, `estimatedMinutes`, `runtime`, `tools`, `checks`, `version`, `archivedAt`, `createdAt`, `updatedAt` | RETAINED (archive only) | Authored lesson content, tool list, and typed check definitions. The version is needed to interpret old attempts. | Business record for course delivery; not personal data. | Indefinite. Soft-deleted with `archivedAt`; never hard-deleted. |
| 15 | `StepGuard` | `stepId`, `solutionPatterns` | RETAINED | Server-only regular expressions describing finished answers. They are never sent to the browser. | Business record for grading and mentor output checks; not personal data. | Indefinite; changes with the step version. |
| 16 | `Dataset` | `id`, `slug`, `title`, `fileName`, `sizeBytes`, `sha256`, `storageKey`, `license`, `isSynthetic` | RETAINED | Dataset metadata and the private object-storage key. No learner content. | Business record for lesson delivery; not personal data. | Indefinite for the life of the content; the file remains in private object storage. |
| 17 | `StepDataset` | `stepId`, `datasetId`, `mountPath` | RETAINED | Mapping between a step and its datasets. | Business record for lesson delivery; not personal data. | Indefinite. |
| 18 | `Hint` | `id`, `stepId`, `rung`, `bodyMd` | RETAINED | Authored hint-ladder content. It may be paid content, but it is not learner data. | Business record for lesson delivery; not personal data. | Indefinite. |
| 19 | `ErrorPattern` | `id`, `stepId`, `key`, `description`, `matchRule`, `messageMd` | RETAINED | Authored error messages and match rules shown after failed checks. | Business record for lesson delivery; not personal data. | Indefinite. |
| 20 | `ToolDoc` | `id`, `tool`, `toolVersion`, `sectionTitle`, `bodyMd` | RETAINED | Public tool documentation. The PRD requires no paid-only material in it. | Business record for learner reference; not personal data. | Indefinite. |
| 21 | `Plan` | `id`, `code`, `name`, `priceMinor`, `currency`, `durationDays`, `active`, `createdAt` | RETAINED | Plan price and duration configuration. Historical payment rows must be interpretable even after a price change. | Contract and legal obligation; business record. | Indefinite. Price and duration are never hard-coded in the app. |
| 22 | `Payment` | `id`, `planId`, `reference`, `provider`, `gatewayTransactionId`, `amountMinor`, `currency`, `status`, `failureReason`, `initializedAt`, `paidAt`, `updatedAt` | RETAINED | Financial record: amount, currency, status, reference, gateway transaction ID, and times. Needed for tax, accounting, audit, refunds, fraud, and disputes. | Legal obligation (tax/accounting/audit) and legitimate interests (fraud prevention and defence of legal claims). | Permanent, per the owner decision of 13 November 2026. The purge no longer deletes these rows. |
| 23 | `Payment` | `userId` | RETAINED (delinked) | Learner link. It is set to NULL when the learner is purged so the financial record survives without the identity link. | Legal obligation; data minimisation. | NULL from account deletion onward; the payment row is permanent. The purge no longer deletes the payment. |
| 24 | `PaymentEvent` | `id`, `provider`, `eventKey`, `type`, `reference`, `amountMinor`, `currency`, `gatewayStatus`, `receivedAt`, `processedAt` | RETAINED | Sanitised gateway event. It never holds card, bank, or email data. Needed to prove what the gateway sent and to replay safely. | Legal obligation (audit) and legitimate interests (fraud, reconciliation, disputes). | Permanent, per the owner decision of 13 November 2026. |
| 25 | `PaymentEvent` | `paymentId` | RETAINED | Link to the payment record. It is set to NULL if a payment row is ever missing, so the event survives. | Legal obligation (audit); business record. | Permanent. |
| 26 | `Entitlement` | `id`, `kind`, `source`, `paymentId`, `startsAt`, `endsAt`, `status`, `createdAt` | RETAINED | Membership history: when PRO started and ended, whether it came from a payment or a manual grant, and whether it was revoked. Needed to prove access periods and refunds. | Legal obligation (accounting/audit) and legitimate interests (disputes); contract while active. | Permanent, per the owner decision of 13 November 2026. The purge no longer deletes these rows. |
| 27 | `Entitlement` | `userId` | RETAINED (delinked) | Learner link. It must be set to NULL on account deletion so the membership history survives without the identity link. | Legal obligation; data minimisation. | NULL from account deletion onward; the row is permanent. The schema now uses nullable `userId` with `onDelete: SetNull`; the migration is pending. |
| 28 | `LearnerStepProgress` | `id`, `userId`, `stepId`, `stepVersion`, `status`, `attempts`, `highestHintRung`, `timeSpentSeconds`, `lastFailedCheckKey`, `passedAt`, `revision`, `updatedAt` | PURGED | Learning progress. It is personal data and has no financial-retention purpose. | No retention basis after deletion; contract while active. | Account lifetime; purged at account deletion. No fixed inactivity period. |
| 29 | `WorkspaceSnapshot` | `id`, `userId`, `stepId`, `editorText`, `commandLog`, `schemaVersion`, `revision`, `updatedAt` | PURGED | Learner code and typed command log. It may contain personal data the learner typed. Capped at 100 KB of editor text and 500 log entries by the API. | No retention basis after deletion; contract while active. | Account lifetime; purged at account deletion. |
| 30 | `CheckAttempt` | `id`, `userId`, `stepId`, `stepVersion`, `passed`, `failedCheckKey`, `resultSummary`, `createdAt` | PURGED | Check results. They drive the progress map and author review while the account exists. `resultSummary` may contain output the learner produced. | No retention basis after deletion; contract while active, and legitimate interests for aggregate content review. | Account lifetime; purged at account deletion. |
| 31 | `MentorMessage` | `id`, `userId`, `stepId`, `stepVersion`, `role`, `source`, `pool`, `content`, `citedChunkIds`, `topSimilarity`, `outOfScope`, `model`, `tokensIn`, `tokensOut`, `thumb`, `createdAt` | PURGED | Chat history, cited chunk IDs, model, token counts, and thumbs feedback. A copy of the question already sent to an outside AI provider cannot be deleted by the app; the Privacy Policy says so. | No retention basis after deletion; contract while active, and legitimate interests for quality and cost. | Account lifetime; purged at account deletion. |
| 32 | `HintQuota` | `userId`, `day`, `aiCount`, `callCount` | PURGED | Per-learner daily AI usage used to enforce the daily limits. | No retention basis after deletion; contract while active. | Account lifetime; purged at account deletion. Rows are per Lagos calendar day. |
| 33 | `DailyUsage` | `day`, `pool`, `calls`, `tokensIn`, `tokensOut`, `estimatedCostUsd` | RETAINED | Pool-level cost and token totals. There is no user link. Used for ceilings, unit economics, and owner review. | Legitimate interests and business records; not personal data at the pool/day level. | Indefinite; no fixed period. If the group is small enough to identify a learner, it must be treated as pseudonymous, not anonymous. |
| 34 | `LearnerEvent` | `id`, `type`, `payload`, `createdAt` | RETAINED | Product, funnel, security, and reliability events. `payload` must not contain learner code, command text, chat text, or gateway payloads. | Legitimate interests (product improvement, security, reliability). | 180 days, then purged by the scheduled cleanup required by PRD section 8. The cleanup is not implemented in version one (gap). |
| 35 | `LearnerEvent` | `userId` | PURGED | Link from an event to an account. It is removed at account deletion, even if the event is younger than 180 days. | No retention basis after deletion; erasure. | Account lifetime; purged at account deletion. |
| 36 | `LearnerEvent` | `anonId` | RETAINED | Random pre-sign-in identifier. The instrumentation rule forbids linking it to an account. | Legitimate interests (pre-sign-in funnel only). | 180 days. It is not account data and must never be joined to a user after sign-in. |
| 37 | `LearnerEvent` | `stepId` | RETAINED | Identifies which step an event concerns. `Step` is never hard-deleted, so this link is stable. | Legitimate interests (product improvement). | 180 days, with the event; set to NULL if a step relation is ever removed. |
| 38 | `ContentChunk` | `id`, `sourceType`, `sourceId`, `stepId`, `tool`, `ordinal`, `text`, `tokenCount`, `contentHash`, `stepVersion`, `embeddingModel`, `embedding`, `embeddedAt`, `createdAt`, `updatedAt` | RETAINED | Authored content chunks and their embeddings for mentor retrieval. The store holds only shared authored content: never learner records, final answers, final commands, `solutionPatterns`, or expected values of checks whose `exposeToMentor` setting is off. | Business record for lesson delivery; not personal data. | Indefinite for the life of the content; updated or replaced on re-import. No learner erasure applies. |

## 3. Lifecycle in plain words

### At the deletion request

`requestAccountDeletion()` does three things in one transaction:

1. Sets `User.deletionRequestedAt`.
2. Replaces `email`, `firstName`, and `lastName`, and nulls `passwordHash`, `emailVerificationCodeHash`, and `emailVerificationExpiresAt`.
3. Deletes every `Session` and `PasswordResetToken` row for that user.

`getSessionUser()` also rejects any session whose user has `deletionRequestedAt` set. The account is locked at once. The learner's progress, snapshots, attempts, messages, quotas, and events still exist during the 30-day grace period, linked to the now-pseudonymous `User.id`. Those rows remain personal data until the hard purge. The grace period is not the erasure date.

### At day 30

`purgeExpiredAccounts()` hard-deletes the `User` row and the learner rows. The intended result, now implemented in code, is:

- **Deleted:** `User`, `Session`, `PasswordResetToken`, `LearnerStepProgress`, `WorkspaceSnapshot`, `CheckAttempt`, `MentorMessage`, `HintQuota`, and the learner's `LearnerEvent` rows.
- **Retained:** `Payment`, `PaymentEvent`, and `Entitlement`. `Payment.userId` and `Entitlement.userId` are set to NULL. No email, name, card, or bank data remains in the financial records.
- **Not linked to the learner:** `LoginCode` rows for the old email are intended to age out through the daily cleanup, but that cleanup is not implemented; `DailyUsage` has no user link; authored content has no learner link.

The purge now produces this result: it no longer deletes `Payment` or `Entitlement` rows. `Payment.userId` becomes NULL through `onDelete: SetNull`. `Entitlement.userId` does the same once the pending migration is applied; until then, the database still cascades entitlements when the `User` row is deleted. See section 7.

### Daily and on other triggers

- `LoginCode`: valid for 10 minutes; the PRD requires a daily cleanup of expired rows.
- `LearnerEvent`: 180-day cap; the PRD requires a scheduled cleanup.
- `Session`: deleted on sign-out, password reset, and account deletion. An expired session is deleted when it is next presented; there is no separate scheduled purge.
- `PasswordResetToken`: valid for 1 hour; deleted when replaced, on account deletion, or with the user purge. Used and expired rows have no scheduled cleanup in version one.
- Backups: governed by section 4, not by these live-database jobs.

## 4. Backups

**Owner decision (13 November 2026): managed database, same region, daily.**

| Item | Value |
|---|---|
| Where backups live | The managed PostgreSQL provider's automated, encrypted backup storage, in the **same region** as the primary database. The provider is still to be confirmed under decisions Q11. |
| Backup cadence | **Daily** full snapshot. |
| Deletion propagation interval | **Within 24 hours** of the live deletion. |
| Backup retention | **7 days.** |
| Restore rule | A restored database is not served until the purge and deletion replay have completed. Deleted rows must not be resurrected. |
| Encryption and access | Encrypted at rest by the managed provider; access limited to the owner and operations. No learner reads from a backup. |

### Why the 24-hour interval is mandatory

No government mandate requires this backup window. The Terms and the Privacy Policy disclose that data may persist in encrypted backups until those backups are rotated. That disclosure is transparency; it is not a legal basis for keeping a deleted learner's rows. Under the rule applied to this matrix, backups must drop deleted rows within a stated interval or the backup retention itself becomes unlawful. The stated interval is **24 hours**.

The 7-day snapshot retention is a disaster-recovery window, not a second retention purpose. Because a database snapshot is normally immutable, the operational control is one of these two, and it must be true before launch:

1. The provider supports deletion propagation into the backup set within 24 hours; or
2. Every restore replays a deletion journal (the account purge plus the 180-day event purge) before the restored database is served.

If neither is true, backup retention must be reduced to 24 hours. A 7-day snapshot that can restore a deleted learner's rows after the 24-hour window would make the retention unlawful on the user's stated test.

### What is in scope for backups

The backup covers the PostgreSQL database, so it covers every table in section 2. The private object storage holds datasets, which are authored content, not learner data. There is no separate learner-data backup outside PostgreSQL. The outside AI providers and Flutterwave hold their own copies under their own terms; this matrix cannot delete those, and the Privacy Policy says so.

## 5. The conflict: erasure versus financial-record retention

**Name of the conflict.** The learner's right to erasure versus the legal obligation to retain payment, payment-event, and membership records.

**The opposing duties.**

- The NDPA 2023 gives the learner a right to erasure of personal data. The app implements it through the "Delete my data" flow.
- Tax, accounting, audit, and fraud-prevention law requires the business to keep records of payments and membership changes. PRD FR-C.17 keeps `Payment` rows and sets their user link to NULL. The owner decided on 13 November 2026 that payment records, ledger entries, payment attempts, and membership changes are retained permanently.

**Which wins.** The retention obligation wins, but only for the minimum financial fields. The erasure right wins for the learner's identity and learning records.

The basis is:

- The erasure right is not absolute. It does not override processing that is necessary to comply with a legal obligation or to establish, exercise, or defend legal claims.
- Data minimisation still applies. The `User` identifiers are replaced at the request (pseudonymised); `Payment.userId` and `Entitlement.userId` are set to NULL; no email, name, card, or bank data remains in the retained financial record.
- The retained financial rows are **pseudonymous, not anonymous**. A payment reference or gateway transaction ID may still be linkable to the learner through Flutterwave or the learner's own records. They are kept under a legal obligation, not because they are anonymous.
- "Permanent" is the owner's policy. It still has to be supported by a real legal obligation; the storage-limitation principle does not disappear because the owner chose permanence. The owner's accountant and counsel must confirm the period (Q7 and D13 are open). If counsel sets a shorter statutory period, that shorter period replaces "permanent".

**What this means for the schema.** `Payment` and `PaymentEvent` are retained; `Payment.userId` is nulled. `Entitlement` ("membership changes") is retained and delinked. The purge no longer deletes `Payment` or `Entitlement` rows. `Payment.userId` is set to NULL by the schema; `Entitlement.userId` is now nullable with `onDelete: SetNull`, and the pending migration must be applied before launch. `PaymentEvent` remains linked to its payment.

**Second conflict: 180-day analytics versus erasure.** `LearnerEvent` rows are kept for 180 days under legitimate interests. If the learner deletes the account, the events linked to that learner are purged at deletion, even if they are younger than 180 days. Erasure wins because the analytics purpose does not require the events of a learner who has left. The 180-day cap applies only to events that remain lawful to keep, such as pre-sign-in events under `anonId` that were never linked to an account.

**Third conflict: backups versus erasure.** A 7-day backup window can outlive a deletion. The 24-hour propagation rule in section 4 resolves it: the erasure right wins in the live database at once, and in backups within 24 hours; the remaining snapshots may exist only for disaster recovery and must not be used to resurrect deleted rows. No government mandate or contractual term overrides this.

## 6. Anonymisation against deletion

### Where we anonymise or delink instead of deleting

| Where | What changes | What remains | Is it anonymous? |
|---|---|---|---|
| `User` at the deletion request | `email`, `firstName`, and `lastName` are replaced; `passwordHash`, `emailVerificationCodeHash`, and `emailVerificationExpiresAt` are nulled; `emailVerified` is reset. `emailVerifiedAt` is not cleared by the current code. | The `User` row under a random ID, and the learner's progress, snapshots, attempts, messages, quotas, and events still linked to that ID | **No.** This is pseudonymisation, not anonymisation. The row is pseudonymous until the day-30 hard purge, and the learner's past identity may still be reconstructible from backups or external records. |
| `Payment` at account deletion | `userId` is set to NULL (intended) | Amount, currency, status, reference, gateway transaction ID, dates | **No.** Pseudonymous. The reference or gateway ID may be linkable through Flutterwave. Kept under legal obligation, not anonymisation. |
| `Entitlement` at account deletion | `userId` is set to NULL (intended; schema change required) | Start, end, status, source, payment link | **No.** Pseudonymous. Kept under legal obligation/legitimate interests. |
| `DailyUsage` | No user link; aggregated by day and pool | Calls, tokens, estimated cost | Treated as **non-personal aggregate** at the pool/day level. If the group is small enough to single out a learner, it must be treated as pseudonymous. |
| Pre-sign-in `LearnerEvent` | Random `anonId`; the rule forbids linking it to an account | Event type, payload, time | **Pseudonymous, not proven anonymous.** The 180-day cap applies. It is never joined to a user after sign-in. |
| Authored content (`CaseStudy`, `Step`, `Hint`, `ToolDoc`, `ContentChunk`, and the rest) | Nothing; these rows contain no learner data | Lesson content, checks, documentation, embeddings | **Not personal data.** No anonymisation is needed. |

**Note on terminology.** The deletion code calls its work "anonymisation," and the API message says "anonymized." The correct term while the row remains linked to the learner's other records is **pseudonymisation**. True anonymisation is only reached when the data is deleted or reduced to an aggregate that cannot single out a learner. The distinction matters because pseudonymous data remains personal data and cannot be kept without a lawful basis.

### Why anonymised data can be kept when identifiable data cannot

The NDPA applies to personal data. Truly anonymous information — information that cannot be linked to an identified or identifiable person by reasonably available means — falls outside the erasure right. It can be kept because it is no longer about a person.

Pseudonymous data does not get that treatment. A random ID, a payment reference, a gateway transaction ID, or a device fingerprint can still be linked to a learner, so the data remains personal data and needs a lawful basis. This matrix therefore does **not** use "anonymisation" as a blanket excuse:

- We delete learner learning records. We do not anonymise them and keep them.
- We keep payment and membership rows under a legal obligation, not because they are anonymous.
- The 30-day grace row is pseudonymous and still personal data. It is a short, disclosed purge delay, not an anonymisation destination.
- Only `DailyUsage` is treated as non-personal, and that is because it has no learner-level identifier, not because a name was removed from a learner record.

The practical test is: could the retained row, alone or with other records, still be used to identify, contact, or single out the learner? If yes, it is personal data and must have a basis. If no, it may be kept as anonymous data.

## 7. Implementation status and gaps

| # | Gap | Evidence | Required action |
|---|---|---|---|
| 1 | ~~The purge job deletes `Payment` rows.~~ Fixed. | `src/lib/account-deletion.ts` no longer deletes payments. `Payment.userId` is already nullable with `onDelete: SetNull`. | Verify after the migration is applied. |
| 2 | ~~The purge job deletes `Entitlement` rows.~~ Fixed in code; migration pending. | The purge no longer deletes entitlements. `Entitlement.userId` is now nullable with `onDelete: SetNull` in `schema.prisma`. | Apply the owner-approved migration before launch. Until then, the live database still cascades entitlements. |
| 3 | No scheduled cleanup for `LearnerEvent` rows older than 180 days. | PRD section 8 and `schema.md` require it; `commands.md` leaves the cleanup command blank; no implementation was found. | Implement the cleanup and schedule it. |
| 4 | No scheduled cleanup for expired `LoginCode` rows. | PRD section 8 requires daily deletion; no implementation was found. | Implement the daily cleanup and schedule it. |
| 5 | Used and expired `PasswordResetToken` rows are not purged. | The reset route sets `usedAt`; no cleanup exists. | Delete on use or add the table to the scheduled cleanup. |
| 6 | Expired `Session` rows are deleted only when presented. | `src/lib/session.ts` deletes an expired session when a request presents it. | Add a scheduled purge or document the lazy cleanup as the accepted control. |
| 7 | No backup deletion-propagation control is configured in the repository. | The PRD says only "one backup plan"; decisions Q11 is open; no backup configuration is present. | Configure the managed provider's daily backup, the 24-hour deletion propagation, and the restore replay; record the settings and test a restore before launch. |
| 8 | Permanent payment retention has no counsel/accountant sign-off. | Q7 and D13 are open. | Confirm the legal obligation and period; if the statutory period is shorter, use it instead of "permanent". |
| 9 | The erasure route does not match the documented route. | `access-and-routes.md` lists `DELETE /api/me`; the implementation is `POST /api/user/delete`. | Align the route or update the rules. This is not a retention defect, but it affects the erasure control. |

## 8. Owner decisions recorded for this matrix

| Date | Topic | Owner answer |
|---|---|---|
| 2026-11-13 | Backup location and interval | "Managed DB, same region, daily" — encrypted automated backups in the managed PostgreSQL provider's backup storage, same region; deletion propagation within 24 hours; backups retained 7 days. |
| 2026-11-13 | Payment retention | "Retained permanently: payment records, ledger entries, payment attempts, membership changes." |
| 2026-11-13 | Purge conflict | "PRD: retain payment rows, flag code defect (Recommended)" — the matrix records the intended PRD behaviour and flagged the purge job as it stood then. |
| 2026-11-13 | Purge fix scope | "Payment and Entitlement (Recommended)" — remove both deletes; make `Entitlement.userId` nullable with `onDelete: SetNull`; report the migration as required but do not run it. |

These decisions are recorded in `.agents/rules/decisions.md` under "Retention decisions (2026-11-13)".

## 9. Open items

| Item | Why it matters | Where it is tracked |
|---|---|---|
| Exact tax/accounting statute and retention period | "Permanent" must be justified by a legal obligation; the storage-limitation principle still applies. | Q7, D13 |
| Backup provider, region, and restore procedure | The owner chose the policy; the provider and the 24-hour propagation mechanism are not yet selected or tested. | Q11, section 4 |
| Whether "membership changes" means `Entitlement` | This matrix reads it as `Entitlement` (PRO start/end/status/source). The owner's fix confirms that reading. | Resolved by decision R3 (2026-11-13). |
| Entitlement migration | `schema.prisma` now makes `Entitlement.userId` nullable with `onDelete: SetNull`; the live database still has the old cascade until the migration runs. | This document; decision R3 |
| Outside AI provider retention | The app cannot delete questions already sent to a model provider; the provider's terms govern. | Q10; Privacy Policy section 6.2 |
| Flutterwave retention | Flutterwave holds its own transaction records; the app's `PaymentEvent` rows are sanitised copies. | Q2, Q4; `payments.md` |
| Email provider retention | Sign-in code emails may be retained by the email service; the app stores only the hash. | Q11; `access-and-routes.md` |

## 10. One-sentence rule

Keep only what the learner needs while the account is active; delete everything learner-owned when the account is purged; keep the minimum financial record because the law requires it; never call a pseudonymous row anonymous; and make the backups drop deleted rows within 24 hours.
