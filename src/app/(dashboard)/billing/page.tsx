import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserBillingSnapshot,
  getUserPayments,
} from "@/lib/services/billing.service";
import { getUserFeatureAccess } from "@/lib/services/feature-access.service";
import {
  getPlanTitle,
  normalizeBillingProvider,
  normalizeSubscriptionStatus,
} from "@/lib/services/plan.service";
import { getActiveTariffs } from "@/lib/services/tariff.service";
import { BillingActions } from "./BillingActions";

type BillingPageProps = {
  searchParams?: Promise<{
    view?: string;
  }>;
};

function formatDate(value: Date | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatAmount(amount: number, currency: string) {
  const normalizedCurrency = currency?.toUpperCase() || "RUB";

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function formatTariffPrice(monthlyPriceRub: number | null, yearlyPriceRub: number | null) {
  if (monthlyPriceRub === null && yearlyPriceRub === null) {
    return "0 ₽ / бесплатно";
  }

  if (monthlyPriceRub !== null && yearlyPriceRub !== null) {
    return `${monthlyPriceRub} ₽ / мес · ${yearlyPriceRub} ₽ / год`;
  }

  if (monthlyPriceRub !== null) {
    return `${monthlyPriceRub} ₽ / мес`;
  }

  return `${yearlyPriceRub} ₽ / год`;
}

function getPaymentStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Ожидает оплаты";
    case "AUTHORIZED":
      return "Авторизован";
    case "PAID":
      return "Оплачен";
    case "FAILED":
      return "Ошибка";
    case "CANCELED":
      return "Отменён";
    case "REFUNDED":
      return "Возврат";
    case "PARTIALLY_REFUNDED":
      return "Частичный возврат";
    default:
      return status;
  }
}

function getSubscriptionStatusLabel(status: string) {
  switch (normalizeSubscriptionStatus(status)) {
    case "ACTIVE":
      return "Активна";
    case "PAST_DUE":
      return "Есть проблема с оплатой";
    case "CANCELED":
      return "Отменена";
    case "EXPIRED":
      return "Истекла";
    default:
      return "Не активна";
  }
}

function getBillingProviderLabel(provider: string) {
  const normalized = normalizeBillingProvider(provider);

  switch (normalized) {
    case "ALFAPAY":
      return "AlfaPay";
    case "MANUAL":
      return "Ручное подключение";
    default:
      return "Не подключен";
  }
}

function getVisiblePayments(
  payments: Awaited<ReturnType<typeof getUserPayments>>,
  view: string
) {
  if (view === "all") {
    return payments;
  }

  return payments.filter(
    (payment) => payment.status !== "CANCELED" && payment.status !== "FAILED"
  );
}

