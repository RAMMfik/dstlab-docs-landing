import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const name = String(body?.name || "").trim();

  if (!name) {
    return new Response(
      JSON.stringify({ error: "Название не может быть пустым" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    return new Response("Not found", { status: 404 });
  }

  if (document.userId !== user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const updatedDocument = await prisma.document.update({
    where: { id },
    data: { name },
  });

  return new Response(JSON.stringify(updatedDocument), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}