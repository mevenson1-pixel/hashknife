import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ChangeOrderStatus } from "@/generated/prisma/client";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/jobs/[id]/change-orders">
) {
  const { id } = await ctx.params;
  const body = await request.json();

  // Get next CO number
  const count = await prisma.changeOrder.count({ where: { jobId: id } });

  const co = await prisma.changeOrder.create({
    data: {
      jobId: id,
      coNumber: count + 1,
      description: body.description,
      amount: parseFloat(body.amount) || 0,
      status: (body.status as ChangeOrderStatus) || "PENDING",
      notes: body.notes || null,
    },
  });

  return Response.json(co, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/jobs/[id]/change-orders">
) {
  const { id: _jobId } = await ctx.params;
  const body = await request.json();

  const co = await prisma.changeOrder.update({
    where: { id: body.id },
    data: {
      ...(body.status !== undefined && {
        status: body.status as ChangeOrderStatus,
        ...(body.status === "APPROVED" && { approvedAt: new Date() }),
        ...(body.status !== "APPROVED" && { approvedAt: null }),
      }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.amount !== undefined && { amount: parseFloat(body.amount) || 0 }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });

  return Response.json(co);
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/jobs/[id]/change-orders">
) {
  const { id: _jobId } = await ctx.params;
  const { searchParams } = request.nextUrl;
  const coId = searchParams.get("coId");
  if (!coId) return Response.json({ error: "coId required" }, { status: 400 });
  await prisma.changeOrder.delete({ where: { id: coId } });
  return new Response(null, { status: 204 });
}
