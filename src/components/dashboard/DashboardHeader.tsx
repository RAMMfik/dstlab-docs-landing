import { LogoutButton } from "@/components/auth/LogoutButton";

type DashboardHeaderProps = {
  email: string;
  plan: string;
  subscriptionStatus?: string | null;
};

function getPlanLabel(plan: string) {
  return plan === "PRO" ? "PRO" : "Старт";
}

function getPlanBadgeClass(plan: string) {
  if (plan === "PRO") {
    return "bg-emerald-50 text-emerald-700";
  }

  return "bg-cyan-50 text-cyan-700";
}

function getSubscriptionText(plan: string, subscriptionStatus?: string | null) {
  if (plan === "PRO") {
    if (subscriptionStatus === "ACTIVE") return "Подписка активна";
    if (subscriptionStatus === "PAST_DUE") return "Есть проблема с оплатой";
    if (subscriptionStatus === "CANCELED") return "Подписка отменена";
    return "PRO без активной подписки";
  }

  return "Базовый доступ";
}

export function DashboardHeader({
  email,
  plan,
  subscriptionStatus,
}: DashboardHeaderProps) {
  return (
    <div className="mb-6 rounded-[24px] border border-[rgba(10,99,117,0.08)] bg-white/80 px-5 py-4 shadow-[0_10px_30px_rgba(10,99,117,0.06)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-lg font-bold text-slate-900">DSTLab Docs AI</div>
          <div className="mt-1 text-sm text-slate-500">
            Рабочая область пользователя
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Вы вошли как:{" "}
            <span className="font-semibold text-slate-900">{email}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${getPlanBadgeClass(plan)}`}
          >
            Тариф: {getPlanLabel(plan)}
          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {getSubscriptionText(plan, subscriptionStatus)}
          </div>

          <LogoutButton />
        </div>
      </div>
    </div>
  );
}