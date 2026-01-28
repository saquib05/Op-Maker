# 01 - Foundation (Repo + Tooling + Conventions)

## Goal

Establish a **repeatable on-prem dev workspace** with the locked repo layout, shared types placeholder, and consistent conventions - so backend/frontend work can start without revisiting setup.

## Dependencies

- None.

## Outputs (definition of done)

- Repo folders exist: `frontend/`, `backend/`, `database/`, `storage/`, `docs/`, plus a **shared types** location (locked requirement).
- A single-command dev workflow exists for backend and frontend (exact script names defined).
- Cross-project conventions are documented (kebab-case filenames, error UX patterns, where env vars live).

---

## Checklist

- [x] Create/confirm required top-level folders: `frontend/`, `backend/`, `database/`, `storage/`, `docs/`.
- [x] Create/confirm subfolders under `storage/` (from PRD):
  - [x] `storage/templates/`
  - [x] `storage/generated-ops/`
  - [x] `storage/excel-files/`
  - [x] `storage/images/`
- [x] Decide monorepo approach (must be explicit to avoid drift):
  - [x] **Workspaces** strategy (e.g., npm workspaces vs pnpm vs yarn) -> **npm workspaces**
  - [x] **Shared types** location name (locked: shared package exists; example: `shared/` or `packages/types/`) -> **`shared/`**
- [x] Initialize shared types package skeleton (no app logic yet):
  - [x] TypeScript config for shared package
  - [x] Export barrels for core domain types (Template/Page/Section/GeneratedOP) and future Zod schemas
- [x] Decide formatting/linting baseline and enforce it consistently:
  - [x] Prettier config -> `.prettierrc` + `.prettierignore`
  - [x] ESLint config (TypeScript + React + Node) -> `eslint.config.js` (flat config)
  - [x] EditorConfig -> `.editorconfig`
- [x] Establish environment/config conventions (on-prem, single user):
  - [x] Where backend reads config from (e.g., `.env` + typed config module) -> `backend/.env`
  - [x] Where frontend reads config from (e.g., Vite env) -> `frontend/.env` with `VITE_` prefix
  - [x] Define required config keys (at minimum: Gemini API key placeholder, storage base path) -> See `.env.example` files
- [x] Choose the frontend bundler/scaffolding (must align with React+TS):
  - [x] Vite vs alternatives (document decision) -> **Vite** (fastest DX, excellent React+TS support)
- [x] Create consistent scripts (names must be stable for later verification commands):
  - [x] Backend: dev, build, start, lint, test (test can be placeholder initially)
  - [x] Frontend: dev, build, preview, lint, test (test can be placeholder initially)
  - [x] Root: convenience scripts to run frontend+backend (optional but helpful)
- [x] Document locked UI/editor decisions in a short "conventions" note for implementers:
  - [x] Tailwind + Radix primitives -> `docs/CONVENTIONS.md` Section 2
  - [x] Modals are primary error/confirm pattern -> `docs/CONVENTIONS.md` Section 2.2
  - [x] Fabric.js editor patterns (pan/zoom/selection shortcuts) -> `docs/CONVENTIONS.md` Section 3
  - [x] Zustand store is source of truth; snapshots for undo/redo -> `docs/CONVENTIONS.md` Section 4

---

## Verification commands (Phase 4 execution)

Run these after implementing this phase:

- [x] From repo root: `node --version` -> v24.13.0
- [x] From repo root: (workspace install) `npm install` -> 669 packages
- [x] From `backend/`: `npm run lint` -> PASSED
- [x] From `frontend/`: `npm run lint` -> PASSED
- [x] From `backend/`: `npm run build` -> PASSED
- [x] From `frontend/`: `npm run build` -> PASSED (180.11 kB bundle)

## Notes / non-goals

- This phase does **not** implement any product features.
- Do **not** pick any of the "explicitly not decided yet" items (rich text editor, charts, Excel lib, PPT lib, theme presets) unless required to unblock tooling; if required, record the decision explicitly.
