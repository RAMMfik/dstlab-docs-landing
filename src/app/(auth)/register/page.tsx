"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (password !== passwordRepeat) {
        throw new Error("Пароли не совпадают");
      }

      const res = await fetch("/api/auth/register", {
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
        throw new Error(data?.error || "Ошибка регистрации");
      }

      router.push("/documents");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[32px] border border-[rgba(10,99,117,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(10,99,117,0.08)] md:p-8">
      <div className="mb-6">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
          DSTLab Docs AI
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Регистрация
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Создай аккаунт, чтобы сохранять документы, аудит и чат в личном кабинете.
        </p>
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
            placeholder="Не короче 6 символов"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-700"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Повторите пароль
          </label>
          <input
            type="password"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
            placeholder="Повторите пароль"
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
          {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
        </button>
      </div>

      <div className="mt-6 text-sm text-slate-600">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-cyan-700 hover:underline">
          Войти
        </Link>
      </div>
    </div>
  );
}