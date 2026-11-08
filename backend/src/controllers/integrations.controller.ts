import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import * as integrationsService from '../services/integrations.service.js';

export const createIntegrationSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  endpoint: z.string().optional(),
  configJson: z.record(z.unknown()).optional(),
});

export const updateIntegrationSchema = createIntegrationSchema.partial();

export async function getAll(_req: Request, res: Response): Promise<void> {
  try {
    const integrations = await integrationsService.findAll();
    sendSuccess(res, integrations);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch integrations';
    sendError(res, msg, 500);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const integration = await integrationsService.findById((req.params.id as string));
    sendSuccess(res, integration);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Integration not found';
    sendError(res, msg, 404);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const integration = await integrationsService.create(req.body);
    sendSuccess(res, integration, 'Integration added', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create integration';
    sendError(res, msg, 400);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const integration = await integrationsService.update((req.params.id as string), req.body);
    sendSuccess(res, integration, 'Integration updated');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update integration';
    sendError(res, msg, 400);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await integrationsService.remove((req.params.id as string));
    sendSuccess(res, { deleted: true }, 'Integration removed');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to remove integration';
    sendError(res, msg, 400);
  }
}

export async function testConnection(req: Request, res: Response): Promise<void> {
  try {
    const result = await integrationsService.testConnection((req.params.id as string));
    sendSuccess(res, result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Connection test failed';
    sendError(res, msg, 400);
  }
}

export async function triggerSync(req: Request, res: Response): Promise<void> {
  try {
    const result = await integrationsService.triggerSync((req.params.id as string));
    sendSuccess(res, result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Sync failed';
    sendError(res, msg, 400);
  }
}

export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await integrationsService.getStats();
    sendSuccess(res, stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch integration stats';
    sendError(res, msg, 500);
  }
}
