import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';
import { sendError } from '../utils/apiResponse.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
  });

  // Prisma known errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as Error & { code: string };
    if (prismaErr.code === 'P2002') {
      sendError(res, 'A record with that unique field already exists', 409);
      return;
    }
    if (prismaErr.code === 'P2025') {
      sendError(res, 'Record not found', 404);
      return;
    }
  }

  sendError(res, 'Internal server error', 500);
}
