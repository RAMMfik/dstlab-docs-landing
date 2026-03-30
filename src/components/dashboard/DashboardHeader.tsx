export function DashboardHeader() {
  return (
    <div className="mb-6 rounded-[24px] border border-[rgba(10,99,117,0.08)] bg-white/80 px-5 py-4 shadow-[0_10px_30px_rgba(10,99,117,0.06)] backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-bold text-slate-900">DSTLab Docs AI</div>
          <div className="mt-1 text-sm text-slate-500">
            Рабочая область пользователя
          </div>
        </div>

        <div className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
          Тариф: Старт
        </div>
      </div>
    </div>
  );
}