import { getCurrentUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import { ok, unauthorized, badRequest, internalError, apiError } from "@/lib/api";
import {
  getUserDocuments,
  createDocument,
} from "@/lib/services/document.service";
import { incrementDocumentsUsed } from "@/lib/services/usage.service";
import { assertUsageWithinLimit } from "@/lib/services/usage-guard.service";
import {
  isSupportedDocumentExtension,
  saveDocumentFile,
} from "@/lib/services/storage.service";
import { getUserLimits } from "@/lib/services/limit.service";

export const runtime = "nodejs";

function sanitizeDocumentName(name: string) {
  return name.replace(/\s+/g, " ").trim();
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorized();
    }

    const documents = await getUserDocuments(user.id);
    return ok(documents);
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return internalError("Не удалось получить документы");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorized();
    }

    const guard = await assertUsageWithinLimit({
      userId: user.id,
      plan: user.plan,
      feature: "documents",
    });

    if (!guard.ok) {
      return apiError(guard.message, 403, "LIMIT_REACHED", {
        feature: guard.feature,
        used: guard.used,
        limit: guard.limit,
      });
    }

    const limits = getUserLimits(user.plan);
    const formData = await req.formData();

    const rawName = String(formData.get("name") || "");
    const file = formData.get("file");

    const name = sanitizeDocumentName(rawName);

    if (!name) {
      return badRequest("Название документа обязательно");
    }

    if (!(file instanceof File)) {
      return badRequest("Файл обязателен");
    }

    if (!file.name.trim()) {
      return badRequest("У файла должно быть имя");
    }

    if (file.size <= 0) {
      return badRequest("Файл пустой", "VALIDATION_ERROR");
    }

    if (file.size > limits.maxUploadSizeBytes) {
      return badRequest(
        `Файл слишком большой. Максимум: ${Math.round(limits.maxUploadSizeBytes / (1024 * 1024))} МБ.`,
        "FILE_TOO_LARGE",
        { maxUploadSizeBytes: limits.maxUploadSizeBytes }
      );
    }

    if (!isSupportedDocumentExtension(file.name)) {
      return badRequest(
        "Поддерживаются только PDF, DOCX и TXT",
        "UNSUPPORTED_FILE_TYPE"
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const savedFile = await saveDocumentFile({
      originalFileName: file.name,
      buffer,
    });

    const document = await createDocument({
      userId: user.id,
      name,
      fileUrl: savedFile.publicUrl,
    });

    await incrementDocumentsUsed(user.id);

    return ok(document, 201);
  } catch (error) {
    console.error("POST /api/documents error:", error);
    return internalError("Не удалось загрузить документ");
  }
}