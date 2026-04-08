import { prisma } from "@/lib/prisma";

type Params = {
  userId: string;
  q?: string;
  status?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export async function getDocumentsQuery(params: Params) {
  const {
    userId,
    q = "",
    status = "all",
    sort = "newest",
    page = 1,
    pageSize = 10,
  } = params;

  const where: any = {
    userId,
  };

  if (q.trim()) {
    where.name = {
      contains: q.trim(),
      mode: "insensitive",
    };
  }

  if (status === "analyzed") {
    where.analysis = {
      not: null,
    };
  }

  if (status === "not_analyzed") {
    where.analysis = null;
  }

  let orderBy: any = { createdAt: "desc" };

  if (sort === "oldest") {
    orderBy = { createdAt: "asc" };
  }

  if (sort === "name_asc") {
    orderBy = { name: "asc" };
  }

  if (sort === "name_desc") {
    orderBy = { name: "desc" };
  }

  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.document.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  return {
    items,
    total,
    totalPages,
    currentPage: safePage,
  };
}