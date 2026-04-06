"use client";

export default function PricingPage() {
  const handleUpgrade = async () => {
    await fetch("/api/upgrade", { method: "POST" });
    window.location.reload();
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold">Тарифы</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">FREE</h2>
            <p className="mb-4 text-sm text-slate-500">Базовый тариф</p>

            <ul className="mb-6 space-y-2 text-sm text-slate-700">
              <li>20 документов</li>
              <li>30 AI-анализов</li>
              <li>100 сообщений в чате</li>
            </ul>

            <button className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium">
              Текущий тариф
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-cyan-50 p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">PRO</h2>
            <p className="mb-4 text-sm text-slate-500">Для активной работы</p>

            <ul className="mb-6 space-y-2 text-sm text-slate-700">
              <li>200 документов</li>
              <li>300 AI-анализов</li>
              <li>1000 сообщений в чате</li>
            </ul>

            <button
              onClick={handleUpgrade}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-4 py-3 text-sm font-semibold text-white"
            >
              Перейти на PRO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}