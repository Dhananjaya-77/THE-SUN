import { Request, Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as controlsService from '../services/controls.service.js';

export const createControlActionSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  constraintValue: z.string().optional(),
  candidateTarget: z.string().optional(),
  setpoint: z.string().optional(),
  aiAssisted: z.boolean().optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const status = req.query.status as 'PENDING' | 'AUTHORIZED' | 'REJECTED' | 'EXECUTED' | 'FAILED';

    const result = await controlsService.findAll({ page, limit, status });
    sendPaginated(res, result.actions, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch control actions';
    sendError(res, msg, 500);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const action = await controlsService.findById((req.params.id as string));
    sendSuccess(res, action);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Action not found';
    sendError(res, msg, 404);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const action = await controlsService.create(req.body);
    sendSuccess(res, action, 'Control action created', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create action';
    sendError(res, msg, 400);
  }
}

export async function authorizeAction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'system';
    const action = await controlsService.authorizeAction((req.params.id as string), userId);
    sendSuccess(res, action, 'Action authorized successfully');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to authorize action';
    sendError(res, msg, 400);
  }
}

export async function rejectAction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || 'system';
    const action = await controlsService.rejectAction((req.params.id as string), userId);
    sendSuccess(res, action, 'Action rejected');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to reject action';
    sendError(res, msg, 400);
  }
}

export async function executeAction(req: Request, res: Response): Promise<void> {
  try {
    const action = await controlsService.executeAction((req.params.id as string));
    sendSuccess(res, action, 'Control action executed');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to execute action';
    sendError(res, msg, 400);
  }
}

export async function getSafetyChecks(req: Request, res: Response): Promise<void> {
  try {
    const checks = await controlsService.getSafetyChecks(req.query.actionId as string);
    sendSuccess(res, checks);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to get safety checks';
    sendError(res, msg, 500);
  }
}

export async function getPending(_req: Request, res: Response): Promise<void> {
  try {
    const count = await controlsService.getPendingCount();
    sendSuccess(res, count);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch pending count';
    sendError(res, msg, 500);
  }
}
