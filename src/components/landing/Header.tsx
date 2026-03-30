"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Menu,
  X,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Возможности", href: "#features" },
  { label: "Как это работает", href: "#how" },
  { label: "Тарифы", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Контакты", href: "#contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(10,99,117,0.08)] bg-[rgba(248,251,252,0.88)] backdrop-blur-xl">
      <div className="container flex min-h-[72px] items-center justify-between py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1DCEC9,#0A6375)] text-white shadow-lg shadow-cyan-200/40">
            <Bot size={22} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
              DSTLab Docs AI
            </div>
            <div className="truncate text-[11px] text-slate-500 sm:text-xs">
              Аудит и анализ документов
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 xl:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors duration-200 hover:text-[#0A6375]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#contact"
            className="rounded-full px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            Оставить заявку
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200/50 transition duration-200 hover:scale-[1.02]"
          >
            Попробовать
            <ArrowRight size={16} />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(10,99,117,0.10)] bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
          aria-label="Открыть меню"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[rgba(10,99,117,0.08)] bg-[linear-gradient(180deg,#ffffff,#f7fbfb)] px-5 py-5 shadow-lg md:hidden">
          <nav className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-transparent bg-white/70 px-4 py-3 shadow-sm transition hover:border-[rgba(10,99,117,0.08)] hover:text-[#0A6375]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <a
              href="tel:+79537863291"
              className="rounded-2xl bg-white p-3 text-center shadow-sm"
              onClick={() => setMobileOpen(false)}
            >
              <Phone size={18} className="mx-auto text-[#0A6375]" />
              <div className="mt-2 text-xs font-semibold text-slate-700">Позвонить</div>
            </a>

            <a
              href="https://t.me/icevan80"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-white p-3 text-center shadow-sm"
              onClick={() => setMobileOpen(false)}
            >
              <Send size={18} className="mx-auto text-[#0A6375]" />
              <div className="mt-2 text-xs font-semibold text-slate-700">Telegram</div>
            </a>

            <a
              href="https://web.whatsapp.com/send?phone=79139003752"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-white p-3 text-center shadow-sm"
              onClick={() => setMobileOpen(false)}
            >
              <MessageCircle size={18} className="mx-auto text-[#0A6375]" />
              <div className="mt-2 text-xs font-semibold text-slate-700">WhatsApp</div>
            </a>
          </div>

          <div className="mt-5 rounded-[24px] bg-[linear-gradient(135deg,rgba(10,99,117,0.08),rgba(29,206,201,0.12))] p-4">
            <div className="text-sm font-bold text-slate-900">DSTLab</div>
            <div className="mt-1 text-xs leading-6 text-slate-600">
              Сертифицированное маркетинговое агентство. ООО «Акцепт Девелопмент».
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border border-[rgba(10,99,117,0.10)] bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              onClick={() => setMobileOpen(false)}
            >
              Оставить заявку
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Попробовать
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}