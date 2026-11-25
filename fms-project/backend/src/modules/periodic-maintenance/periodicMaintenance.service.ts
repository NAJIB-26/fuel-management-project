import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { Prisma } from "@prisma/client";

export async function createPeriodicRequest(data: any, userId: string, department: string) {
  const truck = await prisma.truck.findUnique({ where: { id: data.truckId } });
  if (!truck) throw new ApiError(404, "ERR-301", "Truck not found.");
  if (truck.status !== "ACTIVE") throw new ApiError(409, "ERR-304", "Truck is not active.");

  const limit = await prisma.truckMaintenanceLimit.findUnique({
    where: { truckId_kind: { truckId: data.truckId, kind: data.kind } },
  });
  if (!limit) throw new ApiError(404, "ERR-308", `No maintenance limit configured for ${data.kind} on this truck.`);

  const lastOdometer = limit.lastOdometer ?? new Prisma.Decimal(0);
  if (data.currentOdometer < Number(lastOdometer)) {
    throw new ApiError(400, "ERR-305", `Current odometer (${data.currentOdometer}) cannot be less than last maintenance reading (${lastOdometer}).`);
  }

  const odometerDiff = new Prisma.Decimal(data.currentOdometer).minus(lastOdometer);
  const withinLimit = odometerDiff.lessThanOrEqualTo(limit.limitKm);

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.periodicMaintenanceRequest.create({
      data: {
        requestedById: userId,
        department,
        truckId: data.truckId,
        kind: data.kind,
        currentOdometer: data.currentOdometer,
        lastOdometer,
        odometerDiff,
        quantity: data.quantity,
        unit: data.unit,
        withinLimit,
        date: data.date ?? undefined,
      },
      include: { truck: true, requestedBy: { select: { id: true, fullName: true } } },
    });

    await tx.truckMaintenanceLimit.update({
      where: { truckId_kind: { truckId: data.truckId, kind: data.kind } },
      data: { lastOdometer: data.currentOdometer },
    });

    await tx.auditLog.create({
      data: { userId, action: "CREATE", entityType: "PeriodicMaintenanceRequest", entityId: created.id, newValues: created as any },
    });

    return created;
  });

  return request;
}

export async function getPeriodicRequestById(id: string, requesterId: string, isAdmin: boolean) {
  const request = await prisma.periodicMaintenanceRequest.findUnique({
    where: { id },
    include: { truck: true, requestedBy: { select: { id: true, fullName: true } } },
  });
  if (!request) throw new ApiError(404, "ERR-309", "Periodic maintenance request not found.");
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

export async function listPeriodicRequests(params: ListParams, requesterId: string, isAdmin: boolean) {
  const where: Prisma.PeriodicMaintenanceRequestWhereInput = {
    ...(!isAdmin && { requestedById: requesterId }),
    ...(params.dateFrom && params.dateTo && { date: { gte: params.dateFrom, lte: params.dateTo } }),
    ...(params.approvalStatus !== "ALL" && {
      OR: [{ approvalL1: params.approvalStatus }, { approvalL2: params.approvalStatus }],
    }),
  };

  const [items, total, aggregates] = await Promise.all([
    prisma.periodicMaintenanceRequest.findMany({
      where,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      orderBy: { date: "desc" },
      include: { truck: { select: { name: true, plateNo: true } }, requestedBy: { select: { fullName: true } } },
    }),
    prisma.periodicMaintenanceRequest.count({ where }),
    prisma.periodicMaintenanceRequest.aggregate({ where, _sum: { quantity: true, odometerDiff: true } }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totals: { quantity: aggregates._sum.quantity ?? 0, odometerDiff: aggregates._sum.odometerDiff ?? 0 },
  };
}

export async function approvePeriodicRequest(
  id: string,
  level: "L1" | "L2",
  status: "APPROVED" | "REJECTED" | "PENDING",
  approverId: string
) {
  const request = await prisma.periodicMaintenanceRequest.findUnique({ where: { id } });
  if (!request) throw new ApiError(404, "ERR-309", "Periodic maintenance request not found.");

  if (level === "L2" && request.approvalL1 !== "APPROVED") {
    throw new ApiError(409, "ERR-310", "Level 1 approval required before Level 2.");
  }

  const field = level === "L1" ? "approvalL1" : "approvalL2";
  const updated = await prisma.periodicMaintenanceRequest.update({ where: { id }, data: { [field]: status } });

  await prisma.auditLog.create({
    data: { userId: approverId, action: `APPROVAL_${level}_${status}`, entityType: "PeriodicMaintenanceRequest", entityId: id },
  });

  return updated;
}
