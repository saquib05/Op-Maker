import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { success, error, ErrorCodes, notImplemented } from '../utils/response.js';
import { validateBody, validateParams } from '../utils/validate.js';
import { RequestWithId } from '../utils/request-logger.js';
import { uploadImages } from '../utils/upload.js';
import { exportRouter } from './export.js';
import { opService } from '../services/op-service.js';

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
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  filePath: z.string().optional(),
  pages: z.array(z.any()).optional(), // Full page data with Fabric.js JSON
  metadata: z.record(z.any()).optional(),
  thumbnailUrl: z.string().optional(),
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
// Async handler wrapper
// ============================================

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================
// Mount Export Routes
// ============================================

// Export routes are nested under /ops/:id/export
opsRouter.use('/:id/export', exportRouter);

// ============================================
// OP Routes (PRD Section 8.2)
// ============================================

/**
 * GET /api/ops
 * List all generated OPs
 */
opsRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const ops = await opService.list();
    success(res, ops, 200, requestId);
  })
);

/**
 * GET /api/ops/:id
 * Get OP data for editing
 * Returns: Full OP structure with pages, sections, Fabric.js data
 */
opsRouter.get(
  '/:id',
  validateParams(opIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const op = await opService.getById(req.params.id);

    if (!op) {
      error(res, ErrorCodes.NOT_FOUND, 'OP not found', 404, undefined, requestId);
      return;
    }

    success(res, op, 200, requestId);
  })
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
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const op = await opService.update(req.params.id, req.body);

    if (!op) {
      error(res, ErrorCodes.NOT_FOUND, 'OP not found', 404, undefined, requestId);
      return;
    }

    success(res, op, 200, requestId);
  })
);

/**
 * DELETE /api/ops/:id
 * Delete an OP
 */
opsRouter.delete(
  '/:id',
  validateParams(opIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const deleted = await opService.delete(req.params.id);

    if (!deleted) {
      error(res, ErrorCodes.NOT_FOUND, 'OP not found', 404, undefined, requestId);
      return;
    }

    success(res, { deleted: true }, 200, requestId);
  })
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
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const file = req.file;

    try {
      const result = await opService.aiRedesign({
        opId: req.params.id,
        sectionId: req.body.sectionId,
        prompt: req.body.prompt,
        referenceImagePath: file?.path,
      });
      success(res, result, 200, requestId);
    } catch (err) {
      if (err instanceof Error && err.message.includes('not implemented')) {
        notImplemented(res, 'AI redesign', requestId);
      } else {
        throw err;
      }
    }
  })
);
