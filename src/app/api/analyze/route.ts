import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text;

    if (!text) {
      return NextResponse.json(
        { error: "Нет текста для анализа" },
        { status: 400 }
      );
    }

    const result = await analyzeDocument(text);

    return NextResponse.json({ result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Ошибка анализа" },
      { status: 500 }
    );
  }
}