/**
 * Generated OP Repository
 * Data access layer for generated Opportunity Profiles
 *
 * Handles:
 * - CRUD operations for generated OPs
 * - Status tracking for generation progress
 * - File path management for exports
 */

import { randomUUID } from 'crypto';
import { queryAll, queryOne, execute, getDb, saveDb } from './db.js';
import type {
  GeneratedOP,
  GenerationStatus,
  Page,
} from '@op-maker/shared';

// ============================================================================
// Type Definitions for Database Rows
// ============================================================================

interface GeneratedOPRow {
  id: string;
  template_id: string;
  name: string;
  status: string;
  file_path: string | null;
  input_data: string;
  pages: string;
  metadata: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

function parseJsonOrDefault<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

function toGeneratedOP(row: GeneratedOPRow): GeneratedOP {
  return {
    id: row.id,
    templateId: row.template_id,
    name: row.name,
    status: row.status as GenerationStatus,
    filePath: row.file_path || undefined,
    inputData: JSON.parse(row.input_data) as Record<string, unknown>,
    pages: JSON.parse(row.pages) as Page[],
    metadata: parseJsonOrDefault<Record<string, unknown>>(row.metadata, {}),
    thumbnailUrl: row.thumbnail_url || undefined,
    createdAt: parseDate(row.created_at),
    updatedAt: parseDate(row.updated_at),
  };
}

// ============================================================================
// Repository Functions
// ============================================================================

/**
 * List all generated OPs (most recent first)
 */
export function listGeneratedOPs(): GeneratedOP[] {
  const rows = queryAll<GeneratedOPRow>('SELECT * FROM generated_ops ORDER BY created_at DESC');
  return rows.map(toGeneratedOP);
}

/**
 * List generated OPs by template ID
 */
export function listGeneratedOPsByTemplate(templateId: string): GeneratedOP[] {
  const rows = queryAll<GeneratedOPRow>(
    'SELECT * FROM generated_ops WHERE template_id = ? ORDER BY created_at DESC',
    [templateId]
  );
  return rows.map(toGeneratedOP);
}

/**
 * List generated OPs by status
 */
export function listGeneratedOPsByStatus(status: GenerationStatus): GeneratedOP[] {
  const rows = queryAll<GeneratedOPRow>(
    'SELECT * FROM generated_ops WHERE status = ? ORDER BY created_at DESC',
    [status]
  );
  return rows.map(toGeneratedOP);
}

/**
 * Get a single generated OP by ID
 */
export function getGeneratedOPById(id: string): GeneratedOP | null {
  const row = queryOne<GeneratedOPRow>('SELECT * FROM generated_ops WHERE id = ?', [id]);
  if (!row) return null;
  return toGeneratedOP(row);
}

/**
 * Create input type for generated OP
 */
export interface CreateGeneratedOPInput {
  templateId: string;
  name: string;
  inputData: Record<string, unknown>;
  pages?: Page[];
  status?: GenerationStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Create a new generated OP record
 */
export function createGeneratedOP(input: CreateGeneratedOPInput): GeneratedOP {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO generated_ops (id, template_id, name, status, input_data, pages, metadata, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.templateId,
      input.name,
      input.status || 'pending',
      JSON.stringify(input.inputData),
      JSON.stringify(input.pages || []),
      input.metadata ? JSON.stringify(input.metadata) : null,
      now,
      now,
    ]
  );
  saveDb();

  return getGeneratedOPById(id)!;
}

/**
 * Update input type for generated OP
 */
export interface UpdateGeneratedOPInput {
  name?: string;
  status?: GenerationStatus;
  filePath?: string;
  pages?: Page[];
  metadata?: Record<string, unknown>;
  thumbnailUrl?: string;
}

/**
 * Update an existing generated OP
 */
export function updateGeneratedOP(
  id: string,
  input: UpdateGeneratedOPInput
): GeneratedOP | null {
  const db = getDb();
  const now = new Date().toISOString();

  // Check if exists
  const existing = queryOne<{ id: string }>('SELECT id FROM generated_ops WHERE id = ?', [id]);

  if (!existing) return null;

  // Build dynamic update
  const updates: string[] = ['updated_at = ?'];
  const values: unknown[] = [now];

  if (input.name !== undefined) {
    updates.push('name = ?');
    values.push(input.name);
  }
  if (input.status !== undefined) {
    updates.push('status = ?');
    values.push(input.status);
  }
  if (input.filePath !== undefined) {
    updates.push('file_path = ?');
    values.push(input.filePath);
  }
  if (input.pages !== undefined) {
    updates.push('pages = ?');
    values.push(JSON.stringify(input.pages));
  }
  if (input.metadata !== undefined) {
    updates.push('metadata = ?');
    values.push(JSON.stringify(input.metadata));
  }
  if (input.thumbnailUrl !== undefined) {
    updates.push('thumbnail_url = ?');
    values.push(input.thumbnailUrl);
  }

  values.push(id);

  db.run(`UPDATE generated_ops SET ${updates.join(', ')} WHERE id = ?`, values);
  saveDb();

  return getGeneratedOPById(id);
}

/**
 * Update the status of a generated OP
 */
export function updateGeneratedOPStatus(
  id: string,
  status: GenerationStatus
): boolean {
  const now = new Date().toISOString();
  const changes = execute(
    'UPDATE generated_ops SET status = ?, updated_at = ? WHERE id = ?',
    [status, now, id]
  );
  return changes > 0;
}

/**
 * Delete a generated OP
 */
export function deleteGeneratedOP(id: string): boolean {
  const changes = execute('DELETE FROM generated_ops WHERE id = ?', [id]);
  return changes > 0;
}

/**
 * Get count of generated OPs by status
 */
export function countGeneratedOPsByStatus(): Record<GenerationStatus, number> {
  const rows = queryAll<{ status: string; count: number }>(
    'SELECT status, COUNT(*) as count FROM generated_ops GROUP BY status'
  );

  const counts: Record<GenerationStatus, number> = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  for (const row of rows) {
    counts[row.status as GenerationStatus] = row.count;
  }

  return counts;
}
