import { prisma } from "@/lib/prisma";
import { getAvailablePlans, type PlanConfig } from "@/lib/services/plan.service";

type SyncTariffInput = PlanConfig & {
  sortOrder: number;
};

function planToTariffInput(plan: PlanConfig, sortOrder: number): SyncTariffInput {
  return {
    ...plan,
    sortOrder,
  };
}

export async function syncDefaultTariffs() {
  const plans = getAvailablePlans().map((plan, index) =>
    planToTariffInput(plan, index + 1)
  );

  for (const plan of plans) {
    await prisma.tariff.upsert({
      where: {
        code: plan.code,
      },
      update: {
        title: plan.title,
        marketingTitle: plan.marketingTitle,
        description: plan.description,
        monthlyPriceRub: plan.pricing.monthlyRub,
        yearlyPriceRub: plan.pricing.yearlyRub,
        documentsLimit: plan.limits.documents,
        analysesLimit: plan.limits.analyses,
        messagesLimit: plan.limits.messages,
        maxUploadSizeBytes: plan.limits.maxUploadSizeBytes,
        priorityAnalysis: plan.features.priorityAnalysis,
        teamsEnabled: plan.features.teams,
        apiAccessEnabled: plan.features.apiAccess,
        billingPortal: plan.features.billingPortal,
        storageDriver: plan.features.storageDriver,
        isActive: true,
        sortOrder: plan.sortOrder,
      },
      create: {
        code: plan.code,
        title: plan.title,
        marketingTitle: plan.marketingTitle,
        description: plan.description,
        monthlyPriceRub: plan.pricing.monthlyRub,
        yearlyPriceRub: plan.pricing.yearlyRub,
        documentsLimit: plan.limits.documents,
        analysesLimit: plan.limits.analyses,
        messagesLimit: plan.limits.messages,
        maxUploadSizeBytes: plan.limits.maxUploadSizeBytes,
        priorityAnalysis: plan.features.priorityAnalysis,
        teamsEnabled: plan.features.teams,
        apiAccessEnabled: plan.features.apiAccess,
        billingPortal: plan.features.billingPortal,
        storageDriver: plan.features.storageDriver,
        isActive: true,
        sortOrder: plan.sortOrder,
      },
    });
  }

  return getTariffs();
}

export async function getTariffs() {
  return prisma.tariff.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getActiveTariffs() {
  return prisma.tariff.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getTariffByCode(code: string) {
  return prisma.tariff.findUnique({
    where: {
      code,
    },
  });
}