import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json(
      { error: "Не удалось получить документы" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const fileUrl = String(body?.fileUrl || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Название документа обязательно" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email: "test@test.com" },
      update: {},
      create: { email: "test@test.com" },
    });

    const document = await prisma.document.create({
      data: {
        name,
        fileUrl: fileUrl || "local/test.pdf",
        userId: user.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json(
      { error: "Не удалось создать документ" },
      { status: 500 }
    );
  }
}