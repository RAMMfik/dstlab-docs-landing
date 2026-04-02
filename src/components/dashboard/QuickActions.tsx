export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <a
        href="/documents/new"
        className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-4 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-cyan-200/40"
      >
        Загрузить документ
      </a>

      <a
        href="/chat"
        className="rounded-2xl bg-white px-4 py-4 text-center text-sm font-semibold text-slate-900 border border-slate-200"
      >
        Открыть чат
      </a>

      <a
        href="/billing"
        className="rounded-2xl bg-white px-4 py-4 text-center text-sm font-semibold text-slate-900 border border-slate-200"
      >
        Биллинг
      </a>
    </div>
  );
}