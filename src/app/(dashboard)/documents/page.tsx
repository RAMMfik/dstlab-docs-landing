import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentsQuery } from "@/lib/services/document-query.service";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentsToolbar } from "@/components/documents/DocumentsToolbar";
import { DocumentsPagination } from "@/components/documents/DocumentsPagination";
import { DocumentsEmptyState } from "@/components/documents/DocumentsEmptyState";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function DocumentsPage({ searchParams }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;

  const q = (params.q || "").trim();
  const status = params.status || "all";
  const sort = params.sort || "newest";

  const currentPage = Math.max(1, Number(params.page || "1") || 1);
  const pageSize = Math.max(1, Number(params.pageSize || "10") || 10);

  const result = await getDocumentsQuery({
    userId: user.id,
    q,
    status,
    sort,
    page: currentPage,
    pageSize,
  });

  const paginatedDocuments = result.items;
  const totalDocuments = result.total;
  const totalPages = result.totalPages;
  const safeCurrentPage = result.currentPage;

  const hasAnyDocuments = totalDocuments > 0;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Документы</h1>
          <p className="mt-1 text-sm text-slate-600">
            Загруженные файлы для анализа, аудита и чата по содержимому.
          </p>
        </div>

        <Link
          href="/documents/new"
          className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-4 py-3 text-sm font-semibold text-white"
        >
          Добавить документ
        </Link>
      </div>

      {!hasAnyDocuments ? (
        <DocumentsEmptyState />
      ) : (
        <>
          <div className="mb-6">
            <DocumentsToolbar />
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <div>Найдено документов: {totalDocuments}</div>
            <div>
              Показано: {paginatedDocuments.length} из {totalDocuments}
            </div>
          </div>

          {paginatedDocuments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
              По текущему запросу ничего не найдено.
            </div>
          ) : (
            <div className="grid gap-4">
              {paginatedDocuments.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}

          <DocumentsPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            basePath="/documents"
            queryParams={{
              q: q || undefined,
              status: status !== "all" ? status : undefined,
              sort: sort !== "newest" ? sort : undefined,
              pageSize: String(pageSize) !== "10" ? String(pageSize) : undefined,
            }}
          />
        </>
      )}
    </div>
  );
}