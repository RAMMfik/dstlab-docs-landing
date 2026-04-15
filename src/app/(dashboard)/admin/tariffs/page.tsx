import { requireAdminUser } from "@/lib/admin-auth";
import { getAdminTariffs } from "@/lib/services/admin-tariffs.service";

function formatPrice(value: number | null) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function formatBoolean(value: boolean) {
  return value ? "Да" : "Нет";
}

function getStatusBadgeClass(isActive: boolean) {
  return isActive
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-slate-50 text-slate-700 border-slate-200";
}

export default async function AdminTariffsPage() {
  await requireAdminUser();

  const tariffs = await getAdminTariffs();

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Тарифы
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Список тарифов из базы данных. Здесь отображаются реальные коды, цены,
          лимиты и параметры доступа.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Всего тарифов" value={String(tariffs.length)} />
        <StatCard
          title="Активные"
          value={String(tariffs.filter((tariff) => tariff.isActive).length)}
        />
        <StatCard
          title="Платные"
          value={String(
            tariffs.filter(
              (tariff) =>
                tariff.monthlyPriceRub !== null || tariff.yearlyPriceRub !== null
            ).length
          )}
        />
        <StatCard
          title="С приоритетом"
          value={String(
            tariffs.filter((tariff) => tariff.priorityAnalysis).length
          )}
        />
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Список тарифов</h2>
          <div className="text-sm text-slate-500">Найдено: {tariffs.length}</div>
        </div>

        {tariffs.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-6 text-sm leading-6 text-slate-600">
            В базе пока нет тарифов. Сначала выполни internal sync.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="px-4 py-2 font-medium">Код</th>
                  <th className="px-4 py-2 font-medium">Название</th>
                  <th className="px-4 py-2 font-medium">Месяц</th>
                  <th className="px-4 py-2 font-medium">Год</th>
                  <th className="px-4 py-2 font-medium">Документы</th>
                  <th className="px-4 py-2 font-medium">Анализы</th>
                  <th className="px-4 py-2 font-medium">Сообщения</th>
                  <th className="px-4 py-2 font-medium">Приоритет</th>
                  <th className="px-4 py-2 font-medium">Storage</th>
                  <th className="px-4 py-2 font-medium">Статус</th>
                </tr>
              </thead>

              <tbody>
                {tariffs.map((tariff) => (
                  <tr
                    key={tariff.id}
                    className="rounded-2xl bg-slate-50 text-sm text-slate-700"
                  >
                    <td className="rounded-l-2xl px-4 py-4 font-mono text-xs text-slate-600">
                      {tariff.code}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">
                        {tariff.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {tariff.description}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {formatPrice(tariff.monthlyPriceRub)}
                    </td>
                    <td className="px-4 py-4">
                      {formatPrice(tariff.yearlyPriceRub)}
                    </td>
                    <td className="px-4 py-4">{tariff.documentsLimit}</td>
                    <td className="px-4 py-4">{tariff.analysesLimit}</td>
                    <td className="px-4 py-4">{tariff.messagesLimit}</td>
                    <td className="px-4 py-4">
                      {formatBoolean(tariff.priorityAnalysis)}
                    </td>
                    <td className="px-4 py-4">{tariff.storageDriver}</td>
                    <td className="rounded-r-2xl px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          tariff.isActive
                        )}`}
                      >
                        {tariff.isActive ? "Активен" : "Отключен"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}