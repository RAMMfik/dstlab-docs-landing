import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function DocumentDetailsPage({ params }: Props) {
  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{document.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Детали документа и результат AI-аудита.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/documents"
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700"
            >
              Назад
            </Link>

            <a
              href={document.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-4 py-3 text-sm font-semibold text-white"
            >
              Открыть файл
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">О документе</h2>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div>
                <span className="font-medium text-slate-900">Название:</span> {document.name}
              </div>
              <div>
                <span className="font-medium text-slate-900">Файл:</span> {document.fileUrl}
              </div>
              <div>
                <span className="font-medium text-slate-900">Создан:</span>{" "}
                {new Date(document.createdAt).toLocaleString("ru-RU")}
              </div>
              <div>
                <span className="font-medium text-slate-900">Последний анализ:</span>{" "}
                {document.analyzedAt
                  ? new Date(document.analyzedAt).toLocaleString("ru-RU")
                  : "ещё не выполнялся"}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">AI-аудит</h2>

            {document.analysis ? (
              <pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                {document.analysis}
              </pre>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Анализ ещё не запускался. Вернись в список документов и нажми «AI анализ».
              </div>
            )}
          </div>
        </div>

        {document.extractedText ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Извлечённый текст</h2>
            <pre className="mt-4 max-h-[500px] overflow-auto whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
              {document.extractedText}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}