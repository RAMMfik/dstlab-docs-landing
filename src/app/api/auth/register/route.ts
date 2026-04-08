import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit.service";
import { ok, badRequest, internalError, apiError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const rate = checkRateLimit({
      key: `register:${ip}`,
      limit: 5,
      windowMs: 60_000,
    });

    if (!rate.ok) {
      return apiError(
        "Слишком много регистраций. Попробуйте позже.",
        429,
        "BAD_REQUEST"
      );
    }

    const body = await req.json();

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();

    if (!email) {
      return badRequest("Введите email");
    }

    if (!email.includes("@")) {
      return badRequest("Некорректный email");
    }

    if (password.length < 6) {
      return badRequest("Пароль должен быть не короче 6 символов");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return badRequest("Пользователь с таким email уже существует");
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

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
    console.error("POST /api/auth/register error:", error);

    return internalError(
      error instanceof Error
        ? error.message
        : "Не удалось зарегистрировать пользователя"
    );
  }
}