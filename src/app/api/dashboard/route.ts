import { prisma } from "@/lib/prisma";
import { JobStatus } from "@/generated/prisma/client";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalJobs,
    activeJobs,
    jobsThisMonth,
    pipelineCounts,
    revenueResult,
    pendingInvoices,
    upcomingBlocks,
    recentJobs,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({
      where: { status: { in: ["SCHEDULED", "IN_PROGRESS", "PUNCH_LIST"] as JobStatus[] } },
    }),
    prisma.job.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.job.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.job.aggregate({
      where: { status: "PAID" },
      _sum: { estimatedBudget: true },
    }),
    prisma.job.aggregate({
      where: { status: "INVOICED" },
      _sum: { estimatedBudget: true },
    }),
    prisma.scheduleBlock.findMany({
      where: { start: { gte: now, lte: in7Days } },
      include: { job: { select: { id: true, jobNumber: true, title: true, status: true } } },
      orderBy: { start: "asc" },
      take: 8,
    }),
    prisma.job.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
  ]);

  return Response.json({
    totalJobs,
    activeJobs,
    jobsThisMonth,
    pipelineCounts: pipelineCounts.map((p) => ({ status: p.status, count: p._count.id })),
    totalRevenue: revenueResult._sum.estimatedBudget ?? 0,
    pendingInvoices: pendingInvoices._sum.estimatedBudget ?? 0,
    upcomingBlocks,
    recentJobs,
  });
}
