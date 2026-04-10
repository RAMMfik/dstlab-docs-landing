"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminUserActionsProps = {
  userId: string;
  planCode: string;
  email: string;
};

type ActionResponse = {
  success?: boolean;
  message?: string;
};

export function AdminUserActions({
  userId,
  planCode,
  email,
}: AdminUserActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"activate" | "deactivate" | null>(null);

  const isPro = planCode === "PRO";

  async function runAction(action: "activate" | "deactivate") {
    const confirmed = window.confirm(
      action === "activate"
        ? `Выдать тариф Pro пользователю ${email}?`
        : `Снять тариф Pro у пользователя ${email}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingAction(action);

      const endpoint =
        action === "activate"
          ? `/api/admin/users/${userId}/activate-pro`
          : `/api/admin/users/${userId}/deactivate-pro`;

      const res = await fetch(endpoint, {
        method: "POST",
      });

      const data = (await res.json().catch(() => null)) as ActionResponse | null;

      if (!res.ok || !data?.success) {
        window.alert(data?.message ?? "Не удалось выполнить действие");
        return;
      }

      router.refresh();
    } catch {
      window.alert("Ошибка при выполнении действия");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {isPro ? (
        <button
          type="button"
          onClick={() => void runAction("deactivate")}
          disabled={loadingAction !== null}
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === "deactivate" ? "Снимаем..." : "Снять Pro"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void runAction("activate")}
          disabled={loadingAction !== null}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === "activate" ? "Выдаём..." : "Выдать Pro"}
        </button>
      )}
    </div>
  );
}