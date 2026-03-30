"use client";

import Link from "next/link";
import {
  Bot,
  Mail,
  MessageCircle,
  Phone,
  MapPin,
  Send,
  Building2,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

export function Footer() {
  const [openSection, setOpenSection] = useState<string | null>("contacts");

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <footer className="border-t border-[rgba(10,99,117,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(243,248,248,0.92))] py-8 sm:py-10">
      <div className="container">
        <div className="rounded-[28px] border border-[rgba(10,99,117,0.08)] bg-white/70 p-5 shadow-[0_12px_35px_rgba(10,99,117,0.06)] backdrop-blur sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.8fr_0.95fr] lg:gap-10">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1DCEC9,#0A6375)] text-white shadow-lg shadow-cyan-200/40">
                  <Bot size={22} />
                </div>
                <div>
                  <div className="text-lg font-extrabold tracking-tight text-slate-900">
                    DSTLab Docs AI
                  </div>
                  <div className="text-xs text-slate-500">Аудит и анализ документов</div>
                </div>
              </Link>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
                Платформа для проверки документов, извлечения данных и работы с файлами с
                помощью ИИ. Подходит для договоров, КП, регламентов, инструкций и других
                рабочих документов.
              </p>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <Building2 size={16} className="mt-1 shrink-0 text-cyan-700" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      ООО «Акцепт Девелопмент»
                    </div>
                    <div>Сертифицированное маркетинговое агентство</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-1 shrink-0 text-cyan-700" />
                  <div>Новосибирск, ул. Кошурникова 45/1, офис 8</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 sm:text-sm">
                Навигация
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <a href="#features" className="rounded-xl px-2 py-1 transition hover:bg-white hover:text-[#0A6375]">
                  Возможности
                </a>
                <a href="#how" className="rounded-xl px-2 py-1 transition hover:bg-white hover:text-[#0A6375]">
                  Как это работает
                </a>
                <a href="#pricing" className="rounded-xl px-2 py-1 transition hover:bg-white hover:text-[#0A6375]">
                  Тарифы
                </a>
                <a href="#faq" className="rounded-xl px-2 py-1 transition hover:bg-white hover:text-[#0A6375]">
                  FAQ
                </a>
                <a href="#contact" className="rounded-xl px-2 py-1 transition hover:bg-white hover:text-[#0A6375]">
                  Контакты
                </a>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 sm:text-sm">
                Контакты
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <a
                  href="mailto:info@dstlab.ru"
                  className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 transition hover:bg-white"
                >
                  <Mail size={16} className="shrink-0 text-cyan-700" />
                  <span>info@dstlab.ru</span>
                </a>

                <a
                  href="tel:+79537863291"
                  className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 transition hover:bg-white"
                >
                  <Phone size={16} className="shrink-0 text-cyan-700" />
                  <span>+7 (953) 786 32 91</span>
                </a>

                <a
                  href="https://t.me/icevan80"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 transition hover:bg-white"
                >
                  <Send size={16} className="shrink-0 text-cyan-700" />
                  <span>Telegram</span>
                </a>

                <a
                  href="https://web.whatsapp.com/send?phone=79139003752"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 transition hover:bg-white"
                >
                  <MessageCircle size={16} className="shrink-0 text-cyan-700" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3 border-t border-[rgba(10,99,117,0.08)] pt-5 lg:hidden">
            <div className="rounded-2xl bg-white/70">
              <button
                type="button"
                onClick={() => toggleSection("nav")}
                className="flex w-full items-center justify-between px-4 py-4 text-left"
              >
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-700">
                  Навигация
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-500 transition-transform ${
                    openSection === "nav" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSection === "nav" && (
                <div className="px-4 pb-4 text-sm text-slate-600">
                  <div className="grid gap-3">
                    <a href="#features">Возможности</a>
                    <a href="#how">Как это работает</a>
                    <a href="#pricing">Тарифы</a>
                    <a href="#faq">FAQ</a>
                    <a href="#contact">Контакты</a>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white/70">
              <button
                type="button"
                onClick={() => toggleSection("contacts")}
                className="flex w-full items-center justify-between px-4 py-4 text-left"
              >
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-700">
                  Контакты
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-500 transition-transform ${
                    openSection === "contacts" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSection === "contacts" && (
                <div className="px-4 pb-4 text-sm text-slate-600">
                  <div className="space-y-3">
                    <a href="mailto:info@dstlab.ru" className="flex items-center gap-3">
                      <Mail size={16} className="shrink-0 text-cyan-700" />
                      <span>info@dstlab.ru</span>
                    </a>

                    <a href="tel:+79537863291" className="flex items-center gap-3">
                      <Phone size={16} className="shrink-0 text-cyan-700" />
                      <span>+7 (953) 786 32 91</span>
                    </a>

                    <a
                      href="https://t.me/icevan80"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3"
                    >
                      <Send size={16} className="shrink-0 text-cyan-700" />
                      <span>Telegram</span>
                    </a>

                    <a
                      href="https://web.whatsapp.com/send?phone=79139003752"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3"
                    >
                      <MessageCircle size={16} className="shrink-0 text-cyan-700" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-[rgba(10,99,117,0.08)] pt-5 text-sm text-slate-500">
            © DSTLab, 2009 — 2026
          </div>
        </div>
      </div>
    </footer>
  );
}