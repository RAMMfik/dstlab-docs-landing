import Link from "next/link";

type DocumentsPaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryParams: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  queryParams: Record<string, string | undefined>,
  page: number
) {
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value && value.trim()) {
      params.set(key, value);
    }
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function DocumentsPagination({
  currentPage,
  totalPages,
  basePath,
  queryParams,
}: DocumentsPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">
        Страница {currentPage} из {totalPages}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHref(basePath, queryParams, Math.max(1, currentPage - 1))}
          className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
            currentPage === 1
              ? "pointer-events-none border-slate-200 text-slate-300"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Назад
        </Link>

        {pages.map((page) => (
          <Link
            key={page}
            href={buildHref(basePath, queryParams, page)}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
              page === currentPage
                ? "bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {page}
          </Link>
        ))}

        <Link
          href={buildHref(
            basePath,
            queryParams,
            Math.min(totalPages, currentPage + 1)
          )}
          className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
            currentPage === totalPages
              ? "pointer-events-none border-slate-200 text-slate-300"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Вперёд
        </Link>
      </div>
    </div>
  );
}