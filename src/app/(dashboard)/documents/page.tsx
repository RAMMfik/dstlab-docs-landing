import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentsToolbar } from "@/components/documents/DocumentsToolbar";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function DocumentsPage({ searchParams }: Props) {
  const params = await searchParams;

  const q = (params.q || "").trim();
  const status = params.status || "all";

  const documents = await prisma.document.findMany({
    where: {
      AND: [
        q
          ? {
              name: {
                contains: q,
              },
            }
          : {},
        status === "analyzed"
          ? {
              analysis: {
                not: null,
              },
            }
          : status === "not_analyzed"
          ? {
              analysis: null,
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

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

      <div className="mb-6">
        <DocumentsToolbar />
      </div>

      <div className="mb-4 text-sm text-slate-500">
        Найдено документов: {documents.length}
      </div>

      {documents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
          По текущему запросу ничего не найдено.
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}