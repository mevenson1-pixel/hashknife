import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/jobs/[id]/notes">
) {
  const { id } = await ctx.params;
  const body = await request.json();

  const note = await prisma.jobNote.create({
    data: { jobId: id, content: body.content },
  });

  return Response.json(note, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/jobs/[id]/notes">
) {
  const { id: _jobId } = await ctx.params;
  const { searchParams } = request.nextUrl;
  const noteId = searchParams.get("noteId");
  if (!noteId) return Response.json({ error: "noteId required" }, { status: 400 });
  await prisma.jobNote.delete({ where: { id: noteId } });
  return new Response(null, { status: 204 });
}
