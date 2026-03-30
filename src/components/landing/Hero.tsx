import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  FileText,
  MessageSquareText,
  ScanSearch,
} from "lucide-react";

export function Hero() {
  return (
    <section className="hero-grid relative overflow-hidden py-14 sm:py-16 md:py-20 xl:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(29,206,201,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,185,170,0.16),transparent_24%)]" />
      <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.22),transparent_30%,transparent_70%,rgba(255,255,255,0.18))]" />

      <div className="container relative grid items-center gap-10 xl:grid-cols-[1.05fr_0.95fr] xl:gap-14">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(10,99,117,0.12)] bg-white/85 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm sm:text-sm">
            <Sparkles size={16} className="text-cyan-600" />
            AI-платформа для аудита, анализа и извлечения данных из документов
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.02] text-slate-900 sm:text-5xl lg:text-6xl">
            Проверяйте документы,
            <span className="block bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] bg-clip-text text-transparent">
              находите риски
            </span>
            и ускоряйте работу команды
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Анализируйте договоры, регламенты, инструкции, коммерческие предложения и
            тендерные документы с помощью ИИ. Получайте замечания, краткие выводы,
            рекомендации и ответы по содержимому файла в одном интерфейсе.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "Договоры и соглашения",
              "Тендерные документы",
              "Коммерческие предложения",
              "Регламенты и инструкции",
            ].map((tag) => (
              <div
                key={tag}
                className="rounded-full border border-[rgba(10,99,117,0.10)] bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm"
              >
                {tag}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-cyan-200/50 transition duration-200 hover:scale-[1.02] sm:px-7 sm:py-4 sm:text-base"
            >
              Оставить заявку
              <ArrowRight size={18} />
            </a>

            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-[rgba(10,99,117,0.12)] bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-50 sm:px-7 sm:py-4 sm:text-base"
            >
              Посмотреть возможности
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="glass-card rounded-3xl p-5 transition duration-200 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <FileText size={18} />
                </div>
                <div className="text-lg font-extrabold text-slate-900">PDF / DOCX</div>
              </div>
              <div className="mt-2 text-sm text-slate-500">Поддержка рабочих документов</div>
            </div>

            <div className="glass-card rounded-3xl p-5 transition duration-200 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <ShieldCheck size={18} />
                </div>
                <div className="text-lg font-extrabold text-slate-900">Проверка</div>
              </div>
              <div className="mt-2 text-sm text-slate-500">Проверка рисков и структуры</div>
            </div>

            <div className="glass-card rounded-3xl p-5 transition duration-200 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <MessageSquareText size={18} />
                </div>
                <div className="text-lg font-extrabold text-slate-900">Чат по документу</div>
              </div>
              <div className="mt-2 text-sm text-slate-500">Вопросы и ответы по содержимому</div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[580px] xl:max-w-none">
          <div className="relative">
            <div className="absolute -left-6 top-8 hidden rounded-2xl border border-[rgba(10,99,117,0.08)] bg-white/85 p-4 shadow-[0_18px_45px_rgba(10,99,117,0.08)] backdrop-blur lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <ScanSearch size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">AI-проверка</div>
                  <div className="text-xs text-slate-500">Аудит, summary, извлечение данных</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-[28px] p-3 sm:rounded-[32px] sm:p-4 md:p-6">
              <div className="rounded-[24px] border border-[rgba(10,99,117,0.08)] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Документ</div>
                    <div className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
                      Договор поставки.pdf
                    </div>
                  </div>
                  <div className="w-fit rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
                    Анализ завершён
                  </div>
                </div>

                <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
                  {[
                    ["Юридические риски", "3 замечания", "bg-rose-100 text-rose-700"],
                    ["Структура документа", "2 рекомендации", "bg-amber-100 text-amber-700"],
                    ["Ясность формулировок", "4 улучшения", "bg-emerald-100 text-emerald-700"],
                  ].map(([title, value, tone]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-[rgba(10,99,117,0.08)] bg-slate-50/80 p-4 transition duration-200 hover:bg-white"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{title}</div>
                          <div className="mt-1 text-sm text-slate-500">{value}</div>
                        </div>
                        <div
                          className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${tone}`}
                        >
                          статус
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-[linear-gradient(135deg,rgba(29,206,201,0.12),rgba(255,185,170,0.16))] p-4 sm:mt-6">
                  <div className="text-sm font-semibold text-slate-900">Краткий вывод</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    В документе стоит уточнить ответственность сторон, порядок уведомления и
                    условия расторжения. Также рекомендуется привести формулировки в нескольких
                    разделах к единому стилю, чтобы снизить двусмысленность.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}