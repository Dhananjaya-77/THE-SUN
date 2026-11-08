import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/apiResponse.js';

/**
 * Validates request body/query/params against a Zod schema.
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      // Replace with parsed (and transformed) data
      if (source === 'body') req.body = data;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        sendError(res, `Validation failed: ${messages}`, 422);
      } else {
        sendError(res, 'Validation error', 422);
      }
    }
  };
}
