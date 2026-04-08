import { PageHeader } from "@/components/dashboard/PageHeader";
import { getCurrentUser } from "@/lib/auth";
import {
  normalizeBillingProvider,
  normalizePlan,
  normalizeSubscriptionStatus,
} from "@/lib/services/plan.service";

export default async function BillingPage() {
  const user = await getCurrentUser();

  const plan = user ? normalizePlan(user.plan) : "FREE";
  const subscriptionStatus = user
    ? normalizeSubscriptionStatus(user.subscriptionStatus)
    : "INACTIVE";
  const billingProvider = user
    ? normalizeBillingProvider(user.billingProvider)
    : "NONE";

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Биллинг"
        description="Пока здесь ручной upgrade, но структура уже готова под Stripe, подписки, webhook и историю операций."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <InfoCard title="Текущий план" value={plan} />
        <InfoCard title="Статус подписки" value={subscriptionStatus} />
        <InfoCard title="Провайдер биллинга" value={billingProvider} />
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Что дальше подключим</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StepBox
            title="Stripe customer"
            text="Сохранение billingCustomerId для связки пользователя с платёжным провайдером."
          />
          <StepBox
            title="Stripe subscription"
            text="Сохранение billingSubscriptionId и синхронизация статуса подписки."
          />
          <StepBox
            title="Webhook"
            text="Автоматическое обновление plan и subscriptionStatus после событий оплаты."
          />
          <StepBox
            title="History"
            text="Отдельная история биллинга и операций списания на следующем этапе."
          />
        </div>
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