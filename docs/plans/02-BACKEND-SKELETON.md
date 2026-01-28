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

- [x] Scaffold backend TypeScript app in `backend/` (Express).
- [x] Implement baseline folder structure (locked in PRD):
  - [x] `backend/src/routes/`
  - [x] `backend/src/services/`
  - [x] `backend/src/models/`
  - [x] `backend/src/utils/`
  - [x] `backend/src/config/`
- [x] Implement config loading strategy (on-prem):
  - [x] Port, storage base path, Gemini key placeholder
  - [x] Ensure config is typed and fails fast if required keys missing (future: better UX)
- [x] Add foundational middleware:
  - [x] JSON body parsing
  - [x] CORS policy for local dev frontend
  - [x] Request logging (minimal)
- [x] Establish API response conventions:
  - [x] Standard success envelope (if any) and standard error envelope
  - [x] Correlation/request id strategy (optional but helpful)
- [x] Add a health endpoint:
  - [x] `GET /api/health` returns { status: "ok", version, time }
- [x] Choose and wire request validation library (must match PRD options):
  - [x] **Zod** chosen (modern TypeScript-first validation, already in PRD options)
  - [x] Add helper to validate req.body/req.params/req.query consistently
- [x] Create "route module" pattern:
  - [x] One router per domain (templates, ops, generate, export, excel)
  - [x] Central `routes/index` that mounts `/api/*`
- [x] Add file upload plumbing (contracts only; storage/move happens in Phase 03):
  - [x] Endpoint(s) accept Excel and images as multipart/form-data
  - [x] Ensure limits are not artificially enforced (PRD: no max enforced)
  - [x] Normalize filenames and return server-side identifiers/paths (shape must be defined)
- [x] Add placeholder route stubs for PRD endpoints (return "Not Implemented" consistently):
  - [x] Templates: `GET/POST/GET:id/PUT/DELETE/duplicate/import/export`
  - [x] Generation: `POST /api/generate`, `GET /api/generate/:opId/status`, `GET /api/generate/:opId`
  - [x] OPs: `GET /api/ops/:id`, `PUT /api/ops/:id`, `POST /api/ops/:id/ai-redesign`
  - [x] Export: `GET /api/ops/:id/export/pptx`, `GET /api/ops/:id/export/pdf`
  - [x] Excel: `POST /api/excel/parse`, `POST /api/excel/process`
- [x] Add a minimal "service layer" placeholder per domain (no logic yet, just boundaries).

---

## Verification commands (Phase 4 execution)

- [x] From `backend/`: `npm run dev` (server starts) ✅ Server started on port 3001
- [x] In a second terminal: call `GET /api/health` and confirm 200 response ✅ Returns `{ success: true, data: { status: "ok", version: "1.0.0", time: "..." } }`
- [x] Call one stub endpoint (e.g., `GET /api/templates`) and confirm it returns a consistent "Not Implemented" error shape ✅ Returns `{ success: false, error: { code: "NOT_IMPLEMENTED", message: "...", details: {...} }, meta: { requestId: "..." } }`

## Notes / non-goals

- No SQLite work in this phase (Phase 03).
- No actual template persistence or generation logic (later phases).
- Frontend error UX is handled with modals (locked), but that is implemented in frontend phases—backend only needs consistent error shapes.

## Implementation Summary

### Files Created/Modified

**Folder Structure:**
- `backend/src/routes/` - Route handlers for each domain
- `backend/src/services/` - Business logic layer (placeholders)
- `backend/src/models/` - Database models (placeholder for Phase 03)
- `backend/src/utils/` - Utility functions and helpers
- `backend/src/config/` - Environment configuration

**Route Files:**
- `routes/index.ts` - Central router mounting all domain routers
- `routes/health.ts` - Health check endpoint
- `routes/templates.ts` - Template CRUD operations (8 endpoints)
- `routes/generation.ts` - OP generation flow (3 endpoints)
- `routes/ops.ts` - OP management (3 endpoints)
- `routes/export.ts` - Export to PPTX/PDF (2 endpoints)
- `routes/excel.ts` - Excel parsing/processing (2 endpoints)

**Utility Files:**
- `utils/index.ts` - Re-exports all utilities
- `utils/request-logger.ts` - Request ID generation and logging middleware
- `utils/response.ts` - Success/error envelope helpers
- `utils/validate.ts` - Zod validation middleware
- `utils/upload.ts` - Multer file upload configuration

**Service Files (Placeholders):**
- `services/index.ts` - Re-exports all services
- `services/template-service.ts`
- `services/generation-service.ts`
- `services/op-service.ts`
- `services/export-service.ts`
- `services/excel-service.ts`

### Key Decisions

1. **Validation Library:** Zod (TypeScript-first, modern, already in PRD options)
2. **File Upload:** Multer with disk storage, no size limits enforced
3. **Response Format:** Consistent envelope with `success`, `data/error`, and `meta` (including `requestId`)
4. **Error Codes:** Standardized via `ErrorCodes` constant
