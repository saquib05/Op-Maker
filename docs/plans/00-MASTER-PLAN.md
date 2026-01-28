# 00 — Master Plan (Atomic Roadmap)

This is the **phase index** for building OP Maker from scratch, derived strictly from `docs/01-PRD.md` and `docs/02-CONTEXT.md`.

## Dependency map (high-level)

- **Shared types** must exist before **frontend** + **backend** can safely exchange Template/Page/Section/GeneratedOP structures.
- **Backend + storage conventions** must exist before frontend can:
  - upload Excel/images,
  - start generation,
  - load/save OP JSON for the editor,
  - export PPTX/PDF.
- **SQLite schema + persistence layer** must exist before Template CRUD and OP save/load are “real”.
- **Excel parsing + formula evaluation** must exist before “Generate OP” can assemble section data reliably.
- **PPTX generation pipeline** must exist before export and before “open in editor” (editor needs a JSON slide model to render).
- **Editor core (Fabric + Zustand + snapshot undo/redo + autosave)** must exist before AI “layout rethink” and before production editing UX.

## Locked “vibe” decisions (from Phase 2)

- **UI**: Tailwind CSS + Radix primitives, spacious Canva-style layout, **modals** for errors/confirmations.
- **Editor core**: Fabric.js, direct in-canvas text editing (Fabric `IText`), smart guides, space-to-pan, wheel-zoom.
- **State**: Zustand; React store is source of truth; undo/redo via **state snapshots**; autosave hybrid (~30s silent draft + explicit save).
- **Repo**: single repo on-prem with `frontend/`, `backend/`, `database/`, `storage/`, `docs/`; shared types package; kebab-case filenames.

## Open (explicitly not decided yet; must be planned as decision tasks)

- Rich text editor choice: Slate.js vs Tiptap
- Chart approach: Recharts vs Chart.js and how charts render inside Fabric
- Excel lib choice: `xlsx` vs `exceljs`
- PPT lib choice: PptxGenJS vs python-pptx (if applicable)
- Theme presets (default palettes/tokens)

---

## Phase index

Only the **first 3 phases** have detailed plan files today (per request). Later phases are listed as **stubs** to make dependencies explicit.

### Phase 01 — Foundation (repo/workspaces/dev ergonomics)
- **File**: `docs/plans/01-FOUNDATION.md`
- **Depends on**: none
- **Unblocks**: all other phases

### Phase 02 — Backend Skeleton (Express API base)
- **File**: `docs/plans/02-BACKEND-SKELETON.md`
- **Depends on**: Phase 01
- **Unblocks**: FE integration, DB wiring, file upload flows

### Phase 03 — Database + Storage Foundations (SQLite + filesystem contracts)
- **File**: `docs/plans/03-DATABASE-AND-STORAGE.md`
- **Depends on**: Phase 01, Phase 02
- **Unblocks**: template CRUD persistence, OP save/load, export paths

---

## Remaining phases (stubs; to be expanded into atomic plan files)

### Phase 04 — Shared Domain Model (types + validation contracts)
- **Depends on**: Phase 01
- **Outputs**: shared types package; Zod schemas for API payloads; versioning strategy

### Phase 05 — Template CRUD (Backend)
- **Depends on**: Phase 03, Phase 04
- **Outputs**: template endpoints fully functional (create/edit/delete/duplicate/import/export)

### Phase 06 — Frontend App Shell (Routing + layout + API client base)
- **Depends on**: Phase 01, Phase 02, Phase 04
- **Outputs**: app layout (Canva-style panels), modal system, typed API client, error handling patterns

### Phase 07 — Template Builder UI (Frontend)
- **Depends on**: Phase 06, Phase 05
- **Outputs**: create/edit template pages/sections, datasource config UI, import/export JSON

### Phase 08 — Excel Parse/Process Service (Backend)
- **Depends on**: Phase 03, Phase 04
- **Outputs**: `/api/excel/parse` + `/api/excel/process`; formula strategy; preview mapping support

### Phase 09 — LLM Service Integration (Gemini 3 Pro)
- **Depends on**: Phase 02, Phase 04
- **Outputs**: Gemini client wrapper, prompt templates, cost controls, robust error handling

### Phase 10 — Generation Orchestrator (Backend)
- **Depends on**: Phase 05, Phase 08, Phase 09
- **Outputs**: `/api/generate` + status polling; section-by-section pipeline; progress model

### Phase 11 — Slide Model + Serialization Contract
- **Depends on**: Phase 10
- **Outputs**: JSON “presentation” model that frontend editor can render; mapping from template/sections to slide elements

### Phase 12 — PPTX Generation + Round-Trip
- **Depends on**: Phase 11
- **Outputs**: generate PPTX from slide model; (if needed) parse PPTX back into model; fidelity constraints documented

### Phase 13 — Editor Core (Fabric + Zustand)
- **Depends on**: Phase 06, Phase 11
- **Outputs**: canvas, selection, pan/zoom, layers panel, property panel, snapping, grouping

### Phase 14 — Undo/Redo + Autosave
- **Depends on**: Phase 13
- **Outputs**: snapshot history, keyboard shortcuts, 30s autosave drafts, explicit save checkpoints

### Phase 15 — AI Editor Features (Layout rethink + content enhancement)
- **Depends on**: Phase 13, Phase 09
- **Outputs**: `/api/ops/:id/ai-redesign`; reference image flow; UI for prompts + applying suggestions

### Phase 16 — Export (PPTX + PDF)
- **Depends on**: Phase 12, Phase 03
- **Outputs**: export endpoints; file naming; “export selected slides” logic; PDF fidelity strategy

### Phase 17 — Performance + Reliability Pass
- **Depends on**: Phase 06–16
- **Outputs**: generation <30s (typical), editor interactions <100ms, resilience when LLM unavailable

### Phase 18 — Manual Verification Guide (Phase 5 output)
- **Depends on**: all MVP phases
- **Outputs**: `docs/04-MANUAL-TEST.md` aligned to user flows and acceptance criteria

