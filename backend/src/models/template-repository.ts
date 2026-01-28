/**
 * Template Repository
 * Data access layer for templates, pages, and sections
 *
 * Handles:
 * - CRUD operations for templates with nested pages/sections
 * - JSON serialization/deserialization for complex fields
 * - Transactional operations for data integrity
 */

import { randomUUID } from 'crypto';
import { queryAll, queryOne, execute, transaction, getDb, saveDb } from './db.js';
import type {
  Template,
  Page,
  Section,
  CreateTemplateInput,
  UpdateTemplateInput,
  LayoutType,
  SectionType,
  DataSource,
  VisualProperties,
  Position,
} from '@op-maker/shared';

// ============================================================================
// Type Definitions for Database Rows
// ============================================================================

interface TemplateRow {
  id: string;
  name: string;
  description: string | null;
  tags: string | null;
  thumbnail_url: string | null;
  slide_width: number;
  slide_height: number;
  color_scheme: string | null;
  created_at: string;
  updated_at: string;
}

interface PageRow {
  id: string;
  template_id: string;
  name: string;
  order: number;
  layout_type: string;
  background_color: string | null;
  background_image: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface SectionRow {
  id: string;
  page_id: string;
  name: string;
  type: string;
  data_source: string;
  visual_properties: string;
  position: string;
  parent_section_id: string | null;
  locked: number;
  visible: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

function parseJsonOrDefault<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

function toTemplateRow(row: TemplateRow): Omit<Template, 'pages'> {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    tags: parseJsonOrDefault<string[]>(row.tags, undefined),
    thumbnailUrl: row.thumbnail_url || undefined,
    slideWidth: row.slide_width,
    slideHeight: row.slide_height,
    colorScheme: parseJsonOrDefault(row.color_scheme, undefined),
    createdAt: parseDate(row.created_at),
    updatedAt: parseDate(row.updated_at),
  };
}

function toPage(row: PageRow, sections: Section[]): Page {
  return {
    id: row.id,
    name: row.name,
    order: row.order,
    layoutType: row.layout_type as LayoutType,
    backgroundColor: row.background_color || undefined,
    backgroundImage: row.background_image || undefined,
    notes: row.notes || undefined,
    sections,
  };
}

function toSection(row: SectionRow, children: Section[] = []): Section {
  const section: Section = {
    id: row.id,
    name: row.name,
    type: row.type as SectionType,
    dataSource: JSON.parse(row.data_source) as DataSource,
    visualProperties: JSON.parse(row.visual_properties) as VisualProperties,
    position: JSON.parse(row.position) as Position,
    locked: row.locked === 1,
    visible: row.visible === 1,
  };

  if (children.length > 0) {
    section.children = children;
  }

  return section;
}

// ============================================================================
// Repository Functions
// ============================================================================

/**
 * List all templates (without nested pages/sections for performance)
 */
export function listTemplates(): Template[] {
  const rows = queryAll<TemplateRow>('SELECT * FROM templates ORDER BY updated_at DESC');

  return rows.map((row) => ({
    ...toTemplateRow(row),
    pages: [], // Don't load nested data for list view
  }));
}

/**
 * Get a single template by ID with all nested pages and sections
 */
export function getTemplateById(id: string): Template | null {
  const templateRow = queryOne<TemplateRow>('SELECT * FROM templates WHERE id = ?', [id]);

  if (!templateRow) return null;

  // Get pages ordered by their order field
  const pageRows = queryAll<PageRow>(
    'SELECT * FROM template_pages WHERE template_id = ? ORDER BY "order" ASC',
    [id]
  );

  // Get all sections for all pages in one query
  const pageIds = pageRows.map((p) => p.id);
  if (pageIds.length === 0) {
    return {
      ...toTemplateRow(templateRow),
      pages: [],
    };
  }

  const placeholders = pageIds.map(() => '?').join(',');
  const sectionRows = queryAll<SectionRow>(
    `SELECT * FROM template_sections WHERE page_id IN (${placeholders}) ORDER BY page_id`,
    pageIds
  );

  // Group sections by page_id and build hierarchy
  const sectionsByPage = new Map<string, SectionRow[]>();
  for (const section of sectionRows) {
    const existing = sectionsByPage.get(section.page_id) || [];
    existing.push(section);
    sectionsByPage.set(section.page_id, existing);
  }

  // Build nested section tree for each page
  const pages = pageRows.map((pageRow) => {
    const pageSections = sectionsByPage.get(pageRow.id) || [];
    const sections = buildSectionTree(pageSections);
    return toPage(pageRow, sections);
  });

  return {
    ...toTemplateRow(templateRow),
    pages,
  };
}

/**
 * Build a hierarchical section tree from flat rows
 */
function buildSectionTree(rows: SectionRow[]): Section[] {
  const sectionsById = new Map<string, Section>();
  const rootSections: Section[] = [];

  // First pass: create all sections
  for (const row of rows) {
    sectionsById.set(row.id, toSection(row, []));
  }

  // Second pass: build tree
  for (const row of rows) {
    const section = sectionsById.get(row.id)!;
    if (row.parent_section_id) {
      const parent = sectionsById.get(row.parent_section_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(section);
      } else {
        // Parent not found, treat as root
        rootSections.push(section);
      }
    } else {
      rootSections.push(section);
    }
  }

  return rootSections;
}

/**
 * Create a new template with pages and sections
 */
export function createTemplate(input: CreateTemplateInput): Template {
  const db = getDb();
  const templateId = randomUUID();
  const now = new Date().toISOString();

  // Insert template
  db.run(
    `INSERT INTO templates (id, name, description, tags, slide_width, slide_height, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      templateId,
      input.name,
      input.description || null,
      input.tags ? JSON.stringify(input.tags) : null,
      input.slideWidth || 1920,
      input.slideHeight || 1080,
      now,
      now,
    ]
  );

  // Insert pages and sections
  if (input.pages && input.pages.length > 0) {
    for (let i = 0; i < input.pages.length; i++) {
      const page = input.pages[i];
      const pageId = randomUUID();

      db.run(
        `INSERT INTO template_pages (id, template_id, name, "order", layout_type, background_color, background_image, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pageId,
          templateId,
          page.name,
          page.order ?? i,
          page.layoutType || 'blank',
          page.backgroundColor || null,
          page.backgroundImage || null,
          page.notes || null,
          now,
          now,
        ]
      );

      // Insert sections for this page
      if (page.sections && page.sections.length > 0) {
        insertSections(pageId, page.sections, null, now);
      }
    }
  }

  saveDb();
  return getTemplateById(templateId)!;
}

