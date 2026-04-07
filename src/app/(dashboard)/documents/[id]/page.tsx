import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ReanalyzeButton } from "@/components/documents/ReanalyzeButton";
import { DocumentChat } from "@/components/documents/DocumentChat";
import { DeleteDocumentButton } from "@/components/documents/DeleteDocumentButton";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function formatAnalysisToBlocks(text: string) {
  const sections = text
    .split(/\n(?=\d+\.)/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (sections.length === 0) {
    return [text];
  }

  return sections;
}

function getDocumentTypeLabel(fileUrl: string) {
  const lower = fileUrl.toLowerCase();

  if (lower.endsWith(".pdf")) return "PDF";
  if (lower.endsWith(".docx")) return "DOCX";
  if (lower.endsWith(".txt")) return "TXT";

  return "Файл";
}

export default async function DocumentDetailsPage({ params }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const document = await prisma.document.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!document) {
    notFound();
  }

  const analysisBlocks = document.analysis
    ? formatAnalysisToBlocks(document.analysis)
    : [];

  const extractedTextLength = document.extractedText?.length ?? 0;
  const documentType = getDocumentTypeLabel(document.fileUrl);

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="overflow-hidden rounded-[32px] border border-[rgba(10,99,117,0.08)] bg-[linear-gradient(135deg,rgba(10,99,117,0.08),rgba(29,206,201,0.08),rgba(255,255,255,0.95))] p-6 shadow-[0_18px_50px_rgba(10,99,117,0.08)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                AI аудит документа
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                {document.name}
              </h1>

              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                Здесь хранится результат автоматического аудита документа, извлечённый
                текст и чат по содержимому файла.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Создан:</span>{" "}
                  {new Date(document.createdAt).toLocaleString("ru-RU")}
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    document.analysis
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <span className="font-semibold">
                    {document.analysis ? "Анализ готов" : "Без анализа"}
                  </span>
                </div>

                <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Последний запуск:</span>{" "}
                  {document.analyzedAt
                    ? new Date(document.analyzedAt).toLocaleString("ru-RU")
                    : "ещё не запускался"}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="#chat"
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  К чату
                </a>

                <a
                  href="#analysis"
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  К аудиту
                </a>

                {document.extractedText ? (
                  <a
                    href="#text"
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    К тексту
                  </a>
                ) : null}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto">
              <Link
                href="/documents"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Назад к документам
              </Link>

              <a
                href={document.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Открыть оригинал
              </a>

              <ReanalyzeButton
                documentId={document.id}
                fileUrl={document.fileUrl}
              />

              <DeleteDocumentButton
                documentId={document.id}
                mode="details"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.8fr]">
          <div className="space-y-6">
            <section id="chat" className="scroll-mt-24">
              <DocumentChat
                documentId={document.id}
                messages={document.messages}
              />
            </section>

            <section
              id="analysis"
              className="scroll-mt-24 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Результат AI-аудита</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Структурированный вывод по содержанию документа.
                  </p>
                </div>

                {document.analysis ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
                    Блоков: {analysisBlocks.length}
                  </div>
                ) : null}
              </div>

              {document.analysis ? (
                <div className="space-y-4">
                  {analysisBlocks.map((block, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                    >
                      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Блок {index + 1}
                      </div>

                      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-700">
                        {block}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  Анализ ещё не запускался. Нажми кнопку «Запустить анализ заново».
                </div>
              )}
            </section>

            {document.extractedText ? (
              <section
                id="text"
                className="scroll-mt-24 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Извлечённый текст</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Текст, который был извлечён из файла и отправлен в AI.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
                    {extractedTextLength.toLocaleString("ru-RU")} символов
                  </div>
                </div>

                <div className="max-h-[520px] overflow-auto rounded-2xl bg-slate-50 p-4">
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-700">
                    {document.extractedText}
                  </pre>
                </div>
              </section>
            ) : null}
          </div>

          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">О документе</h2>

              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Название
                  </div>
                  <div className="mt-2 font-medium text-slate-900">
                    {document.name}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Тип файла
                  </div>
                  <div className="mt-2 font-medium text-slate-900">
                    {documentType}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Файл
                  </div>
                  <div className="mt-2 break-all font-medium text-slate-900">
                    {document.fileUrl}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Размер текста
                  </div>
                  <div className="mt-2 font-medium text-slate-900">
                    {document.extractedText
                      ? `${document.extractedText.length.toLocaleString("ru-RU")} символов`
                      : "ещё не извлечён"}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Сообщений в чате
                  </div>
                  <div className="mt-2 font-medium text-slate-900">
                    {document.messages.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Быстрые действия</h2>

              <div className="mt-4 space-y-3">
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Открыть исходный файл
                </a>

                <a
                  href="#analysis"
                  className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Перейти к аудиту
                </a>

                <a
                  href="#chat"
                  className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Перейти к чату
                </a>

                <Link
                  href="/documents"
                  className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Вернуться к списку
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}