import { Request, Response } from 'express';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as securityService from '../services/security.service.js';

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const userId = req.query.userId as string;
    const resource = req.query.resource as string;
    const action = req.query.action as string;
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const result = await securityService.getAuditLogs({ page, limit, userId, resource, action, from, to });
    sendPaginated(res, result.logs, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch audit logs';
    sendError(res, msg, 500);
  }
}

export async function getSessions(req: Request, res: Response): Promise<void> {
  try {
    const sessions = await securityService.getActiveSessions();
    sendSuccess(res, sessions);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch sessions';
    sendError(res, msg, 500);
  }
}

export async function revokeSession(req: Request, res: Response): Promise<void> {
  try {
    await securityService.revokeSession((req.params.id as string));
    sendSuccess(res, { revoked: true }, 'Session revoked successfully');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to revoke session';
    sendError(res, msg, 400);
  }
}

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await securityService.getSecurityStats();
    sendSuccess(res, stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch security stats';
    sendError(res, msg, 500);
  }
}
