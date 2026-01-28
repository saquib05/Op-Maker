/**
 * OP Service
 * Handles business logic for managing generated OPs (Opportunity Profiles)
 *
 * Uses the OP repository for data access.
 */

import type { GeneratedOP, Page } from '@op-maker/shared';
import {
  listGeneratedOPs,
  listGeneratedOPsByTemplate,
  getGeneratedOPById,
  createGeneratedOP,
  updateGeneratedOP,
  deleteGeneratedOP,
} from '../models/index.js';
import type { CreateGeneratedOPInput, UpdateGeneratedOPInput } from '../models/index.js';

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
  list(): Promise<GeneratedOP[]>;
  listByTemplate(templateId: string): Promise<GeneratedOP[]>;
  getById(id: string): Promise<GeneratedOP | null>;
  create(data: CreateGeneratedOPInput): Promise<GeneratedOP>;
  update(id: string, data: UpdateGeneratedOPInput): Promise<GeneratedOP | null>;
  delete(id: string): Promise<boolean>;
  aiRedesign(request: AiRedesignRequest): Promise<object>;
}

/**
 * OP service implementation using SQLite repository
 */
export const opService: OpService = {
  async list() {
    return listGeneratedOPs();
  },

  async listByTemplate(templateId) {
    return listGeneratedOPsByTemplate(templateId);
  },

  async getById(id) {
    return getGeneratedOPById(id);
  },

  async create(data) {
    return createGeneratedOP(data);
  },

  async update(id, data) {
    return updateGeneratedOP(id, data);
  },

  async delete(id) {
    return deleteGeneratedOP(id);
  },

  async aiRedesign(_request) {
    // TODO: Implement in later phases with Gemini integration
    // This will call the Gemini API to redesign the layout
    throw new Error('AI redesign not implemented yet - coming in a later phase');
  },
};
