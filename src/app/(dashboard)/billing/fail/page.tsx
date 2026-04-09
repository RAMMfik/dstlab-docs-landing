export default function BillingFailPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Оплата не завершена
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Платежный сценарий был прерван или завершился неуспешно. Подписка не
          изменилась.
        </p>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-3xl bg-slate-50 p-5">
          <div className="text-lg font-bold text-slate-900">
            Можно попробовать снова
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Вернитесь в биллинг, проверьте выбранный тариф и запустите оплату еще
            раз.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/dashboard/billing"
            className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Вернуться в биллинг
          </a>
        </div>
      </div>
    </div>
  );
}