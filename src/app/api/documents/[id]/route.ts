import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await context.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Документ не найден или недоступен" },
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
      where: { id: document.id },
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