import Link from "next/link";
import { FileText, Upload, MessageSquareText, Sparkles } from "lucide-react";

export function DocumentsEmptyState() {
  return (
    <div className="rounded-[32px] border border-dashed border-[rgba(10,99,117,0.16)] bg-white p-8 shadow-sm md:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(10,99,117,0.10),rgba(29,206,201,0.18))] text-cyan-700">
          <FileText size={26} />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          У вас пока нет документов
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
          Загрузите первый файл, чтобы запустить AI-аудит, извлечь текст и задать
          вопросы по содержанию документа в чате.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/documents/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            <Upload size={18} />
            Загрузить первый документ
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            На главную
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm">
              <Upload size={18} />
            </div>
            <div className="text-sm font-bold text-slate-900">1. Загрузите файл</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Поддерживаются PDF, TXT и DOCX.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm">
              <Sparkles size={18} />
            </div>
            <div className="text-sm font-bold text-slate-900">2. Запустите AI-аудит</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Сервис выделит риски, ошибки и рекомендации.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm">
              <MessageSquareText size={18} />
            </div>
            <div className="text-sm font-bold text-slate-900">3. Общайтесь с документом</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Задавайте вопросы по содержанию прямо в чате.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}