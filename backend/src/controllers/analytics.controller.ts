import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import * as analyticsService from '../services/analytics.service.js';

export async function getDashboard(_req: Request, res: Response): Promise<void> {
  try {
    const dashboard = await analyticsService.getDashboardOverview();
    sendSuccess(res, dashboard);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch dashboard analytics';
    sendError(res, msg, 500);
  }
}

export async function getEnergyYield(_req: Request, res: Response): Promise<void> {
  try {
    const yieldData = await analyticsService.getEnergyYield();
    sendSuccess(res, yieldData);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch energy yield';
    sendError(res, msg, 500);
  }
}

export async function getCarbon(_req: Request, res: Response): Promise<void> {
  try {
    const carbon = await analyticsService.getCarbonMetrics();
    sendSuccess(res, carbon);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch carbon metrics';
    sendError(res, msg, 500);
  }
}

export async function getRevenue(req: Request, res: Response): Promise<void> {
  try {
    const tariff = req.query.tariff ? parseFloat(req.query.tariff as string) : undefined;
    const revenue = await analyticsService.getRevenueEstimation(tariff);
    sendSuccess(res, revenue);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to estimate revenue';
    sendError(res, msg, 500);
  }
}

export async function getPerformance(_req: Request, res: Response): Promise<void> {
  try {
    const performance = await analyticsService.getPerformanceKPIs();
    sendSuccess(res, performance);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch performance KPIs';
    sendError(res, msg, 500);
  }
}

export async function getComparison(_req: Request, res: Response): Promise<void> {
  try {
    const comparison = await analyticsService.comparePeriods();
    sendSuccess(res, comparison);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to compare periods';
    sendError(res, msg, 500);
  }
}
