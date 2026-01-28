/**
 * Utilities Index
 * Re-exports all utility functions and helpers
 */

export { generateRequestId, requestLogger, type RequestWithId } from './request-logger.js';
export { success, error, notImplemented, ErrorCodes } from './response.js';
export type { ApiResponse, ApiError } from './response.js';
export { validate, validateBody, validateParams, validateQuery } from './validate.js';
export {
  uploadExcel,
  uploadImages,
  uploadMixed,
  normalizeFilename,
  toUploadedFileInfo,
} from './upload.js';
export type { UploadedFileInfo } from './upload.js';

// File storage utilities
export {
  getStoragePath,
  safePath,
  validateStoragePath,
  sanitizeFilename,
  generateUniqueFilename,
  generateTimestampedFilename,
  ensureDirectory,
  ensureStorageDirectories,
  saveFile,
  readFile,
  deleteFile,
  fileExists,
  listFiles,
  getFileStats,
  moveFile,
  copyFile,
  getFullPath,
} from './storage.js';
export type { StorageCategory } from './storage.js';
