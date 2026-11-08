import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as reportsService from '../services/reports.service.js';

export const generateReportSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  format: z.enum(['PDF', 'CSV']).optional(),
  parameters: z.record(z.unknown()).optional(),
});

export const createScheduleSchema = z.object({
  reportType: z.string().min(1),
  cronExpr: z.string().min(1),
  recipients: z.record(z.unknown()).optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const type = req.query.type as string;
    const status = req.query.status as string;

    const result = await reportsService.findAll({ page, limit, type, status });
    sendPaginated(res, result.reports, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch reports';
    sendError(res, msg, 500);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const report = await reportsService.findById((req.params.id as string));
    sendSuccess(res, report);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Report not found';
    sendError(res, msg, 404);
  }
}

export async function generate(req: Request, res: Response): Promise<void> {
  try {
    const report = await reportsService.generate(req.body);
    sendSuccess(res, report, 'Report generated', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate report';
    sendError(res, msg, 400);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await reportsService.remove((req.params.id as string));
    sendSuccess(res, { deleted: true }, 'Report deleted');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete report';
    sendError(res, msg, 400);
  }
}

export async function getSchedules(_req: Request, res: Response): Promise<void> {
  try {
    const schedules = await reportsService.findSchedules();
    sendSuccess(res, schedules);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch schedules';
    sendError(res, msg, 500);
  }
}

export async function createSchedule(req: Request, res: Response): Promise<void> {
  try {
    const schedule = await reportsService.createSchedule(req.body);
    sendSuccess(res, schedule, 'Schedule created', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create schedule';
    sendError(res, msg, 400);
  }
}

export async function updateSchedule(req: Request, res: Response): Promise<void> {
  try {
    const schedule = await reportsService.updateSchedule((req.params.id as string), req.body);
    sendSuccess(res, schedule, 'Schedule updated');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update schedule';
    sendError(res, msg, 400);
  }
}

export async function removeSchedule(req: Request, res: Response): Promise<void> {
  try {
    await reportsService.removeSchedule((req.params.id as string));
    sendSuccess(res, { deleted: true }, 'Schedule deleted');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete schedule';
    sendError(res, msg, 400);
  }
}

export async function getTemplates(_req: Request, res: Response): Promise<void> {
  try {
    const templates = await reportsService.getTemplates();
    sendSuccess(res, templates);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch templates';
    sendError(res, msg, 500);
  }
}
