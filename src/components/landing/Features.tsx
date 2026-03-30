import { FileSearch, Files, MessageSquareText, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Аудит документов",
    text: "Проверка структуры, формулировок, ошибок, слабых мест и потенциальных рисков в рабочих документах.",
  },
  {
    icon: MessageSquareText,
    title: "AI-чат по документу",
    text: "Задавайте вопросы по содержимому файла, уточняйте пункты, находите нужные разделы и получайте объяснения.",
  },
  {
    icon: Files,
    title: "Извлечение данных",
    text: "Быстро находите реквизиты, суммы, сроки, роли сторон, обязательства и другие ключевые данные из документа.",
  },
  {
    icon: ShieldCheck,
    title: "Готовые сценарии",
    text: "От проверки рисков и редактуры до summary, замечаний к доработке и анализа полноты документа.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-14 sm:py-16 lg:py-20">
      <div className="container">
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 sm:text-sm">
            Возможности
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:mt-4 sm:text-4xl">
            Всё, что нужно для анализа документации
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Сервис помогает быстрее проверять документы, находить проблемные места,
            вытаскивать важные данные и работать с содержимым файла в удобном интерфейсе.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="glass-card rounded-[24px] p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(10,99,117,0.10)] sm:rounded-[28px] sm:p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1DCEC9,#0A6375)] text-white">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}