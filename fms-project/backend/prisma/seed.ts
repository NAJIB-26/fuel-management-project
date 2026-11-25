import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const ERROR_CODES = [
  { code: "ERR-001", description: "Invalid input data submitted.", solution: "Check required fields and data formats, then resubmit." },
  { code: "ERR-002", description: "Refresh token missing.", solution: "Log in again to obtain a new session." },
  { code: "ERR-003", description: "Invalid password change data.", solution: "Ensure new password and confirmation match and meet length requirements." },
  { code: "ERR-101", description: "Authentication token missing.", solution: "Include a valid Bearer token in the Authorization header." },
  { code: "ERR-102", description: "User inactive or not found.", solution: "Contact your system administrator." },
  { code: "ERR-103", description: "Invalid or expired token.", solution: "Log in again to refresh your session." },
  { code: "ERR-104", description: "Too many login attempts.", solution: "Wait 15 minutes before trying again." },
  { code: "ERR-105", description: "Invalid username or password.", solution: "Verify credentials and try again." },
  { code: "ERR-106", description: "Account suspended.", solution: "Contact your system administrator." },
  { code: "ERR-107", description: "User not found.", solution: "Verify the user record exists." },
  { code: "ERR-108", description: "Previous password incorrect.", solution: "Re-enter your current password correctly." },
  { code: "ERR-109", description: "Username already exists.", solution: "Choose a different username." },
  { code: "ERR-201", description: "No permissions assigned.", solution: "Ask an administrator to assign permissions." },
  { code: "ERR-202", description: "Insufficient permissions for this action.", solution: "Request the required permission from your administrator." },
  { code: "ERR-203", description: "System administrator access required.", solution: "This action is restricted to system administrators." },
  { code: "ERR-204", description: "No access to this request.", solution: "You can only view requests you created, unless you are an administrator." },
  { code: "ERR-205", description: "Access to this screen is not permitted.", solution: "Ask your system administrator to grant screen access." },
  { code: "ERR-301", description: "Truck not found.", solution: "Verify the truck ID or plate number." },
  { code: "ERR-302", description: "Plate number already registered.", solution: "Use a unique plate number." },
  { code: "ERR-303", description: "Truck has transaction history.", solution: "Set the truck status to SOLD instead of deleting it." },
  { code: "ERR-304", description: "Truck is not active.", solution: "Only active trucks can be used for new requests." },
  { code: "ERR-305", description: "Odometer reading is less than the last recorded reading.", solution: "Verify the current odometer value." },
  { code: "ERR-306", description: "Fuel request not found.", solution: "Verify the request ID." },
  { code: "ERR-307", description: "Request already has an approval decision.", solution: "Revoke existing approvals before editing." },
  { code: "ERR-308", description: "No maintenance limit configured for this type on this truck.", solution: "Configure the maintenance limit on the truck's asset screen first." },
  { code: "ERR-309", description: "Periodic maintenance request not found.", solution: "Verify the request ID." },
  { code: "ERR-310", description: "Level 1 approval required before Level 2.", solution: "Obtain Level 1 approval first." },
  { code: "ERR-311", description: "General maintenance request not found.", solution: "Verify the request ID." },
  { code: "ERR-312", description: "Estimated cost exceeds your financial approval limit.", solution: "Escalate to an approver with a higher financial limit." },
  { code: "ERR-313", description: "Unit not found.", solution: "Verify the unit ID." },
  { code: "ERR-316", description: "Notification not found.", solution: "Verify the notification ID." },
  { code: "ERR-317", description: "Employee number already in use.", solution: "Choose a different, unused employee number." },
  { code: "ERR-500", description: "Internal server error.", solution: "Retry the operation; contact support if it persists." },
];

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 12);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      fullName: "System Administrator",
      jobLevel: "Manager",
      department: "IT",
      username: "admin",
      passwordHash: adminPasswordHash,
      permissions: {
        create: {
          isSystemAdmin: true,
          canAdd: true, canEdit: true, canPrint: true, canViewReports: true,
          canApproveLevel1: true, canApproveLevel2: true,
          tabPermissions: ["config", "transactions", "reports"],
          screenPermissions: [
            "company", "users", "trucks", "units", "permissions", "codes",
            "fuel-requests", "periodic-maintenance", "general-maintenance",
            "dashboard", "audit-log",
          ],
        },
      },
    },
  });

  const driverPasswordHash = await bcrypt.hash("Driver@12345", 12);
  await prisma.user.upsert({
    where: { username: "driver1" },
    update: {},
    create: {
      fullName: "Ahmed Ali",
      jobLevel: "Driver",
      department: "Operations",
      username: "driver1",
      passwordHash: driverPasswordHash,
      permissions: {
        create: {
          canAdd: true, canPrint: true,
          tabPermissions: ["transactions"],
          screenPermissions: ["fuel-requests", "periodic-maintenance", "general-maintenance"],
        },
      },
    },
  });

  const truck = await prisma.truck.upsert({
    where: { plateNo: "ABC-1234" },
    update: {},
    create: {
      name: "شاحنة رقم 1",
      model: "Volvo FH16",
      yearMade: 2022,
      plateNo: "ABC-1234",
      tankCapacityLiters: 400,
      fuelType: "DIESEL",
      engineOilType: "15W-40",
      status: "ACTIVE",
    },
  });

  const limits: Record<string, number> = {
    ENGINE_OIL: 8000, GEARBOX_OIL: 40000, DIFFERENTIAL_OIL: 40000, POWER_STEERING_OIL: 60000,
    BRAKE_PAD: 30000, OIL_FILTER: 8000, DIESEL_FILTER: 15000, DIESEL_FILTER_METAL: 20000,
    AIR_FILTER: 20000, RADIATOR_WATER: 40000, TIRES: 60000, WASHING: 1000, PERIODIC_INSPECTION: 12000,
  };
  for (const [kind, limitKm] of Object.entries(limits)) {
    await prisma.truckMaintenanceLimit.upsert({
      where: { truckId_kind: { truckId: truck.id, kind: kind as any } },
      update: { limitKm },
      create: { truckId: truck.id, kind: kind as any, limitKm },
    });
  }

  await prisma.unit.createMany({
    data: [{ description: "كيلومتر" }, { description: "لتر" }, { description: "قطعة" }],
    skipDuplicates: true,
  });

  const periodicTypes = [
    "تغيير زيت", "تغيير زيت جير", "تغيير زيت اسبيت", "تغيير زيت سكان",
    "تغيير سم بريك", "تغيير فلتر زيت", "تغيير فلتر ديزل", "تغيير فلتر ديزل حديد",
    "تغيير فلتر هواء", "تغيير ماء اديتر", "تغيير كفرات", "عمل غسيل",
  ];
  const generalTypes = [
    "تغيير قماشات بريك", "تغيير بلاكات مكينة", "تغيير بطارية",
    "صيانة ميكانيك", "صيانة ميزان", "صيانة كهرباء", "صيانة سمكرة", "أخرى",
  ];
  for (const name of periodicTypes) {
    await prisma.maintenanceTypeCode.create({ data: { name, category: "PERIODIC" } }).catch(() => {});
  }
  for (const name of generalTypes) {
    await prisma.maintenanceTypeCode.create({ data: { name, category: "GENERAL" } }).catch(() => {});
  }

  await prisma.vendor.createMany({
    data: [
      { name: "محطة الوقود المركزية", type: "FUEL_STATION", address: "Riyadh" },
      { name: "ورشة الصيانة الشاملة", type: "WORKSHOP", address: "Riyadh" },
    ],
    skipDuplicates: true,
  });

  for (const ec of ERROR_CODES) {
    await prisma.errorCode.upsert({ where: { code: ec.code }, update: {}, create: ec });
  }

  console.log("Seed complete. Login: admin / Admin@12345  |  driver1 / Driver@12345");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
