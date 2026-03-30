"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Какие документы можно проверять?",
    a: "Договоры, регламенты, инструкции, коммерческие предложения, тендерные материалы и другие рабочие документы в поддерживаемых форматах.",
  },
  {
    q: "Что именно показывает аудит?",
    a: "Сервис может находить слабые места в структуре документа, неясные формулировки, потенциальные риски, пропущенные блоки и участки, требующие доработки.",
  },
  {
    q: "Можно ли задавать вопросы по загруженному файлу?",
    a: "Да. После загрузки документа можно использовать AI-чат, чтобы уточнять отдельные пункты, искать нужные разделы и получать ответы по содержимому файла.",
  },
  {
    q: "Подходит ли сервис для коммерческих предложений и тендерных материалов?",
    a: "Да, платформа подходит для анализа коммерческих предложений, тендерной документации, внутренних регламентов, инструкций и договоров.",
  },
  {
    q: "Можно ли подключить форму к API, Telegram и почте?",
    a: "Да. Форма на лендинге может быть подключена к API, отправке в Telegram, письму на email или CRM — это зависит от вашей схемы интеграции.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20">
      <div className="container max-w-4xl">
        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-700">
            FAQ
          </div>
          <h2 className="mt-4 text-4xl font-extrabold text-slate-900">Частые вопросы</h2>
          <p className="mt-4 text-lg text-slate-600">
            Ответы на основные вопросы о работе сервиса и его возможностях.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.q} className="glass-card overflow-hidden rounded-[28px]">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-lg font-bold text-slate-900">{item.q}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm leading-7 text-slate-600">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}