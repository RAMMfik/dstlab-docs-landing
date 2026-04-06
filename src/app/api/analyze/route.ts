import { LIMITS } from "@/lib/limits";
import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { analyzeDocument } from "@/lib/ai";
import { parsePdf } from "@/lib/pdf";
import { parseDocx } from "@/lib/docx";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

async function readTextFile(fullPath: string) {
  return fs.readFile(fullPath, "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const analyzedCount = await prisma.document.count({
  where: {
    userId: user.id,
    analysis: {
      not: null,
    },
  },
});

if (analyzedCount >= LIMITS.FREE.analyses) {
  return new Response(
    JSON.stringify({
      error: "Лимит AI-анализов исчерпан. Обновите тариф.",
    }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    }
  );
}

    const body = await req.json();
    const fileUrl = String(body?.fileUrl || "").trim();
    const documentId = String(body?.documentId || "").trim();

    if (!fileUrl) {
      return NextResponse.json({ error: "Нет файла" }, { status: 400 });
    }

    if (!documentId) {
      return NextResponse.json({ error: "Нет documentId" }, { status: 400 });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: user.id,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Документ не найден или недоступен" },
        { status: 404 }
      );
    }

    const normalizedFileUrl = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    const fullPath = path.join(process.cwd(), "public", normalizedFileUrl);
    const ext = path.extname(fullPath).toLowerCase();

    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { error: `Файл не найден: ${normalizedFileUrl}` },
        { status: 400 }
      );
    }

    let text = "";

    if (ext === ".pdf") {
      text = await parsePdf(fullPath);
    } else if (ext === ".txt") {
      text = await readTextFile(fullPath);
    } else if (ext === ".docx") {
      text = await parseDocx(fullPath);
    } else {
      return NextResponse.json(
        {
          error: `Формат ${ext || "unknown"} пока не поддерживается. Сейчас поддерживаются PDF, TXT и DOCX.`,
        },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            ext === ".txt"
              ? "TXT файл пустой или в нём слишком мало текста"
              : ext === ".docx"
              ? "Не удалось извлечь текст из DOCX"
              : "Не удалось извлечь текст из файла",
        },
        { status: 400 }
      );
    }

    const result = await analyzeDocument(text);

    const updatedDocument = await prisma.document.update({
      where: { id: document.id },
      data: {
        extractedText: text,
        analysis: result,
        analyzedAt: new Date(),
      },
    });

    return NextResponse.json({
      result,
      documentId: updatedDocument.id,
    });
  } catch (error) {
    console.error("[analyze] fatal error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Неизвестная ошибка анализа",
      },
      { status: 500 }
    );
  }
}