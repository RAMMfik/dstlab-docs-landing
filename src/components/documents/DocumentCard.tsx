"use client";

import Link from "next/link";
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

function shortenPath(path: string, max = 58) {
  if (path.length <= max) return path;
  return `${path.slice(0, max)}...`;
}

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
    <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900">{doc.name}</h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                doc.analysis
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {doc.analysis ? "Анализ готов" : "Без анализа"}
            </span>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            <span className="font-medium text-slate-700">Файл:</span>{" "}
            <span title={doc.fileUrl}>{shortenPath(doc.fileUrl)}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Открыть файл
            </a>

            <Link
              href={`/documents/${doc.id}`}
              className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Открыть аудит
            </Link>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#a855f7)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Анализ..." : doc.analysis ? "Переанализировать" : "AI анализ"}
            </button>

            <DeleteDocumentButton documentId={doc.id} />
          </div>
        </div>

        <div className="grid min-w-[220px] gap-3 rounded-[24px] bg-slate-50 p-4 text-sm text-slate-600">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
              Создан
            </div>
            <div className="mt-1 font-medium text-slate-900">
              {new Date(doc.createdAt).toLocaleString("ru-RU")}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
              Последний анализ
            </div>
            <div className="mt-1 font-medium text-slate-900">
              {doc.analyzedAt
                ? new Date(doc.analyzedAt).toLocaleString("ru-RU")
                : "ещё не запускался"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}