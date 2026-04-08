"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UpgradeToProButtonProps = {
  disabled?: boolean;
  initialLabel?: string;
};

export function UpgradeToProButton({
  disabled = false,
  initialLabel = "Перейти на PRO",
}: UpgradeToProButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/upgrade", { method: "POST" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Не удалось обновить тариф");
      }

      setSuccess("Тариф успешно обновлён до PRO");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка обновления тарифа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
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

      <button
        onClick={handleUpgrade}
        disabled={disabled || loading}
        className="w-full rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Обновляем..." : initialLabel}
      </button>
    </div>
  );
}