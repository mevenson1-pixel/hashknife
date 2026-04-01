import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/jobs/[id]">
) {
  const { id } = await ctx.params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      client: true,
      budgetItems: { orderBy: { createdAt: "asc" } },
      changeOrders: { orderBy: { coNumber: "asc" } },
      jobNotes: { orderBy: { createdAt: "desc" } },
      scheduleBlocks: { orderBy: { start: "asc" } },
    },
  });

  if (!job) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(job);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/jobs/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();

  const job = await prisma.job.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.siteAddress !== undefined && { siteAddress: body.siteAddress }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.estimatedStartDate !== undefined && {
        estimatedStartDate: body.estimatedStartDate
          ? new Date(body.estimatedStartDate)
          : null,
      }),
      ...(body.actualStartDate !== undefined && {
        actualStartDate: body.actualStartDate
          ? new Date(body.actualStartDate)
          : null,
      }),
      ...(body.estimatedEndDate !== undefined && {
        estimatedEndDate: body.estimatedEndDate
          ? new Date(body.estimatedEndDate)
          : null,
      }),
      ...(body.actualEndDate !== undefined && {
        actualEndDate: body.actualEndDate
          ? new Date(body.actualEndDate)
          : null,
      }),
      ...(body.estimatedBudget !== undefined && {
        estimatedBudget: body.estimatedBudget
          ? parseFloat(body.estimatedBudget)
          : null,
      }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.clientId !== undefined && { clientId: body.clientId }),
    },
    include: {
      client: true,
      budgetItems: { orderBy: { createdAt: "asc" } },
      changeOrders: { orderBy: { coNumber: "asc" } },
      jobNotes: { orderBy: { createdAt: "desc" } },
      scheduleBlocks: { orderBy: { start: "asc" } },
    },
  });

  return Response.json(job);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/jobs/[id]">
) {
  const { id } = await ctx.params;
  await prisma.job.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
