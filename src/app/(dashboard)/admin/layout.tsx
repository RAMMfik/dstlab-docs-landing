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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Admin Home
          </Link>
          <Link
            href="/admin/users"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Users
          </Link>
          <Link
            href="/admin/tariffs"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Tariffs
          </Link>
          <Link
            href="/admin/models"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Models
          </Link>
          <Link
            href="/admin/ai-usage"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            AI Usage
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}