import Link from "next/link";
import { requireAdminUser } from "@/lib/admin-auth";
import { getAdminUsers } from "@/lib/services/admin-users.service";
import { getActiveTariffs } from "@/lib/services/tariff.service";
import { AdminUserActions } from "@/components/admin/AdminUserActions";

type AdminUsersPageProps = {
  searchParams?: Promise<{
    q?: string;
    plan?: string;
    subscriptionStatus?: string;
    sort?: string;
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

function buildUsersUrl(params: {
  q?: string;
  plan?: string;
  subscriptionStatus?: string;
  sort?: string;
}) {
  const search = new URLSearchParams();

  if (params.q) search.set("q", params.q);
  if (params.plan) search.set("plan", params.plan);
  if (params.subscriptionStatus) {
    search.set("subscriptionStatus", params.subscriptionStatus);
  }
  if (params.sort) search.set("sort", params.sort);

  const query = search.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

function getNextSortForEmail(currentSort: string) {
  return currentSort === "email_asc" ? "email_desc" : "email_asc";
}

function getNextSortForCreated(currentSort: string) {
  return currentSort === "oldest" ? "newest" : "oldest";
}

function SortLink({
  label,
  href,
  active,
  direction,
}: {
  label: string;
  href: string;
  active: boolean;
  direction?: "asc" | "desc";
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 transition ${
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span>{label}</span>
      {active ? (
        <span className="text-xs">{direction === "asc" ? "↑" : "↓"}</span>
      ) : null}
    </Link>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await requireAdminUser();

  const resolvedSearchParams = searchParams ? await searchParams : {};

  const q = resolvedSearchParams.q?.trim() || "";
  const plan = resolvedSearchParams.plan?.trim() || "";
  const subscriptionStatus =
    resolvedSearchParams.subscriptionStatus?.trim() || "";
  const sort = resolvedSearchParams.sort?.trim() || "newest";

  const [users, tariffs] = await Promise.all([
    getAdminUsers({
      q,
      plan,
      subscriptionStatus,
      sort,
    }),
    getActiveTariffs(),
  ]);

  const planOptions = tariffs.map((tariff) => ({
    code: tariff.code,
    title: tariff.title,
  }));

  const emailSortHref = buildUsersUrl({
    q,
    plan,
    subscriptionStatus,
    sort: getNextSortForEmail(sort),
  });

  const createdSortHref = buildUsersUrl({
    q,
    plan,
    subscriptionStatus,
    sort: getNextSortForCreated(sort),
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Пользователи
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Просмотр аккаунтов, тарифов, статусов подписки и usage по сервису.
            </p>
          </div>

          <Link
            href="/admin/billing"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Открыть раздел платежей
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <form className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <input
            name="q"
            defaultValue={q}
            placeholder="Поиск по email"
            className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
          />

          <select
            name="plan"
            defaultValue={plan}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm xl:w-[170px]"
          >
            <option value="">Все тарифы</option>
            {planOptions.map((tariff) => (
              <option key={tariff.code} value={tariff.code}>
                {tariff.title}
              </option>
            ))}
          </select>

          <select
            name="subscriptionStatus"
            defaultValue={subscriptionStatus}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm xl:w-[190px]"
          >
            <option value="">Все подписки</option>
            <option value="ACTIVE">Активна</option>
            <option value="INACTIVE">Не активна</option>
          </select>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Применить
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
          title="На платном"
          value={String(users.filter((u) => u.planCode !== "START").length)}
        />
        <MetricCard
          title="С активной подпиской"
          value={String(
            users.filter((u) => u.subscriptionStatus === "ACTIVE").length
          )}
        />
        <MetricCard
          title="С платежами"
          value={String(users.filter((u) => u.counts.payments > 0).length)}
        />
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">
            Список пользователей
          </h2>
          <div className="text-sm text-slate-500">Найдено: {users.length}</div>
        </div>

        {users.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-6 text-sm leading-6 text-slate-600">
            Пользователи не найдены. Попробуй изменить фильтры или сбросить их.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="px-4 py-2 font-medium">
                    <SortLink
                      label="Пользователь"
                      href={emailSortHref}
                      active={sort === "email_asc" || sort === "email_desc"}
                      direction={sort === "email_desc" ? "desc" : "asc"}
                    />
                  </th>
                  <th className="px-4 py-2 font-medium">Тариф</th>
                  <th className="px-4 py-2 font-medium">Подписка</th>
                  <th className="px-4 py-2 font-medium">Usage</th>
                  <th className="px-4 py-2 font-medium">Документы</th>
                  <th className="px-4 py-2 font-medium">Платежи</th>
                  <th className="px-4 py-2 font-medium">
                    <SortLink
                      label="Создан"
                      href={createdSortHref}
                      active={sort === "newest" || sort === "oldest"}
                      direction={sort === "oldest" ? "asc" : "desc"}
                    />
                  </th>
                  <th className="px-4 py-2 font-medium">Доступ до</th>
                  <th className="px-4 py-2 font-medium">Действия</th>
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
                        Провайдер: {user.billingProviderLabel}
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

                    <td className="px-4 py-4 align-top text-xs">
                      <div>Документы: {user.usage.documentsUsed}</div>
                      <div>Анализы: {user.usage.analysesUsed}</div>
                      <div>Чат: {user.usage.messagesUsed}</div>
                    </td>

                    <td className="px-4 py-4 align-top">{user.counts.documents}</td>
                    <td className="px-4 py-4 align-top">{user.counts.payments}</td>
                    <td className="px-4 py-4 align-top whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-4 align-top whitespace-nowrap">
                      {formatDate(user.currentPeriodEnd)}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 align-top">
                      <AdminUserActions
                        userId={user.id}
                        planCode={user.planCode}
                        email={user.email}
                        plans={planOptions}
                      />
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

function MetricCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}