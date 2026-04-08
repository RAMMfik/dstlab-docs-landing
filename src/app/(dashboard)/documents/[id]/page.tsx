import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentChat } from "@/components/documents/DocumentChat";
import { ReanalyzeButton } from "@/components/documents/ReanalyzeButton";

type PageProps = {
  params: Promise<{ id: string }>;
};

function getStatusBadge(status: string) {
  if (status === "READY") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "FAILED") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (status === "ANALYZING") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "QUEUED") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}

function getStatusLabel(status: string) {
  if (status === "READY") return "Готово";
  if (status === "FAILED") return "Ошибка";
  if (status === "ANALYZING") return "Обработка";
  if (status === "QUEUED") return "В очереди";
  return "Загружен";
}

export default async function DocumentDetailsPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    notFound();
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
      aiLogs: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!document) {
    notFound();
  }

  const canUseChat =
    document.processingStatus === "READY" &&
    Boolean(document.extractedText?.trim());

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Link
                  href="/documents"
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Назад к документам
                </Link>

                <div
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusBadge(document.processingStatus)}`}
                >
                  {getStatusLabel(document.processingStatus)}
                </div>
              </div>

              <h1 className="break-words text-2xl font-bold text-slate-900 md:text-3xl">
                {document.name}
              </h1>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetaCard
                  label="Создан"
                  value={new Date(document.createdAt).toLocaleString("ru-RU")}
                />
                <MetaCard
                  label="Последний анализ"
                  value={
                    document.analyzedAt
                      ? new Date(document.analyzedAt).toLocaleString("ru-RU")
                      : "Ещё не запускался"
                  }
                />
                <MetaCard
                  label="Старт обработки"
                  value={
                    document.analysisStartedAt
                      ? new Date(document.analysisStartedAt).toLocaleString("ru-RU")
                      : "—"
                  }
                />
                <MetaCard
                  label="Завершение обработки"
                  value={
                    document.analysisCompletedAt
                      ? new Date(document.analysisCompletedAt).toLocaleString("ru-RU")
                      : "—"
                  }
                />
              </div>
            </div>

            <div className="w-full max-w-sm">
              <ReanalyzeButton documentId={document.id} />
            </div>
          </div>

          {document.processingError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {document.processingError}
            </div>
          ) : null}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">AI-анализ</h2>

              <div className="mt-4">
                {document.processingStatus === "READY" && document.analysis ? (
                  <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {document.analysis}
                  </div>
                ) : document.processingStatus === "ANALYZING" ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Анализ сейчас выполняется.
                  </div>
                ) : document.processingStatus === "QUEUED" ? (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Документ поставлен в очередь на обработку.
                  </div>
                ) : document.processingStatus === "FAILED" ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Анализ завершился ошибкой. Проверь сообщение выше и попробуй повторить.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Анализ ещё не запускался.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Извлечённый текст</h2>

              <div className="mt-4">
                {document.extractedText ? (
                  <div className="max-h-[420px] overflow-auto rounded-2xl bg-slate-50 p-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {document.extractedText}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Текст пока не извлечён.
                  </div>
                )}
              </div>
            </section>

            {canUseChat ? (
              <DocumentChat documentId={document.id} messages={document.messages} />
            ) : (
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">Чат по документу</h2>
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Чат станет доступен после успешного AI-анализа документа.
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Технический статус</h2>

              <div className="mt-4 space-y-3">
                <StatusRow label="Статус обработки" value={getStatusLabel(document.processingStatus)} />
                <StatusRow
                  label="Сообщений в чате"
                  value={String(document.messages.length)}
                />
                <StatusRow
                  label="Ошибки обработки"
                  value={document.processingError || "Нет"}
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Последние AI-запросы</h2>

              <div className="mt-4 space-y-3">
                {document.aiLogs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Логи AI ещё не появились.
                  </div>
                ) : (
                  document.aiLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"
                    >
                      <div className="font-semibold text-slate-900">
                        {log.type} · {log.status}
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-slate-500">
                        <div>Модель: {log.model || "—"}</div>
                        <div>Токены: {log.tokensTotal ?? "—"}</div>
                        <div>
                          Стоимость:{" "}
                          {typeof log.estimatedCostUsd === "number"
                            ? `$${log.estimatedCostUsd.toFixed(6)}`
                            : "—"}
                        </div>
                        <div>Время: {log.durationMs ?? "—"} ms</div>
                        <div>
                          Создан: {new Date(log.createdAt).toLocaleString("ru-RU")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-900 break-words">{value}</div>
    </div>
  );
}