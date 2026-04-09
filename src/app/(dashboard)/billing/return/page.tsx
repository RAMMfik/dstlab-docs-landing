"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyResponse = {
  success: boolean;
  message?: string;
  paymentId?: string;
  orderNumber?: string;
  status?: string;
  isTerminal?: boolean;
  currentPeriodEnd?: string | null;
  gateway?: {
    status?: string | null;
    statusCode?: number | null;
    actionCode?: number | null;
    clientMessage?: string | null;
  };
};

type VerifyState = "idle" | "loading" | "success" | "pending" | "failed" | "error";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function BillingReturnPage() {
  const searchParams = useSearchParams();

  const paymentId = searchParams.get("paymentId") ?? "";
  const orderNumber = searchParams.get("orderNumber") ?? "";
  const gatewayOrderId = searchParams.get("orderId") ?? searchParams.get("mdOrder") ?? "";

  const [state, setState] = useState<VerifyState>("idle");
  const [data, setData] = useState<VerifyResponse | null>(null);

  const payload = useMemo(
    () => ({
      paymentId: paymentId || undefined,
      orderNumber: orderNumber || undefined,
      gatewayOrderId: gatewayOrderId || undefined,
    }),
    [gatewayOrderId, orderNumber, paymentId]
  );

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      if (!payload.paymentId && !payload.orderNumber && !payload.gatewayOrderId) {
        setState("error");
        setData({
          success: false,
          message:
            "Не удалось определить платеж. Откройте страницу биллинга и проверьте статус вручную.",
        });
        return;
      }

      setState("loading");

      try {
        const response = await fetch("/api/billing/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = (await response.json()) as VerifyResponse;

        if (cancelled) return;

        setData(result);

        if (!response.ok || !result.success) {
          setState("error");
          return;
        }

        if (result.status === "PAID") {
          setState("success");
          return;
        }

        if (result.status === "PENDING" || result.status === "AUTHORIZED") {
          setState("pending");
          return;
        }

        if (
          result.status === "FAILED" ||
          result.status === "CANCELED" ||
          result.status === "REFUNDED" ||
          result.status === "PARTIALLY_REFUNDED"
        ) {
          setState("failed");
          return;
        }

        setState("pending");
      } catch {
        if (cancelled) return;

        setState("error");
        setData({
          success: false,
          message: "Не удалось проверить статус платежа. Попробуйте обновить страницу позже.",
        });
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [payload]);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Проверка оплаты
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          После возврата из платежного шлюза мы перепроверяем реальный статус
          платежа и только после этого обновляем подписку.
        </p>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        {state === "loading" || state === "idle" ? (
          <StatusBlock
            title="Проверяем платеж"
            text="Подтягиваем актуальный статус оплаты из платежного шлюза."
          />
        ) : null}

        {state === "success" ? (
          <StatusBlock
            title="Оплата подтверждена"
            text="Подписка активирована. Доступ к платным возможностям обновлен."
          />
        ) : null}

        {state === "pending" ? (
          <StatusBlock
            title="Платеж еще обрабатывается"
            text="Webhook мог еще не дойти. Статус можно повторно проверить чуть позже на странице биллинга."
          />
        ) : null}

        {state === "failed" ? (
          <StatusBlock
            title="Оплата не завершена"
            text="Платеж не был подтвержден. Можно попробовать повторить оплату из раздела биллинга."
          />
        ) : null}

        {state === "error" ? (
          <StatusBlock
            title="Не удалось проверить статус"
            text={data?.message ?? "Произошла ошибка при проверке платежа."}
          />
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoBox title="Локальный статус" value={data?.status ?? "—"} />
          <InfoBox title="Номер заказа" value={data?.orderNumber ?? orderNumber || "—"} />
          <InfoBox
            title="Статус в gateway"
            value={data?.gateway?.status ?? "—"}
          />
          <InfoBox
            title="Период активен до"
            value={formatDate(data?.currentPeriodEnd)}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/dashboard/billing"
            className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Вернуться в биллинг
          </a>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Проверить еще раз
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <div className="text-lg font-bold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-2 text-base font-bold text-slate-900">{value}</div>
    </div>
  );
}