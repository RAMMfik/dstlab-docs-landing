type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

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

export async function chatWithDocument(params: {
  documentText: string;
  question: string;
  history?: ChatMessage[];
}) {
  const limitedText = params.documentText.slice(0, 20000);
  const history = (params.history || []).slice(-8);

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
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `Ты AI-помощник по документам.
Отвечай только на основе текста документа и вопросов пользователя.
Если в документе нет точного ответа, прямо так и скажи.
Отвечай на русском языке, структурированно и по делу.`,
        },
        {
          role: "user",
          content: `Текст документа:\n\n${limitedText}`,
        },
        ...history,
        {
          role: "user",
          content: params.question,
        },
      ],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error || "Ошибка AI сервиса");
  }

  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("AI не вернул ответ в чате");
  }

  return content;
}