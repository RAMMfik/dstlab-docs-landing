import { getUserLimits } from "@/lib/services/limit.service";
import { getUserUsage } from "@/lib/services/usage.service";

type GuardFeature = "documents" | "analyses" | "messages";

const FEATURE_LABELS: Record<GuardFeature, string> = {
  documents: "документов",
  analyses: "AI-анализов",
  messages: "сообщений",
};

export async function assertUsageWithinLimit(params: {
  userId: string;
  plan: string;
  feature: GuardFeature;
}) {
  const usage = await getUserUsage(params.userId);
  const limits = getUserLimits(params.plan);

  const usedKey = `${params.feature}Used` as const;
  const used = usage[usedKey];
  const limit = limits[params.feature];

  if (used >= limit) {
    return {
      ok: false as const,
      used,
      limit,
      feature: params.feature,
      message: `Достигнут лимит ${FEATURE_LABELS[params.feature]}. Обновите тариф.`,
    };
  }

  return {
    ok: true as const,
    used,
    limit,
    feature: params.feature,
  };
}