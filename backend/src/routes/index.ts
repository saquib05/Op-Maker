import { Router } from 'express';
import { healthRouter } from './health.js';
import { templatesRouter } from './templates.js';
import { generationRouter } from './generation.js';
import { opsRouter } from './ops.js';
import { exportRouter } from './export.js';
import { excelRouter } from './excel.js';

/**
 * Central API Router
 * Mounts all domain routers under /api/*
 */
export const apiRouter = Router();

// Health check
apiRouter.use('/health', healthRouter);

// Template management
apiRouter.use('/templates', templatesRouter);

// OP generation
apiRouter.use('/generate', generationRouter);

// OP management and editing
apiRouter.use('/ops', opsRouter);

// Export functionality (nested under ops for context)
// Note: Export routes are mounted under /ops/:id/export in opsRouter

// Excel processing
apiRouter.use('/excel', excelRouter);

// Re-export individual routers for direct use if needed
export {
  healthRouter,
  templatesRouter,
  generationRouter,
  opsRouter,
  exportRouter,
  excelRouter,
};
