import { Request, Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as notificationsService from '../services/notifications.service.js';

export const createNotificationSchema = z.object({
  type: z.enum(['CRITICAL', 'WARNING', 'INFO', 'critical', 'warning', 'info']),
  title: z.string().min(1),
  detail: z.string().optional(),
  targetView: z.string().optional(),
});

export async function getAll(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, 'User identification required', 401);
      return;
    }
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const result = await notificationsService.findForUser(userId, page, limit);
    sendPaginated(res, result.notifications, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch notifications';
    sendError(res, msg, 500);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const notification = await notificationsService.create(req.body);
    sendSuccess(res, notification, 'Notification sent', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create notification';
    sendError(res, msg, 400);
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    await notificationsService.markAsRead((req.params.id as string), userId);
    sendSuccess(res, { markedAsRead: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to mark as read';
    sendError(res, msg, 400);
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    await notificationsService.markAllAsRead(userId);
    sendSuccess(res, { markedAllAsRead: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to mark all as read';
    sendError(res, msg, 400);
  }
}

export async function getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    const count = await notificationsService.getUnreadCount(userId);
    sendSuccess(res, count);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to get unread count';
    sendError(res, msg, 500);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await notificationsService.remove((req.params.id as string));
    sendSuccess(res, { deleted: true }, 'Notification deleted');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete notification';
    sendError(res, msg, 400);
  }
}
