"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function DocumentsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");

  const currentStatus = searchParams.get("status") || "all";
  const currentSort = searchParams.get("sort") || "newest";
  const currentPageSize = searchParams.get("pageSize") || "10";

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const hasFilters = useMemo(() => {
    return (
      Boolean((searchParams.get("q") || "").trim()) ||
      currentStatus !== "all" ||
      currentSort !== "newest" ||
      currentPageSize !== "10"
    );
  }, [searchParams, currentStatus, currentSort, currentPageSize]);

  const buildAndPush = (
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

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      if (query !== currentQ) {
        buildAndPush(query, currentStatus, currentSort, currentPageSize);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, currentStatus, currentSort, currentPageSize, searchParams]);

  const resetFilters = () => {
    setQuery("");
    router.push(pathname);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-[minmax(260px,1.2fr)_220px_220px_180px]">
        <div className="min-w-0">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Поиск по названию
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Например: договор, оферта, резюме..."
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
          />
        </div>

        <div className="min-w-0">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Статус
          </label>
          <select
            value={currentStatus}
            onChange={(e) =>
              buildAndPush(query, e.target.value, currentSort, currentPageSize)
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
          >
            <option value="all">Все документы</option>
            <option value="analyzed">С анализом</option>
            <option value="not_analyzed">Без анализа</option>
          </select>
        </div>

        <div className="min-w-0">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Сортировка
          </label>
          <select
            value={currentSort}
            onChange={(e) =>
              buildAndPush(query, currentStatus, e.target.value, currentPageSize)
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="name_asc">Название: А-Я</option>
            <option value="name_desc">Название: Я-А</option>
          </select>
        </div>

        <div className="min-w-0">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            На странице
          </label>
          <select
            value={currentPageSize}
            onChange={(e) =>
              buildAndPush(query, currentStatus, currentSort, e.target.value)
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {hasFilters ? (
        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : null}
    </div>
  );
}