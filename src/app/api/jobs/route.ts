import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") as JobStatus | null;
  const search = searchParams.get("search") || "";

  const jobs = await prisma.job.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { client: { name: { contains: search } } },
              { jobNumber: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      client: { select: { id: true, name: true } },
      _count: { select: { changeOrders: true, jobNotes: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json(jobs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const job = await prisma.job.create({
    data: {
      jobNumber: body.jobNumber,
      title: body.title,
      description: body.description || null,
      siteAddress: body.siteAddress || null,
      status: body.status || "LEAD",
      estimatedStartDate: body.estimatedStartDate
        ? new Date(body.estimatedStartDate)
        : null,
      estimatedEndDate: body.estimatedEndDate
        ? new Date(body.estimatedEndDate)
        : null,
      estimatedBudget: body.estimatedBudget
        ? parseFloat(body.estimatedBudget)
        : null,
      notes: body.notes || null,
      clientId: body.clientId,
    },
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  return Response.json(job, { status: 201 });
}
