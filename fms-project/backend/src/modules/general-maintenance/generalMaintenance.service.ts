import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { Prisma } from "@prisma/client";

export async function createGeneralRequest(data: any, userId: string, department: string) {
  const truck = await prisma.truck.findUnique({ where: { id: data.truckId } });
  if (!truck) throw new ApiError(404, "ERR-301", "Truck not found.");

  const lastOdometer = truck.lastFuelOdometer ?? new Prisma.Decimal(0);
  if (data.currentOdometer < Number(lastOdometer)) {
    throw new ApiError(400, "ERR-305", `Current odometer (${data.currentOdometer}) cannot be less than last recorded reading (${lastOdometer}).`);
  }

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.generalMaintenanceRequest.create({
      data: {
        requestedById: userId,
        department,
        truckId: data.truckId,
        currentOdometer: data.currentOdometer,
        lastOdometer,
        faultType: data.faultType,
        faultDescription: data.faultDescription,
        estimatedCost: data.estimatedCost,
        requiredParts: data.requiredParts,
        date: data.date ?? undefined,
        attachmentUrl: data.attachmentUrl,
      },
      include: { truck: true, requestedBy: { select: { id: true, fullName: true } } },
    });

    await tx.auditLog.create({
      data: { userId, action: "CREATE", entityType: "GeneralMaintenanceRequest", entityId: created.id, newValues: created as any },
    });

    return created;
  });

  return request;
}

export async function getGeneralRequestById(id: string, requesterId: string, isAdmin: boolean) {
  const request = await prisma.generalMaintenanceRequest.findUnique({
    where: { id },
    include: { truck: true, requestedBy: { select: { id: true, fullName: true } } },
  });
  if (!request) throw new ApiError(404, "ERR-311", "General maintenance request not found.");
  if (!isAdmin && request.requestedById !== requesterId) {
    throw new ApiError(403, "ERR-204", "You do not have access to this request.");
  }
  return request;
}

interface ListParams {
  page: number;
  pageSize: number;
  dateFrom?: Date;
  dateTo?: Date;
  approvalStatus: "APPROVED" | "REJECTED" | "PENDING" | "ALL";
}

export async function listGeneralRequests(params: ListParams, requesterId: string, isAdmin: boolean) {
  const where: Prisma.GeneralMaintenanceRequestWhereInput = {
    ...(!isAdmin && { requestedById: requesterId }),
    ...(params.dateFrom && params.dateTo && { date: { gte: params.dateFrom, lte: params.dateTo } }),
    ...(params.approvalStatus !== "ALL" && {
      OR: [{ approvalL1: params.approvalStatus }, { approvalL2: params.approvalStatus }],
    }),
  };

  const [items, total, aggregates] = await Promise.all([
    prisma.generalMaintenanceRequest.findMany({
      where,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      orderBy: { date: "desc" },
      include: { truck: { select: { name: true, plateNo: true } }, requestedBy: { select: { fullName: true } } },
    }),
    prisma.generalMaintenanceRequest.count({ where }),
    prisma.generalMaintenanceRequest.aggregate({ where, _sum: { estimatedCost: true } }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totals: { estimatedCost: aggregates._sum.estimatedCost ?? 0 },
  };
}

export async function approveGeneralRequest(
  id: string,
  level: "L1" | "L2",
  status: "APPROVED" | "REJECTED" | "PENDING",
  approverId: string
) {
  const request = await prisma.generalMaintenanceRequest.findUnique({ where: { id } });
  if (!request) throw new ApiError(404, "ERR-311", "General maintenance request not found.");

  if (level === "L2" && request.approvalL1 !== "APPROVED") {
    throw new ApiError(409, "ERR-310", "Level 1 approval required before Level 2.");
  }

  if (level === "L2" && status === "APPROVED") {
    const permission = await prisma.permission.findUnique({ where: { userId: approverId } });
    const limit = permission?.financialApprovalLimit;
    if (limit != null && Number(request.estimatedCost) > Number(limit)) {
      throw new ApiError(403, "ERR-312", `Estimated cost (${request.estimatedCost}) exceeds your financial approval limit (${limit}).`);
    }
  }

  const field = level === "L1" ? "approvalL1" : "approvalL2";
  const updated = await prisma.generalMaintenanceRequest.update({ where: { id }, data: { [field]: status } });

  await prisma.auditLog.create({
    data: { userId: approverId, action: `APPROVAL_${level}_${status}`, entityType: "GeneralMaintenanceRequest", entityId: id },
  });

  return updated;
}
