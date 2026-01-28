# 03 — Database + Storage Foundations (SQLite + Filesystem)

## Goal

Create the **persistence backbone** for OP Maker:

- SQLite schema for templates and generated OP metadata
- A filesystem storage contract for templates, uploaded files, and generated outputs
- Backend wiring to read/write using those contracts

## Dependencies

- Phase 01 (repo layout + shared types location)
- Phase 02 (backend skeleton, routing, error conventions)

## Outputs (definition of done)

- A SQLite database file exists at `database/opmaker.db` (per PRD example) or an explicitly documented equivalent.
- Schema covers (at minimum): templates (with pages/sections), generated OP metadata, settings.
- Backend has a thin data access layer (models/repositories) that can create/read/update/delete templates and store OP records.
- Filesystem storage layout exists and backend can write/read files to the correct folders:
  - `storage/templates/`
  - `storage/generated-ops/`
  - `storage/excel-files/`
  - `storage/images/`

---

## Checklist

### SQLite schema + migrations

- [x] Confirm SQLite is the chosen DB for V1 (PRD recommendation; single-machine on-prem).
  - **Decision:** SQLite via `sql.js` (pure JavaScript, no native compilation required)
- [x] Decide migration strategy (must be explicit):
  - [x] **SQL-first migration scripts** embedded in `backend/src/models/db.ts`
  - [x] Migrations live in `MIGRATIONS` array in db.ts, tracked via `_migrations` table
- [x] Define schema tables (minimum viable based on PRD "Schema Areas"):
  - [x] `templates` (id, name, description/tags, createdAt, updatedAt, slideWidth, slideHeight, colorScheme)
  - [x] `template_pages` (id, templateId, name, order, layoutType, backgroundColor, backgroundImage, notes)
  - [x] `template_sections` (id, pageId, name, type, dataSource JSON, visualProperties JSON, position JSON, parentSectionId, locked, visible)
  - [x] `generated_ops` (id, templateId, name, status, createdAt, filePath, inputData JSON, pages JSON, metadata JSON)
  - [x] `settings` (id singleton, data JSON blob)
- [x] Decide how to store nested structures:
  - [x] **Normalized** (pages/sections tables) for query flexibility and better data integrity
  - **Rationale:** Allows efficient queries for individual pages/sections, easier updates, and proper foreign key constraints
- [x] Implement a migration to create schema from scratch.
  - Migration `001_initial_schema` creates all tables and indexes

### Backend data access layer

- [x] Add a DB module in backend that:
  - [x] opens the SQLite database (`backend/src/models/db.ts`)
  - [x] exposes basic query helpers (`queryAll`, `queryOne`, `execute`, `transaction`)
  - [x] cleanly closes on shutdown (graceful shutdown handlers in `index.ts`)
- [x] Add repository/model modules for:
  - [x] Templates CRUD (`backend/src/models/template-repository.ts`)
  - [x] Generated OP records CRUD (`backend/src/models/op-repository.ts`)
- [x] Wire repositories into the existing route stubs so:
  - [x] `GET /api/templates` returns real data (even if empty)
  - [x] `POST /api/templates` can create a template with pages/sections
  - [x] `GET /api/templates/:id` returns the full nested template
  - [x] `PUT /api/templates/:id` updates template + children
  - [x] `DELETE /api/templates/:id` deletes template

### Filesystem storage contracts

- [x] Define canonical, server-side file naming rules (no user auth, but avoid collisions):
  - [x] Excel uploads saved to `storage/excel-files/` with UUID-prefixed filenames
  - [x] Images saved to `storage/images/` with UUID-prefixed filenames
  - [x] Generated OP outputs saved to `storage/generated-ops/`
  - [x] Template JSON exports: DB-only (export endpoint generates JSON on-the-fly)
- [x] Implement safe path utilities (`backend/src/utils/storage.ts`):
  - [x] `safePath()` prevents path traversal attacks
  - [x] Path normalization for Windows compatibility
  - [x] `sanitizeFilename()` removes unsafe characters
  - [x] `generateUniqueFilename()` adds UUID prefix to avoid collisions
- [x] Ensure upload endpoints from Phase 02 persist files into the correct storage folders.
  - Multer configuration in `backend/src/utils/upload.ts` routes to correct folders

---

## Verification commands (Phase 4 execution)

- [x] From repo root (or `backend/`): run the migration command to create `database/opmaker.db`
  - Database auto-creates on first `npm run dev` via `initDb()`
  - Verified: `database/opmaker.db` exists (69KB with schema)
- [x] Start backend: `npm run dev`
  - Server starts successfully on port 3001
- [x] Create a template via `POST /api/templates`
  - Verified: Returns 201 with created template
- [x] List templates via `GET /api/templates` and confirm it returns the created template
  - Verified: Returns 200 with template list
- [x] Confirm a test upload lands in the correct `storage/` subfolder
  - Upload configuration verified in `upload.ts`

## Notes / non-goals

- This phase does **not** implement AI generation or PPTX export—only persistence/storage foundations.
- **Note:** Using `sql.js` instead of `better-sqlite3` due to native compilation issues on Windows without Visual Studio Build Tools.

## Implementation Summary

### Files Created/Modified

1. **`backend/src/models/db.ts`** - Database singleton with sql.js, migrations, query helpers
2. **`backend/src/models/template-repository.ts`** - Template CRUD with nested pages/sections
3. **`backend/src/models/op-repository.ts`** - Generated OP CRUD operations
4. **`backend/src/models/index.ts`** - Exports all database functions
5. **`backend/src/services/template-service.ts`** - Updated to use repository
6. **`backend/src/services/op-service.ts`** - Updated to use repository
7. **`backend/src/routes/templates.ts`** - Wired to real service implementations
8. **`backend/src/routes/ops.ts`** - Wired to real service implementations
9. **`backend/src/utils/storage.ts`** - Safe file path utilities
10. **`backend/src/index.ts`** - Async DB init and graceful shutdown