/**
 * Recursively insert sections (handles nested children)
 */
function insertSections(
  pageId: string,
  sections: Omit<Section, 'id'>[],
  parentId: string | null,
  now: string
): void {
  const db = getDb();
  for (const section of sections) {
    const sectionId = randomUUID();

    db.run(
      `INSERT INTO template_sections (id, page_id, name, type, data_source, visual_properties, position, parent_section_id, locked, visible, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sectionId,
        pageId,
        section.name,
        section.type,
        JSON.stringify(section.dataSource),
        JSON.stringify(section.visualProperties),
        JSON.stringify(section.position),
        parentId,
        section.locked ? 1 : 0,
        section.visible !== false ? 1 : 0,
        now,
        now,
      ]
    );

    // Recursively insert children
    if (section.children && section.children.length > 0) {
      insertSections(pageId, section.children as Omit<Section, 'id'>[], sectionId, now);
    }
  }
}

/**
 * Update a template and its nested structure
 */
export function updateTemplate(id: string, input: UpdateTemplateInput): Template | null {
  const db = getDb();
  const now = new Date().toISOString();

  // Check if template exists
  const existing = queryOne<{ id: string }>('SELECT id FROM templates WHERE id = ?', [id]);

  if (!existing) return null;

  // Build update query dynamically
  const updates: string[] = ['updated_at = ?'];
  const values: unknown[] = [now];

  if (input.name !== undefined) {
    updates.push('name = ?');
    values.push(input.name);
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    values.push(input.description);
  }
  if (input.tags !== undefined) {
    updates.push('tags = ?');
    values.push(JSON.stringify(input.tags));
  }
  if (input.slideWidth !== undefined) {
    updates.push('slide_width = ?');
    values.push(input.slideWidth);
  }
  if (input.slideHeight !== undefined) {
    updates.push('slide_height = ?');
    values.push(input.slideHeight);
  }

  values.push(id);

  db.run(`UPDATE templates SET ${updates.join(', ')} WHERE id = ?`, values);

  // If pages are provided, replace all pages and sections
  if (input.pages !== undefined) {
    // Delete existing pages (cascade deletes sections)
    db.run('DELETE FROM template_pages WHERE template_id = ?', [id]);

    // Insert new pages
    for (let i = 0; i < input.pages.length; i++) {
      const page = input.pages[i];
      const pageId = page.id || randomUUID();

      db.run(
        `INSERT INTO template_pages (id, template_id, name, "order", layout_type, background_color, background_image, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pageId,
          id,
          page.name,
          page.order ?? i,
          page.layoutType || 'blank',
          page.backgroundColor || null,
          page.backgroundImage || null,
          page.notes || null,
          now,
          now,
        ]
      );

      // Insert sections
      if (page.sections && page.sections.length > 0) {
        insertSectionsWithIds(pageId, page.sections, null, now);
      }
    }
  }

  saveDb();
  return getTemplateById(id);
}

