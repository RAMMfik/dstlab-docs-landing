import Link from "next/link";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminPage() {
  await requireAdminUser();

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Admin Panel
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Внутренняя панель управления проектом DSTLab Docs AI: пользователи, тарифы,
          модели и AI usage.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminCard
          href="/admin/users"
          title="Пользователи"
          text="Просмотр пользователей и их текущих тарифов."
        />
        <AdminCard
          href="/admin/tariffs"
          title="Тарифы"
          text="Контроль текущей тарифной структуры и лимитов."
        />
        <AdminCard
          href="/admin/models"
          title="Модели"
          text="Точка для будущей настройки AI-моделей."
        />
        <AdminCard
          href="/admin/ai-usage"
          title="AI Usage"
          text="Логи AI-запросов, токены, стоимость и ошибки."
        />
        <AdminCard
          href="/admin/billing"
          title="Billing"
          text="Платежи AlfaPay, статусы и возвраты."
        />
      </section>
    </div>
  );
}

function AdminCard({
  href,
  title,
  text,
}: {
  href: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-lg font-bold text-slate-900">{title}</div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  );
}