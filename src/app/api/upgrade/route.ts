import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { plan: "PRO" },
  });

  return Response.json({ success: true });
}