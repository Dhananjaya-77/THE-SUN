import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as sitesService from '../services/sites.service.js';

export const createSiteSchema = z.object({
  siteCode: z.string().min(1),
  name: z.string().min(1),
  country: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  technology: z.string().optional(),
  commissionedYear: z.number().int().optional(),
  installedCapacityMw: z.number().positive(),
  annualEnergyGwh: z.number().positive().optional(),
  status: z.enum(['ONLINE', 'OFFLINE', 'ATTENTION', 'MAINTENANCE']).optional(),
  sourceUrl: z.string().url().optional(),
  imageUrl: z.string().optional(),
});

export const updateSiteSchema = createSiteSchema.partial();

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const status = req.query.status as 'ONLINE' | 'OFFLINE' | 'ATTENTION' | 'MAINTENANCE';
    const province = req.query.province as string;
    const district = req.query.district as string;
    const search = req.query.search as string;

    const result = await sitesService.findAll({ page, limit, status, province, district, search });
    sendPaginated(res, result.sites, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch sites';
    sendError(res, msg, 500);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const site = await sitesService.findById((req.params.id as string));
    sendSuccess(res, site);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Site not found';
    sendError(res, msg, 404);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const site = await sitesService.create(req.body);
    sendSuccess(res, site, 'Site created successfully', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create site';
    sendError(res, msg, 400);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const site = await sitesService.update((req.params.id as string), req.body);
    sendSuccess(res, site, 'Site updated successfully');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update site';
    sendError(res, msg, 400);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await sitesService.remove((req.params.id as string));
    sendSuccess(res, { deleted: true }, 'Site deleted successfully');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete site';
    sendError(res, msg, 400);
  }
}

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await sitesService.getStats((req.params.id as string));
    sendSuccess(res, stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch site stats';
    sendError(res, msg, 500);
  }
}

export async function getSummary(_req: Request, res: Response): Promise<void> {
  try {
    const summary = await sitesService.getSummary();
    sendSuccess(res, summary);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch summary';
    sendError(res, msg, 500);
  }
}
