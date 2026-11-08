import prisma from '../utils/prisma.js';
import { emitToAll } from '../socket/index.js';
import { SocketEvents } from '../types/index.js';

export async function findForUser(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  // Ensure any global notifications have user notification rows
  const unlinked = await prisma.notification.findMany({
    where: {
      userNotifications: { none: { userId } },
    },
  });

  if (unlinked.length > 0) {
    await prisma.userNotification.createMany({
      data: unlinked.map((n) => ({
        userId,
        notificationId: n.id,
        isRead: false,
      })),
      skipDuplicates: true,
    });
  }

  const [total, userNotifications] = await Promise.all([
    prisma.userNotification.count({ where: { userId } }),
    prisma.userNotification.findMany({
      where: { userId },
      skip,
      take: limit,
      include: { notification: true },
      orderBy: { notification: { createdAt: 'desc' } },
    }),
  ]);

  const items = userNotifications.map((un) => ({
    id: un.notification.id,
    type: un.notification.type.toLowerCase(),
    title: un.notification.title,
    detail: un.notification.detail,
    view: un.notification.targetView || 'alerts',
    read: un.isRead,
    createdAt: un.notification.createdAt,
  }));

  return { notifications: items, total, page, limit };
}

export async function create(data: {
  type: string;
  title: string;
  detail?: string;
  targetView?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      type: data.type.toUpperCase(),
      title: data.title,
      detail: data.detail,
      targetView: data.targetView,
    },
  });

  // Link to all active users
  const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
  if (users.length > 0) {
    await prisma.userNotification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        notificationId: notification.id,
        isRead: false,
      })),
    });
  }

  emitToAll(SocketEvents.NOTIFICATION_NEW, {
    id: notification.id,
    type: notification.type.toLowerCase(),
    title: notification.title,
    detail: notification.detail,
    view: notification.targetView || 'alerts',
    read: false,
    createdAt: notification.createdAt,
  });

  return notification;
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.userNotification.updateMany({
    where: { notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.userNotification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.userNotification.count({
    where: { userId, isRead: false },
  });
  return { unreadCount: count };
}

export async function remove(id: string) {
  return prisma.notification.delete({ where: { id } });
}
