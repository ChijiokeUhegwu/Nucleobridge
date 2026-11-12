import { purgeExpiredAccounts } from '@/lib/account-deletion';
import { prisma } from '@/lib/prisma';

async function main() {
  try {
    await purgeExpiredAccounts();
  } catch (error) {
    console.error('[Hard Delete Job] Fatal error in purge script:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();

