import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as gridService from '../services/grid.service.js';

export const powerFlowSchema = z.record(
  z.string(),
  z.object({
    pvKw: z.number().nonnegative(),
    loadKw: z.number().nonnegative(),
    batteryKw: z.number().optional(),
  })
);

export async function getStatus(_req: Request, res: Response): Promise<void> {
  try {
    const status = await gridService.getStatus();
    sendSuccess(res, status);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch grid status';
    sendError(res, msg, 500);
  }
}

export async function runPowerFlow(req: Request, res: Response): Promise<void> {
  try {
    const pointsMap: Record<number, { pvKw: number; loadKw: number; batteryKw?: number }> = {};
    for (const [key, value] of Object.entries(req.body)) {
      pointsMap[parseInt(key, 10)] = value as { pvKw: number; loadKw: number; batteryKw?: number };
    }
    const result = await gridService.executePowerFlow(pointsMap, 'API Run');
    sendSuccess(res, result, 'Power-flow calculation complete', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Power flow failed';
    sendError(res, msg, 400);
  }
}

export async function getSnapshots(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await gridService.findSnapshots(page, limit);
    sendPaginated(res, result.snapshots, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch snapshots';
    sendError(res, msg, 500);
  }
}

export async function getSnapshotById(req: Request, res: Response): Promise<void> {
  try {
    const snapshot = await gridService.findSnapshotById((req.params.id as string));
    sendSuccess(res, snapshot);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Snapshot not found';
    sendError(res, msg, 404);
  }
}

export async function getConstraints(_req: Request, res: Response): Promise<void> {
  try {
    const constraints = await gridService.getConstraints();
    sendSuccess(res, constraints);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch constraints';
    sendError(res, msg, 500);
  }
}

export async function getTopology(_req: Request, res: Response): Promise<void> {
  try {
    const topology = await gridService.getTopology();
    sendSuccess(res, topology);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch topology';
    sendError(res, msg, 500);
  }
}
