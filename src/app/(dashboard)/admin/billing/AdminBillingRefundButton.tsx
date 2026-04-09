"use client";

import { useState } from "react";

type AdminBillingRefundButtonProps = {
  paymentId: string;
  paymentStatus: string;
};

type RefundResponse = {
  success: boolean;
  message?: string;
  paymentId?: string;
  status?: string;
};

export function AdminBillingRefundButton({
  paymentId,
  paymentStatus,
}: AdminBillingRefundButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const canRefund = paymentStatus === "PAID";

  async function handleRefund() {
    const confirmed = window.confirm(
      "Выполнить полный refund этого платежа?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/admin/billing/refund/${paymentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const result = (await response.json()) as RefundResponse;

      if (!response.ok || !result.success) {
        window.alert(result.message ?? "Не удалось выполнить refund.");
        return;
      }

      window.alert(`Refund выполнен. Новый статус: ${result.status ?? "UNKNOWN"}`);
      window.location.reload();
    } catch {
      window.alert("Ошибка refund. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleRefund()}
      disabled={!canRefund || isLoading}
      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? "Возврат..." : "Refund"}
    </button>
  );
}