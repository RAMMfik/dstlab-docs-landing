import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();

    if (!email) {
      return NextResponse.json({ error: "Введите email" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен быть не короче 6 символов" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/register error:", error);

    return NextResponse.json(
      { error: "Не удалось зарегистрировать пользователя" },
      { status: 500 }
    );
  }
}