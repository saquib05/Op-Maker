# Context / Vibe Lock (Phase 2)
## OP Maker - Opportunity Profile Generator

**Date:** 2026-01-28  
**Status:** Phase 2 (DISCUSS) ✅ Decisions Locked

---

## 1. Purpose of This Document
This file “locks” the Phase 2 gray-area decisions so Phase 3 planning and Phase 4 execution stay consistent.

---

## 2. Visual Structure (UI/UX Vibe)

### 2.1 UI Styling + Component Primitives
- **Styling system**: Tailwind CSS
- **Component primitives**: **Radix UI + Tailwind**
  - We prefer **accessible primitives** with **full design control**, rather than a heavy, opinionated component suite.

### 2.2 Editor Layout Density
- **Layout density**: **Spacious, Canva-style**
  - Clean, beginner-friendly spacing
  - Larger click targets
  - Panels should feel “light” rather than Figma/Photoshop-dense

### 2.3 Notifications / Errors
- **Primary pattern**: **Modal dialogs**
  - Use modals for errors, confirmations, and critical flows.
  - (Non-blocking toasts are not the primary UX in V1.)

---

## 3. Canvas / Editor Core (Fabric.js)

### 3.1 Canvas Library
- **Canvas library**: **Fabric.js**

### 3.2 Interaction Model (V1)

#### Snapping & Guides
- **Enabled**: **Snap to other objects’ edges/centers (smart guides)**
- **Not selected** (V1): grid snap; slide margin/safe-area snapping

#### Selection
- **Selection**: **Single select + Shift for multi-select + drag-marquee selection**

#### Pan & Zoom
- **Zoom**: **Ctrl/Cmd + mouse wheel zoom** (zoom centered on cursor)
- **Pan**: **Hold Space to pan** (hand tool)
- **Zoom UI**: **Zoom dropdown/buttons + fit-to-screen**

#### Keyboard Shortcuts (V1)
- **Undo/Redo**: Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z
- **Copy/Paste/Duplicate**: Ctrl/Cmd+C/V, Ctrl/Cmd+D
- **Nudge**: Arrow keys nudge; Shift+Arrow = larger step

#### Text Editing
- **Text model**: **Direct in-canvas text editing** (Fabric `IText` on double-click)
- **Styling**: via properties panel (fonts/sizes/colors/etc.)

#### Layers Panel
- **Z-order**: drag to reorder (z-index)
- **Lock/Hide**: lock/unlock + hide/show
- **Groups**: show groups as expandable tree
- **Background**: treat slide background as a layer

---

## 4. State Management + Data Flow

### 4.1 Global State
- **State manager**: **Zustand**

### 4.2 Source of Truth
- **React store is the source of truth**
  - Fabric.js is a rendering surface driven from store state.
  - Persist/serialize using Fabric JSON (`toJSON` / `loadFromJSON`) as needed.

### 4.3 Undo / Redo
- **Undo/redo approach**: **State snapshots**
  - Store full JSON snapshots per change (likely per slide and/or presentation state).

### 4.4 Auto-Save
- **Auto-save behavior**: **Hybrid**
  - Silent **draft auto-save** every ~30s
  - Explicit **Save** action required to mark a “final” / intentional save point

---

## 5. File Organization (Hybrid On-Prem App)

### 5.1 Repo Layout
- **Single repo** (on-prem), containing:
  - `frontend/`
  - `backend/`
  - `database/`
  - `storage/`
  - `docs/`

### 5.2 Frontend Structure
- **Frontend organization**: **Hybrid**
  - Keep `pages/` (route-level)
  - Use `features/` for complex domains (e.g. editor, template builder, generation flow)
  - Keep shared `components/`, `store/`, `services/`, `utils/` for cross-cutting concerns

### 5.3 Backend Structure
- **Backend organization**: **Flat as in PRD**
  - `routes/`, `services/`, `models/`, `utils/`, `config/`

### 5.4 Shared Types
- **Shared package**: **Yes**
  - Create a top-level shared workspace (e.g. `shared/` or `packages/types/`)
  - Both frontend + backend import shared types (Template/Page/Section/GeneratedOP, etc.)

### 5.5 Naming Conventions
- **File naming**: **kebab-case**
  - Applies to `.ts`, `.tsx`, etc.

---

## 6. Explicitly Not Decided Yet (Tracked for Plan Phase)
These are intentionally left open (no assumptions):
- **Rich text editor choice**: Slate.js vs Tiptap
- **Charting approach**: Recharts vs Chart.js (and how charts render inside Fabric)
- **Backend Excel library choice**: `xlsx` vs `exceljs`
- **Backend PPT library choice**: PptxGenJS vs python-pptx (if applicable)
- **Theme presets**: default PPT theme palettes and UI theme tokens

