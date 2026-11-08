import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import logger from '../utils/logger.js';
import { config } from '../config/index.js';

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join site-specific rooms
    socket.on('join:site', (siteId: string) => {
      socket.join(`site:${siteId}`);
      logger.debug(`Socket ${socket.id} joined site:${siteId}`);
    });

    socket.on('leave:site', (siteId: string) => {
      socket.leave(`site:${siteId}`);
    });

    // Join user-specific room for notifications
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

/** Emit a real-time event to all connected clients */
export function emitToAll(event: string, data: unknown): void {
  if (io) io.emit(event, data);
}

/** Emit to a specific site room */
export function emitToSite(siteId: string, event: string, data: unknown): void {
  if (io) io.to(`site:${siteId}`).emit(event, data);
}

/** Emit to a specific user */
export function emitToUser(userId: string, event: string, data: unknown): void {
  if (io) io.to(`user:${userId}`).emit(event, data);
}