export default async function BillingPage({
  searchParams,
}: BillingPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentView = resolvedSearchParams.view === "all" ? "all" : "active";

  const billing = getUserBillingSnapshot({
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    billingProvider: user.billingProvider,
    currentPeriodEnd: user.currentPeriodEnd,
  });

  const [payments, tariffs] = await Promise.all([
    getUserPayments(user.id),
    getActiveTariffs(),
  ]);

  const visiblePayments = getVisiblePayments(payments, currentView);

  const featureAccess = await getUserFeatureAccess({
  plan: billing.plan,
  subscriptionStatus: billing.subscriptionStatus,
});

  const latestPendingPayment =
    payments.find(
      (payment) => payment.status === "PENDING" || payment.status === "AUTHORIZED"
    ) ?? null;

  const currentPlanTitle = getPlanTitle(billing.plan);

  const tariffTitleMap = new Map(
    tariffs.map((tariff) => [tariff.code, tariff.title])
  );

  const paidTariffs = tariffs.filter(
    (tariff) => tariff.monthlyPriceRub !== null || tariff.yearlyPriceRub !== null
  );

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Биллинг"
        description="Управление тарифом, оплатой и статусом подписки."
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <InfoCard title="Текущий план" value={currentPlanTitle} />
        <InfoCard
          title="Статус подписки"
          value={getSubscriptionStatusLabel(billing.subscriptionStatus)}
        />
        <InfoCard
          title="Провайдер биллинга"
          value={getBillingProviderLabel(billing.billingProvider)}
        />
        <InfoCard
          title="Доступ активен до"
          value={formatDate(billing.currentPeriodEnd)}
        />
      </div>

      {latestPendingPayment ? (
        <div className="mt-6 rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="text-sm font-semibold text-amber-900">
            Есть незавершённый платёж
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Один из платежей ожидает подтверждения от AlfaPay. Система
            автоматически перепроверяет статус и обновляет подписку после успешной оплаты.
          </p>
        </div>
      ) : null}

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900">Тарифы сервиса</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Внутри кабинета отображаются активные тарифы из базы данных. Платные
              варианты подключаются через AlfaPay.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {tariffs.map((tariff) => (
                <PlanPoint
                  key={tariff.id}
                  label={tariff.title}
                  value={formatTariffPrice(
                    tariff.monthlyPriceRub,
                    tariff.yearlyPriceRub
                  )}
                />
              ))}

              <PlanPoint
                label="Текущий доступ"
                value={featureAccess.hasPaidAccess ? "Платный активен" : "Базовый"}
              />
            </div>
          </div>

          <BillingActions latestPendingPaymentId={latestPendingPayment?.id ?? null} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {tariffs.map((tariff) => (
          <section
            key={tariff.id}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900">
              Что входит в {tariff.title}
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <StepBox
                title="Документы"
                text={`До ${tariff.documentsLimit} документов`}
              />
              <StepBox
                title="AI-анализы"
                text={`До ${tariff.analysesLimit} запусков`}
              />
              <StepBox
                title="Чат"
                text={`До ${tariff.messagesLimit} сообщений`}
              />
              <StepBox
                title="Приоритетная обработка"
                text={tariff.priorityAnalysis ? "Доступна" : "Недоступна"}
              />
            </div>
          </section>
        ))}
      </div>

      {paidTariffs.length > 0 ? (
        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Платные варианты</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {paidTariffs.map((tariff) => (
              <StepBox
                key={tariff.id}
                title={tariff.title}
                text={formatTariffPrice(
                  tariff.monthlyPriceRub,
                  tariff.yearlyPriceRub
                )}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold text-slate-900">История платежей</h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="text-sm text-slate-500">
              Всего операций: {visiblePayments.length}
            </div>

            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <Link
                href="/billing"
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  currentView === "active"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Полезные
              </Link>
              <Link
                href="/billing?view=all"
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  currentView === "all"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Все
              </Link>
            </div>
          </div>
        </div>

        {visiblePayments.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            Платежей пока нет. После первой оплаты через AlfaPay здесь появится
            история транзакций.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="px-4 py-2 font-medium">Дата</th>
                  <th className="px-4 py-2 font-medium">План</th>
                  <th className="px-4 py-2 font-medium">Сумма</th>
                  <th className="px-4 py-2 font-medium">Статус</th>
                  <th className="px-4 py-2 font-medium">Заказ</th>
                </tr>
              </thead>
              <tbody>
                {visiblePayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="rounded-2xl bg-slate-50 text-sm text-slate-700"
                  >
                    <td className="rounded-l-2xl px-4 py-4">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      {payment.planCode
                        ? tariffTitleMap.get(payment.planCode) ?? getPlanTitle(payment.planCode)
                        : "—"}
                    </td>
                    <td className="px-4 py-4">
                      {formatAmount(payment.amount, payment.currency)}
                    </td>
                    <td className="px-4 py-4">
                      {getPaymentStatusLabel(payment.status)}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 font-mono text-xs text-slate-500">
                      {payment.orderNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function StepBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <div className="text-sm font-bold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function PlanPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}