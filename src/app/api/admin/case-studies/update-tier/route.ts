import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { enforceRateLimit } from '@/lib/rate-limit';

const updateTierSchema = z.object({
  caseStudyId: z.string().min(1),
  tier: z.enum(['FREE', 'PAID']),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const rateLimitResponse = enforceRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json().catch(() => null);
    const parsed = updateTierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const { caseStudyId, tier } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const caseStudy = await tx.caseStudy.findUnique({
        where: { id: caseStudyId },
        select: { id: true, title: true, slug: true },
      });

      if (!caseStudy) {
        return null;
      }

      await tx.caseStudy.update({
        where: { id: caseStudyId },
        data: {
          accessMode: tier,
          freeStepCount: null,
        },
      });

      await tx.step.updateMany({
        where: { caseStudyId },
        data: { access: tier },
      });

      return { ...caseStudy, accessMode: tier };
    });

    if (!updated) {
      return NextResponse.json({ error: 'Case study not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, caseStudy: updated });
  } catch (error) {
    console.error('Admin case study tier update error:', error);
    return NextResponse.json(
      { error: 'Unable to update the case study tier.' },
      { status: 500 }
    );
  }
}
