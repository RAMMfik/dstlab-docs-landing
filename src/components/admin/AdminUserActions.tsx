"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAvailablePlans } from "@/lib/services/plan.service";

type Props = {
  userId: string;
  planCode: string;
  email: string;
};

const availablePlans = getAvailablePlans();

export function AdminUserActions({
  userId,
  planCode,
  email,
}: Props) {
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState(planCode);
  const [loading, setLoading] = useState(false);

  async function updatePlan() {
    const selectedPlanLabel =
      availablePlans.find((plan) => plan.code === selectedPlan)?.title ?? selectedPlan;

    const confirmed = window.confirm(
      `Изменить тариф пользователя ${email} на ${selectedPlanLabel}?`
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
    <div className="flex min-w-[180px] flex-col gap-2">
      <select
        value={selectedPlan}
        onChange={(e) => setSelectedPlan(e.target.value)}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
      >
        {availablePlans.map((plan) => (
          <option key={plan.code} value={plan.code}>
            {plan.title}
          </option>
        ))}
      </select>

      <button
        onClick={updatePlan}
        disabled={loading}
        className="rounded-xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
      >
        {loading ? "Сохраняем..." : "Изменить тариф"}
      </button>
    </div>
  );
}