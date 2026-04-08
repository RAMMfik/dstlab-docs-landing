import { getCurrentUser } from "@/lib/auth";
import {
  normalizePlan,
  normalizeSubscriptionStatus,
} from "@/lib/services/plan.service";
import { UpgradeToProButton } from "@/components/pricing/UpgradeToProButton";

export default async function PricingPage() {
  const user = await getCurrentUser();

  const currentPlan = user ? normalizePlan(user.plan) : "FREE";
  const subscriptionStatus = user
    ? normalizeSubscriptionStatus(user.subscriptionStatus)
    : "INACTIVE";

  const isProActive =
    currentPlan === "PRO" && subscriptionStatus === "ACTIVE";

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[32px] border border-[rgba(10,99,117,0.08)] bg-[linear-gradient(135deg,rgba(10,99,117,0.08),rgba(29,206,201,0.08),rgba(255,255,255,0.95))] p-6 shadow-[0_18px_50px_rgba(10,99,117,0.08)] md:p-8">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Тарифы и лимиты
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Выберите подходящий план
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
              Сейчас у вас активен план <span className="font-semibold text-slate-900">{currentPlan}</span>.
              Статус подписки: <span className="font-semibold text-slate-900">{subscriptionStatus}</span>.
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <TariffCard
            title="FREE"
            subtitle="Базовый тариф для старта"
            description="Подходит для тестирования сервиса, единичных документов и знакомства с AI-аудитом."
            features={[
              "20 документов",
              "30 AI-анализов",
              "100 сообщений в чате",
              "Максимум 10 МБ на файл",
              "Загрузка PDF, DOCX и TXT",
            ]}
            footer={
              currentPlan === "FREE" ? (
                <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700">
                  Текущий тариф
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                  Доступен как базовый план
                </div>
              )
            }
          />

          <TariffCard
            title="PRO"
            subtitle="Для активной ежедневной работы"
            description="Подходит для регулярной загрузки документов, чата по файлам и будущей интеграции с биллингом."
            features={[
              "200 документов",
              "300 AI-анализов",
              "1000 сообщений в чате",
              "Максимум 25 МБ на файл",
              "Billing-ready структура аккаунта",
            ]}
            highlight
            footer={
              isProActive ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
                  PRO уже активирован
                </div>
              ) : (
                <UpgradeToProButton />
              )
            }
          />
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Что уже подготовлено в архитектуре</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <FeatureBox
              title="Billing-ready"
              text="Появились subscriptionStatus, billingProvider и currentPeriodEnd для следующего этапа со Stripe."
            />
            <FeatureBox
              title="Feature gating"
              text="Лимиты и фичи теперь централизованы по тарифам и готовы к расширению."
            />
            <FeatureBox
              title="AI logging"
              text="Запросы анализа и чата логируются, чтобы дальше считать стоимость и производительность."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function TariffCard({
  title,
  subtitle,
  description,
  features,
  footer,
  highlight = false,
}: {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  footer: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[32px] border p-6 shadow-sm ${
        highlight
          ? "border-cyan-200 bg-[linear-gradient(180deg,rgba(10,99,117,0.04),rgba(29,206,201,0.08),#ffffff)]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-6">
        <div className="mb-2 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
          {title}
        </div>

        <h2 className="text-2xl font-bold text-slate-900">{subtitle}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <div className="space-y-3">
        {features.map((item) => (
          <div
            key={item}
            className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-6">{footer}</div>
    </div>
  );
}

function FeatureBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <div className="text-sm font-bold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}