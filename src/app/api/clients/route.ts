import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, phone: true },
  });
  return Response.json(clients);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const client = await prisma.client.create({
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      notes: body.notes || null,
    },
  });
  return Response.json(client, { status: 201 });
}
