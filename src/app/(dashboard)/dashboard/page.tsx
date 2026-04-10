import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardData();

  return (
    <div className="space-y-6 p-6 md:p-8">
      <section className="overflow-hidden rounded-[32px] border border-[rgba(10,99,117,0.08)] bg-[linear-gradient(135deg,rgba(10,99,117,0.08),rgba(29,206,201,0.08),rgba(255,255,255,0.95))] p-6 shadow-[0_18px_50px_rgba(10,99,117,0.08)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Рабочая область
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Обзор аккаунта
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
              Следите за документами, AI-анализами, сообщениями в чате и текущими
              лимитами по вашему тарифу.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Badge label="Тариф" value={data.tariff} />
              <Badge label="Документов" value={`${data.stats.totalDocuments}`} />
              <Badge
                label="Готовых анализов"
                value={`${data.stats.analyzedDocuments}`}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto">
            <Link
              href="/documents/new"
              className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-95"
            >
              Загрузить документ
            </Link>

            <Link
              href="/documents"
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Открыть документы
            </Link>

            <Link
              href="/billing"
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Управление тарифом
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Документы"
          value={data.stats.totalDocuments}
          subtitle="Всего загружено"
        />
        <StatCard
          title="Проверены"
          value={data.stats.analyzedDocuments}
          subtitle="С готовым AI-аудитом"
        />
        <StatCard
          title="Без анализа"
          value={data.stats.pendingDocuments}
          subtitle="Ожидают запуска"
        />
        <StatCard
          title="Готовность"
          value={`${data.stats.completionRate}%`}
          subtitle="Доля проанализированных"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Использование лимитов
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Актуальная загрузка по текущему тарифу.
                </p>
              </div>

              <Link
                href="/billing"
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Изменить тариф
              </Link>
            </div>

            <div className="space-y-4">
              <UsageCard
                title="Документы"
                used={data.usage.documentsUsed}
                limit={data.usage.documentsLimit}
                hint="Загруженные файлы в аккаунте"
              />
              <UsageCard
                title="AI-анализы"
                used={data.usage.analysesUsed}
                limit={data.usage.analysesLimit}
                hint="Запуски AI-аудита"
              />
              <UsageCard
                title="Сообщения в чате"
                used={data.usage.chatMessagesUsed}
                limit={data.usage.chatMessagesLimit}
                hint="Вопросы к документам"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Последние документы
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Быстрый доступ к последним загруженным файлам.
              </p>
            </div>

            {data.recentDocuments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                Документов пока нет. Загрузите первый файл, чтобы начать работу.
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-4 transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {doc.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(doc.createdAt).toLocaleString("ru-RU")}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        doc.status === "Проверен"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Быстрые действия</h2>

            <div className="mt-4 space-y-3">
              <Link
                href="/documents/new"
                className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Загрузить новый документ
              </Link>

              <Link
                href="/documents"
                className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Перейти к списку документов
              </Link>

              <Link
                href="/billing"
                className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Открыть биллинг
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Статус аккаунта</h2>

            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <InfoRow label="Тариф" value={data.tariff} />
              <InfoRow
                label="Документов в работе"
                value={String(data.stats.totalDocuments)}
              />
              <InfoRow
                label="AI-анализов завершено"
                value={String(data.stats.analyzedDocuments)}
              />
              <InfoRow
                label="Сообщений в чате"
                value={String(data.usage.chatMessagesUsed)}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-700">
      <span className="font-semibold text-slate-900">{label}:</span> {value}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number | string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

function UsageCard({
  title,
  used,
  limit,
  hint,
}: {
  title: string;
  used: number;
  limit: number;
  hint: string;
}) {
  const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>

        <div className="rounded-2xl bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
          {used} / {limit}
        </div>
      </div>

      <div className="mt-3 h-2.5 w-full rounded-full bg-slate-200">
        <div
          className="h-2.5 rounded-full bg-[linear-gradient(135deg,#0A6375,#1DCEC9)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 font-medium text-slate-900">{value}</div>
    </div>
  );
}