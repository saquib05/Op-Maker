/**
 * Generated OP (Opportunity Profile) Types
 */

import type { Page } from './template';

// ============================================================================
// Generation Status
// ============================================================================

export type GenerationStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface GenerationProgress {
  status: GenerationStatus;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  percentage: number;
  message?: string;
  error?: string;
}

// ============================================================================
// Generated OP
// ============================================================================

export interface GeneratedOP {
  id: string;
  templateId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  /** Path to the generated file on disk */
  filePath?: string;
  /** Generation status */
  status: GenerationStatus;
  /** Input data used for generation */
  inputData: Record<string, unknown>;
  /** Rendered pages with actual content */
  pages: Page[];
  /** Additional metadata */
  metadata: Record<string, unknown>;
  /** Thumbnail URL for preview */
  thumbnailUrl?: string;
}

// ============================================================================
// Generation Request/Response DTOs
// ============================================================================

export interface GenerateOPInput {
  templateId: string;
  name: string;
  /** Field values keyed by section ID */
  fields: Record<string, unknown>;
  /** Excel file reference (file ID or path) */
  excelFileId?: string;
  /** Image file references keyed by section ID */
  images?: Record<string, string>;
}

export interface GenerateOPResponse {
  opId: string;
  status: GenerationStatus;
  progress: GenerationProgress;
}

// ============================================================================
// Export Types
// ============================================================================

export type ExportFormat = 'pptx' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  /** Export specific slides (by index, 0-based) */
  slideIndices?: number[];
  /** Image quality for exports (0-100) */
  imageQuality?: number;
  /** Include speaker notes */
  includeNotes?: boolean;
  /** Custom filename (without extension) */
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  downloadUrl?: string;
  error?: string;
}
