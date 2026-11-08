import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { AuthRequest } from '../types/index.js';
import { sendError } from '../utils/apiResponse.js';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Access token required', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY';
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}

/** Optional auth — populates req.user if token present, but doesn't reject */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        email: string;
        role: 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY';
      };
      req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    } catch {
      // Token invalid — continue without user
    }
  }
  next();
}
