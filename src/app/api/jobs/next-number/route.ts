import { prisma } from "@/lib/prisma";

export async function GET() {
  const year = new Date().getFullYear();
  const count = await prisma.job.count({
    where: {
      jobNumber: { startsWith: `HK-${year}-` },
    },
  });
  const nextNum = String(count + 1).padStart(3, "0");
  return Response.json({ jobNumber: `HK-${year}-${nextNum}` });
}
