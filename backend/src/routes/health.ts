import { Router } from 'express';
import { success } from '../utils/response.js';

// Version from package.json (injected at build time or read at runtime)
const VERSION = '1.0.0';

export const healthRouter = Router();

/**
 * GET /api/health
 * Health check endpoint
 * Returns: { status: "ok", version, time }
 */
healthRouter.get('/', (_req, res) => {
  success(res, {
    status: 'ok',
    version: VERSION,
    time: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
