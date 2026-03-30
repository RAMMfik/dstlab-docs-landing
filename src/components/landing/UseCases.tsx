import { ArrowRight, FileCheck2, FileSpreadsheet, Gavel, ScrollText } from "lucide-react";

const cases = [
  {
    icon: Gavel,
    title: "Договоры и соглашения",
    text: "Проверка рисков, противоречий, слабых формулировок и условий, которые требуют уточнения перед отправкой или согласованием.",
  },
  {
    icon: FileSpreadsheet,
    title: "Коммерческие предложения и тендеры",
    text: "Быстрый разбор структуры, полноты документа, аргументации и ключевых блоков перед подачей или отправкой клиенту.",
  },
  {
    icon: ScrollText,
    title: "Регламенты и инструкции",
    text: "Анализ логики, полноты, повторов, пробелов и качества формулировок во внутренних документах компании.",
  },
  {
    icon: FileCheck2,
    title: "Извлечение данных",
    text: "Поиск реквизитов, сроков, сумм, ролей сторон, обязательств и других сущностей без ручного просмотра всего файла.",
  },
];

export function UseCases() {
  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <div className="container">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 sm:text-sm">
              Сценарии использования
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Где сервис даёт наибольшую пользу
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Используйте платформу для ежедневной работы с документами: от проверки
              договоров и тендерных файлов до анализа внутренних регламентов и быстрого
              извлечения ключевых данных.
            </p>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A6375] transition hover:text-[#084f5f]"
          >
            Обсудить задачу
            <ArrowRight size={16} />
          </a>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {cases.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-[24px] border border-[rgba(10,99,117,0.08)] bg-white/80 p-5 shadow-[0_10px_30px_rgba(10,99,117,0.06)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(10,99,117,0.10)] sm:p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#dff8f7,#eefbfb)] text-[#0A6375] transition duration-200 group-hover:bg-[linear-gradient(135deg,#1DCEC9,#0A6375)] group-hover:text-white">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}