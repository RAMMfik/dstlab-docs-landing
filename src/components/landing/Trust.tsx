import { BadgeCheck, Clock3, FileText, Zap } from "lucide-react";

const stats = [
  {
    icon: FileText,
    value: "PDF / DOCX",
    label: "Поддержка рабочих документов и типовых файлов",
  },
  {
    icon: Zap,
    value: "Проверка",
    label: "Быстрый анализ рисков, структуры и формулировок",
  },
  {
    icon: Clock3,
    value: "Быстрее",
    label: "Сокращение времени на первичную проверку документов",
  },
  {
    icon: BadgeCheck,
    value: "Для бизнеса",
    label: "Подходит для команд, внутренних процессов и внедрения",
  },
];

export function Trust() {
  return (
    <section className="pb-14 sm:pb-16 lg:pb-20">
      <div className="container">
        <div className="rounded-[28px] border border-[rgba(10,99,117,0.08)] bg-white/75 p-5 shadow-[0_10px_35px_rgba(10,99,117,0.06)] backdrop-blur sm:rounded-[32px] sm:p-6 lg:p-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.value}
                  className="rounded-[22px] border border-[rgba(10,99,117,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(246,250,250,0.95))] p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(10,99,117,0.08)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1DCEC9,#0A6375)] text-white shadow-lg shadow-cyan-200/40">
                    <Icon size={20} />
                  </div>
                  <div className="mt-4 text-2xl font-extrabold text-slate-900">{item.value}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}