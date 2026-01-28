/**
 * Shared Types - Barrel Export
 * 
 * This module exports all shared types used across frontend and backend.
 */

// Template domain types
export type {
  Position,
  VisualProperties,
  DataSourceType,
  ExcelConfig,
  DataSource,
  SectionType,
  Section,
  LayoutType,
  Page,
  Template,
  CreateTemplateInput,
  UpdateTemplateInput,
} from './template';

// Generated OP types
export type {
  GenerationStatus,
  GenerationProgress,
  GeneratedOP,
  GenerateOPInput,
  GenerateOPResponse,
  ExportFormat,
  ExportOptions,
  ExportResult,
} from './generated-op';
