export async function analyzeDocument(text: string) {
  const limitedText = text.slice(0, 12000);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "DSTLab Docs AI",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Ты эксперт по аудиту документов.
Верни результат на русском языке в понятной структуре:

1. Краткое содержание
2. Основные риски
3. Ошибки и слабые места
4. Что улучшить
5. Итоговая оценка

Пиши конкретно, без воды.`,
        },
        {
          role: "user",
          content: limitedText,
        },
      ],
      temperature: 0.2,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error || "Ошибка AI сервиса");
  }

  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("AI не вернул текст ответа");
  }

  return content;
}