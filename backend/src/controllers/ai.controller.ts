import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as aiService from '../services/ai.service.js';

export const createModelSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  version: z.string().min(1),
  accuracy: z.number().optional(),
  inferenceMs: z.number().optional(),
  configJson: z.record(z.unknown()).optional(),
});

export const createAnomalySchema = z.object({
  modelId: z.string().min(1),
  siteId: z.string().optional(),
  type: z.string().min(1),
  description: z.string().min(1),
  severity: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export const createRecommendationSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  impact: z.string().optional(),
});

export async function getModels(_req: Request, res: Response): Promise<void> {
  try {
    const models = await aiService.findModels();
    sendSuccess(res, models);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch models';
    sendError(res, msg, 500);
  }
}

export async function getModelById(req: Request, res: Response): Promise<void> {
  try {
    const model = await aiService.findModelById((req.params.id as string));
    sendSuccess(res, model);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Model not found';
    sendError(res, msg, 404);
  }
}

export async function createModel(req: Request, res: Response): Promise<void> {
  try {
    const model = await aiService.createModel(req.body);
    sendSuccess(res, model, 'Model registered', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create model';
    sendError(res, msg, 400);
  }
}

export async function updateModel(req: Request, res: Response): Promise<void> {
  try {
    const model = await aiService.updateModel((req.params.id as string), req.body);
    sendSuccess(res, model, 'Model updated');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update model';
    sendError(res, msg, 400);
  }
}

export async function getAnomalies(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await aiService.findAnomalies(page, limit);
    sendPaginated(res, result.anomalies, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch anomalies';
    sendError(res, msg, 500);
  }
}

export async function reportAnomaly(req: Request, res: Response): Promise<void> {
  try {
    const anomaly = await aiService.createAnomaly(req.body);
    sendSuccess(res, anomaly, 'Anomaly reported', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to report anomaly';
    sendError(res, msg, 400);
  }
}

export async function resolveAnomaly(req: Request, res: Response): Promise<void> {
  try {
    const anomaly = await aiService.resolveAnomaly((req.params.id as string));
    sendSuccess(res, anomaly, 'Anomaly resolved');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to resolve anomaly';
    sendError(res, msg, 400);
  }
}

export async function getRecommendations(_req: Request, res: Response): Promise<void> {
  try {
    const recs = await aiService.findRecommendations();
    sendSuccess(res, recs);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch recommendations';
    sendError(res, msg, 500);
  }
}

export async function createRecommendation(req: Request, res: Response): Promise<void> {
  try {
    const rec = await aiService.createRecommendation(req.body);
    sendSuccess(res, rec, 'Recommendation created', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create recommendation';
    sendError(res, msg, 400);
  }
}

export async function updateRecommendationStatus(req: Request, res: Response): Promise<void> {
  try {
    const rec = await aiService.updateRecommendationStatus((req.params.id as string), req.body.status);
    sendSuccess(res, rec, 'Status updated');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update status';
    sendError(res, msg, 400);
  }
}

export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await aiService.getStats();
    sendSuccess(res, stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch stats';
    sendError(res, msg, 500);
  }
}
