import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as iotService from '../services/iot.service.js';

export const createDeviceSchema = z.object({
  siteId: z.string().optional(),
  deviceCode: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  protocol: z.string().optional(),
  ipAddress: z.string().optional(),
  firmwareVer: z.string().optional(),
  status: z.enum(['ONLINE', 'DEGRADED', 'OFFLINE']).optional(),
});

export const updateDeviceSchema = createDeviceSchema.partial();

export const heartbeatSchema = z.object({
  latencyMs: z.number().nonnegative().optional(),
  packetLossPct: z.number().min(0).max(100).optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const siteId = req.query.siteId as string;
    const type = req.query.type as string;
    const status = req.query.status as 'ONLINE' | 'DEGRADED' | 'OFFLINE';

    const result = await iotService.findAll({ page, limit, siteId, type, status });
    sendPaginated(res, result.devices, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch devices';
    sendError(res, msg, 500);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const device = await iotService.findById((req.params.id as string));
    sendSuccess(res, device);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Device not found';
    sendError(res, msg, 404);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const device = await iotService.create(req.body);
    sendSuccess(res, device, 'Device registered', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create device';
    sendError(res, msg, 400);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const device = await iotService.update((req.params.id as string), req.body);
    sendSuccess(res, device, 'Device updated');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update device';
    sendError(res, msg, 400);
  }
}

export async function heartbeat(req: Request, res: Response): Promise<void> {
  try {
    const device = await iotService.recordHeartbeat(
      (req.params.id as string),
      req.body.latencyMs,
      req.body.packetLossPct
    );
    sendSuccess(res, device, 'Heartbeat recorded');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Heartbeat failed';
    sendError(res, msg, 400);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await iotService.remove((req.params.id as string));
    sendSuccess(res, { deleted: true }, 'Device removed');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to remove device';
    sendError(res, msg, 400);
  }
}

export async function getGateways(_req: Request, res: Response): Promise<void> {
  try {
    const gateways = await iotService.findGateways();
    sendSuccess(res, gateways);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch gateways';
    sendError(res, msg, 500);
  }
}

export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await iotService.getStats();
    sendSuccess(res, stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch stats';
    sendError(res, msg, 500);
  }
}
