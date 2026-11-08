import { Response } from 'express';
import type { ApiResponse } from '../types/index.js';

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200, meta?: ApiResponse['meta']): void {
  const response: ApiResponse<T> = { success: true, data, message, meta };
  res.status(statusCode).json(response);
}

export function sendError(res: Response, error: string, statusCode = 400): void {
  const response: ApiResponse = { success: false, error };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
): void {
  const totalPages = Math.ceil(total / limit);
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: { page, limit, total, totalPages },
  };
  res.status(200).json(response);
}
