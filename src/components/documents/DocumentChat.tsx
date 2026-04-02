"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

export function DocumentChat({ documentId, messages }: DocumentChatProps) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = question.trim();

    if (!trimmed) return;

    try {
      setLoading(true);

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

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Сервер вернул не JSON: ${raw.slice(0, 200)}`);
      }

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка чата");
      }

      setQuestion("");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
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
      </div>

      <div className="space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Например: какие риски по ответственности сторон ты видишь?"
          rows={4}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={loading}
            className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Отправляем..." : "Отправить вопрос"}
          </button>
        </div>
      </div>
    </div>
  );
}