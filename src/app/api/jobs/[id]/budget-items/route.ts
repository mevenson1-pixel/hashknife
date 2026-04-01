import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { BudgetCategory } from "@/generated/prisma/client";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/jobs/[id]/budget-items">
) {
  const { id } = await ctx.params;
  const body = await request.json();

  const item = await prisma.budgetItem.create({
    data: {
      jobId: id,
      category: body.category as BudgetCategory,
      description: body.description,
      estimatedAmount: parseFloat(body.estimatedAmount) || 0,
      actualAmount: parseFloat(body.actualAmount) || 0,
    },
  });

  return Response.json(item, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/jobs/[id]/budget-items">
) {
  const { id: _jobId } = await ctx.params;
  const body = await request.json();

  const item = await prisma.budgetItem.update({
    where: { id: body.id },
    data: {
      ...(body.category !== undefined && { category: body.category as BudgetCategory }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.estimatedAmount !== undefined && {
        estimatedAmount: parseFloat(body.estimatedAmount) || 0,
      }),
      ...(body.actualAmount !== undefined && {
        actualAmount: parseFloat(body.actualAmount) || 0,
      }),
    },
  });

  return Response.json(item);
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/jobs/[id]/budget-items">
) {
  const { id: _jobId } = await ctx.params;
  const { searchParams } = request.nextUrl;
  const itemId = searchParams.get("itemId");
  if (!itemId) return Response.json({ error: "itemId required" }, { status: 400 });
  await prisma.budgetItem.delete({ where: { id: itemId } });
  return new Response(null, { status: 204 });
}
