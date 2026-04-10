import Link from "next/link";
import { ReactNode } from "react";
import { requireAdminUser } from "@/lib/admin-auth";

const adminLinks = [
  { href: "/admin", label: "Admin Home" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/ai-usage", label: "AI Usage" },
  { href: "/admin/tariffs", label: "Tariffs" },
  { href: "/admin/models", label: "Models" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-lg font-bold text-slate-900">Admin Panel</div>
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

          <div className="mt-5 flex flex-wrap gap-3">
            {adminLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}