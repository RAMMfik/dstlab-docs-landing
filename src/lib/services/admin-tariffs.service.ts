import { prisma } from "@/lib/prisma";

export async function getAdminTariffs() {
  return prisma.tariff.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}