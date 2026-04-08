import { PageHeader } from "@/components/dashboard/PageHeader";
import { getStorageInfo } from "@/lib/services/storage-info.service";
import { checkStorageHealth } from "@/lib/services/storage-health.service";

export default async function SettingsPage() {
  const storage = getStorageInfo();
  const health = await checkStorageHealth();

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        title="Настройки"
        description="Технические настройки системы и инфраструктуры проекта."
      />

      {/* STORAGE */}
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Storage</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <InfoCard title="Driver" value={storage.driver} />
          <InfoCard
            title="Configured"
            value={storage.configured ? "Yes" : "No"}
          />
          <InfoCard
            title="Health"
            value={health.ok ? "OK" : "Error"}
          />
        </div>

        {!health.ok && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {health.message}
          </div>
        )}

        {storage.isLocal && (
          <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            Сейчас используется локальное хранилище (public/uploads).  
            Для production рекомендуется перейти на S3.
          </div>
        )}

        {storage.isS3 && !storage.configured && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            S3 выбран, но не настроен (нет S3_BUCKET).
          </div>
        )}
      </section>

      {/* FUTURE */}
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Что дальше</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StepBox
            title="S3 migration"
            text="Перенос файлов из local storage в S3."
          />
          <StepBox
            title="CDN"
            text="Раздача файлов через CDN (Cloudflare / AWS CloudFront)."
          />
          <StepBox
            title="Signed URLs"
            text="Ограниченный доступ к файлам через временные ссылки."
          />
          <StepBox
            title="Background uploads"
            text="Загрузка больших файлов через очередь."
          />
        </div>
      </section>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-lg font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}

function StepBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <div className="text-sm font-bold text-slate-900">{title}</div>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );
}