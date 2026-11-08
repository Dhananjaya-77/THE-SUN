import { Request, Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as alertsService from '../services/alerts.service.js';

export const createAlertSchema = z.object({
  siteId: z.string().optional(),
  severity: z.enum(['CRITICAL', 'WARNING', 'INFO']),
  title: z.string().min(1),
  detail: z.string().optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const severity = req.query.severity as 'CRITICAL' | 'WARNING' | 'INFO';
    const status = req.query.status as 'OPEN' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED';
    const siteId = req.query.siteId as string;
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const result = await alertsService.findAll({ page, limit, severity, status, siteId, from, to });
    sendPaginated(res, result.alerts, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch alerts';
    sendError(res, msg, 500);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const alert = await alertsService.findById((req.params.id as string));
    sendSuccess(res, alert);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Alert not found';
    sendError(res, msg, 404);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const alert = await alertsService.create(req.body);
    sendSuccess(res, alert, 'Alert created', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create alert';
    sendError(res, msg, 400);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const alert = await alertsService.update((req.params.id as string), req.body);
    sendSuccess(res, alert, 'Alert updated');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update alert';
    sendError(res, msg, 400);
  }
}

export async function acknowledge(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'operator';
    const alert = await alertsService.acknowledge((req.params.id as string), userId);
    sendSuccess(res, alert, 'Alert acknowledged');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to acknowledge alert';
    sendError(res, msg, 400);
  }
}

export async function resolve(req: Request, res: Response): Promise<void> {
  try {
    const alert = await alertsService.resolve((req.params.id as string));
    sendSuccess(res, alert, 'Alert resolved');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to resolve alert';
    sendError(res, msg, 400);
  }
}

export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await alertsService.getStats();
    sendSuccess(res, stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch alert stats';
    sendError(res, msg, 500);
  }
}

export async function getOpenAlerts(_req: Request, res: Response): Promise<void> {
  try {
    const openAlerts = await alertsService.getOpenAlerts();
    sendSuccess(res, openAlerts);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch open alerts';
    sendError(res, msg, 500);
  }
}
