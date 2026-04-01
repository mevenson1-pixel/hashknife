import { prisma } from "@/lib/prisma";

export async function GET() {
  // Return all schedule blocks + job date ranges as calendar events
  const [blocks, jobs] = await Promise.all([
    prisma.scheduleBlock.findMany({
      include: { job: { select: { id: true, jobNumber: true, status: true } } },
      orderBy: { start: "asc" },
    }),
    prisma.job.findMany({
      where: {
        AND: [
          { estimatedStartDate: { not: null } },
          { estimatedEndDate: { not: null } },
        ],
      },
      select: {
        id: true,
        jobNumber: true,
        title: true,
        status: true,
        estimatedStartDate: true,
        estimatedEndDate: true,
        actualStartDate: true,
        actualEndDate: true,
        client: { select: { name: true } },
      },
    }),
  ]);

  return Response.json({ blocks, jobs });
}
