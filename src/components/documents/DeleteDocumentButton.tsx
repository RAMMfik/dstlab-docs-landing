"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type DeleteDocumentButtonProps = {
  documentId: string;
  mode?: "list" | "details";
};

export function DeleteDocumentButton({
  documentId,
  mode = "list",
}: DeleteDocumentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка удаления");
      }

      setOpen(false);

      if (mode === "details") {
        router.push("/documents");
      } else {
        router.refresh();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className={
          mode === "details"
            ? "rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            : "text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
        }
      >
        {loading ? "Удаляем..." : "Удалить"}
      </button>

      <ConfirmModal
        open={open}
        title="Удалить документ?"
        description="Документ, AI-аудит, история чата и связанный файл будут удалены без возможности восстановления."
        confirmText="Удалить"
        cancelText="Отмена"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}