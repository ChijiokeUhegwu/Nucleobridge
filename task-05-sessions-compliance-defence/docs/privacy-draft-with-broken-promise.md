# Privacy draft with a broken promise

This file records the promise I removed from `privacy.md`, the version that replaced it, and why the system could not keep the original. The rest of the draft is the same as `privacy.md`; only the backup paragraph changed.

## Draft version (the promise I removed)

> When you delete your account, we remove your personal data from every backup within 24 hours.

This was going to sit in the backup section of the draft. It sounds like the natural meaning of "delete," but the system cannot keep it.

## Why the system cannot keep it

- Backups are daily snapshots kept for up to 7 days.
- No backup deletion-propagation control is configured in the repository, so an older snapshot can still restore the deleted row.
- A snapshot is not a table from which one row can be deleted. It has to be replaced or restored and purged.

## Final version in `privacy.md`

> Backups are encrypted copies of the database. We keep them for up to 7 days for disaster recovery.
>
> A deleted row can remain in an older backup until that backup is replaced. We do not use backups to bring back a deleted account.

The final version does not promise that every copy is gone within 24 hours. It states the 7-day backup window, the limit that follows from it, and the rule that backups must not bring a deleted account back.

## How a promise like this gets written

Promises like this get written when the policy is drafted from the word "delete" instead of from a map of every copy. The writer sees the live database row disappear and forgets that a backup is a separate, immutable snapshot with its own rotation schedule.
