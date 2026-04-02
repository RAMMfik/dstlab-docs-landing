import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DocumentCard } from "@/components/documents/DocumentCard";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Документы</h1>
          <p className="mt-1 text-sm text-slate-600">
            Загруженные файлы для анализа и аудита.
          </p>
        </div>

        <Link
          href="/documents/new"
          className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-4 py-3 text-sm font-semibold text-white"
        >
          Добавить документ
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
          Пока документов нет.
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