import Link from "next/link";
import { ReactNode } from "react";
import { requireAdminUser } from "@/lib/admin-auth";

const tabs = [
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/billing", label: "Платежи" },
  { href: "/admin/ai-usage", label: "Использование AI" },
  { href: "/admin", label: "Обзор" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminUser();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-lg font-bold text-slate-900">
              Панель администратора
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Управление пользователями, платежами и AI-операциями
            </div>
          </div>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Вернуться в кабинет
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </section>

      {children}
    </div>
  );
}