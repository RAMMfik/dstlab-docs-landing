import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { dashboardStats, recentDocuments } from "@/data/dashboard";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Обзор"
        description="Краткая статистика по документам, проверкам, токенам и текущему тарифу."
      />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {dashboardStats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            description={item.description}
          />
        ))}
      </div>

      <div className="mt-8 rounded-[28px] border border-[rgba(10,99,117,0.08)] bg-white/80 p-6 shadow-[0_10px_30px_rgba(10,99,117,0.06)] backdrop-blur">
        <h2 className="text-xl font-bold text-slate-900">Последние документы</h2>

        <div className="mt-5 overflow-hidden rounded-[20px] border border-[rgba(10,99,117,0.08)]">
          <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            <div>Документ</div>
            <div>Статус</div>
            <div>Дата</div>
          </div>

          {recentDocuments.map((doc) => (
            <div
              key={doc.id}
              className="grid grid-cols-[1.5fr_0.8fr_0.8fr] border-t border-[rgba(10,99,117,0.08)] px-4 py-4 text-sm text-slate-600"
            >
              <div>{doc.name}</div>
              <div>{doc.status}</div>
              <div>{doc.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}