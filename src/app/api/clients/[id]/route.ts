import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/clients/[id]">
) {
  const { id } = await ctx.params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      jobs: {
        orderBy: { updatedAt: "desc" },
        include: { _count: { select: { changeOrders: true } } },
      },
    },
  });

  if (!client) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(client);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/clients/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();

  const client = await prisma.client.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email || null }),
      ...(body.phone !== undefined && { phone: body.phone || null }),
      ...(body.address !== undefined && { address: body.address || null }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
    },
  });

  return Response.json(client);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/clients/[id]">
) {
  const { id } = await ctx.params;
  await prisma.client.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
