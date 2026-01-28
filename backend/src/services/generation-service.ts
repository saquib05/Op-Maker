/**
 * Generation Service
 * Handles business logic for OP generation from templates
 *
 * Later phases will implement actual generation logic with:
 * - LLM integration (Gemini)
 * - Excel data processing
 * - PPT assembly
 */

import type { GeneratedOP } from '@op-maker/shared';

/**
 * Generation status enum
 */
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Generation job info
 */
export interface GenerationJob {
  opId: string;
  templateId: string;
  status: GenerationStatus;
  progress: number; // 0-100
  message?: string;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Generation request parameters
 */
export interface GenerateRequest {
  templateId: string;
  fields: Record<string, unknown>;
  excelFilePath?: string;
  imagePaths?: string[];
  name?: string;
}

/**
 * Service interface for generation operations
 */
export interface GenerationService {
  startGeneration(request: GenerateRequest): Promise<GenerationJob>;
  getStatus(opId: string): Promise<GenerationJob | null>;
  getResult(opId: string): Promise<GeneratedOP | null>;
}

/**
 * Generation service placeholder implementation
 */
export const generationService: GenerationService = {
  async startGeneration(_request) {
    // TODO: Implement in later phases
    throw new Error('Not implemented');
  },

  async getStatus(_opId) {
    // TODO: Implement in later phases
    return null;
  },

  async getResult(_opId) {
    // TODO: Implement in later phases
    return null;
  },
};
