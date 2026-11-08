import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma.js';
import type { AuthRequest } from '../types/index.js';

/**
 * Audit middleware — logs mutating requests to the audit_logs table.
 */
export function auditLog(resource: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Only log mutating operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      next();
      return;
    }

    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string) || null;

    res.on('finish', () => {
      // Fire-and-forget audit log creation
      prisma.auditLog
        .create({
          data: {
            userId: req.user?.id || null,
            action: `${req.method} ${req.originalUrl}`,
            resource,
            resourceId: paramId,
            details: req.method !== 'DELETE' ? (req.body as any) : undefined,
            ipAddress: req.ip || null,
          },
        })
        .catch(() => {
          // Silently ignore audit log failures
        });
    });

    next();
  };
}
