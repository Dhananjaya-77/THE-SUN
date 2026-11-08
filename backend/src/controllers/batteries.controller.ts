import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import * as batteriesService from '../services/batteries.service.js';

export const createBatterySchema = z.object({
  siteId: z.string().min(1),
  name: z.string().min(1),
  capacityKwh: z.number().positive(),
  maxPowerKw: z.number().positive(),
  socPercent: z.number().min(0).max(100).optional(),
  sohPercent: z.number().min(0).max(100).optional(),
  temperatureC: z.number().optional(),
});

export const updateBatterySchema = z.object({
  socPercent: z.number().min(0).max(100).optional(),
  sohPercent: z.number().min(0).max(100).optional(),
  temperatureC: z.number().optional(),
  status: z.enum(['AVAILABLE', 'CHARGING', 'DISCHARGING', 'OFFLINE', 'MAINTENANCE']).optional(),
});

export const createScheduleSchema = z.object({
  batteryId: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  action: z.string().min(1),
  powerKw: z.number().positive(),
});

export async function getAll(_req: Request, res: Response): Promise<void> {
  try {
    const batteries = await batteriesService.findAll();
    sendSuccess(res, batteries);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch batteries';
    sendError(res, msg, 500);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const battery = await batteriesService.findById((req.params.id as string));
    sendSuccess(res, battery);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Battery not found';
    sendError(res, msg, 404);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const battery = await batteriesService.create(req.body);
    sendSuccess(res, battery, 'Battery created', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create battery';
    sendError(res, msg, 400);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const battery = await batteriesService.update((req.params.id as string), req.body);
    sendSuccess(res, battery, 'Battery updated');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update battery';
    sendError(res, msg, 400);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await batteriesService.remove((req.params.id as string));
    sendSuccess(res, { deleted: true }, 'Battery deleted');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete battery';
    sendError(res, msg, 400);
  }
}

export async function getSchedules(req: Request, res: Response): Promise<void> {
  try {
    const schedules = await batteriesService.findSchedules((req.params.id as string));
    sendSuccess(res, schedules);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch schedules';
    sendError(res, msg, 500);
  }
}

export async function createSchedule(req: Request, res: Response): Promise<void> {
  try {
    const schedule = await batteriesService.createSchedule({
      batteryId: (req.params.id as string),
      ...req.body,
    });
    sendSuccess(res, schedule, 'Schedule created', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create schedule';
    sendError(res, msg, 400);
  }
}

export async function updateSchedule(req: Request, res: Response): Promise<void> {
  try {
    const schedule = await batteriesService.updateSchedule((req.params.scheduleId as string), req.body);
    sendSuccess(res, schedule, 'Schedule updated');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update schedule';
    sendError(res, msg, 400);
  }
}

export async function removeSchedule(req: Request, res: Response): Promise<void> {
  try {
    await batteriesService.removeSchedule((req.params.scheduleId as string));
    sendSuccess(res, { deleted: true }, 'Schedule deleted');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete schedule';
    sendError(res, msg, 400);
  }
}

export async function getFleet(_req: Request, res: Response): Promise<void> {
  try {
    const summary = await batteriesService.getFleetSummary();
    sendSuccess(res, summary);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch fleet summary';
    sendError(res, msg, 500);
  }
}
