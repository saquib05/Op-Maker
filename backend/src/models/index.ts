/**
 * Models Index
 * Re-exports all database models and repository functions
 *
 * Models handle database interactions (SQLite via better-sqlite3).
 */

// Database connection management
export {
  initDb,
  closeDb,
  getDb,
  saveDb,
  isDbInitialized,
  queryAll,
  queryOne,
  execute,
  transaction,
} from './db.js';

// Template repository
export {
  listTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  exportTemplateToJson,
  importTemplateFromJson,
} from './template-repository.js';

// Generated OP repository
export {
  listGeneratedOPs,
  listGeneratedOPsByTemplate,
  listGeneratedOPsByStatus,
  getGeneratedOPById,
  createGeneratedOP,
  updateGeneratedOP,
  updateGeneratedOPStatus,
  deleteGeneratedOP,
  countGeneratedOPsByStatus,
} from './op-repository.js';
export type {
  CreateGeneratedOPInput,
  UpdateGeneratedOPInput,
} from './op-repository.js';
