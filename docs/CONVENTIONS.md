# OP Maker Conventions

This document locks in the coding conventions, patterns, and standards for the OP Maker project.

---

## 1. File & Folder Organization

### 1.1 Naming Conventions

- **File naming:** `kebab-case` for all `.ts`, `.tsx`, `.js`, `.jsx` files
  - Example: `template-editor.tsx`, `health-check.ts`
- **Component files:** Match the component name in kebab-case
  - Example: `TemplateList` component → `template-list.tsx`
- **Test files:** `*.test.ts` or `*.spec.ts` suffix

### 1.2 Folder Structure

```
PPT Maker/
├── frontend/           # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/ # Shared UI components
│   │   ├── features/   # Feature-specific modules (editor, templates, etc.)
│   │   ├── pages/      # Route-level page components
│   │   ├── services/   # API client and external services
│   │   ├── store/      # Zustand stores
│   │   └── utils/      # Shared utilities
│   └── public/         # Static assets
├── backend/            # Node.js + Express + TypeScript
│   └── src/
│       ├── config/     # Configuration and env
│       ├── routes/     # Express route handlers
│       ├── services/   # Business logic
│       ├── models/     # Data models / DB access
│       └── utils/      # Shared utilities
├── shared/             # Shared types package (@op-maker/shared)
│   └── src/
│       ├── types/      # TypeScript interfaces and types
│       └── index.ts    # Barrel export
├── database/           # SQLite database file
├── storage/            # User-generated files
│   ├── templates/
│   ├── generated-ops/
│   ├── excel-files/
│   └── images/
└── docs/               # Documentation
    └── plans/          # Phase plans
```

---

## 2. UI/UX Conventions

### 2.1 Styling

- **CSS Framework:** Tailwind CSS
- **Component Library:** Radix UI primitives + custom Tailwind styling
- **Layout Density:** Spacious, Canva-style (beginner-friendly)

### 2.2 Interaction Patterns

- **Errors/Confirmations:** Modal dialogs (primary pattern)
- **Toast notifications:** Not used in V1
- **Loading states:** Spinners + skeleton loaders where appropriate

### 2.3 Color Scheme

```
Primary Green:  #21AE4C (brand green from OPs)
Accent Colors:  coral (#FF6B6B), orange (#FF8C42), magenta (#E84A8E)
Background:     white/light gray (#F9FAFB)
Text:           dark gray (#213547)
```

---

## 3. Canvas Editor (Fabric.js)

### 3.1 Interaction Model

| Feature         | Behavior                                          |
|-----------------|---------------------------------------------------|
| Selection       | Single click + Shift for multi + drag-marquee     |
| Zoom            | Ctrl/Cmd + mouse wheel (centered on cursor)       |
| Pan             | Hold Space to pan (hand tool)                     |
| Snapping        | Smart guides (snap to object edges/centers)       |
| Text editing    | Double-click for in-canvas IText editing          |

### 3.2 Keyboard Shortcuts

| Action          | Shortcut                    |
|-----------------|-----------------------------|
| Undo            | Ctrl/Cmd + Z                |
| Redo            | Ctrl/Cmd + Shift + Z        |
| Copy            | Ctrl/Cmd + C                |
| Paste           | Ctrl/Cmd + V                |
| Duplicate       | Ctrl/Cmd + D                |
| Nudge           | Arrow keys (small)          |
| Large Nudge     | Shift + Arrow keys          |

---

## 4. State Management

### 4.1 Global State (Zustand)

- React store is the **source of truth**
- Fabric.js is a **rendering surface** driven from store state
- Persist/serialize using Fabric JSON (`toJSON` / `loadFromJSON`)

### 4.2 Undo/Redo

- **Approach:** State snapshots (full JSON per change)
- Store per-slide snapshots
- Cap history at reasonable limit (e.g., 50 states)

### 4.3 Auto-Save

- **Silent draft auto-save:** Every ~30 seconds
- **Explicit Save:** Required for intentional save points

---

## 5. API Conventions

### 5.1 REST Endpoints

- Base URL: `/api`
- Use plural nouns for resources: `/api/templates`, `/api/ops`
- HTTP methods:
  - `GET` for read operations
  - `POST` for create operations
  - `PUT` for full updates
  - `PATCH` for partial updates
  - `DELETE` for deletions

### 5.2 Response Format

```typescript
// Success response
{
  data: T;           // The response payload
  message?: string;  // Optional success message
}

// Error response
{
  error: string;     // Error type/code
  message: string;   // Human-readable message
  details?: any;     // Additional error details (dev only)
}
```

### 5.3 Status Codes

- `200` - Success (GET, PUT, PATCH)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## 6. TypeScript Conventions

### 6.1 Type Imports

```typescript
// Use 'type' keyword for type-only imports
import type { Template, Page, Section } from '@op-maker/shared';

// Regular imports for values
import { someFunction } from './utils';
```

### 6.2 Interface vs Type

- **Interface:** For object shapes that may be extended
- **Type:** For unions, intersections, and computed types

### 6.3 Naming

- **Interfaces/Types:** PascalCase (`Template`, `GeneratedOP`)
- **Functions:** camelCase (`createTemplate`, `generateOP`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_SLIDES`, `API_TIMEOUT`)
- **Enums:** PascalCase with PascalCase values

---

## 7. Git Conventions

### 7.1 Commit Messages

Format: `<type>: <short description>`

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Build/tooling changes

Example: `feat: add template duplication endpoint`

### 7.2 Branch Naming

Format: `<type>/<short-description>`

Examples:
- `feat/template-editor`
- `fix/export-pdf-crash`
- `chore/update-dependencies`

---

## 8. Environment Variables

### 8.1 Backend (.env)

| Variable           | Description                        |
|--------------------|------------------------------------|
| `PORT`             | Server port (default: 3001)        |
| `NODE_ENV`         | development / production / test    |
| `STORAGE_BASE_PATH`| Path to storage folder             |
| `DATABASE_PATH`    | Path to SQLite database            |
| `GEMINI_API_KEY`   | Google Gemini API key              |
| `CORS_ORIGIN`      | Allowed CORS origin (frontend URL) |

### 8.2 Frontend (.env)

| Variable            | Description                        |
|---------------------|------------------------------------|
| `VITE_API_URL`      | Backend API URL                    |
| `VITE_API_TIMEOUT`  | API request timeout (ms)           |
| `VITE_APP_NAME`     | Application name                   |

---

## 9. Scripts Reference

### 9.1 Root Scripts

```bash
npm run dev           # Start both backend and frontend
npm run build         # Build all packages
npm run lint          # Lint all packages
npm run test          # Run all tests
```

### 9.2 Backend Scripts

```bash
npm run dev           # Start with hot reload (tsx watch)
npm run build         # TypeScript compile
npm run start         # Run compiled JS
npm run lint          # ESLint
npm run test          # Run tests
```

### 9.3 Frontend Scripts

```bash
npm run dev           # Vite dev server
npm run build         # Production build
npm run preview       # Preview production build
npm run lint          # ESLint
npm run test          # Run tests
```

---

**Last Updated:** 2026-01-28
