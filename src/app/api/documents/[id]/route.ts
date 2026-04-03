import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Документ не найден" },
        { status: 404 }
      );
    }

    if (document.fileUrl) {
      const normalizedFileUrl = document.fileUrl.startsWith("/")
        ? document.fileUrl.slice(1)
        : document.fileUrl;

      const fullPath = path.join(process.cwd(), "public", normalizedFileUrl);

      try {
        await fs.unlink(fullPath);
      } catch (fileError) {
        console.warn("Не удалось удалить файл с диска:", fullPath, fileError);
      }
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/documents/[id] error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Не удалось удалить документ",
      },
      { status: 500 }
    );
  }
}