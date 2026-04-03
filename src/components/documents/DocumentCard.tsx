"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteDocumentButton } from "@/components/documents/DeleteDocumentButton";

type DocumentCardProps = {
  doc: {
    id: string;
    name: string;
    fileUrl: string;
    createdAt: string | Date;
    analyzedAt?: string | Date | null;
    analysis?: string | null;
  };
};

export function DocumentCard({ doc }: DocumentCardProps) {
  const router = useRouter();
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
          documentId: doc.id,
          fileUrl: doc.fileUrl,
        }),
      });

      const raw = await res.text();
      const data = JSON.parse(raw);

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка анализа");
      }

      router.push(`/documents/${doc.id}`);
      router.refresh();
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

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-cyan-700 hover:underline"
        >
          Открыть файл
        </a>

        <a
          href={`/documents/${doc.id}`}
          className="text-sm font-medium text-slate-700 hover:underline"
        >
          Открыть аудит
        </a>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="text-sm font-medium text-purple-600 hover:underline disabled:opacity-50"
        >
          {loading ? "Анализ..." : doc.analysis ? "Переанализировать" : "AI анализ"}
        </button>

        <DeleteDocumentButton documentId={doc.id} />
      </div>

      <div className="mt-2 text-xs text-slate-400">
        Создан: {new Date(doc.createdAt).toLocaleString("ru-RU")}
      </div>

      {doc.analyzedAt ? (
        <div className="mt-1 text-xs text-emerald-600">
          Анализ выполнен: {new Date(doc.analyzedAt).toLocaleString("ru-RU")}
        </div>
      ) : null}
    </div>
  );
}