import { CheckCircle2 } from "lucide-react";

const pricing = [
  {
    name: "Start",
    price: "0 ₽",
    subtext: "Для знакомства с сервисом",
    features: [
      "Базовые сценарии проверки",
      "Ограниченный объем операций",
      "AI-чат по одному документу",
    ],
    featured: false,
    button: "Выбрать тариф",
  },
  {
    name: "Pro",
    price: "от 990 ₽",
    subtext: "Для регулярной работы с документами",
    features: [
      "Расширенный аудит документов",
      "Извлечение данных и summary",
      "Приоритетная обработка",
    ],
    featured: true,
    button: "Выбрать тариф",
  },
  {
    name: "Business",
    price: "Индивидуально",
    subtext: "Для команд и большого потока файлов",
    features: [
      "Командный доступ",
      "Гибкие лимиты и роли",
      "Индивидуальные условия подключения",
    ],
    featured: false,
    button: "Оставить заявку",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-14 sm:py-16 lg:py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 sm:text-sm">
            Тарифы
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Выберите подходящий формат работы
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Для разных задач — от первого знакомства с сервисом до командной работы с
            документами и более глубокой интеграции в процессы компании.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
          {pricing.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[24px] p-5 transition duration-200 hover:-translate-y-1 sm:rounded-[32px] sm:p-6 ${
                plan.featured
                  ? "border border-cyan-300 bg-[linear-gradient(180deg,rgba(29,206,201,0.10),rgba(255,255,255,0.98))] shadow-[0_20px_50px_rgba(29,206,201,0.18)]"
                  : "glass-card"
              } ${plan.name === "Business" ? "md:col-span-2 xl:col-span-1" : ""}`}
            >
              {plan.featured && (
                <div className="mb-4 inline-flex rounded-full bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                  Популярный выбор
                </div>
              )}

              <div className="text-xl font-bold text-slate-900">{plan.name}</div>
              <div className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                {plan.price}
              </div>
              <div className="mt-2 text-sm text-slate-500">{plan.subtext}</div>

              <div className="mt-6 space-y-3">
                {plan.features.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-cyan-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                className={`mt-8 w-full rounded-full px-5 py-3.5 text-sm font-semibold transition duration-200 ${
                  plan.featured
                    ? "bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] text-white shadow-lg shadow-cyan-200/40 hover:scale-[1.01]"
                    : "bg-[#2F3640] text-white hover:bg-[#1f252e]"
                }`}
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}