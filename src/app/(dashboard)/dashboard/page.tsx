import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardData();

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Обзор</h1>
          <p className="text-sm text-gray-500">
            Краткая статистика по документам и активности
          </p>
        </div>

        <div className="rounded-xl border px-4 py-2 text-sm">
          Тариф: <span className="font-semibold">{data.tariff}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <div className="flex gap-3">
        <a
          href="/documents/new"
          className="rounded-xl bg-teal-600 px-4 py-2 text-white"
        >
          Загрузить документ
        </a>

        <a href="/documents" className="rounded-xl border px-4 py-2">
          Все документы
        </a>

        <a href="/pricing" className="rounded-xl border px-4 py-2">
          Тарифы
        </a>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h2 className="mb-4 font-semibold">Последние документы</h2>

        {data.recentDocuments.length === 0 ? (
          <div className="text-sm text-gray-500">Документов пока нет</div>
        ) : (
          <div className="space-y-2">
            {data.recentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border px-4 py-3"
              >
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(doc.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>

                <span className="text-sm text-gray-600">{doc.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl border bg-white p-4">
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
  const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-2 flex justify-between">
        <p className="text-sm">{title}</p>
        <p className="text-sm">
          {used} / {limit}
        </p>
      </div>

      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-teal-600"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}