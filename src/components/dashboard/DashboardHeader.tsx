import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getPlanTitle } from "@/lib/services/plan.service";

type DashboardHeaderProps = {
  email: string;
  plan: string;
  subscriptionStatus?: string | null;
  isAdmin?: boolean;
};

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
    if (subscriptionStatus === "EXPIRED") return "Подписка истекла";
    return "Pro без активной подписки";
  }

  return "Базовый доступ";
}

export function DashboardHeader({
  email,
  plan,
  subscriptionStatus,
  isAdmin = false,
}: DashboardHeaderProps) {
  const planTitle = getPlanTitle(plan);

  return (
    <div className="mb-6 rounded-[24px] border border-[rgba(10,99,117,0.08)] bg-white/80 px-5 py-4 shadow-[0_10px_30px_rgba(10,99,117,0.06)] backdrop-blur">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
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
            Тариф: {planTitle}
          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {getSubscriptionText(plan, subscriptionStatus)}
          </div>

          <Link
            href="/billing"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Тарифы
          </Link>

          <Link
            href="/"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Главная
          </Link>

          {isAdmin ? (
            <Link
              href="/admin"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Админка
            </Link>
          ) : null}

          <LogoutButton />
        </div>
      </div>
    </div>
  );
}