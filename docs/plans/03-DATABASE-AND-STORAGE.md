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

- [ ] Confirm SQLite is the chosen DB for V1 (PRD recommendation; single-machine on-prem).
- [ ] Decide migration strategy (must be explicit):
  - [ ] “Code-first” (e.g., Prisma migrations) **or** “SQL-first” migration scripts
  - [ ] Where migration files live and how they are executed
- [ ] Define schema tables (minimum viable based on PRD “Schema Areas”):
  - [ ] `templates` (id, name, description/tags, createdAt, updatedAt)
  - [ ] `template_pages` (id, templateId, name, order, layoutType)
  - [ ] `template_sections` (id, pageId, name, type, dataSource JSON, visualProperties JSON, position JSON)
  - [ ] `generated_ops` (id, templateId, name, createdAt, filePath, metadata JSON)
  - [ ] `settings` (id or singleton, json blob)
- [ ] Decide how to store nested structures:
  - [ ] Normalize (pages/sections tables) vs store entire Template as JSON blob (document decision + rationale)
- [ ] Implement a migration to create schema from scratch.

### Backend data access layer

- [ ] Add a DB module in backend that:
  - [ ] opens the SQLite database
  - [ ] exposes basic query helpers
  - [ ] cleanly closes on shutdown
- [ ] Add repository/model modules for:
  - [ ] Templates CRUD
  - [ ] Generated OP records CRUD (at least create + read)
- [ ] Wire repositories into the existing route stubs so:
  - [ ] `GET /api/templates` returns real data (even if empty)
  - [ ] `POST /api/templates` can create a template with pages/sections
  - [ ] `GET /api/templates/:id` returns the full nested template
  - [ ] `PUT /api/templates/:id` updates template + children
  - [ ] `DELETE /api/templates/:id` deletes template

### Filesystem storage contracts

- [ ] Define canonical, server-side file naming rules (no user auth, but avoid collisions):
  - [ ] where Excel uploads are saved (`storage/excel-files/`)
  - [ ] where images are saved (`storage/images/`)
  - [ ] where generated OP outputs are saved (`storage/generated-ops/`)
  - [ ] how template JSON exports are stored/served (`storage/templates/` or DB-only; document decision)
- [ ] Implement safe path utilities:
  - [ ] prevent path traversal
  - [ ] normalize separators (Windows)
- [ ] Ensure upload endpoints from Phase 02 persist files into the correct storage folders.

---

## Verification commands (Phase 4 execution)

- [ ] From repo root (or `backend/`): run the migration command to create `database/opmaker.db`
- [ ] Start backend: `npm run dev`
- [ ] Create a template via `POST /api/templates`
- [ ] List templates via `GET /api/templates` and confirm it returns the created template
- [ ] Confirm a test upload lands in the correct `storage/` subfolder

## Notes / non-goals

- This phase does **not** implement AI generation or PPTX export—only persistence/storage foundations.
- If a future phase selects Prisma or another ORM, ensure it does not violate on-prem/single-file SQLite constraints.

