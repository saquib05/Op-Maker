import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { config } from '../config/env.js';

/**
 * File upload configuration using Multer
 * Handles Excel files and images as multipart/form-data
 *
 * Note: Actual file persistence/moving happens in Phase 03.
 * This sets up the plumbing and contracts.
 */

/**
 * Allowed MIME types for different upload categories
 */
const ALLOWED_MIME_TYPES = {
  excel: [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/csv', // .csv
    'application/csv',
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
} as const;

/**
 * Normalize filename to be safe for filesystem
 * - Removes special characters
 * - Replaces spaces with hyphens
 * - Adds UUID prefix for uniqueness
 */
export function normalizeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext);

  // Sanitize: only allow alphanumeric, hyphens, underscores
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50); // Limit length

  const uniqueId = randomUUID().substring(0, 8);

  return `${uniqueId}-${sanitized}${ext}`;
}

/**
 * File info returned after upload
 */
export interface UploadedFileInfo {
  originalName: string;
  normalizedName: string;
  mimeType: string;
  size: number;
  path: string;
}

/**
 * Create a file filter for specific file types
 */
function createFileFilter(allowedTypes: readonly string[]) {
  return (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`
        )
      );
    }
  };
}

/**
 * Storage configuration for disk storage
 * Files are stored temporarily; Phase 03 handles final persistence
 */
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Default to images folder; specific routes may override
    cb(null, config.storage.images);
  },
  filename: (_req, file, cb) => {
    cb(null, normalizeFilename(file.originalname));
  },
});

/**
 * Excel file upload middleware
 * Accepts: .xlsx, .xls, .csv
 * PRD: No max file size enforced
 */
export const uploadExcel = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, config.storage.excelFiles);
    },
    filename: (_req, file, cb) => {
      cb(null, normalizeFilename(file.originalname));
    },
  }),
  fileFilter: createFileFilter(ALLOWED_MIME_TYPES.excel),
  // Note: No limits enforced per PRD requirement
});

/**
 * Image file upload middleware
 * Accepts: JPEG, PNG, GIF, WebP, SVG
 * PRD: No max file size enforced
 */
export const uploadImages = multer({
  storage: diskStorage,
  fileFilter: createFileFilter(ALLOWED_MIME_TYPES.images),
  // Note: No limits enforced per PRD requirement
});

/**
 * Mixed file upload middleware (Excel + Images)
 * For endpoints that accept both types
 */
export const uploadMixed = multer({
  storage: diskStorage,
  fileFilter: createFileFilter([
    ...ALLOWED_MIME_TYPES.excel,
    ...ALLOWED_MIME_TYPES.images,
  ]),
});

/**
 * Convert Multer file to standardized UploadedFileInfo
 */
export function toUploadedFileInfo(file: Express.Multer.File): UploadedFileInfo {
  return {
    originalName: file.originalname,
    normalizedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
  };
}
