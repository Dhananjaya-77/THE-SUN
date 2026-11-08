import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as simulationService from '../services/simulation.service.js';

export const createScenarioSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  inputs: z.record(
    z.string(),
    z.object({
      pvKw: z.number().nonnegative(),
      loadKw: z.number().nonnegative(),
      batteryKw: z.number().optional(),
    })
  ),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await simulationService.findAll(page, limit);
    sendPaginated(res, result.scenarios, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch scenarios';
    sendError(res, msg, 500);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const scenario = await simulationService.findById((req.params.id as string));
    sendSuccess(res, scenario);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Scenario not found';
    sendError(res, msg, 404);
  }
}

export async function createAndRun(req: Request, res: Response): Promise<void> {
  try {
    const scenario = await simulationService.createAndRun(req.body);
    sendSuccess(res, scenario, 'Scenario simulated successfully', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Simulation failed';
    sendError(res, msg, 400);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const scenario = await simulationService.update((req.params.id as string), req.body);
    sendSuccess(res, scenario, 'Scenario updated');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update scenario';
    sendError(res, msg, 400);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await simulationService.remove((req.params.id as string));
    sendSuccess(res, { deleted: true }, 'Scenario deleted');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete scenario';
    sendError(res, msg, 400);
  }
}

export async function getBaselines(_req: Request, res: Response): Promise<void> {
  try {
    const baselines = await simulationService.findBaselines();
    sendSuccess(res, baselines);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch baselines';
    sendError(res, msg, 500);
  }
}

export async function saveBaseline(req: Request, res: Response): Promise<void> {
  try {
    const scenario = await simulationService.saveBaseline((req.params.id as string));
    sendSuccess(res, scenario, 'Scenario saved as baseline');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save baseline';
    sendError(res, msg, 400);
  }
}
