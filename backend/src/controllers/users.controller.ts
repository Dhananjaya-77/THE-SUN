import { Request, Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import * as usersService from '../services/users.service.js';

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'OPERATOR', 'ENGINEER', 'READONLY']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export const assignScopeSchema = z.object({
  siteId: z.string().min(1),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = req.query.search as string;
    const role = req.query.role as 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY';

    const result = await usersService.findAll({ page, limit, search, role });
    sendPaginated(res, result.users, result.total, result.page, result.limit);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch users';
    sendError(res, msg, 500);
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const user = await usersService.findById((req.params.id as string));
    sendSuccess(res, user);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'User not found';
    sendError(res, msg, 404);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const updated = await usersService.update((req.params.id as string), req.body);
    sendSuccess(res, updated, 'User updated successfully');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update user';
    sendError(res, msg, 400);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const deactivated = await usersService.deactivate((req.params.id as string));
    sendSuccess(res, deactivated, 'User deactivated');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to deactivate user';
    sendError(res, msg, 400);
  }
}

export async function getScopes(req: Request, res: Response): Promise<void> {
  try {
    const scopes = await usersService.getScopes((req.params.id as string));
    sendSuccess(res, scopes);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to get scopes';
    sendError(res, msg, 500);
  }
}

export async function assignScope(req: Request, res: Response): Promise<void> {
  try {
    const scope = await usersService.assignScope((req.params.id as string), req.body.siteId);
    sendSuccess(res, scope, 'Site scope assigned', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to assign scope';
    sendError(res, msg, 400);
  }
}

export async function removeScope(req: Request, res: Response): Promise<void> {
  try {
    await usersService.removeScope((req.params.id as string), (req.params.siteId as string));
    sendSuccess(res, { removed: true }, 'Site scope removed');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to remove scope';
    sendError(res, msg, 400);
  }
}
