import { requireAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminBillingRefundButton } from "./AdminBillingRefundButton";

function formatDate(value: Date | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatAmount(amount: number, currency: string) {
  const normalizedCurrency = currency?.toUpperCase() || "RUB";

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function getPaymentStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Ожидает оплаты";
    case "AUTHORIZED":
      return "Авторизован";
    case "PAID":
      return "Оплачен";
    case "FAILED":
      return "Ошибка";
    case "CANCELED":
      return "Отменен";
    case "REFUNDED":
      return "Возврат";
    case "PARTIALLY_REFUNDED":
      return "Частичный возврат";
    default:
      return status;
  }
}

export default async function AdminBillingPage() {
  await requireAdminUser();

  const payments = await prisma.payment.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  const paidCount = payments.filter((payment) => payment.status === "PAID").length;
  const pendingCount = payments.filter(
    (payment) => payment.status === "PENDING" || payment.status === "AUTHORIZED"
  ).length;
  const refundedCount = payments.filter(
    (payment) =>
      payment.status === "REFUNDED" || payment.status === "PARTIALLY_REFUNDED"
  ).length;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Платежи
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Управление платежами AlfaPay, ручная проверка статусов и возвраты средств.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Всего платежей" value={String(payments.length)} />
        <StatCard title="Оплачено" value={String(paidCount)} />
        <StatCard title="Ожидают" value={String(pendingCount)} />
        <StatCard title="Возвраты" value={String(refundedCount)} />
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Платежи</h2>
          <div className="text-sm text-slate-500">Последние 100 операций</div>
        </div>

        {payments.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            Платежей пока нет.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="px-4 py-2 font-medium">Дата</th>
                  <th className="px-4 py-2 font-medium">Пользователь</th>
                  <th className="px-4 py-2 font-medium">План</th>
                  <th className="px-4 py-2 font-medium">Сумма</th>
                  <th className="px-4 py-2 font-medium">Статус</th>
                  <th className="px-4 py-2 font-medium">Провайдер</th>
                  <th className="px-4 py-2 font-medium">Заказ</th>
                  <th className="px-4 py-2 font-medium">Действие</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="rounded-2xl bg-slate-50 text-sm text-slate-700"
                  >
                    <td className="rounded-l-2xl px-4 py-4">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-4 py-4">{payment.user.email}</td>
                    <td className="px-4 py-4">{payment.planCode ?? "—"}</td>
                    <td className="px-4 py-4">
                      {formatAmount(payment.amount, payment.currency)}
                    </td>
                    <td className="px-4 py-4">
                      {getPaymentStatusLabel(payment.status)}
                    </td>
                    <td className="px-4 py-4">{payment.provider}</td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-500">
                      {payment.orderNumber}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4">
                      <AdminBillingRefundButton
                        paymentId={payment.id}
                        paymentStatus={payment.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}