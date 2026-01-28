/**
 * File Storage Utilities
 * Safe file path handling and storage operations
 *
 * Implements:
 * - Path traversal prevention
 * - Path normalization (Windows compatibility)
 * - File naming conventions
 * - Storage location management
 */

import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { config } from '../config/env.js';

// ============================================================================
// Storage Directories
// ============================================================================

export type StorageCategory = 'templates' | 'generated-ops' | 'excel-files' | 'images';

/**
 * Get the absolute path to a storage directory
 */
export function getStoragePath(category: StorageCategory): string {
  switch (category) {
    case 'templates':
      return config.storage.templates;
    case 'generated-ops':
      return config.storage.generatedOps;
    case 'excel-files':
      return config.storage.excelFiles;
    case 'images':
      return config.storage.images;
    default:
      throw new Error(`Unknown storage category: ${category}`);
  }
}

// ============================================================================
// Path Security
// ============================================================================

/**
 * Check if a path is safe (doesn't traverse outside allowed directory)
 * Returns the normalized, resolved path if safe, null if unsafe
 */
export function safePath(
  basePath: string,
  requestedPath: string
): string | null {
  // Normalize both paths
  const normalizedBase = path.normalize(basePath);
  const resolvedPath = path.resolve(normalizedBase, requestedPath);

  // Check if resolved path is within base path
  if (!resolvedPath.startsWith(normalizedBase + path.sep) && resolvedPath !== normalizedBase) {
    console.warn(`Path traversal attempt blocked: ${requestedPath}`);
    return null;
  }

  return resolvedPath;
}

/**
 * Validate and return a safe file path within a storage category
 * Throws if path is invalid
 */
export function validateStoragePath(
  category: StorageCategory,
  filename: string
): string {
  const basePath = getStoragePath(category);
  const safe = safePath(basePath, filename);

  if (!safe) {
    throw new Error(`Invalid file path: ${filename}`);
  }

  return safe;
}

// ============================================================================
// File Naming
// ============================================================================

/**
 * Sanitize a filename to be safe for the filesystem
 * - Removes/replaces unsafe characters
 * - Limits length
 * - Preserves extension
 */
export function sanitizeFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const base = path.basename(filename, ext);

  // Remove unsafe characters, keep only alphanumeric, dash, underscore
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);

  return sanitized || 'file';
}

/**
 * Generate a unique filename with optional prefix
 */
export function generateUniqueFilename(
  originalName: string,
  prefix?: string
): string {
  const sanitized = sanitizeFilename(originalName);
  const ext = path.extname(originalName).toLowerCase();
  const uuid = randomUUID().substring(0, 8);

  if (prefix) {
    return `${prefix}-${uuid}-${sanitized}${ext}`;
  }

  return `${uuid}-${sanitized}${ext}`;
}

/**
 * Generate a timestamped filename
 */
export function generateTimestampedFilename(
  originalName: string,
  prefix?: string
): string {
  const sanitized = sanitizeFilename(originalName);
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (prefix) {
    return `${prefix}-${timestamp}-${sanitized}${ext}`;
  }

  return `${timestamp}-${sanitized}${ext}`;
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * Ensure a directory exists, create if it doesn't
 */
export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Ensure all storage directories exist
 */
export function ensureStorageDirectories(): void {
  const categories: StorageCategory[] = [
    'templates',
    'generated-ops',
    'excel-files',
    'images',
  ];

  for (const category of categories) {
    ensureDirectory(getStoragePath(category));
  }

  console.log('📁 Storage directories verified');
}

/**
 * Save a file to a storage category
 * Returns the relative path within the category
 */
export async function saveFile(
  category: StorageCategory,
  filename: string,
  content: Buffer | string
): Promise<string> {
  const uniqueName = generateUniqueFilename(filename);
  const fullPath = validateStoragePath(category, uniqueName);

  // Ensure parent directory exists
  ensureDirectory(path.dirname(fullPath));

  await fs.promises.writeFile(fullPath, content);

  return uniqueName;
}

/**
 * Read a file from a storage category
 */
export async function readFile(
  category: StorageCategory,
  filename: string
): Promise<Buffer> {
  const fullPath = validateStoragePath(category, filename);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filename}`);
  }

  return fs.promises.readFile(fullPath);
}

/**
 * Delete a file from a storage category
 */
export async function deleteFile(
  category: StorageCategory,
  filename: string
): Promise<boolean> {
  const fullPath = validateStoragePath(category, filename);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  await fs.promises.unlink(fullPath);
  return true;
}

/**
 * Check if a file exists in a storage category
 */
export function fileExists(
  category: StorageCategory,
  filename: string
): boolean {
  try {
    const fullPath = validateStoragePath(category, filename);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

/**
 * List files in a storage category
 */
export async function listFiles(category: StorageCategory): Promise<string[]> {
  const dirPath = getStoragePath(category);

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  return entries.filter((e) => e.isFile()).map((e) => e.name);
}

/**
 * Get file stats
 */
export async function getFileStats(
  category: StorageCategory,
  filename: string
): Promise<fs.Stats | null> {
  try {
    const fullPath = validateStoragePath(category, filename);
    return await fs.promises.stat(fullPath);
  } catch {
    return null;
  }
}

/**
 * Move a file to a storage category
 */
export async function moveFile(
  sourcePath: string,
  category: StorageCategory,
  newFilename?: string
): Promise<string> {
  const filename = newFilename || path.basename(sourcePath);
  const uniqueName = generateUniqueFilename(filename);
  const destPath = validateStoragePath(category, uniqueName);

  // Ensure destination directory exists
  ensureDirectory(path.dirname(destPath));

  await fs.promises.rename(sourcePath, destPath);

  return uniqueName;
}

/**
 * Copy a file to a storage category
 */
export async function copyFile(
  sourcePath: string,
  category: StorageCategory,
  newFilename?: string
): Promise<string> {
  const filename = newFilename || path.basename(sourcePath);
  const uniqueName = generateUniqueFilename(filename);
  const destPath = validateStoragePath(category, uniqueName);

  // Ensure destination directory exists
  ensureDirectory(path.dirname(destPath));

  await fs.promises.copyFile(sourcePath, destPath);

  return uniqueName;
}

/**
 * Get the full path of a file in storage (for serving)
 */
export function getFullPath(
  category: StorageCategory,
  filename: string
): string {
  return validateStoragePath(category, filename);
}
