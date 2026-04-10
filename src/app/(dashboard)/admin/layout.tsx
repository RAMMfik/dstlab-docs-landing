import Link from "next/link";
import { ReactNode } from "react";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminUser();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-lg font-bold text-slate-900">
              Панель администратора
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Внутреннее управление сервисом DSTLab Docs AI
            </div>
          </div>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Вернуться в кабинет
          </Link>
        </div>
      </section>

      {children}
    </div>
  );
}