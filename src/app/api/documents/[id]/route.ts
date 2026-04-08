import { getCurrentUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import { deleteDocument, getUserDocumentById } from "@/lib/services/document.service";
import { decrementDocumentsUsed } from "@/lib/services/usage.service";
import { deleteDocumentFileByPublicUrl } from "@/lib/services/storage.service";
import { ok, unauthorized, notFound, internalError } from "@/lib/api";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorized();
    }

    const { id } = await context.params;

    const document = await getUserDocumentById(id, user.id);

    if (!document) {
      return notFound("Документ не найден или недоступен");
    }

    await deleteDocument({
      documentId: document.id,
      userId: user.id,
    });

    if (document.fileUrl) {
      try {
        await deleteDocumentFileByPublicUrl(document.fileUrl);
      } catch (fileError) {
        console.warn("Не удалось удалить файл документа:", document.fileUrl, fileError);
      }
    }

    await decrementDocumentsUsed(user.id);

    return ok({ success: true });
  } catch (error) {
    console.error("DELETE /api/documents/[id] error:", error);
    return internalError(
      error instanceof Error ? error.message : "Не удалось удалить документ"
    );
  }
}