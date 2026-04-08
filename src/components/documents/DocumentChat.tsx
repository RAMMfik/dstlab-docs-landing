"use client";

import { useRouter } from "next/navigation";
import { KeyboardEvent, useMemo, useState } from "react";

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string | Date;
};

type DocumentChatProps = {
  documentId: string;
  messages: Message[];
};

const MAX_QUESTION_LENGTH = 4000;

export function DocumentChat({ documentId, messages }: DocumentChatProps) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedQuestion = question.trim();
  const remaining = MAX_QUESTION_LENGTH - question.length;

  const isDisabled =
    loading || !trimmedQuestion || question.length > MAX_QUESTION_LENGTH;

  const helperText = useMemo(() => {
    if (question.length > MAX_QUESTION_LENGTH) {
      return `Сократи вопрос на ${Math.abs(remaining)} символов`;
    }

    return `Осталось символов: ${remaining}`;
  }, [question.length, remaining]);

  const handleSend = async () => {
    const trimmed = question.trim();

    if (!trimmed || loading) return;

    if (trimmed.length > MAX_QUESTION_LENGTH) {
      setError(`Вопрос слишком длинный. Максимум ${MAX_QUESTION_LENGTH} символов.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/document-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          question: trimmed,
        }),
      });

      const raw = await res.text();

      let data: { error?: string } | null = null;
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(`Сервер вернул не JSON: ${raw.slice(0, 200)}`);
      }

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка чата");
      }

      setQuestion("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">Чат по документу</h2>
        <p className="mt-1 text-sm text-slate-600">
          Задавай вопросы по содержанию файла и получай ответы на основе извлечённого текста.
        </p>
      </div>

      <div className="mb-4 max-h-[520px] space-y-4 overflow-auto rounded-2xl bg-slate-50 p-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
            Пока сообщений нет. Например, спроси: «Какие основные риски в этом документе?»
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[92%] rounded-3xl px-4 py-3 text-sm leading-7 ${
                message.role === "user"
                  ? "ml-auto bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] text-white"
                  : "bg-white text-slate-700 shadow-sm"
              }`}
            >
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                {message.role === "user" ? "Вы" : "AI"}
              </div>
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            </div>
          ))
        )}

        {loading ? (
          <div className="max-w-[92%] rounded-3xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
              AI
            </div>
            Думаю над ответом...
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Например: какие риски по ответственности сторон ты видишь?"
          rows={4}
          maxLength={MAX_QUESTION_LENGTH + 500}
          disabled={loading}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className={`text-xs ${
              question.length > MAX_QUESTION_LENGTH ? "text-red-600" : "text-slate-400"
            }`}
          >
            {helperText}. Ctrl + Enter — отправить
          </div>

          <button
            onClick={handleSend}
            disabled={isDisabled}
            className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Отправляем..." : "Отправить вопрос"}
          </button>
        </div>
      </div>
    </div>
  );
}