/**
 * Insert sections preserving their IDs (for updates)
 */
function insertSectionsWithIds(
  pageId: string,
  sections: Section[],
  parentId: string | null,
  now: string
): void {
  const db = getDb();
  for (const section of sections) {
    const sectionId = section.id || randomUUID();

    db.run(
      `INSERT INTO template_sections (id, page_id, name, type, data_source, visual_properties, position, parent_section_id, locked, visible, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sectionId,
        pageId,
        section.name,
        section.type,
        JSON.stringify(section.dataSource),
        JSON.stringify(section.visualProperties),
        JSON.stringify(section.position),
        parentId,
        section.locked ? 1 : 0,
        section.visible !== false ? 1 : 0,
        now,
        now,
      ]
    );

    if (section.children && section.children.length > 0) {
      insertSectionsWithIds(pageId, section.children, sectionId, now);
    }
  }
}

/**
 * Delete a template (cascade deletes pages and sections)
 */
export function deleteTemplate(id: string): boolean {
  const changes = execute('DELETE FROM templates WHERE id = ?', [id]);
  return changes > 0;
}

/**
 * Duplicate a template with a new ID
 */
export function duplicateTemplate(id: string): Template | null {
  const original = getTemplateById(id);
  if (!original) return null;

  // Create a new template with copied data
  const input: CreateTemplateInput = {
    name: `${original.name} (Copy)`,
    description: original.description,
    tags: original.tags,
    slideWidth: original.slideWidth,
    slideHeight: original.slideHeight,
    pages: original.pages.map((page) => ({
      name: page.name,
      order: page.order,
      layoutType: page.layoutType,
      backgroundColor: page.backgroundColor,
      backgroundImage: page.backgroundImage,
      notes: page.notes,
      sections: page.sections,
    })),
  };

  return createTemplate(input);
}

/**
 * Export template to JSON format
 */
export function exportTemplateToJson(id: string): object | null {
  const template = getTemplateById(id);
  if (!template) return null;

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    template: {
      name: template.name,
      description: template.description,
      tags: template.tags,
      slideWidth: template.slideWidth,
      slideHeight: template.slideHeight,
      colorScheme: template.colorScheme,
      pages: template.pages,
    },
  };
}

/**
 * Import template from JSON format
 */
export function importTemplateFromJson(json: {
  template: CreateTemplateInput;
}): Template {
  return createTemplate(json.template);
}
