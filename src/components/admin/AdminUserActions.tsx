"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  userId: string;
  planCode: string;
  email: string;
};

export function AdminUserActions({
  userId,
  planCode,
  email,
}: Props) {
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState(planCode);
  const [loading, setLoading] = useState(false);

  async function updatePlan() {
    const confirmed = window.confirm(
      `Изменить тариф пользователя ${email} на ${selectedPlan}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/users/${userId}/change-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planCode: selectedPlan,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        window.alert(data.message || "Ошибка смены тарифа");
        return;
      }

      router.refresh();
    } catch {
      window.alert("Ошибка смены тарифа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 min-w-[180px]">
      <select
        value={selectedPlan}
        onChange={(e) => setSelectedPlan(e.target.value)}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
      >
        <option value="START">Start</option>
        <option value="PRO">Pro</option>
      </select>

      <button
        onClick={updatePlan}
        disabled={loading}
        className="rounded-xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-3 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
      >
        {loading ? "Сохраняем..." : "Изменить тариф"}
      </button>
    </div>
  );
}