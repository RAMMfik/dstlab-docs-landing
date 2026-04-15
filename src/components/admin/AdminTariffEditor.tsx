"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminTariffEditorProps = {
  tariff: {
    id: string;
    code: string;
    title: string;
    marketingTitle: string;
    description: string;
    monthlyPriceRub: number | null;
    yearlyPriceRub: number | null;
    documentsLimit: number;
    analysesLimit: number;
    messagesLimit: number;
    maxUploadSizeBytes: number;
    priorityAnalysis: boolean;
    billingPortal: boolean;
    storageDriver: string;
    isActive: boolean;
  };
};

export function AdminTariffEditor({ tariff }: AdminTariffEditorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(tariff.title);
  const [marketingTitle, setMarketingTitle] = useState(tariff.marketingTitle);
  const [description, setDescription] = useState(tariff.description);
  const [monthlyPriceRub, setMonthlyPriceRub] = useState(
    tariff.monthlyPriceRub?.toString() ?? ""
  );
  const [yearlyPriceRub, setYearlyPriceRub] = useState(
    tariff.yearlyPriceRub?.toString() ?? ""
  );
  const [documentsLimit, setDocumentsLimit] = useState(
    String(tariff.documentsLimit)
  );
  const [analysesLimit, setAnalysesLimit] = useState(
    String(tariff.analysesLimit)
  );
  const [messagesLimit, setMessagesLimit] = useState(
    String(tariff.messagesLimit)
  );
  const [maxUploadSizeBytes, setMaxUploadSizeBytes] = useState(
    String(tariff.maxUploadSizeBytes)
  );
  const [priorityAnalysis, setPriorityAnalysis] = useState(
    tariff.priorityAnalysis
  );
  const [billingPortal, setBillingPortal] = useState(tariff.billingPortal);
  const [storageDriver, setStorageDriver] = useState(tariff.storageDriver);
  const [isActive, setIsActive] = useState(tariff.isActive);

  async function handleSave() {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/tariffs/${tariff.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          marketingTitle,
          description,
          monthlyPriceRub: monthlyPriceRub === "" ? null : Number(monthlyPriceRub),
          yearlyPriceRub: yearlyPriceRub === "" ? null : Number(yearlyPriceRub),
          documentsLimit: Number(documentsLimit),
          analysesLimit: Number(analysesLimit),
          messagesLimit: Number(messagesLimit),
          maxUploadSizeBytes: Number(maxUploadSizeBytes),
          priorityAnalysis,
          billingPortal,
          storageDriver,
          isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        window.alert(result.message || "Не удалось обновить тариф");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      window.alert("Ошибка при сохранении тарифа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Редактировать
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Редактирование тарифа
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Код тарифа: {tariff.code}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Название">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Marketing title">
                <input
                  value={marketingTitle}
                  onChange={(e) => setMarketingTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Цена в месяц, ₽">
                <input
                  value={monthlyPriceRub}
                  onChange={(e) => setMonthlyPriceRub(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Цена в год, ₽">
                <input
                  value={yearlyPriceRub}
                  onChange={(e) => setYearlyPriceRub(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Лимит документов">
                <input
                  value={documentsLimit}
                  onChange={(e) => setDocumentsLimit(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Лимит анализов">
                <input
                  value={analysesLimit}
                  onChange={(e) => setAnalysesLimit(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Лимит сообщений">
                <input
                  value={messagesLimit}
                  onChange={(e) => setMessagesLimit(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Макс. размер файла, байт">
                <input
                  value={maxUploadSizeBytes}
                  onChange={(e) => setMaxUploadSizeBytes(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                />
              </Field>

              <Field label="Storage driver">
                <select
                  value={storageDriver}
                  onChange={(e) => setStorageDriver(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                >
                  <option value="local">local</option>
                  <option value="s3-ready">s3-ready</option>
                </select>
              </Field>
            </div>

            <Field label="Описание" className="mt-4">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[110px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              />
            </Field>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <CheckboxRow
                label="Активен"
                checked={isActive}
                onChange={setIsActive}
              />
              <CheckboxRow
                label="Приоритетный анализ"
                checked={priorityAnalysis}
                onChange={setPriorityAnalysis}
              />
              <CheckboxRow
                label="Billing portal"
                checked={billingPortal}
                onChange={setBillingPortal}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
              >
                {loading ? "Сохраняем..." : "Сохранить изменения"}
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}