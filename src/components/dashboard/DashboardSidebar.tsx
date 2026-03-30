"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNav, adminNav } from "@/lib/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-[28px] border border-[rgba(10,99,117,0.08)] bg-white/80 p-5 shadow-[0_10px_30px_rgba(10,99,117,0.06)] backdrop-blur xl:sticky xl:top-24">
      <div>
        <div className="text-lg font-extrabold text-slate-900">Кабинет</div>
        <div className="mt-1 text-sm text-slate-500">
          Управление документами и лимитами
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
          Пользователь
        </div>
        <nav className="grid gap-2">
          {dashboardNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] text-white shadow-lg shadow-cyan-200/40"
                    : "bg-slate-50 text-slate-700 hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
          Управление
        </div>
        <nav className="grid gap-2">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-700 hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}