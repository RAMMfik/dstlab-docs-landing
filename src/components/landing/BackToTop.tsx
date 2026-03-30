"use client";

import { ChevronUp } from "lucide-react";

export function BackToTop() {
  return (
    <a
      href="#top"
      className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] text-white shadow-[0_12px_30px_rgba(10,99,117,0.28)] transition duration-200 hover:scale-[1.05] sm:bottom-6 sm:right-6"
      aria-label="Наверх"
      title="Наверх"
    >
      <ChevronUp size={20} />
    </a>
  );
}