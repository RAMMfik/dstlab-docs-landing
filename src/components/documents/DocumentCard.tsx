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

  const [analyzing, setAnalyzing] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(doc.name);
  const [renameLoading, setRenameLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setError(null);
      setAnalyzing(true);

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
      const data = raw ? JSON.parse(raw) : {};

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка анализа");
      }

      router.push(`/documents/${doc.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка анализа");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRenameSave = async () => {
    const trimmedName = renameValue.trim();

    if (!trimmedName) {
      setError("Название не может быть пустым");
      return;
    }

    if (trimmedName === doc.name) {
      setRenaming(false);
      setError(null);
      return;
    }

    try {
      setError(null);
      setRenameLoading(true);

      const response = await fetch(`/api/documents/${doc.id}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};

      if (!response.ok) {
        throw new Error(data?.error || "Не удалось переименовать документ");
      }

      setRenaming(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось переименовать документ"
      );
    } finally {
      setRenameLoading(false);
    }
  };

  const handleRenameCancel = () => {
    setRenameValue(doc.name);
    setRenaming(false);
    setError(null);
  };

  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {renaming ? (
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-cyan-700"
                  placeholder="Введите название документа"
                  disabled={renameLoading}
                  autoFocus
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleRenameSave}
                    disabled={renameLoading}
                    className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {renameLoading ? "Сохраняем..." : "Сохранить"}
                  </button>

                  <button
                    type="button"
                    onClick={handleRenameCancel}
                    disabled={renameLoading}
                    className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-900">{doc.name}</h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    analyzing
                      ? "bg-cyan-50 text-cyan-700"
                      : doc.analysis
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {analyzing
                    ? "Идёт анализ"
                    : doc.analysis
                      ? "Анализ готов"
                      : "Без анализа"}
                </span>
              </>
            )}
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            <span className="font-medium text-slate-700">Файл:</span>{" "}
            <span title={doc.fileUrl}>{shortenPath(doc.fileUrl)}</span>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

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

            {!renaming ? (
              <button
                type="button"
                onClick={() => {
                  setRenameValue(doc.name);
                  setRenaming(true);
                  setError(null);
                }}
                disabled={analyzing}
                className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Переименовать
              </button>
            ) : null}

            <button
              onClick={handleAnalyze}
              disabled={analyzing || renaming || renameLoading}
              className="rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#a855f7)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {analyzing
                ? "Анализ..."
                : doc.analysis
                  ? "Переанализировать"
                  : "AI анализ"}
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