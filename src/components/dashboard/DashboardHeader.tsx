import { LogoutButton } from "@/components/auth/LogoutButton";

type DashboardHeaderProps = {
  email: string;
};

export function DashboardHeader({ email }: DashboardHeaderProps) {
  return (
    <div className="mb-6 rounded-[24px] border border-[rgba(10,99,117,0.08)] bg-white/80 px-5 py-4 shadow-[0_10px_30px_rgba(10,99,117,0.06)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-lg font-bold text-slate-900">DSTLab Docs AI</div>
          <div className="mt-1 text-sm text-slate-500">
            Рабочая область пользователя
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Вы вошли как: <span className="font-semibold text-slate-900">{email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
            Тариф: Старт
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}