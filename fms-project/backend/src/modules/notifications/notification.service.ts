import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";

interface CreateNotificationInput {
  userId: string;
  type: "NEW_REQUEST" | "APPROVAL_RESULT";
  message: string;
}

export async function pushNotification(input: CreateNotificationInput) {
  return prisma.notification.create({ data: input });
}

export async function listNotifications(userId: string, page: number, pageSize: number, unreadOnly: boolean) {
  const where = { userId, ...(unreadOnly && { isRead: false }) };
  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { items, total, page, pageSize, unreadCount };
}

export async function markAsRead(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new ApiError(404, "ERR-316", "Notification not found.");
  if (notification.userId !== userId) throw new ApiError(403, "ERR-204", "You do not have access to this notification.");
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}

export async function registerDeviceToken(userId: string, token: string, platform: string) {
  return prisma.deviceToken.upsert({
    where: { token },
    update: { userId, platform },
    create: { userId, token, platform },
  });
}

export async function unregisterDeviceToken(token: string) {
  await prisma.deviceToken.deleteMany({ where: { token } });
}
