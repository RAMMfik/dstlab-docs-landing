"use client";

import { useCallback, useEffect, useState } from "react";

type BillingTariffOption = {
  code: string;
  title: string;
  monthlyPriceRub: number | null;
  yearlyPriceRub: number | null;
};

type BillingActionsProps = {
  latestPendingPaymentId: string | null;
  paidTariffs: BillingTariffOption[];
};

type CheckoutResponse = {
  success: boolean;
  message?: string;
  paymentId?: string;
  paymentUrl?: string;
};

type VerifyResponse = {
  success: boolean;
  message?: string;
  paymentId?: string;
  status?: string;
};

const AUTO_REFRESH_INTERVAL = 30000;

function formatTariffButtonLabel(
  tariff: BillingTariffOption,
  billingCycle: "MONTHLY" | "YEARLY"
) {
  if (billingCycle === "MONTHLY") {
    return tariff.monthlyPriceRub !== null
      ? `Оплатить ${tariff.title} · ${tariff.monthlyPriceRub} ₽/мес`
      : `Оплатить ${tariff.title} Monthly`;
  }

  return tariff.yearlyPriceRub !== null
    ? `Оплатить ${tariff.title} · ${tariff.yearlyPriceRub} ₽/год`
    : `Оплатить ${tariff.title} Yearly`;
}

export function BillingActions({
  latestPendingPaymentId,
  paidTariffs,
}: BillingActionsProps) {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const startCheckout = useCallback(
    async (planCode: string, billingCycle: "MONTHLY" | "YEARLY") => {
      try {
        setIsCheckoutLoading(true);
        setMessage(null);

        const response = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planCode,
            billingCycle,
          }),
        });

        const result = (await response.json()) as CheckoutResponse;

        if (!response.ok || !result.success || !result.paymentUrl) {
          setMessage(result.message ?? "Не удалось создать ссылку на оплату.");
          return;
        }

        window.location.href = result.paymentUrl;
      } catch {
        setMessage("Не удалось начать оплату. Попробуйте еще раз.");
      } finally {
        setIsCheckoutLoading(false);
      }
    },
    []
  );

  const syncPayment = useCallback(
    async (showMessage = true) => {
      if (!latestPendingPaymentId) {
        if (showMessage) {
          setMessage("Нет ожидающего платежа для проверки.");
        }
        return;
      }

      try {
        setIsVerifyLoading(true);

        const response = await fetch(
          `/api/billing/sync/${latestPendingPaymentId}`,
          {
            method: "POST",
          }
        );

        const result = (await response.json()) as VerifyResponse;

        if (!response.ok || !result.success) {
          if (showMessage) {
            setMessage(result.message ?? "Не удалось проверить статус платежа.");
          }
          return;
        }

        if (showMessage) {
          setMessage(`Текущий статус платежа: ${result.status ?? "UNKNOWN"}`);
        }

        if (
          result.status &&
          result.status !== "PENDING" &&
          result.status !== "AUTHORIZED"
        ) {
          window.location.reload();
        }
      } catch {
        if (showMessage) {
          setMessage("Ошибка проверки статуса. Попробуйте позже.");
        }
      } finally {
        setIsVerifyLoading(false);
      }
    },
    [latestPendingPaymentId]
  );

  useEffect(() => {
    if (!latestPendingPaymentId) {
      return;
    }

    const interval = setInterval(() => {
      void syncPayment(false);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [latestPendingPaymentId, syncPayment]);

  return (
    <div className="w-full max-w-sm rounded-[28px] border border-slate-200 bg-slate-50 p-5">
      <div className="text-sm font-semibold text-slate-900">
        Действия по биллингу
      </div>

      <div className="mt-4 grid gap-3">
        {paidTariffs.map((tariff) => (
          <div key={tariff.code} className="grid gap-3">
            {tariff.monthlyPriceRub !== null ? (
              <button
                type="button"
                onClick={() => void startCheckout(tariff.code, "MONTHLY")}
                disabled={isCheckoutLoading || isVerifyLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckoutLoading
                  ? "Создаем оплату..."
                  : formatTariffButtonLabel(tariff, "MONTHLY")}
              </button>
            ) : null}

            {tariff.yearlyPriceRub !== null ? (
              <button
                type="button"
                onClick={() => void startCheckout(tariff.code, "YEARLY")}
                disabled={isCheckoutLoading || isVerifyLoading}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckoutLoading
                  ? "Создаем оплату..."
                  : formatTariffButtonLabel(tariff, "YEARLY")}
              </button>
            ) : null}
          </div>
        ))}

        <button
          type="button"
          onClick={() => void syncPayment(true)}
          disabled={!latestPendingPaymentId || isCheckoutLoading || isVerifyLoading}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isVerifyLoading ? "Проверяем..." : "Проверить последний платеж"}
        </button>
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl bg-white p-3 text-sm leading-6 text-slate-600">
          {message}
        </div>
      ) : null}
    </div>
  );
}