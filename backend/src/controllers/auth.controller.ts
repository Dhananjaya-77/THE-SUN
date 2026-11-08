import { Request, Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import * as authService from '../services/auth.service.js';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'OPERATOR', 'ENGINEER', 'READONLY']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const user = await authService.register(req.body);
    sendSuccess(res, user, 'User registered successfully', 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Registration failed';
    sendError(res, msg, 400);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.login({
      email: req.body.email,
      password: req.body.password,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    sendSuccess(res, result, 'Logged in successfully');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    sendError(res, msg, 401);
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.refreshToken(req.body.refreshToken);
    sendSuccess(res, result, 'Token refreshed');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Token refresh failed';
    sendError(res, msg, 401);
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const token = req.body.refreshToken;
    if (token) {
      await authService.logout(token);
    }
    sendSuccess(res, { loggedOut: true }, 'Logged out successfully');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Logout failed';
    sendError(res, msg, 400);
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
    const profile = await authService.getProfile(req.user.id);
    sendSuccess(res, profile);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve profile';
    sendError(res, msg, 404);
  }
}
