"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewDocumentPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) {
      setError("Введите название документа");
      return;
    }

    if (!file) {
      setError("Выберите файл");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("file", file);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка загрузки документа");
      }

      router.push("/documents");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Загрузка документа
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          Загрузи PDF, DOC, DOCX или другой рабочий файл для дальнейшего анализа.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Название документа
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Договор поставки"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Файл
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Загружаем..." : "Загрузить документ"}
          </button>
        </div>
      </div>
    </div>
  );
}