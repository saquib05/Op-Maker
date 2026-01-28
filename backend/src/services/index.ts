/**
 * Service Layer Index
 * Re-exports all services for easy importing
 *
 * Services contain business logic and are called by route handlers.
 * They should be independent of HTTP concerns (req/res).
 */

export { templateService } from './template-service.js';
export type { TemplateService } from './template-service.js';

export { generationService } from './generation-service.js';
export type {
  GenerationService,
  GenerationJob,
  GenerationStatus,
  GenerateRequest,
} from './generation-service.js';

export { opService } from './op-service.js';
export type { OpService, AiRedesignRequest } from './op-service.js';

export { exportService } from './export-service.js';
export type { ExportService, ExportOptions, ExportResult } from './export-service.js';

export { excelService } from './excel-service.js';
export type {
  ExcelService,
  ExcelColumn,
  ExcelParseResult,
  ExcelProcessOptions,
  ExcelProcessResult,
} from './excel-service.js';
