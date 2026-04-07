"use client";

import { useState } from "react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      setSuccess("");
      setError("");

      const res = await fetch("/api/upgrade", { method: "POST" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Не удалось обновить тариф");
      }

      setSuccess("Тариф успешно обновлён до PRO");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка обновления тарифа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[32px] border border-[rgba(10,99,117,0.08)] bg-[linear-gradient(135deg,rgba(10,99,117,0.08),rgba(29,206,201,0.08),rgba(255,255,255,0.95))] p-6 shadow-[0_18px_50px_rgba(10,99,117,0.08)] md:p-8">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Тарифы и лимиты
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Выберите подходящий план
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
              Сравните лимиты и выберите тариф для вашей нагрузки: базовая работа с документами или активное ежедневное использование AI-аудита и чата.
            </p>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <TariffCard
            title="FREE"
            subtitle="Базовый тариф для старта"
            description="Подходит для тестирования сервиса, единичных документов и знакомства с AI-аудитом."
            features={[
              "20 документов",
              "30 AI-анализов",
              "100 сообщений в чате",
              "Загрузка PDF, DOCX и TXT",
              "Доступ к аудиту и чату по документу",
            ]}
            buttonText="Текущий тариф"
            buttonVariant="secondary"
            disabled
          />

          <TariffCard
            title="PRO"
            subtitle="Для активной ежедневной работы"
            description="Подходит для команд, юристов, менеджеров и специалистов, которые регулярно загружают документы и общаются с ними через AI."
            features={[
              "200 документов",
              "300 AI-анализов",
              "1000 сообщений в чате",
              "Больше пространства для рабочих файлов",
              "Подходит для постоянной эксплуатации",
            ]}
            buttonText={loading ? "Обновляем..." : "Перейти на PRO"}
            buttonVariant="primary"
            onClick={handleUpgrade}
            disabled={loading}
            highlight
          />
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Что входит в сервис</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <FeatureBox
              title="AI-аудит"
              text="Проверка документа, выделение рисков, структуры и возможных проблем."
            />
            <FeatureBox
              title="Извлечение текста"
              text="Парсинг содержимого файла для дальнейшего анализа и поиска по смыслу."
            />
            <FeatureBox
              title="Чат по документу"
              text="Возможность задавать уточняющие вопросы по конкретному файлу."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function TariffCard({
  title,
  subtitle,
  description,
  features,
  buttonText,
  buttonVariant,
  onClick,
  disabled,
  highlight = false,
}: {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[32px] border p-6 shadow-sm ${
        highlight
          ? "border-cyan-200 bg-[linear-gradient(180deg,rgba(10,99,117,0.04),rgba(29,206,201,0.08),#ffffff)]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-6">
        <div className="mb-2 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
          {title}
        </div>

        <h2 className="text-2xl font-bold text-slate-900">{subtitle}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <div className="space-y-3">
        {features.map((item) => (
          <div
            key={item}
            className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>

      <button
        onClick={onClick}
        disabled={disabled}
        className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          buttonVariant === "primary"
            ? "bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] text-white hover:opacity-95"
            : "border border-slate-300 bg-white text-slate-700"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}

function FeatureBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <div className="text-sm font-bold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}