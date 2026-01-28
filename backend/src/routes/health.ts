import { Router } from 'express';

export const healthRouter = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'OP Maker backend is running',
  });
});
