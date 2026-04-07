"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DragEvent, useMemo, useRef, useState } from "react";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];

function formatFileSize(size: number) {
  if (size < 1024) return `${size} Б`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} КБ`;
  return `${(size / (1024 * 1024)).toFixed(1)} МБ`;
}

function hasAllowedExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export default function NewDocumentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const fileMeta = useMemo(() => {
    if (!file) return null;

    return {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || "Неизвестный тип",
    };
  }, [file]);

  const validateFile = (nextFile: File | null) => {
    if (!nextFile) {
      setError("Выберите файл");
      return false;
    }

    if (!hasAllowedExtension(nextFile.name)) {
      setError("Поддерживаются только PDF, DOCX и TXT");
      return false;
    }

    return true;
  };

  const applyFile = (nextFile: File | null) => {
    setError("");

    if (!nextFile) {
      setFile(null);
      return;
    }

    if (!validateFile(nextFile)) {
      return;
    }

    setFile(nextFile);

    const baseName = nextFile.name.replace(/\.[^/.]+$/, "");
    setName(baseName);
  };

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

    if (!validateFile(file)) {
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

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка загрузки документа");
      }

      setFile(null);
      setName("");

      router.push(`/documents/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!loading) setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    if (loading) return;

    const droppedFile = e.dataTransfer.files?.[0] || null;
    applyFile(droppedFile);
  };

  const openFilePicker = () => {
    if (loading) return;
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    if (loading) return;
    setFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900 md:text-3xl">
              Загрузка документа
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Загрузите файл для AI-анализа, аудита и чата по содержимому.
              Сейчас поддерживаются PDF, DOCX и TXT.
            </p>
          </div>

          <Link
            href="/documents"
            className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            К документам
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Название документа
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Договор поставки"
              disabled={loading}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Файл
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFilePicker}
              className={`cursor-pointer rounded-[28px] border-2 border-dashed p-6 text-center transition md:p-8 ${
                dragActive
                  ? "border-cyan-700 bg-cyan-50"
                  : "border-slate-300 bg-slate-50 hover:border-cyan-600 hover:bg-cyan-50/40"
              } ${loading ? "pointer-events-none opacity-70" : ""}`}
            >
              <div className="mx-auto max-w-xl">
                <div className="mb-3 text-base font-semibold text-slate-900 md:text-lg">
                  {dragActive ? "Отпустите файл, чтобы загрузить" : "Перетащите файл сюда"}
                </div>

                <p className="text-sm leading-6 text-slate-600">
                  или нажмите, чтобы выбрать файл с компьютера
                </p>

                <div className="mt-4 inline-flex flex-wrap justify-center gap-2 text-xs text-slate-500">
                  {ACCEPTED_EXTENSIONS.map((ext) => (
                    <span
                      key={ext}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1"
                    >
                      {ext.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => applyFile(e.target.files?.[0] || null)}
              disabled={loading}
              className="hidden"
            />

            {fileMeta ? (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                      {fileMeta.name}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>Размер: {fileMeta.size}</span>
                      <span>Тип: {fileMeta.type}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearFile}
                    disabled={loading}
                    className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Убрать файл
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-xs text-slate-500">
                Файл пока не выбран
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="mb-2 text-sm font-semibold text-slate-900">
              Как это работает
            </div>
            <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-4">
                1. Загружаете документ
              </div>
              <div className="rounded-2xl bg-white p-4">
                2. Запускаете AI-анализ
              </div>
              <div className="rounded-2xl bg-white p-4">
                3. Общаетесь с документом в чате
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Загружаем документ..." : "Загрузить документ"}
            </button>

            <Link
              href="/documents"
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Отмена
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}