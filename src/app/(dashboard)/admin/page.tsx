import Link from "next/link";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminPage() {
  await requireAdminUser();

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Обзор админки
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Центральная точка управления DSTLab Docs AI.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <AdminCard
          href="/admin/users"
          title="Пользователи"
          text="Управление аккаунтами, тарифами и ручной выдачей Pro."
        />
        <AdminCard
          href="/admin/billing"
          title="Платежи"
          text="Контроль AlfaPay операций и возвратов."
        />
        <AdminCard
          href="/admin/ai-usage"
          title="Использование AI"
          text="AI-запросы, токены, стоимость и ошибки."
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
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md"
    >
      <div className="text-lg font-bold text-slate-900">{title}</div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  );
}