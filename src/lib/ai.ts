export async function analyzeDocument(text: string) {
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
          content:
            "Ты эксперт по анализу документов. Анализируй текст и давай структурированный аудит.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    }),
  });

  const data = await res.json();

  return data.choices?.[0]?.message?.content || "Нет ответа";
}