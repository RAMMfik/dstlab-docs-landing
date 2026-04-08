"use client";

import { useRouter } from "next/navigation";
import { KeyboardEvent, useMemo, useState } from "react";
import { ApiErrorAlert } from "@/components/ui/ApiErrorAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string | Date;
};

type Props = {
  documentId: string;
  messages: Message[];
};

const MAX_QUESTION_LENGTH = 4000;

export function DocumentChat({ documentId, messages }: Props) {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = question.trim();
  const remaining = MAX_QUESTION_LENGTH - question.length;

  const isDisabled =
    loading || !trimmed || question.length > MAX_QUESTION_LENGTH;

  const helperText = useMemo(() => {
    if (question.length > MAX_QUESTION_LENGTH) {
      return `Сократи вопрос на ${Math.abs(remaining)} символов`;
    }
    return `Осталось символов: ${remaining}`;
  }, [question.length, remaining]);

  const handleSend = async () => {
    if (!trimmed || loading) return;

    if (trimmed.length > MAX_QUESTION_LENGTH) {
      setError(`Максимум ${MAX_QUESTION_LENGTH} символов`);
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
      const data = raw ? JSON.parse(raw) : {};

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
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        Чат по документу
      </h2>

      <div className="mb-4 max-h-[520px] space-y-4 overflow-auto rounded-2xl bg-slate-50 p-4">
        {messages.length === 0 ? (
          <div className="text-sm text-slate-600">
            Пока сообщений нет.
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[92%] rounded-3xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-cyan-700 text-white"
                  : "bg-white text-slate-700"
              }`}
            >
              {m.content}
            </div>
          ))
        )}

        {loading && (
          <div className="text-sm text-slate-500">
            Думаю над ответом...
          </div>
        )}
      </div>

      <ApiErrorAlert message={error} />

      <div className="space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={4}
          className="w-full rounded-2xl border px-4 py-3"
        />

        <div className="flex justify-between items-center">
          <div className="text-xs text-slate-400">{helperText}</div>

          <LoadingButton
            loading={loading}
            onClick={handleSend}
            disabled={isDisabled}
            loadingText="Отправляем..."
          >
            Отправить
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}