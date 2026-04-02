"use client";

import { useState } from "react";

export function DocumentCard({ doc }: any) {
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl: doc.fileUrl,
        }),
      });

      const raw = await res.text();
      let data: any = null;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Сервер вернул не JSON: ${raw.slice(0, 200)}`);
      }

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка анализа");
      }

      alert(data.result);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-lg font-semibold text-slate-900">{doc.name}</div>

      <div className="mt-2 text-sm text-slate-500">Путь: {doc.fileUrl}</div>

      <div className="mt-3 flex items-center gap-4">
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-cyan-700 hover:underline"
        >
          Открыть файл
        </a>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="text-sm font-medium text-purple-600 hover:underline disabled:opacity-50"
        >
          {loading ? "Анализ..." : "AI анализ"}
        </button>
      </div>

      <div className="mt-2 text-xs text-slate-400">
        Создан: {new Date(doc.createdAt).toLocaleString("ru-RU")}
      </div>
    </div>
  );
}