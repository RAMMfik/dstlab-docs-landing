import { getAdminAiAnalytics } from "@/lib/services/admin-ai-analytics.service";

export default async function AdminAiUsagePage() {
  const data = await getAdminAiAnalytics();

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            AI Usage Admin
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Базовая админ-аналитика по AI-запросам: количество, токены, стоимость и последние ошибки.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Всего запросов" value={String(data.totals.totalRequests)} />
          <MetricCard title="Успешных" value={String(data.totals.successRequests)} />
          <MetricCard title="Ошибок" value={String(data.totals.failedRequests)} />
          <MetricCard title="Всего токенов" value={String(data.totals.totalTokens)} />
          <MetricCard title="Analysis" value={String(data.totals.analysisRequests)} />
          <MetricCard title="Chat" value={String(data.totals.chatRequests)} />
          <MetricCard
            title="Суммарная стоимость"
            value={`$${data.totals.totalCostUsd.toFixed(6)}`}
          />
          <MetricCard
            title="Success rate"
            value={
              data.totals.totalRequests > 0
                ? `${Math.round((data.totals.successRequests / data.totals.totalRequests) * 100)}%`
                : "0%"
            }
          />
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Последние AI-логи</h2>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-3 font-medium">Время</th>
                  <th className="px-3 py-3 font-medium">Тип</th>
                  <th className="px-3 py-3 font-medium">Статус</th>
                  <th className="px-3 py-3 font-medium">Пользователь</th>
                  <th className="px-3 py-3 font-medium">Документ</th>
                  <th className="px-3 py-3 font-medium">Модель</th>
                  <th className="px-3 py-3 font-medium">Токены</th>
                  <th className="px-3 py-3 font-medium">Стоимость</th>
                  <th className="px-3 py-3 font-medium">Время</th>
                  <th className="px-3 py-3 font-medium">Ошибка</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 align-top">
                    <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                      {new Date(log.createdAt).toLocaleString("ru-RU")}
                    </td>
                    <td className="px-3 py-3 text-slate-900">{log.type}</td>
                    <td className="px-3 py-3 text-slate-900">{log.status}</td>
                    <td className="px-3 py-3 text-slate-900">{log.userEmail}</td>
                    <td className="px-3 py-3 text-slate-900">{log.documentName}</td>
                    <td className="px-3 py-3 text-slate-900">{log.model || "—"}</td>
                    <td className="px-3 py-3 text-slate-900">{log.tokensTotal ?? "—"}</td>
                    <td className="px-3 py-3 text-slate-900">
                      {typeof log.estimatedCostUsd === "number"
                        ? `$${log.estimatedCostUsd.toFixed(6)}`
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-900">
                      {log.durationMs ? `${log.durationMs} ms` : "—"}
                    </td>
                    <td className="px-3 py-3 text-red-700">
                      {log.errorMessage || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}