import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-semibold">Обзор</h1>
        <p className="text-sm text-gray-500">
          Краткая статистика по документам и активности
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Документы"
          value={data.stats.totalDocuments}
          subtitle="Всего загружено"
        />

        <StatCard
          title="Проверены"
          value={data.stats.analyzedDocuments}
          subtitle="С AI-анализом"
        />

        <StatCard
          title="Без анализа"
          value={data.stats.pendingDocuments}
          subtitle="Ожидают обработки"
        />
      </div>

      {/* Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UsageCard
          title="Документы"
          used={data.usage.documentsUsed}
          limit={data.usage.documentsLimit}
        />

        <UsageCard
          title="AI-анализ"
          used={data.usage.analysesUsed}
          limit={data.usage.analysesLimit}
        />
      </div>

      {/* Быстрые действия */}
      <div className="flex gap-3">
        <a
          href="/documents/new"
          className="px-4 py-2 rounded-xl bg-teal-600 text-white"
        >
          Загрузить документ
        </a>

        <a
          href="/documents"
          className="px-4 py-2 rounded-xl border"
        >
          Все документы
        </a>
      </div>

      {/* Последние документы */}
      <div className="bg-white rounded-2xl border p-4">
        <h2 className="font-semibold mb-4">Последние документы</h2>

        <div className="space-y-2">
          {data.recentDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex justify-between items-center border rounded-xl px-4 py-2"
            >
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>

              <span className="text-sm text-gray-600">
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-2xl border p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  );
}

function UsageCard({
  title,
  used,
  limit,
}: {
  title: string;
  used: number;
  limit: number;
}) {
  const percent = Math.min((used / limit) * 100, 100);

  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className="flex justify-between mb-2">
        <p className="text-sm">{title}</p>
        <p className="text-sm">
          {used} / {limit}
        </p>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-2 bg-teal-600 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}