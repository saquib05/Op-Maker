/**
 * Database Module
 * Singleton SQLite connection using sql.js (pure JavaScript SQLite)
 *
 * Design decisions:
 * - SQL-first migration approach (simple, explicit)
 * - Normalized schema (templates -> pages -> sections) for query flexibility
 * - Singleton pattern ensures single connection across the app
 * - Uses sql.js for pure JavaScript SQLite (no native compilation needed)
 */

import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env.js';

// Singleton database instance
let db: SqlJsDatabase | null = null;
let sqlPromise: Promise<typeof import('sql.js')> | null = null;

/**
 * Get the singleton database instance
 * Throws if database is not initialized
 */
export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error(
      'Database not initialized. Call initDb() before accessing the database.'
    );
  }
  return db;
}

/**
 * Initialize the database connection
 * Creates the database file and runs migrations if needed
 */
export async function initDb(): Promise<SqlJsDatabase> {
  if (db) {
    console.log('📦 Database already initialized');
    return db;
  }

  // Ensure database directory exists
  const dbDir = path.dirname(config.database.path);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`📁 Created database directory: ${dbDir}`);
  }

  // Initialize sql.js
  if (!sqlPromise) {
    sqlPromise = initSqlJs();
  }
  const SQL = await sqlPromise;

  // Check if database file exists
  let dbBuffer: Buffer | null = null;
  if (fs.existsSync(config.database.path)) {
    dbBuffer = fs.readFileSync(config.database.path);
    console.log(`📦 Loading existing database: ${config.database.path}`);
  } else {
    console.log(`📦 Creating new database: ${config.database.path}`);
  }

  // Create database instance
  db = dbBuffer ? new SQL.Database(dbBuffer) : new SQL.Database();

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  console.log(`📦 Database connected: ${config.database.path}`);

  // Run migrations
  runMigrations(db);

  // Save database after migrations
  saveDb();

  return db;
}

/**
 * Save the database to disk
 */
export function saveDb(): void {
  if (!db) return;

  const data = db.export();
  const buffer = Buffer.from(data);

  // Ensure directory exists
  const dbDir = path.dirname(config.database.path);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  fs.writeFileSync(config.database.path, buffer);
}

/**
 * Close the database connection gracefully
 */
export function closeDb(): void {
  if (db) {
    saveDb(); // Save before closing
    db.close();
    db = null;
    console.log('📦 Database connection closed');
  }
}

/**
 * Run database migrations
 * Uses a simple version tracking approach
 */
function runMigrations(database: SqlJsDatabase): void {
  // Create migrations tracking table if it doesn't exist
  database.run(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Get list of applied migrations
  const appliedStmt = database.prepare('SELECT name FROM _migrations');
  const appliedMigrations: string[] = [];
  while (appliedStmt.step()) {
    const row = appliedStmt.getAsObject() as { name: string };
    appliedMigrations.push(row.name);
  }
  appliedStmt.free();

  const appliedSet = new Set(appliedMigrations);

  // Run each migration that hasn't been applied
  for (const migration of MIGRATIONS) {
    if (!appliedSet.has(migration.name)) {
      console.log(`🔄 Running migration: ${migration.name}`);
      try {
        database.run('BEGIN TRANSACTION');
        database.run(migration.sql);
        database.run('INSERT INTO _migrations (name) VALUES (?)', [migration.name]);
        database.run('COMMIT');
        console.log(`✅ Migration complete: ${migration.name}`);
      } catch (err) {
        database.run('ROLLBACK');
        console.error(`❌ Migration failed: ${migration.name}`, err);
        throw err;
      }
    }
  }
}

/**
 * Migration definitions
 * Each migration should be idempotent-safe when wrapped in transaction
 */
interface Migration {
  name: string;
  sql: string;
}

const MIGRATIONS: Migration[] = [
  {
    name: '001_initial_schema',
    sql: `
      -- Templates table
      CREATE TABLE templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        tags TEXT,
        thumbnail_url TEXT,
        slide_width INTEGER DEFAULT 1920,
        slide_height INTEGER DEFAULT 1080,
        color_scheme TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- Template pages table
      CREATE TABLE template_pages (
        id TEXT PRIMARY KEY,
        template_id TEXT NOT NULL,
        name TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        layout_type TEXT NOT NULL DEFAULT 'blank',
        background_color TEXT,
        background_image TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
      );

      -- Template sections table
      CREATE TABLE template_sections (
        id TEXT PRIMARY KEY,
        page_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'text',
        data_source TEXT NOT NULL,
        visual_properties TEXT NOT NULL,
        position TEXT NOT NULL,
        parent_section_id TEXT,
        locked INTEGER DEFAULT 0,
        visible INTEGER DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (page_id) REFERENCES template_pages(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_section_id) REFERENCES template_sections(id) ON DELETE SET NULL
      );

      -- Generated OPs table
      CREATE TABLE generated_ops (
        id TEXT PRIMARY KEY,
        template_id TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        file_path TEXT,
        input_data TEXT NOT NULL,
        pages TEXT NOT NULL,
        metadata TEXT,
        thumbnail_url TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
      );

      -- Settings table (singleton pattern)
      CREATE TABLE settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL DEFAULT '{}',
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- Insert default settings row
      INSERT INTO settings (id, data) VALUES (1, '{}');

      -- Indexes for common queries
      CREATE INDEX idx_template_pages_template_id ON template_pages(template_id);
      CREATE INDEX idx_template_sections_page_id ON template_sections(page_id);
      CREATE INDEX idx_generated_ops_template_id ON generated_ops(template_id);
      CREATE INDEX idx_generated_ops_status ON generated_ops(status);
    `,
  },
];

/**
 * Check if database is initialized
 */
export function isDbInitialized(): boolean {
  return db !== null;
}

/**
 * Execute a SQL statement and return all results
 */
export function queryAll<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const database = getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);

  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();

  return results;
}

/**
 * Execute a SQL statement and return the first result
 */
export function queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | null {
  const results = queryAll<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute a SQL statement (INSERT, UPDATE, DELETE)
 */
export function execute(sql: string, params: unknown[] = []): number {
  const database = getDb();
  database.run(sql, params);
  saveDb(); // Auto-save after modifications
  return database.getRowsModified();
}

/**
 * Run multiple statements in a transaction
 */
export function transaction<T>(fn: () => T): T {
  const database = getDb();
  let inTransaction = false;
  try {
    database.run('BEGIN TRANSACTION');
    inTransaction = true;
    const result = fn();
    database.run('COMMIT');
    inTransaction = false;
    saveDb(); // Save after transaction
    return result;
  } catch (err) {
    if (inTransaction) {
      try {
        database.run('ROLLBACK');
      } catch {
        // Ignore rollback errors
      }
    }
    throw err;
  }
}

export type { SqlJsDatabase as Database };
