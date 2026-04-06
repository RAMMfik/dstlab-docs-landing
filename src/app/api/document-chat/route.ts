import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatWithDocument } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();

    const documentId = String(body?.documentId || "").trim();
    const question = String(body?.question || "").trim();

    if (!documentId) {
      return NextResponse.json({ error: "Нет documentId" }, { status: 400 });
    }

    if (!question) {
      return NextResponse.json({ error: "Введите вопрос" }, { status: 400 });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Документ не найден или недоступен" },
        { status: 404 }
      );
    }

    if (!document.extractedText || document.extractedText.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            "У документа нет извлечённого текста. Сначала запусти AI-анализ.",
        },
        { status: 400 }
      );
    }

    const history = (document.messages as any[])
      .filter((msg: any) => msg.role === "user" || msg.role === "assistant")
      .map((msg: any) => ({
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