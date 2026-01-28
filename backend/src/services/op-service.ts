/**
 * OP Service
 * Handles business logic for managing generated OPs (Opportunity Profiles)
 *
 * Later phases will implement actual persistence and editing logic.
 */

import type { GeneratedOP } from '@op-maker/shared';

/**
 * AI redesign request
 */
export interface AiRedesignRequest {
  opId: string;
  sectionId: string;
  prompt: string;
  referenceImagePath?: string;
}

/**
 * Service interface for OP operations
 */
export interface OpService {
  getById(id: string): Promise<GeneratedOP | null>;
  update(id: string, data: Partial<GeneratedOP>): Promise<GeneratedOP | null>;
  aiRedesign(request: AiRedesignRequest): Promise<object>;
}

/**
 * OP service placeholder implementation
 */
export const opService: OpService = {
  async getById(_id) {
    // TODO: Implement in later phases
    return null;
  },

  async update(_id, _data) {
    // TODO: Implement in later phases
    return null;
  },

  async aiRedesign(_request) {
    // TODO: Implement in later phases with Gemini integration
    throw new Error('Not implemented');
  },
};
