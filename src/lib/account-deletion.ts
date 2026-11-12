import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';

export const DELETION_GRACE_PERIOD_DAYS = 30;

/**
 * Initiates the 30-day soft deletion grace period for a user:
 * 1. Sets deletionRequestedAt to the current timestamp.
 * 2. Irreversibly anonymizes identity (email, firstName, lastName).
 * 3. Nullifies authentication credentials.
 * 4. Revokes all active sessions in PostgreSQL immediately.
 */
export async function requestAccountDeletion(userId: string) {
  const anonymizedEmail = `deleted-${crypto.randomUUID()}@example.com`;
  const anonymizedFirstName = 'Deleted';
  const anonymizedLastName = 'User';

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        deletionRequestedAt: new Date(),
        email: anonymizedEmail,
        firstName: anonymizedFirstName,
        lastName: anonymizedLastName,
        passwordHash: null,
        emailVerified: false,
        emailVerificationCodeHash: null,
        emailVerificationExpiresAt: null,
      },
    }),
    prisma.session.deleteMany({
      where: { userId },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId },
    }),
  ]);

  return { anonymizedEmail };
}

/**
 * Hard delete and purge job meant to run daily.
 * Queries for users whose deletionRequestedAt is older than 30 days,
 * cascade deletes all child records, and hard deletes the user record.
 */
export async function purgeExpiredAccounts() {
  const cutoffDate = new Date(Date.now() - DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  const accountsToPurge = await prisma.user.findMany({
    where: {
      deletionRequestedAt: {
        not: null,
        lte: cutoffDate,
      },
    },
    select: {
      id: true,
      email: true,
      deletionRequestedAt: true,
    },
  });

  const count = accountsToPurge.length;
  console.log(`[Hard Delete Job] Started. Found ${count} accounts to purge.`);

  if (count === 0) {
    console.log('[Hard Delete Job] Finished. Successfully purged 0 accounts.');
    return { purgedCount: 0 };
  }

  let purgedCount = 0;

  for (const account of accountsToPurge) {
    await prisma.$transaction(async (tx) => {
      // 1. Delete authentication and session child records
      await tx.session.deleteMany({ where: { userId: account.id } });
      await tx.passwordResetToken.deleteMany({ where: { userId: account.id } });

      // 2. Delete payments and entitlements
      await tx.entitlement.deleteMany({ where: { userId: account.id } });
      await tx.payment.deleteMany({ where: { userId: account.id } });

      // 3. Delete learning and analytics records
      await tx.learnerStepProgress.deleteMany({ where: { userId: account.id } });
      await tx.workspaceSnapshot.deleteMany({ where: { userId: account.id } });
      await tx.checkAttempt.deleteMany({ where: { userId: account.id } });
      await tx.mentorMessage.deleteMany({ where: { userId: account.id } });
      await tx.hintQuota.deleteMany({ where: { userId: account.id } });
      await tx.learnerEvent.deleteMany({ where: { userId: account.id } });

      // 4. Finally hard delete the User record itself
      await tx.user.delete({ where: { id: account.id } });
    });

    purgedCount++;
  }

  console.log(`[Hard Delete Job] Finished. Successfully purged ${purgedCount} accounts.`);
  return { purgedCount };
}

