/**
 * Excel Service
 * Handles business logic for parsing and processing Excel files
 *
 * Later phases will implement actual Excel processing with:
 * - xlsx or exceljs library
 * - Formula evaluation
 * - Data extraction and transformation
 */

/**
 * Excel column info
 */
export interface ExcelColumn {
  name: string;
  index: number;
  type: 'string' | 'number' | 'date' | 'boolean' | 'formula' | 'unknown';
}

/**
 * Excel parse result
 */
export interface ExcelParseResult {
  fileName: string;
  sheets: string[];
  activeSheet: string;
  columns: ExcelColumn[];
  previewRows: Record<string, unknown>[];
  totalRows: number;
}

/**
 * Excel process options
 */
export interface ExcelProcessOptions {
  filePath: string;
  columns?: string[];
  rowFilter?: string;
  aggregation?: 'sum' | 'average' | 'count' | 'custom';
  formula?: string;
}

/**
 * Excel process result
 */
export interface ExcelProcessResult {
  data: Record<string, unknown>[];
  summary?: Record<string, unknown>;
}

/**
 * Service interface for Excel operations
 */
export interface ExcelService {
  parse(filePath: string): Promise<ExcelParseResult>;
  process(options: ExcelProcessOptions): Promise<ExcelProcessResult>;
}

/**
 * Excel service placeholder implementation
 */
export const excelService: ExcelService = {
  async parse(_filePath) {
    // TODO: Implement in later phases with xlsx or exceljs
    throw new Error('Not implemented');
  },

  async process(_options) {
    // TODO: Implement in later phases with xlsx or exceljs
    throw new Error('Not implemented');
  },
};
