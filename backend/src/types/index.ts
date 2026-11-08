import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY';
  };
}

// Standard API response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination params
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Time range filter
export interface TimeRangeFilter {
  from?: Date;
  to?: Date;
}

// Helper to get string parameter safely from Express 5 req.params
export function getParam(req: Request, name = 'id'): string {
  const val = req.params[name];
  if (Array.isArray(val)) return val[0];
  return (val as string) || '';
}

// Socket events
export const SocketEvents = {
  MEASUREMENT_UPDATE: 'measurement:update',
  ALERT_NEW: 'alert:new',
  ALERT_UPDATE: 'alert:update',
  BATTERY_UPDATE: 'battery:update',
  CONTROL_UPDATE: 'control:update',
  NOTIFICATION_NEW: 'notification:new',
  SITE_STATUS: 'site:status',
  GRID_UPDATE: 'grid:update',
  DEVICE_STATUS: 'device:status',
} as const;
