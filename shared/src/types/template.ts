/**
 * Template Domain Types
 * Core data structures for OP Maker templates
 */

// ============================================================================
// Position & Visual Properties
// ============================================================================

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
}

export interface VisualProperties {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder' | number;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  padding?: number | { top: number; right: number; bottom: number; left: number };
  opacity?: number;
}

// ============================================================================
// Data Sources
// ============================================================================

export type DataSourceType = 'llm' | 'excel' | 'text' | 'image' | 'static';

export interface ExcelConfig {
  columns: string[];
  formula?: string;
  rowFilter?: string;
  aggregation?: 'sum' | 'average' | 'count' | 'custom';
  customAggregation?: string;
}

export interface DataSource {
  type: DataSourceType;
  /** LLM prompt template for AI-generated content */
  llmPrompt?: string;
  /** Excel data extraction configuration */
  excelConfig?: ExcelConfig;
  /** Default/static value */
  defaultValue?: string;
  /** Whether this field is required during generation */
  required?: boolean;
  /** Human-readable label for the input field */
  label?: string;
  /** Placeholder text for input fields */
  placeholder?: string;
}

// ============================================================================
// Section Types
// ============================================================================

export type SectionType = 'text' | 'image' | 'chart' | 'shape' | 'mixed' | 'group';

export interface Section {
  id: string;
  name: string;
  type: SectionType;
  dataSource: DataSource;
  visualProperties: VisualProperties;
  position: Position;
  /** Child sections for grouped elements */
  children?: Section[];
  /** Whether the section is locked for editing */
  locked?: boolean;
  /** Whether the section is visible */
  visible?: boolean;
}

// ============================================================================
// Page Types
// ============================================================================

export type LayoutType = 
  | 'blank'
  | 'title-only'
  | 'title-content'
  | 'two-column'
  | 'three-column'
  | 'title-two-column'
  | 'comparison'
  | 'custom';

export interface Page {
  id: string;
  name: string;
  order: number;
  layoutType: LayoutType;
  sections: Section[];
  /** Page background color */
  backgroundColor?: string;
  /** Page background image URL */
  backgroundImage?: string;
  /** Page notes/speaker notes */
  notes?: string;
}

// ============================================================================
// Template Types
// ============================================================================

export interface Template {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  pages: Page[];
  /** Template tags for filtering/searching */
  tags?: string[];
  /** Template thumbnail URL */
  thumbnailUrl?: string;
  /** Default slide dimensions (in pixels) */
  slideWidth?: number;
  slideHeight?: number;
  /** Default color scheme */
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

// ============================================================================
// Template Create/Update DTOs
// ============================================================================

export interface CreateTemplateInput {
  name: string;
  description?: string;
  pages?: Omit<Page, 'id'>[];
  tags?: string[];
  slideWidth?: number;
  slideHeight?: number;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  pages?: Page[];
  tags?: string[];
  slideWidth?: number;
  slideHeight?: number;
}
