import { prisma } from "../../config/db";

interface DashboardParams {
  requesterId: string;
  isAdmin: boolean;
}

function scopeFilter(isAdmin: boolean, requesterId: string) {
  return isAdmin ? {} : { requestedById: requesterId };
}

export async function getPendingRequestsSummary(params: DashboardParams) {
  const scope = scopeFilter(params.isAdmin, params.requesterId);

  const [fuelPending, periodicPending, generalPending] = await Promise.all([
    prisma.fuelRequest.count({ where: { ...scope, OR: [{ directApproval: "PENDING" }, { serviceApproval: "PENDING" }] } }),
    prisma.periodicMaintenanceRequest.count({ where: { ...scope, OR: [{ approvalL1: "PENDING" }, { approvalL2: "PENDING" }] } }),
    prisma.generalMaintenanceRequest.count({ where: { ...scope, OR: [{ approvalL1: "PENDING" }, { approvalL2: "PENDING" }] } }),
  ]);

  return {
    fuel: fuelPending,
    periodicMaintenance: periodicPending,
    generalMaintenance: generalPending,
    total: fuelPending + periodicPending + generalPending,
  };
}

export async function getFleetStatusBreakdown() {
  const grouped = await prisma.truck.groupBy({ by: ["status"], _count: { _all: true } });
  return grouped.map((g) => ({ status: g.status, count: g._count._all }));
}

export async function getTopCostTrucks(params: DashboardParams, limit = 10) {
  const where = { ...scopeFilter(params.isAdmin, params.requesterId), approvalL2: "APPROVED" as const };

  const grouped = await prisma.generalMaintenanceRequest.groupBy({
    by: ["truckId"],
    where,
    _sum: { estimatedCost: true },
    orderBy: { _sum: { estimatedCost: "desc" } },
    take: limit,
  });

  const truckIds = grouped.map((g) => g.truckId);
  const trucks = await prisma.truck.findMany({ where: { id: { in: truckIds } }, select: { id: true, name: true, plateNo: true } });
  const truckMap = new Map(trucks.map((t) => [t.id, t]));

  return grouped.map((g) => ({ truck: truckMap.get(g.truckId), totalCost: g._sum.estimatedCost ?? 0 }));
}

export async function getDashboardSummary(params: DashboardParams) {
  const [pending, fleetStatus, topCostTrucks] = await Promise.all([
    getPendingRequestsSummary(params),
    getFleetStatusBreakdown(),
    getTopCostTrucks(params),
  ]);
  return { pending, fleetStatus, topCostTrucks };
}
