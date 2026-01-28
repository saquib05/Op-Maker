import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { notImplemented } from '../utils/response.js';
import { validateBody, validateParams } from '../utils/validate.js';
import { RequestWithId } from '../utils/request-logger.js';
import { uploadImages } from '../utils/upload.js';
import { exportRouter } from './export.js';

export const opsRouter = Router();

// ============================================
// Zod Schemas for OP Routes
// ============================================

/**
 * Schema for OP ID parameter
 */
export const opIdSchema = z.object({
  id: z.string().min(1, 'OP ID is required'),
});

/**
 * Schema for updating an OP
 * This accepts the full OP data structure (Fabric.js JSON, etc.)
 */
export const updateOpSchema = z.object({
  name: z.string().optional(),
  pages: z.array(z.any()).optional(), // Full page data with Fabric.js JSON
  metadata: z.record(z.any()).optional(),
});

/**
 * Schema for AI redesign request
 */
export const aiRedesignSchema = z.object({
  sectionId: z.string().min(1, 'Section ID is required'),
  prompt: z.string().min(1, 'Prompt is required').max(2000),
  // referenceImage handled by multer
});

// ============================================
// Mount Export Routes
// ============================================

// Export routes are nested under /ops/:id/export
opsRouter.use('/:id/export', exportRouter);

// ============================================
// OP Routes (PRD Section 8.2)
// ============================================

/**
 * GET /api/ops/:id
 * Get OP data for editing
 * Returns: Full OP structure with pages, sections, Fabric.js data
 */
opsRouter.get(
  '/:id',
  validateParams(opIdSchema),
  (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    notImplemented(res, `GET /api/ops/${req.params.id}`, requestId);
  }
);

/**
 * PUT /api/ops/:id
 * Save edited OP
 * Body: Full OP data structure
 */
opsRouter.put(
  '/:id',
  validateParams(opIdSchema),
  validateBody(updateOpSchema),
  (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    notImplemented(res, `PUT /api/ops/${req.params.id}`, requestId);
  }
);

/**
 * POST /api/ops/:id/ai-redesign
 * AI-powered layout redesign
 * Body: { sectionId, prompt, referenceImage? }
 */
opsRouter.post(
  '/:id/ai-redesign',
  validateParams(opIdSchema),
  uploadImages.single('referenceImage'),
  validateBody(aiRedesignSchema),
  (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    notImplemented(res, `POST /api/ops/${req.params.id}/ai-redesign`, requestId);
  }
);
