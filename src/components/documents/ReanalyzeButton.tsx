"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiErrorAlert } from "@/components/ui/ApiErrorAlert";
import { LoadingButton } from "@/components/ui/LoadingButton";

type ReanalyzeButtonProps = {
  documentId: string;
  label?: string;
  loadingText?: string;
};

export function ReanalyzeButton({
  documentId,
  label = "Запустить анализ заново",
  loadingText = "Переанализируем...",
}: ReanalyzeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
        }),
      });

      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};

      if (!res.ok) {
        throw new Error(data?.error || "Ошибка анализа");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <LoadingButton
        loading={loading}
        onClick={handleAnalyze}
        loadingText={loadingText}
      >
        {label}
      </LoadingButton>

      <ApiErrorAlert message={error} />
    </div>
  );
}