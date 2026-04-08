type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type OpenRouterUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

type AiResultMeta = {
  provider: "OPENROUTER";
  model: string;
  tokensInput: number | null;
  tokensOutput: number | null;
  tokensTotal: number | null;
  estimatedCostUsd: number | null;
};

type AiTextResult = {
  content: string;
  meta: AiResultMeta;
};

const DEFAULT_MODEL = "openai/gpt-4o-mini";

function parseUsage(data: unknown): OpenRouterUsage | null {
  if (!data || typeof data !== "object" || !("usage" in data)) {
    return null;
  }

  const usage = (data as { usage?: OpenRouterUsage }).usage;

  if (!usage || typeof usage !== "object") {
    return null;
  }

  return usage;
}

function getEstimatedCostUsd(params: {
  tokensInput: number | null;
  tokensOutput: number | null;
}) {
  const inputRate = Number(process.env.AI_INPUT_COST_PER_1K_TOKENS || "");
  const outputRate = Number(process.env.AI_OUTPUT_COST_PER_1K_TOKENS || "");

  if (!Number.isFinite(inputRate) || !Number.isFinite(outputRate)) {
    return null;
  }

  const inputCost =
    ((params.tokensInput ?? 0) / 1000) * inputRate;

  const outputCost =
    ((params.tokensOutput ?? 0) / 1000) * outputRate;

  return Number((inputCost + outputCost).toFixed(6));
}

async function runOpenRouterRequest(
  body: Record<string, unknown>
): Promise<AiTextResult> {
  const model = DEFAULT_MODEL;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "DSTLab Docs AI",
    },
    body: JSON.stringify({
      model,
      ...body,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error || "Ошибка AI сервиса");
  }

  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("AI не вернул текстовый ответ");
  }

  const usage = parseUsage(data);

  const tokensInput =
    typeof usage?.prompt_tokens === "number" ? usage.prompt_tokens : null;

  const tokensOutput =
    typeof usage?.completion_tokens === "number" ? usage.completion_tokens : null;

  const tokensTotal =
    typeof usage?.total_tokens === "number" ? usage.total_tokens : null;

  return {
    content,
    meta: {
      provider: "OPENROUTER",
      model,
      tokensInput,
      tokensOutput,
      tokensTotal,
      estimatedCostUsd: getEstimatedCostUsd({
        tokensInput,
        tokensOutput,
      }),
    },
  };
}

export async function analyzeDocumentDetailed(text: string) {
  const limitedText = text.slice(0, 12000);

  return runOpenRouterRequest({
    temperature: 0.2,
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
  });
}

export async function analyzeDocument(text: string) {
  const result = await analyzeDocumentDetailed(text);
  return result.content;
}

export async function chatWithDocumentDetailed(params: {
  documentText: string;
  question: string;
  history?: ChatMessage[];
}) {
  const limitedText = params.documentText.slice(0, 20000);
  const history = (params.history || []).slice(-8);

  return runOpenRouterRequest({
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
  });
}

export async function chatWithDocument(params: {
  documentText: string;
  question: string;
  history?: ChatMessage[];
}) {
  const result = await chatWithDocumentDetailed(params);
  return result.content;
}