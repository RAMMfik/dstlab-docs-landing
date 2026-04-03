"use client";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/45 px-4">
      <div className="w-full max-w-md rounded-[28px] border border-[rgba(10,99,117,0.10)] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-2xl bg-[linear-gradient(135deg,#d92d20,#f04438)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Удаляем..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}