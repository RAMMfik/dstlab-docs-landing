import { CheckCircle2 } from "lucide-react";

const useCases = [
  "Проверка договоров перед отправкой",
  "Аудит коммерческих предложений и тендерных файлов",
  "Проверка регламентов, инструкций и внутренних документов",
  "Выжимка ключевой информации из больших файлов",
];

const steps = [
  {
    title: "Загрузите документ",
    text: "PDF, DOCX и другие поддерживаемые форматы. Пользователь просто добавляет файл в интерфейс.",
  },
  {
    title: "Выберите сценарий",
    text: "Например: аудит рисков, редактура, summary, извлечение данных или чат по документу.",
  },
  {
    title: "Получите результат",
    text: "Система формирует отчёт, выделяет проблемные места и предлагает рекомендации.",
  },
  {
    title: "Уточните детали в AI-чате",
    text: "После анализа можно задавать точечные вопросы по содержимому и получать ответы по контексту файла.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-14 sm:py-16 lg:py-20">
      <div className="container grid gap-6 xl:grid-cols-[0.92fr_1.08fr] xl:gap-8">
        <div className="rounded-[28px] border border-[#0A6375]/10 bg-[#0A6375] p-6 text-white shadow-[0_16px_50px_rgba(10,99,117,0.16)] sm:rounded-[32px] sm:p-8">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 sm:text-sm">
            Для кого
          </div>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            Где это особенно полезно
          </h2>
          <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
            {useCases.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-white/8 p-4 transition duration-200 hover:bg-white/12"
              >
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#1DCEC9]" size={20} />
                <div className="text-sm leading-7 text-cyan-50">{item}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 sm:text-sm">
            Как это работает
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Простой путь от загрузки файла до результата
          </h2>
          <div className="mt-6 grid gap-4 sm:mt-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="glass-card flex items-start gap-4 rounded-[24px] p-5 transition duration-200 hover:-translate-y-0.5 sm:rounded-[28px]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2F3640] text-sm font-extrabold text-white">
                  {index + 1}
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{step.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">{step.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}