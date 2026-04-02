import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

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

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: "Файл обязателен" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
    await mkdir(uploadDir, { recursive: true });

    const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, safeFileName);
    await writeFile(filePath, buffer);

    const publicFileUrl = `/uploads/documents/${safeFileName}`;

    const user = await prisma.user.upsert({
      where: { email: "test@test.com" },
      update: {},
      create: { email: "test@test.com" },
    });

    const document = await prisma.document.create({
      data: {
        name,
        fileUrl: publicFileUrl,
        userId: user.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить документ" },
      { status: 500 }
    );
  }
}