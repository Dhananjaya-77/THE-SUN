import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as measurementsService from '../services/measurements.service.js';

export const ingestMeasurementSchema = z.object({
  siteId: z.string().min(1),
  timestamp: z.string().or(z.date()).optional(),
  generationKw: z.number().optional(),
  gridVoltageV: z.number().optional(),
  activePowerKw: z.number().optional(),
  reactivePowerKvar: z.number().optional(),
  frequencyHz: z.number().optional(),
  powerFactor: z.number().optional(),
  currentA: z.number().optional(),
  irradianceWm2: z.number().optional(),
  ambientTempC: z.number().optional(),
  dataSource: z.string().optional(),
  dataQuality: z.enum(['GOOD', 'SUSPECT', 'BAD', 'INTERPOLATED']).optional(),
});

export const bulkIngestSchema = z.array(ingestMeasurementSchema);

export async function ingest(req: Request, res: Response): Promise<void> {
  try {
    const measurement = await measurementsService.ingest(req.body);
    sendSuccess(res, measurement, 'Measurement ingested successfully', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to ingest measurement';
    sendError(res, msg, 400);
  }
}

export async function ingestBulk(req: Request, res: Response): Promise<void> {
  try {
    const result = await measurementsService.ingestBulk(req.body);
    sendSuccess(res, result, 'Bulk ingest completed', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Bulk ingest failed';
    sendError(res, msg, 400);
  }
}

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const siteId = req.query.siteId as string;
    const dataQuality = req.query.dataQuality as 'GOOD' | 'SUSPECT' | 'BAD' | 'INTERPOLATED';
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const result = await measurementsService.findAll({ page, limit, siteId, dataQuality, from, to });
    sendPaginated(res, result.measurements, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch measurements';
    sendError(res, msg, 500);
  }
}

export async function getLatest(_req: Request, res: Response): Promise<void> {
  try {
    const latest = await measurementsService.getLatestPerSite();
    sendSuccess(res, latest);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch latest measurements';
    sendError(res, msg, 500);
  }
}

export async function getAggregated(req: Request, res: Response): Promise<void> {
  try {
    const siteId = req.query.siteId as string;
    if (!siteId) {
      sendError(res, 'siteId is required', 400);
      return;
    }
    const interval = (req.query.interval as 'hour' | 'day') || 'hour';
    const result = await measurementsService.getAggregated(siteId, interval);
    sendSuccess(res, result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to aggregate data';
    sendError(res, msg, 500);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await measurementsService.remove((req.params.id as string));
    sendSuccess(res, { deleted: true }, 'Measurement deleted');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete measurement';
    sendError(res, msg, 400);
  }
}
