import { prisma } from "@/lib/prisma";

export async function getAdminTariffs() {
  return prisma.tariff.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

type UpdateTariffInput = {
  id: string;
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

export async function updateTariff(input: UpdateTariffInput) {
  return prisma.tariff.update({
    where: {
      id: input.id,
    },
    data: {
      title: input.title,
      marketingTitle: input.marketingTitle,
      description: input.description,
      monthlyPriceRub: input.monthlyPriceRub,
      yearlyPriceRub: input.yearlyPriceRub,
      documentsLimit: input.documentsLimit,
      analysesLimit: input.analysesLimit,
      messagesLimit: input.messagesLimit,
      maxUploadSizeBytes: input.maxUploadSizeBytes,
      priorityAnalysis: input.priorityAnalysis,
      billingPortal: input.billingPortal,
      storageDriver: input.storageDriver,
      isActive: input.isActive,
    },
  });
}