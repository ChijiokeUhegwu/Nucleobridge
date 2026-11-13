# Privacy at NucleoBridge

Last updated: 13 November 2026

This is a plain-language description of what NucleoBridge does with your data. It describes the rules the system follows. If you think something here is wrong, email privacy@nucleobridge.org.

## The short version

- We collect what we need to run your account, save your work, check your answers, run the AI mentor, and take payments.
- You can delete your account from your account area. You get a 30-day grace period. After that, we delete your learner data.
- We keep payment and membership records after deletion because tax, accounting, audit, fraud, and dispute rules require them. We remove the link to you.
- We cannot delete copies held by the AI provider or old backup snapshots. We explain those limits below.
- We do not sell your data.

## What we collect

- **Account data:** your email address, first and last name if you give them, a password hash, and hashed sign-in codes. We never store a sign-in code or password in plain text.
- **Learning data:** your step progress, editor text, typed command log, check results, hints used, time on each step, and your mentor chat with us.
- **Payment data:** the plan, amount, currency, payment status, reference, Flutterwave transaction ID, and the start and end of your PRO access. We never store card or bank details.
- **Usage data:** events such as sign-in, step open, hint shown, mentor request, and sync error. We also record device and browser details and daily totals of AI calls, tokens, and cost.

## How to delete your data

1. Sign in and open your account area.
2. Click **Delete my data**.
3. Read the warning and confirm.

If you cannot sign in, email privacy@nucleobridge.org and tell us which email address the account uses. We may ask you to prove you own that email before we act.

When you confirm, you are signed out and your account is locked. You cannot sign back in or cancel the deletion from the app.

## The 30-day grace period

The deletion request starts a 30-day grace period. The account is already locked during this time. It is not a period where you can keep using the service.

At the start of the grace period:

- We replace your email address with a random deleted-user address.
- We replace your first and last name with "Deleted" and "User".
- We remove your password hash and your email verification code.
- We delete your active sessions and password reset tokens.

Your learning records stay in our database during the 30 days, under a random ID. Your email address and name are already gone, and you cannot sign in. At the end of the 30 days, the purge job deletes the rest.

We do not restore deleted accounts after you confirm.

## What we delete after the 30 days

- Your account row, including the random deleted-user address and the deletion request time.
- Any remaining sessions and password reset tokens.
- Your step progress, saved work and snapshots, check attempts, mentor chat messages, hint counts, and the usage events linked to your account.

Sign-in codes are separate from your account. A code works for 10 minutes, and we store only a hash of it, never the code itself.

## What we keep after deletion, and why

| What we keep | What it contains | Why we keep it | How long |
|---|---|---|---|
| Payment records | Amount, currency, status, reference, Flutterwave transaction ID, and dates | Tax, accounting, audit, fraud prevention, refunds, and disputes | Permanently. We remove the link to your account. |
| Payment events | The sanitized event the payment gateway sent us: type, reference, amount, currency, status, and times | Audit, reconciliation, fraud prevention, and disputes | Permanently. No email, card, or bank details. |
| Membership records | When PRO started and ended, whether it came from a payment or a manual grant, and whether it was revoked | To prove access periods, refunds, and disputes | Permanently. We remove the link to your account. |
| Daily AI totals | Calls, tokens, and estimated cost by pool and day | Cost ceilings and business records | Indefinitely. These rows have no user ID. |
| Pre-sign-in events | Event type, payload, and time under a random ID | To understand the sign-in funnel and keep the service secure | A limited period. These events are not linked to your account. |
| Encrypted backups | Copies of the database | Disaster recovery | Up to 7 days. See the next section. |
| AI provider copy | Your question, the step context, relevant authored excerpts, and relevant parts of your work | The provider answers your question and keeps its own records | Controlled by the provider's terms. We cannot delete the provider's copy. |

We keep payment and membership records permanently. We need them for tax, accounting, audit, fraud prevention, refunds, and disputes; the law requires us to keep financial records, and we may need them to defend legal claims. We remove the link to your account, so the retained rows no longer show your email or name.

Flutterwave also keeps its own record of the payment under its own terms. We cannot delete Flutterwave's copy.

We keep authored lesson content, checks, hints, tool documentation, and content chunks for as long as the course exists. That content is not about you.

## Backups

Backups are encrypted copies of the database. We keep them for up to 7 days for disaster recovery.

A deleted row can remain in an older backup until that backup is replaced. We do not use backups to bring back a deleted account.

## The AI mentor

When you ask the mentor a question, we send your question, the step context, relevant authored excerpts, and relevant parts of your work to an outside AI provider. We keep our copy of the chat as part of your account. We delete it when you delete your account.

The provider keeps its own copy under its own terms. We cannot delete the provider's copy when you delete your account.

## Sign-in and security

- A session lasts up to 30 days. Signing out, resetting your password, or deleting your account removes it.
- A sign-in code works for 10 minutes and dies after 5 wrong tries.
- A password reset link works for 1 hour.
- We store hashes of session tokens, sign-in codes, and reset tokens, not the raw values.
- We never store card or bank details. Flutterwave holds them.

## Contact

For any privacy question, including a deletion request you cannot make from the app, email privacy@nucleobridge.org.

You can also complain to the Nigeria Data Protection Commission if you believe we have broken the law.

## Changes

We will update this document when the system changes. The date at the top shows the last change.
