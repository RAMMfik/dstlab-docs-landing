import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { analyzeDocument } from "@/lib/ai";
import { parsePdf } from "@/lib/pdf";

export const runtime = "nodejs";

async function readTextFile(fullPath: string) {
  return fs.readFile(fullPath, "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fileUrl = String(body?.fileUrl || "").trim();

    console.log("[analyze] body:", body);
    console.log("[analyze] fileUrl:", fileUrl);

    if (!fileUrl) {
      return NextResponse.json({ error: "Нет файла" }, { status: 400 });
    }

    const normalizedFileUrl = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    const fullPath = path.join(process.cwd(), "public", normalizedFileUrl);
    const ext = path.extname(fullPath).toLowerCase();

    console.log("[analyze] normalizedFileUrl:", normalizedFileUrl);
    console.log("[analyze] fullPath:", fullPath);
    console.log("[analyze] ext:", ext);

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
    } else {
      return NextResponse.json(
        { error: `Формат ${ext || "unknown"} пока не поддерживается. Сейчас поддерживаются только PDF и TXT.` },
        { status: 400 }
      );
    }

    console.log("[analyze] text length:", text?.length || 0);

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            ext === ".txt"
              ? "TXT файл пустой или в нём слишком мало текста"
              : "Не удалось извлечь текст из файла",
        },
        { status: 400 }
      );
    }

    const result = await analyzeDocument(text);

    return NextResponse.json({ result });
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