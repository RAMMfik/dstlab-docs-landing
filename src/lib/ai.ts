export async function analyzeDocument(text: string) {
  // ограничиваем размер (ВАЖНО)
  const limitedText = text.slice(0, 12000);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "system",
          content: `
Ты эксперт по анализу документов.

Сделай аудит:
1. Краткое содержание
2. Риски
3. Ошибки
4. Рекомендации
5. Общая оценка
`,
        },
        {
          role: "user",
          content: limitedText,
        },
      ],
    }),
  });

  const data = await res.json();

  return data.choices?.[0]?.message?.content || "Нет ответа";
}