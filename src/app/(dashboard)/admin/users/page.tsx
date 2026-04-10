import Link from "next/link";
import { requireAdminUser } from "@/lib/admin-auth";
import { getAdminUsers } from "@/lib/services/admin-users.service";

type AdminUsersPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

function formatDate(value: Date | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function getPlanBadgeClass(planCode: string) {
  if (planCode === "PRO") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}

function getSubscriptionBadgeClass(status: string) {
  if (status === "ACTIVE") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "PAST_DUE") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "CANCELED" || status === "EXPIRED") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await requireAdminUser();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = resolvedSearchParams.q?.trim() || "";

  const users = await getAdminUsers({ q });

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Пользователи
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Просмотр всех аккаунтов, текущих тарифов, статусов подписки и usage
              по сервису.
            </p>
          </div>

          <Link
            href="/admin/billing"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Открыть billing admin
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <label
              htmlFor="q"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Поиск по email
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Например: demo@test.ru"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500"
            />
          </div>

          <div className="flex items-end gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Найти
            </button>

            <Link
              href="/admin/users"
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Сбросить
            </Link>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Всего пользователей" value={String(users.length)} />
        <MetricCard
          title="На Pro"
          value={String(users.filter((user) => user.planCode === "PRO").length)}
        />
        <MetricCard
          title="С активной подпиской"
          value={String(
            users.filter((user) => user.subscriptionStatus === "ACTIVE").length
          )}
        />
        <MetricCard
          title="С платежами"
          value={String(users.filter((user) => user.counts.payments > 0).length)}
        />
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Список пользователей</h2>
          <div className="text-sm text-slate-500">Найдено: {users.length}</div>
        </div>

        {users.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-6 text-sm leading-6 text-slate-600">
            Пользователи не найдены. Попробуй изменить поисковый запрос или
            сбросить фильтр.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="px-4 py-2 font-medium">Пользователь</th>
                  <th className="px-4 py-2 font-medium">Тариф</th>
                  <th className="px-4 py-2 font-medium">Подписка</th>
                  <th className="px-4 py-2 font-medium">Usage</th>
                  <th className="px-4 py-2 font-medium">Документы</th>
                  <th className="px-4 py-2 font-medium">Платежи</th>
                  <th className="px-4 py-2 font-medium">Создан</th>
                  <th className="px-4 py-2 font-medium">Доступ до</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="rounded-2xl bg-slate-50 text-sm text-slate-700"
                  >
                    <td className="rounded-l-2xl px-4 py-4 align-top">
                      <div className="font-semibold text-slate-900">
                        {user.email}
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Provider: {user.billingProviderLabel}
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPlanBadgeClass(
                          user.planCode
                        )}`}
                      >
                        {user.planLabel}
                      </span>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getSubscriptionBadgeClass(
                          user.subscriptionStatus
                        )}`}
                      >
                        {user.subscriptionStatusLabel}
                      </span>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="space-y-1 text-xs text-slate-600">
                        <div>Документы: {user.usage.documentsUsed}</div>
                        <div>Анализы: {user.usage.analysesUsed}</div>
                        <div>Чат: {user.usage.messagesUsed}</div>
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top">{user.counts.documents}</td>
                    <td className="px-4 py-4 align-top">{user.counts.payments}</td>
                    <td className="px-4 py-4 align-top whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 align-top whitespace-nowrap">
                      {formatDate(user.currentPeriodEnd)}
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

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}