import { PageHeader } from "@/components/dashboard/PageHeader";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserBillingSnapshot,
  getUserPayments,
} from "@/lib/services/billing.service";
import { getUserFeatureAccess } from "@/lib/services/feature-access.service";
import { BillingActions } from "./BillingActions";

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
      return "Отменен";
    case "REFUNDED":
      return "Возврат";
    case "PARTIALLY_REFUNDED":
      return "Частичный возврат";
    default:
      return status;
  }
}

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const billing = getUserBillingSnapshot({
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    billingProvider: user.billingProvider,
    currentPeriodEnd: user.currentPeriodEnd,
  });

  const payments = await getUserPayments(user.id);

  const featureAccess = getUserFeatureAccess({
    plan: billing.plan,
    subscriptionStatus: billing.subscriptionStatus,
  });

  const latestPendingPayment =
    payments.find(
      (payment) => payment.status === "PENDING" || payment.status === "AUTHORIZED"
    ) ?? null;

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Биллинг"
        description="Управление тарифом, оплатой и проверкой статуса платежей."
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <InfoCard title="Текущий план" value={billing.plan} />
        <InfoCard title="Статус подписки" value={billing.subscriptionStatus} />
        <InfoCard title="Провайдер биллинга" value={billing.billingProvider} />
        <InfoCard
          title="Доступ активен до"
          value={formatDate(billing.currentPeriodEnd)}
        />
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900">Тариф PRO</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Подключает платный доступ к AI-функциям DocsAI. Сейчас оплата идет
              через AlfaPay, а подтверждение статуса — через проверку платежа на
              стороне DocsAI.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <PlanPoint label="PRO Monthly" value="990 ₽ / месяц" />
              <PlanPoint label="PRO Yearly" value="9 990 ₽ / год" />
              <PlanPoint
                label="Priority analysis"
                value={featureAccess.canUsePriorityAnalysis ? "Доступен" : "Закрыт"}
              />
              <PlanPoint
                label="Billing status"
                value={billing.isActive ? "Активен" : "Не активен"}
              />
            </div>
          </div>

          <BillingActions latestPendingPaymentId={latestPendingPayment?.id ?? null} />
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Доступ по текущему тарифу</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StepBox
            title="Priority analysis"
            text={featureAccess.canUsePriorityAnalysis ? "Доступен" : "Недоступен"}
          />
          <StepBox
            title="Teams"
            text={featureAccess.canUseTeams ? "Доступен" : "Пока закрыт"}
          />
          <StepBox
            title="API access"
            text={featureAccess.canUseApiAccess ? "Доступен" : "Пока закрыт"}
          />
          <StepBox
            title="Billing portal"
            text={featureAccess.canUseBillingPortal ? "Готов к включению" : "Пока выключен"}
          />
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">История платежей</h2>
          <div className="text-sm text-slate-500">
            Всего операций: {payments.length}
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            Платежей пока нет. После первого checkout здесь появится история операций.
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
                  <th className="px-4 py-2 font-medium">Order</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="rounded-2xl bg-slate-50 text-sm text-slate-700"
                  >
                    <td className="rounded-l-2xl px-4 py-4">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-4 py-4">{payment.planCode ?? "—"}</td>
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