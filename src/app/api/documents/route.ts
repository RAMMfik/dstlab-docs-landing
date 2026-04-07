import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getUserLimits } from "@/lib/services/limit.service";
import { incrementDocumentsUsed } from "@/lib/services/usage.service";
import {
  getUserDocuments,
  countUserDocuments,
  createDocument,
} from "@/lib/services/document.service";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const documents = await getUserDocuments(user.id);

    return NextResponse.json(documents);
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json(
      { error: "Не удалось получить документы" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const limits = getUserLimits(user.plan);
    const documentsCount = await countUserDocuments(user.id);

    if (documentsCount >= limits.documents) {
      return NextResponse.json(
        { error: "Достигнут лимит документов. Обновите тариф." },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const name = String(formData.get("name") || "").trim();
    const file = formData.get("file") as File | null;

    if (!name) {
      return NextResponse.json(
        { error: "Название документа обязательно" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "Файл обязателен" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
    await mkdir(uploadDir, { recursive: true });

    const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, safeFileName);

    await writeFile(filePath, buffer);

    const publicFileUrl = `/uploads/documents/${safeFileName}`;

    const document = await createDocument({
  userId: user.id,
  name,
  fileUrl: publicFileUrl,
});

await incrementDocumentsUsed(user.id);

return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить документ" },
      { status: 500 }
    );
  }
}