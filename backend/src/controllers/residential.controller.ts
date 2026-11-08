import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as residentialService from '../services/residential.service.js';

export const createCustomerSchema = z.object({
  displayCode: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  utilityProvider: z.enum(['CEB', 'LECO']),
});

export const createSiteSchema = z.object({
  customerId: z.string().min(1),
  siteCode: z.string().min(1),
  district: z.string().optional(),
  province: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  connectionScheme: z.enum(['NET_METERING', 'NET_ACCOUNTING', 'NET_PLUS', 'NET_PLUS_PLUS']),
  solarCapacityKw: z.number().positive(),
  panelCount: z.number().int().optional(),
  panelWattageW: z.number().int().optional(),
  inverterCapacityKw: z.number().positive().optional(),
  connectionPhase: z.string().optional(),
  maxExportKw: z.number().optional(),
  hasBattery: z.boolean().optional(),
  batteryCapacityKwh: z.number().optional(),
});

export const createMeasurementSchema = z.object({
  siteId: z.string().min(1),
  timestamp: z.string().or(z.date()).optional(),
  solarGenerationKw: z.number().optional(),
  householdConsumptionKw: z.number().optional(),
  gridImportKw: z.number().optional(),
  gridExportKw: z.number().optional(),
  voltageV: z.number().optional(),
  frequencyHz: z.number().optional(),
  batterySocPct: z.number().optional(),
  dataQuality: z.enum(['GOOD', 'SUSPECT', 'BAD', 'INTERPOLATED']).optional(),
});

export const createCreditSchema = z.object({
  siteId: z.string().min(1),
  billingPeriod: z.string().min(1),
  exportedKwh: z.number().nonnegative(),
  creditedKwh: z.number().nonnegative(),
  exportValueLkr: z.number().nonnegative(),
});

export async function getCustomers(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await residentialService.findCustomers(page, limit);
    sendPaginated(res, result.customers, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch customers';
    sendError(res, msg, 500);
  }
}

export async function createCustomer(req: Request, res: Response): Promise<void> {
  try {
    const customer = await residentialService.createCustomer(req.body);
    sendSuccess(res, customer, 'Customer created', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create customer';
    sendError(res, msg, 400);
  }
}

export async function getSites(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const district = req.query.district as string;
    const province = req.query.province as string;
    const scheme = req.query.scheme as 'NET_METERING' | 'NET_ACCOUNTING' | 'NET_PLUS' | 'NET_PLUS_PLUS';
    const provider = req.query.provider as 'CEB' | 'LECO';

    const result = await residentialService.findSites({ page, limit, district, province, scheme, provider });
    sendPaginated(res, result.sites, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch residential sites';
    sendError(res, msg, 500);
  }
}

export async function createSite(req: Request, res: Response): Promise<void> {
  try {
    const site = await residentialService.createSite(req.body);
    sendSuccess(res, site, 'Residential site registered', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to register site';
    sendError(res, msg, 400);
  }
}

export async function getSiteById(req: Request, res: Response): Promise<void> {
  try {
    const site = await residentialService.findSiteById((req.params.id as string));
    sendSuccess(res, site);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Site not found';
    sendError(res, msg, 404);
  }
}

export async function ingestMeasurement(req: Request, res: Response): Promise<void> {
  try {
    const m = await residentialService.ingestMeasurement(req.body);
    sendSuccess(res, m, 'Measurement recorded', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to record measurement';
    sendError(res, msg, 400);
  }
}

export async function getMeasurements(req: Request, res: Response): Promise<void> {
  try {
    const siteId = req.query.siteId as string;
    if (!siteId) {
      sendError(res, 'siteId is required', 400);
      return;
    }
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;
    const measurements = await residentialService.findMeasurements(siteId, from, to);
    sendSuccess(res, measurements);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch measurements';
    sendError(res, msg, 500);
  }
}

export async function getCredits(req: Request, res: Response): Promise<void> {
  try {
    const siteId = (req.params.siteId as string);
    const credits = await residentialService.findCredits(siteId);
    sendSuccess(res, credits);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch credits';
    sendError(res, msg, 500);
  }
}

export async function createCredit(req: Request, res: Response): Promise<void> {
  try {
    const credit = await residentialService.createCredit(req.body);
    sendSuccess(res, credit, 'Energy credit recorded', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to record credit';
    sendError(res, msg, 400);
  }
}

export async function getSummary(_req: Request, res: Response): Promise<void> {
  try {
    const summary = await residentialService.getSummary();
    sendSuccess(res, summary);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch summary';
    sendError(res, msg, 500);
  }
}

export async function getSchemes(_req: Request, res: Response): Promise<void> {
  try {
    const schemes = await residentialService.getSchemes();
    sendSuccess(res, schemes);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch schemes';
    sendError(res, msg, 500);
  }
}
