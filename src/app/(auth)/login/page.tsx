"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка входа");
      }

      router.push("/documents");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[32px] border border-[rgba(10,99,117,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(10,99,117,0.08)] md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            DSTLab Docs AI
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Вход
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Войди в кабинет, чтобы работать с документами, аудитом и чатом.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          На главную
        </Link>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </div>

      <div className="mt-6 text-sm text-slate-600">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-semibold text-cyan-700 hover:underline">
          Зарегистрироваться
        </Link>
      </div>
    </div>
  );
}