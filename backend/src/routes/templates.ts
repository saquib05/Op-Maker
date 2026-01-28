import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { success, error, ErrorCodes } from '../utils/response.js';
import { validateBody, validateParams } from '../utils/validate.js';
import { RequestWithId } from '../utils/request-logger.js';
import { templateService } from '../services/template-service.js';

export const templatesRouter = Router();

// ============================================
// Zod Schemas for Template Routes
// ============================================

/**
 * Schema for template ID parameter
 */
export const templateIdSchema = z.object({
  id: z.string().min(1, 'Template ID is required'),
});

/**
 * Schema for creating a new template
 */
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(255),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  slideWidth: z.number().int().min(100).optional(),
  slideHeight: z.number().int().min(100).optional(),
  pages: z
    .array(
      z.object({
        name: z.string().min(1),
        order: z.number().int().min(0).optional(),
        layoutType: z.string().optional(),
        backgroundColor: z.string().optional(),
        backgroundImage: z.string().optional(),
        notes: z.string().optional(),
        sections: z.array(z.any()).optional(),
      })
    )
    .optional(),
});

/**
 * Schema for updating a template
 */
export const updateTemplateSchema = createTemplateSchema.partial();

/**
 * Schema for importing a template
 */
export const importTemplateSchema = z.object({
  template: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    pages: z.array(z.any()).optional(),
  }),
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
// Template Routes (PRD Section 8.2)
// ============================================

/**
 * GET /api/templates
 * List all templates
 */
templatesRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const templates = await templateService.list();
    success(res, templates, 200, requestId);
  })
);

/**
 * POST /api/templates
 * Create new template
 */
templatesRouter.post(
  '/',
  validateBody(createTemplateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const template = await templateService.create(req.body);
    success(res, template, 201, requestId);
  })
);

/**
 * GET /api/templates/:id
 * Get template details
 */
templatesRouter.get(
  '/:id',
  validateParams(templateIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const template = await templateService.getById(req.params.id);

    if (!template) {
      error(res, ErrorCodes.NOT_FOUND, 'Template not found', 404, undefined, requestId);
      return;
    }

    success(res, template, 200, requestId);
  })
);

/**
 * PUT /api/templates/:id
 * Update template
 */
templatesRouter.put(
  '/:id',
  validateParams(templateIdSchema),
  validateBody(updateTemplateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const template = await templateService.update(req.params.id, req.body);

    if (!template) {
      error(res, ErrorCodes.NOT_FOUND, 'Template not found', 404, undefined, requestId);
      return;
    }

    success(res, template, 200, requestId);
  })
);

/**
 * DELETE /api/templates/:id
 * Delete template
 */
templatesRouter.delete(
  '/:id',
  validateParams(templateIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const deleted = await templateService.delete(req.params.id);

    if (!deleted) {
      error(res, ErrorCodes.NOT_FOUND, 'Template not found', 404, undefined, requestId);
      return;
    }

    success(res, { deleted: true }, 200, requestId);
  })
);

/**
 * POST /api/templates/:id/duplicate
 * Duplicate template
 */
templatesRouter.post(
  '/:id/duplicate',
  validateParams(templateIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const template = await templateService.duplicate(req.params.id);

    if (!template) {
      error(res, ErrorCodes.NOT_FOUND, 'Template not found', 404, undefined, requestId);
      return;
    }

    success(res, template, 201, requestId);
  })
);

/**
 * POST /api/templates/import
 * Import template from JSON
 */
templatesRouter.post(
  '/import',
  validateBody(importTemplateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const template = await templateService.importFromJson(req.body);
    success(res, template, 201, requestId);
  })
);

/**
 * GET /api/templates/:id/export
 * Export template to JSON
 */
templatesRouter.get(
  '/:id/export',
  validateParams(templateIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = (req as RequestWithId).requestId;
    const exportData = await templateService.exportToJson(req.params.id);

    if (!exportData) {
      error(res, ErrorCodes.NOT_FOUND, 'Template not found', 404, undefined, requestId);
      return;
    }

    success(res, exportData, 200, requestId);
  })
);
