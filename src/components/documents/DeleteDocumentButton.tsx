"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Удалить документ, его анализ и всю историю чата?"
    );

    if (!confirmed) return;

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
    <button
      onClick={handleDelete}
      disabled={loading}
      className={
        mode === "details"
          ? "rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          : "text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
      }
    >
      {loading ? "Удаляем..." : "Удалить"}
    </button>
  );
}