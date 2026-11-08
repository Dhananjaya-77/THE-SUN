import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import { sendError } from '../utils/apiResponse.js';

type Role = 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY';

/**
 * Role-based access control middleware.
 * Pass allowed roles; the user must have at least one.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
}

/** Shortcut: only admins */
export const adminOnly = authorize('ADMIN');

/** Shortcut: operators and above */
export const operatorAndAbove = authorize('ADMIN', 'OPERATOR');

/** Shortcut: engineers and above */
export const engineerAndAbove = authorize('ADMIN', 'OPERATOR', 'ENGINEER');

/** Shortcut: all authenticated users */
export const anyAuthenticated = authorize('ADMIN', 'OPERATOR', 'ENGINEER', 'READONLY');
