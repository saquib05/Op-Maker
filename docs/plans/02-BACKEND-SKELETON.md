# 02 — Backend Skeleton (Express API Base)

## Goal

Stand up the **minimum backend foundation** (Node.js + Express + TypeScript) with consistent routing, validation, error handling, and file-upload plumbing so later phases can add real business logic (templates, generation, export) without restructuring.

## Dependencies

- Phase 01 (repo/tooling conventions + shared types location chosen)

## Outputs (definition of done)

- Backend runs locally on a known port and exposes a health endpoint.
- Backend has stable folder structure aligned with PRD: `routes/`, `services/`, `models/`, `utils/`, `config/`.
- Central request validation pattern is established (PRD: Zod or Joi; decision must be explicit).
- Global error-handling middleware exists (backend-side), with consistent error shape for frontend.
- File upload handling is wired (Excel/images) into a storage area contract (actual persistence completed in Phase 03).

---

## Checklist

- [ ] Scaffold backend TypeScript app in `backend/` (Express).
- [ ] Implement baseline folder structure (locked in PRD):
  - [ ] `backend/src/routes/`
  - [ ] `backend/src/services/`
  - [ ] `backend/src/models/`
  - [ ] `backend/src/utils/`
  - [ ] `backend/src/config/`
- [ ] Implement config loading strategy (on-prem):
  - [ ] Port, storage base path, Gemini key placeholder
  - [ ] Ensure config is typed and fails fast if required keys missing (future: better UX)
- [ ] Add foundational middleware:
  - [ ] JSON body parsing
  - [ ] CORS policy for local dev frontend
  - [ ] Request logging (minimal)
- [ ] Establish API response conventions:
  - [ ] Standard success envelope (if any) and standard error envelope
  - [ ] Correlation/request id strategy (optional but helpful)
- [ ] Add a health endpoint:
  - [ ] `GET /api/health` returns { status: "ok", version, time }
- [ ] Choose and wire request validation library (must match PRD options):
  - [ ] Zod **or** Joi (record decision)
  - [ ] Add helper to validate req.body/req.params/req.query consistently
- [ ] Create “route module” pattern:
  - [ ] One router per domain (templates, ops, generate, export, excel)
  - [ ] Central `routes/index` that mounts `/api/*`
- [ ] Add file upload plumbing (contracts only; storage/move happens in Phase 03):
  - [ ] Endpoint(s) accept Excel and images as multipart/form-data
  - [ ] Ensure limits are not artificially enforced (PRD: no max enforced)
  - [ ] Normalize filenames and return server-side identifiers/paths (shape must be defined)
- [ ] Add placeholder route stubs for PRD endpoints (return “Not Implemented” consistently):
  - [ ] Templates: `GET/POST/GET:id/PUT/DELETE/duplicate/import/export`
  - [ ] Generation: `POST /api/generate`, `GET /api/generate/:opId/status`, `GET /api/generate/:opId`
  - [ ] OPs: `GET /api/ops/:id`, `PUT /api/ops/:id`, `POST /api/ops/:id/ai-redesign`
  - [ ] Export: `GET /api/ops/:id/export/pptx`, `GET /api/ops/:id/export/pdf`
  - [ ] Excel: `POST /api/excel/parse`, `POST /api/excel/process`
- [ ] Add a minimal “service layer” placeholder per domain (no logic yet, just boundaries).

---

## Verification commands (Phase 4 execution)

- [ ] From `backend/`: `npm run dev` (server starts)
- [ ] In a second terminal: call `GET /api/health` and confirm 200 response
- [ ] Call one stub endpoint (e.g., `GET /api/templates`) and confirm it returns a consistent “Not Implemented” error shape

## Notes / non-goals

- No SQLite work in this phase (Phase 03).
- No actual template persistence or generation logic (later phases).
- Frontend error UX is handled with modals (locked), but that is implemented in frontend phases—backend only needs consistent error shapes.

