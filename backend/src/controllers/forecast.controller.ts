import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as forecastService from '../services/forecast.service.js';

export const createForecastSchema = z.object({
  type: z.string().min(1),
  targetDate: z.string().or(z.date()),
  values: z.array(z.number()),
  confidencePct: z.number().min(0).max(100).optional(),
  modelVersion: z.string().optional(),
  weatherInputs: z.record(z.unknown()).optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const type = req.query.type as string;
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const result = await forecastService.findAll({ page, limit, type, from, to });
    sendPaginated(res, result.forecasts, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch forecasts';
    sendError(res, msg, 500);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const forecast = await forecastService.findById((req.params.id as string));
    sendSuccess(res, forecast);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Forecast not found';
    sendError(res, msg, 404);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const forecast = await forecastService.create(req.body);
    sendSuccess(res, forecast, 'Forecast created', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create forecast';
    sendError(res, msg, 400);
  }
}

export async function getLatest(req: Request, res: Response): Promise<void> {
  try {
    const type = (req.query.type as string) || 'GENERATION';
    const latest = await forecastService.getLatest(type);
    sendSuccess(res, latest);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch latest forecast';
    sendError(res, msg, 500);
  }
}

export async function getAccuracy(_req: Request, res: Response): Promise<void> {
  try {
    const accuracy = await forecastService.getAccuracy();
    sendSuccess(res, accuracy);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch accuracy';
    sendError(res, msg, 500);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await forecastService.remove((req.params.id as string));
    sendSuccess(res, { deleted: true }, 'Forecast deleted');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete forecast';
    sendError(res, msg, 400);
  }
}
