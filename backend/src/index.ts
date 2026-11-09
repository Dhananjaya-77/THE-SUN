import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config/index.js';
import { initSocket } from './socket/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import sitesRoutes from './routes/sites.routes.js';
import measurementsRoutes from './routes/measurements.routes.js';
import gridRoutes from './routes/grid.routes.js';
import batteriesRoutes from './routes/batteries.routes.js';
import controlsRoutes from './routes/controls.routes.js';
import forecastRoutes from './routes/forecast.routes.js';
import iotRoutes from './routes/iot.routes.js';
import alertsRoutes from './routes/alerts.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import aiRoutes from './routes/ai.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import securityRoutes from './routes/security.routes.js';
import integrationsRoutes from './routes/integrations.routes.js';
import residentialRoutes from './routes/residential.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import simulationRoutes from './routes/simulation.routes.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Global middleware
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'The Sun Solar API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/measurements', measurementsRoutes);
app.use('/api/grid', gridRoutes);
app.use('/api/batteries', batteriesRoutes);
app.use('/api/controls', controlsRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/residential', residentialRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/simulation', simulationRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Server startup error handling (e.g. EADDRINUSE)
httpServer.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`❌ Port ${config.port} is already in use by another process.`);
    logger.error(`👉 Run 'lsof -ti :${config.port} | xargs kill -9' or 'npm run stop' to free port ${config.port}.`);
    process.exit(1);
  } else {
    logger.error('❌ Server startup error:', err);
    process.exit(1);
  }
});

// Start server
httpServer.listen(config.port, () => {
  logger.info(`☀ The Sun API server running on port ${config.port}`);
  logger.info(`  Environment: ${config.nodeEnv}`);
  logger.info(`  CORS origin: ${config.cors.origin}`);
  logger.info(`  Health check: http://localhost:${config.port}/api/health`);
});

export default app;
