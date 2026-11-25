import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { Prisma } from "@prisma/client";

export async function createFuelRequest(data: any, userId: string, department: string) {
  const truck = await prisma.truck.findUnique({ where: { id: data.truckId } });
  if (!truck) throw new ApiError(404, "ERR-301", "Truck not found.");
  if (truck.status !== "ACTIVE") throw new ApiError(409, "ERR-304", "Truck is not active.");

  const previousOdometer = truck.lastFuelOdometer ?? new Prisma.Decimal(0);
  if (data.currentOdometer < Number(previousOdometer)) {
    throw new ApiError(400, "ERR-305", `Current odometer (${data.currentOdometer}) cannot be less than last reading (${previousOdometer}).`);
  }

  const odometerDiff = new Prisma.Decimal(data.currentOdometer).minus(previousOdometer);
  const consumptionRate = odometerDiff.dividedBy(data.requestedQuantity);
  const totalAmount = new Prisma.Decimal(data.requestedQuantity).mul(data.unitPrice ?? 0);

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.fuelRequest.create({
      data: {
        requestedById: userId,
        department,
        truckId: data.truckId,
        fuelType: data.fuelType,
        requestedQuantity: data.requestedQuantity,
        unit: data.unit,
        unitPrice: data.unitPrice,
        totalAmount,
        currentOdometer: data.currentOdometer,
        previousOdometer,
        odometerDiff,
        consumptionRate,
        date: data.date ?? undefined,
        attachmentUrl: data.attachmentUrl,
      },
      include: { truck: true, requestedBy: { select: { id: true, fullName: true } } },
    });

    await tx.truck.update({ where: { id: data.truckId }, data: { lastFuelOdometer: data.currentOdometer } });
    await tx.auditLog.create({ data: { userId, action: "CREATE", entityType: "FuelRequest", entityId: created.id, newValues: created as any } });
    return created;
  });

  return request;
}

export async function getFuelRequestById(id: string, requesterId: string, isAdmin: boolean) {
  const request = await prisma.fuelRequest.findUnique({
    where: { id },
    include: { truck: true, requestedBy: { select: { id: true, fullName: true } } },
  });
  if (!request) throw new ApiError(404, "ERR-306", "Fuel request not found.");
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

export async function listFuelRequests(params: ListParams, requesterId: string, isAdmin: boolean) {
  const where: Prisma.FuelRequestWhereInput = {
    ...(!isAdmin && { requestedById: requesterId }),
    ...(params.dateFrom && params.dateTo && { date: { gte: params.dateFrom, lte: params.dateTo } }),
    ...(params.approvalStatus !== "ALL" && {
      OR: [{ directApproval: params.approvalStatus }, { serviceApproval: params.approvalStatus }],
    }),
  };

  const [items, total, aggregates] = await Promise.all([
    prisma.fuelRequest.findMany({
      where,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      orderBy: { date: "desc" },
      include: { truck: { select: { name: true, plateNo: true } }, requestedBy: { select: { fullName: true } } },
    }),
    prisma.fuelRequest.count({ where }),
    prisma.fuelRequest.aggregate({ where, _sum: { requestedQuantity: true, odometerDiff: true, totalAmount: true } }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totals: {
      requestedQuantity: aggregates._sum.requestedQuantity ?? 0,
      odometerDiff: aggregates._sum.odometerDiff ?? 0,
      totalAmount: aggregates._sum.totalAmount ?? 0,
    },
  };
}

export async function approveFuelRequest(
  id: string,
  level: "DIRECT" | "SERVICE",
  status: "APPROVED" | "REJECTED" | "PENDING",
  approverId: string
) {
  const request = await prisma.fuelRequest.findUnique({ where: { id } });
  if (!request) throw new ApiError(404, "ERR-306", "Fuel request not found.");

  const field = level === "DIRECT" ? "directApproval" : "serviceApproval";

  const updated = await prisma.fuelRequest.update({ where: { id }, data: { [field]: status } });

  await prisma.auditLog.create({
    data: { userId: approverId, action: `APPROVAL_${level}_${status}`, entityType: "FuelRequest", entityId: id },
  });

  return updated;
}
