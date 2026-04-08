"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function SearchInput({
  initialValue,
  onDebouncedChange,
}: {
  initialValue: string;
  onDebouncedChange: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDebouncedChange(value);
    }, 350);

    return () => clearTimeout(timer);
  }, [onDebouncedChange, value]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Например: договор, оферта, резюме..."
      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
    />
  );
}

export function DocumentsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQueryFromUrl = searchParams.get("q") || "";
  const currentStatus = searchParams.get("status") || "all";
  const currentSort = searchParams.get("sort") || "newest";
  const currentPageSize = searchParams.get("pageSize") || "10";

  const hasFilters = useMemo(() => {
    return (
      Boolean(currentQueryFromUrl.trim()) ||
      currentStatus !== "all" ||
      currentSort !== "newest" ||
      currentPageSize !== "10"
    );
  }, [currentPageSize, currentQueryFromUrl, currentSort, currentStatus]);

  const buildAndPush = useCallback(
    (
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
    },
    [pathname, router, searchParams]
  );

  const handleQueryChange = useCallback(
    (nextQuery: string) => {
      if (nextQuery === currentQueryFromUrl) return;
      buildAndPush(nextQuery, currentStatus, currentSort, currentPageSize);
    },
    [buildAndPush, currentPageSize, currentQueryFromUrl, currentSort, currentStatus]
  );

  const resetFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Поиск по названию
          </label>
          <SearchInput
            key={currentQueryFromUrl}
            initialValue={currentQueryFromUrl}
            onDebouncedChange={handleQueryChange}
          />
        </div>

        <div className="min-w-0">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Статус
          </label>
          <select
            value={currentStatus}
            onChange={(e) =>
              buildAndPush(currentQueryFromUrl, e.target.value, currentSort, currentPageSize)
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
              buildAndPush(currentQueryFromUrl, currentStatus, e.target.value, currentPageSize)
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
              buildAndPush(currentQueryFromUrl, currentStatus, currentSort, e.target.value)
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