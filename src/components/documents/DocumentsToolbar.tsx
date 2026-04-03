"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function DocumentsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");

  const currentStatus = searchParams.get("status") || "all";
  const currentSort = searchParams.get("sort") || "newest";
  const currentPageSize = searchParams.get("pageSize") || "10";

  const hasFilters = useMemo(() => {
    return (
      Boolean((searchParams.get("q") || "").trim()) ||
      currentStatus !== "all" ||
      currentSort !== "newest" ||
      currentPageSize !== "10"
    );
  }, [searchParams, currentStatus, currentSort, currentPageSize]);

  const applyFilters = (
    nextQuery: string,
    nextStatus: string,
    nextSort: string,
    nextPageSize: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    } else {
      params.delete("q");
    }

    if (nextStatus !== "all") {
      params.set("status", nextStatus);
    } else {
      params.delete("status");
    }

    if (nextSort !== "newest") {
      params.set("sort", nextSort);
    } else {
      params.delete("sort");
    }

    if (nextPageSize !== "10") {
      params.set("pageSize", nextPageSize);
    } else {
      params.delete("pageSize");
    }

    params.delete("page");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const resetFilters = () => {
    setQuery("");
    router.push(pathname);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_220px_220px_180px_auto]">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Поиск по названию
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Например: договор, оферта, резюме..."
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyFilters(query, currentStatus, currentSort, currentPageSize);
              }
            }}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Статус
          </label>
          <select
            value={currentStatus}
            onChange={(e) =>
              applyFilters(query, e.target.value, currentSort, currentPageSize)
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
          >
            <option value="all">Все документы</option>
            <option value="analyzed">С анализом</option>
            <option value="not_analyzed">Без анализа</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Сортировка
          </label>
          <select
            value={currentSort}
            onChange={(e) =>
              applyFilters(query, currentStatus, e.target.value, currentPageSize)
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="name_asc">Название: А-Я</option>
            <option value="name_desc">Название: Я-А</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            На странице
          </label>
          <select
            value={currentPageSize}
            onChange={(e) =>
              applyFilters(query, currentStatus, currentSort, e.target.value)
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="flex items-end gap-3">
          <button
            onClick={() =>
              applyFilters(query, currentStatus, currentSort, currentPageSize)
            }
            className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Применить
          </button>

          {hasFilters ? (
            <button
              onClick={resetFilters}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Сбросить
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}