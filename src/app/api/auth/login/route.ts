import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit.service";
import { ok, badRequest, internalError, apiError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const rate = checkRateLimit({
      key: `login:${ip}`,
      limit: 10,
      windowMs: 60_000,
    });

    if (!rate.ok) {
      return apiError(
        "Слишком много попыток входа. Попробуйте позже.",
        429,
        "BAD_REQUEST"
      );
    }

    const body = await req.json();

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();

    if (!email || !password) {
      return badRequest("Введите email и пароль");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return badRequest("Неверный email или пароль");
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return badRequest("Неверный email или пароль");
    }

    await createSession({
      userId: user.id,
      email: user.email,
    });

    return ok({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);

    return internalError(
      error instanceof Error ? error.message : "Не удалось выполнить вход"
    );
  }
}