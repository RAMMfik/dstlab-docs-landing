import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatWithDocument } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const documentId = String(body?.documentId || "").trim();
    const question = String(body?.question || "").trim();

    if (!documentId) {
      return NextResponse.json({ error: "Нет documentId" }, { status: 400 });
    }

    if (!question) {
      return NextResponse.json({ error: "Введите вопрос" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Документ не найден" },
        { status: 404 }
      );
    }

    if (!document.extractedText || document.extractedText.trim().length < 20) {
      return NextResponse.json(
        { error: "У документа нет извлечённого текста. Сначала запусти AI-анализ." },
        { status: 400 }
      );
    }

    const history = document.messages
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

    const answer = await chatWithDocument({
      documentText: document.extractedText,
      question,
      history,
    });

    await prisma.documentMessage.createMany({
      data: [
        {
          documentId: document.id,
          role: "user",
          content: question,
        },
        {
          documentId: document.id,
          role: "assistant",
          content: answer,
        },
      ],
    });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("[document-chat] fatal error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Неизвестная ошибка чата",
      },
      { status: 500 }
    );
  }
}