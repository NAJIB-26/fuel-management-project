import { prisma } from "../../config/db";
import { Prisma } from "@prisma/client";

interface AuditQueryParams {
  page: number;
  pageSize: number;
  entityType?: string;
}

export async function listAuditLogs(params: AuditQueryParams) {
  const where: Prisma.AuditLogWhereInput = { ...(params.entityType && { entityType: params.entityType }) };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { fullName: true, username: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total, page: params.page, pageSize: params.pageSize };
}
