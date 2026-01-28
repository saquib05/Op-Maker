/**
 * Template Service
 * Handles business logic for template management
 *
 * Uses the template repository for data access.
 */

import type { Template, CreateTemplateInput, UpdateTemplateInput } from '@op-maker/shared';
import {
  listTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  exportTemplateToJson,
  importTemplateFromJson,
} from '../models/index.js';

/**
 * Service interface for template operations
 */
export interface TemplateService {
  list(): Promise<Template[]>;
  getById(id: string): Promise<Template | null>;
  create(data: CreateTemplateInput): Promise<Template>;
  update(id: string, data: UpdateTemplateInput): Promise<Template | null>;
  delete(id: string): Promise<boolean>;
  duplicate(id: string): Promise<Template | null>;
  exportToJson(id: string): Promise<object | null>;
  importFromJson(json: object): Promise<Template>;
}

/**
 * Template service implementation using SQLite repository
 */
export const templateService: TemplateService = {
  async list() {
    return listTemplates();
  },

  async getById(id) {
    return getTemplateById(id);
  },

  async create(data) {
    return createTemplate(data);
  },

  async update(id, data) {
    return updateTemplate(id, data);
  },

  async delete(id) {
    return deleteTemplate(id);
  },

  async duplicate(id) {
    return duplicateTemplate(id);
  },

  async exportToJson(id) {
    return exportTemplateToJson(id);
  },

  async importFromJson(json) {
    // Validate the import structure
    const importData = json as { template?: CreateTemplateInput };
    if (!importData.template || !importData.template.name) {
      throw new Error('Invalid import format: template.name is required');
    }
    return importTemplateFromJson(importData as { template: CreateTemplateInput });
  },
};
