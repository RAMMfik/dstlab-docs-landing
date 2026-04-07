import { getCurrentUser } from "@/lib/auth";
import { renameDocument } from "@/lib/services/document.service";

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

  await renameDocument({
    documentId: id,
    userId: user.id,
    name,
  });

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}