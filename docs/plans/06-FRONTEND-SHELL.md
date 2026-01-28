# Phase 06 — Frontend App Shell

**Depends on:** Phase 01 (Foundation), Phase 02 (Backend Skeleton), Phase 04 (Shared Types)  
**Unblocks:** Phase 07 (Template Builder UI), Phase 13 (Editor Core)

---

## Goal

Establish the frontend application shell with:
- ShadCN UI component library (Radix + Tailwind)
- React Router for navigation
- Typed API client for backend communication
- Zustand global state store
- Canva-style sidebar layout

**Deliverable:** Open `localhost:5173`, see a sidebar, navigate between empty pages, and see a "Server Connected" indicator.

---

## Tasks

### Task 6.1 — Install and Configure ShadCN UI

**Objective:** Set up ShadCN UI with required base components.

**Steps:**
1. Initialize ShadCN UI in the frontend workspace:
   ```bash
   cd frontend
   npx shadcn@latest init
   ```
   - Style: Default
   - Base color: Neutral (we'll customize later)
   - CSS variables: Yes
   - Tailwind config: Use existing `tailwind.config.js`
   - Components path: `src/components/ui`
   - Utilities path: `src/lib/utils`

2. Install required components:
   ```bash
   npx shadcn@latest add button card dialog
   ```

3. Create layout primitives (ShadCN doesn't have a sidebar, we'll build one):
   - `src/components/layout/app-shell.tsx` — main layout wrapper
   - `src/components/layout/sidebar.tsx` — navigation sidebar
   - `src/components/layout/main-content.tsx` — content area

**Files Created:**
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/dialog.tsx`
- `src/lib/utils.ts`
- `src/components/layout/app-shell.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/main-content.tsx`

**Verification:**
```bash
cd frontend && npm run build
```
- ✅ Build completes without errors
- ✅ `src/components/ui/` contains Button, Card, Dialog components

---

### Task 6.2 — Setup React Router

**Objective:** Configure client-side routing with all required routes.

**Steps:**
1. Install React Router:
   ```bash
   cd frontend
   npm install react-router-dom
   ```

2. Create route structure:
   ```
   src/
   ├── pages/
   │   ├── home-page.tsx          → /
   │   ├── templates-page.tsx     → /templates
   │   ├── ops-page.tsx           → /ops
   │   └── editor-page.tsx        → /editor/:id
   └── router.tsx                 → Route definitions
   ```

3. Create `src/router.tsx`:
   ```typescript
   import { createBrowserRouter } from 'react-router-dom';
   import { AppShell } from './components/layout/app-shell';
   import { HomePage } from './pages/home-page';
   import { TemplatesPage } from './pages/templates-page';
   import { OpsPage } from './pages/ops-page';
   import { EditorPage } from './pages/editor-page';

   export const router = createBrowserRouter([
     {
       path: '/',
       element: <AppShell />,
       children: [
         { index: true, element: <HomePage /> },
         { path: 'templates', element: <TemplatesPage /> },
         { path: 'ops', element: <OpsPage /> },
         { path: 'editor/:id', element: <EditorPage /> },
       ],
     },
   ]);
   ```

4. Update `src/main.tsx` to use RouterProvider.

5. Create placeholder pages (each with a heading showing the page name).

**Files Created:**
- `src/router.tsx`
- `src/pages/home-page.tsx`
- `src/pages/templates-page.tsx`
- `src/pages/ops-page.tsx`
- `src/pages/editor-page.tsx`

**Files Modified:**
- `src/main.tsx`

**Verification:**
```bash
cd frontend && npm run dev
```
- ✅ Navigate to `/` → see "Home" heading
- ✅ Navigate to `/templates` → see "Templates" heading
- ✅ Navigate to `/ops` → see "OPs" heading
- ✅ Navigate to `/editor/test-123` → see "Editor: test-123" heading

---

### Task 6.3 — Create Typed API Client

**Objective:** Build a strictly typed API client that communicates with the backend.

**Steps:**
1. Install axios (or use native fetch — axios provides better ergonomics):
   ```bash
   cd frontend
   npm install axios
   ```

2. Create API client structure:
   ```
   src/
   └── services/
       ├── api-client.ts       → Axios instance + interceptors
       ├── templates-api.ts    → Template CRUD operations
       ├── ops-api.ts          → OP management operations
       ├── generation-api.ts   → Generation operations
       ├── excel-api.ts        → Excel processing operations
       └── health-api.ts       → Health check
   ```

3. Create `src/services/api-client.ts`:
   ```typescript
   import axios from 'axios';

   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

   export const apiClient = axios.create({
     baseURL: API_BASE_URL,
     headers: {
       'Content-Type': 'application/json',
     },
     timeout: 30000,
   });

   // Response interceptor for error handling
   apiClient.interceptors.response.use(
     (response) => response,
     (error) => {
       // Transform error to standard format
       const message = error.response?.data?.error?.message || error.message;
       return Promise.reject(new Error(message));
     }
   );
   ```

4. Create typed API modules using shared types from `@op-maker/shared`:
   - `health-api.ts` — `checkHealth(): Promise<HealthResponse>`
   - `templates-api.ts` — full CRUD with types
   - `ops-api.ts` — OP operations with types
   - `generation-api.ts` — generation + status polling
   - `excel-api.ts` — parse + process

5. Create barrel export `src/services/index.ts`.

**Type Definitions (to add to shared or local types):**
```typescript
// Health response
interface HealthResponse {
  status: 'ok';
  version: string;
  time: string;
  uptime: number;
}

// API response wrapper (matches backend response.ts)
interface ApiResponse<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

**Files Created:**
- `src/services/api-client.ts`
- `src/services/health-api.ts`
- `src/services/templates-api.ts`
- `src/services/ops-api.ts`
- `src/services/generation-api.ts`
- `src/services/excel-api.ts`
- `src/services/index.ts`

**Files Modified:**
- `frontend/.env.example` — add `VITE_API_URL=http://localhost:3001/api`

**Verification:**
```bash
cd frontend && npm run build
```
- ✅ Build completes without type errors
- ✅ All API functions are properly typed with `@op-maker/shared` types

---

### Task 6.4 — Setup Zustand Store

**Objective:** Create the global state management foundation using Zustand.

**Steps:**
1. Install Zustand:
   ```bash
   cd frontend
   npm install zustand
   ```

2. Create store structure (per CONTEXT.md — React store is source of truth):
   ```
   src/
   └── store/
       ├── index.ts              → Barrel export
       ├── app-store.ts          → Global app state (connection, loading, errors)
       ├── templates-store.ts    → Template list + selected template
       ├── ops-store.ts          → OP list + selected OP
       └── editor-store.ts       → Editor state (stub for Phase 13)
   ```

3. Create `src/store/app-store.ts`:
   ```typescript
   import { create } from 'zustand';

   interface AppState {
     // Connection status
     isServerConnected: boolean;
     serverVersion: string | null;
     
     // Global loading/error
     isLoading: boolean;
     error: string | null;
     
     // Actions
     setServerConnected: (connected: boolean, version?: string) => void;
     setLoading: (loading: boolean) => void;
     setError: (error: string | null) => void;
     clearError: () => void;
   }

   export const useAppStore = create<AppState>((set) => ({
     isServerConnected: false,
     serverVersion: null,
     isLoading: false,
     error: null,

     setServerConnected: (connected, version) =>
       set({ isServerConnected: connected, serverVersion: version ?? null }),
     setLoading: (loading) => set({ isLoading: loading }),
     setError: (error) => set({ error }),
     clearError: () => set({ error: null }),
   }));
   ```

4. Create `src/store/templates-store.ts`:
   ```typescript
   import { create } from 'zustand';
   import type { Template } from '@op-maker/shared';

   interface TemplatesState {
     templates: Template[];
     selectedTemplateId: string | null;
     isLoading: boolean;
     
     // Actions
     setTemplates: (templates: Template[]) => void;
     addTemplate: (template: Template) => void;
     updateTemplate: (template: Template) => void;
     removeTemplate: (id: string) => void;
     selectTemplate: (id: string | null) => void;
     setLoading: (loading: boolean) => void;
   }

   export const useTemplatesStore = create<TemplatesState>((set) => ({
     templates: [],
     selectedTemplateId: null,
     isLoading: false,

     setTemplates: (templates) => set({ templates }),
     addTemplate: (template) =>
       set((state) => ({ templates: [...state.templates, template] })),
     updateTemplate: (template) =>
       set((state) => ({
         templates: state.templates.map((t) =>
           t.id === template.id ? template : t
         ),
       })),
     removeTemplate: (id) =>
       set((state) => ({
         templates: state.templates.filter((t) => t.id !== id),
       })),
     selectTemplate: (id) => set({ selectedTemplateId: id }),
     setLoading: (loading) => set({ isLoading: loading }),
   }));
   ```

5. Create similar stores for `ops-store.ts` and `editor-store.ts` (stub).

6. Create barrel export `src/store/index.ts`.

**Files Created:**
- `src/store/app-store.ts`
- `src/store/templates-store.ts`
- `src/store/ops-store.ts`
- `src/store/editor-store.ts`
- `src/store/index.ts`

**Verification:**
```bash
cd frontend && npm run build
```
- ✅ Build completes without errors
- ✅ Stores can be imported: `import { useAppStore } from './store'`

---

### Task 6.5 — Build Sidebar Layout Component

**Objective:** Create a Canva-style sidebar navigation layout.

**Steps:**
1. Create `src/components/layout/sidebar.tsx`:
   ```typescript
   // Navigation items:
   // - Home (/) — icon: Home
   // - Templates (/templates) — icon: FileText
   // - OPs (/ops) — icon: Presentation
   
   // Footer:
   // - Server status indicator (green dot = connected, red = disconnected)
   ```

2. Create `src/components/layout/app-shell.tsx`:
   ```typescript
   // Layout structure:
   // ┌─────────────────────────────────────────────┐
   // │ Sidebar (fixed, 240px) │   Main Content    │
   // │                        │   (Outlet)        │
   // │  - Logo                │                   │
   // │  - Nav items           │                   │
   // │  - Server status       │                   │
   // └─────────────────────────────────────────────┘
   ```

3. Install Lucide React for icons:
   ```bash
   cd frontend
   npm install lucide-react
   ```

4. Implement the sidebar with:
   - Logo/app name at top
   - Navigation links (using NavLink from react-router-dom)
   - Active state styling (highlight current route)
   - Server connection indicator at bottom

5. Create `src/components/layout/server-status.tsx`:
   ```typescript
   // Uses useAppStore to show connection status
   // Green dot + "Connected" or Red dot + "Disconnected"
   ```

**Files Created:**
- `src/components/layout/sidebar.tsx`
- `src/components/layout/app-shell.tsx`
- `src/components/layout/server-status.tsx`

**Verification:**
- ✅ Sidebar is visible on all pages
- ✅ Clicking nav items changes route
- ✅ Active nav item is visually highlighted
- ✅ Server status shows "Disconnected" (backend not running)

---

### Task 6.6 — Implement Server Connection Check

**Objective:** Check backend connectivity on app load and show status.

**Steps:**
1. Create `src/hooks/use-health-check.ts`:
   ```typescript
   import { useEffect } from 'react';
   import { useAppStore } from '../store';
   import { healthApi } from '../services';

   export function useHealthCheck() {
     const { setServerConnected, setError } = useAppStore();

     useEffect(() => {
       const checkHealth = async () => {
         try {
           const health = await healthApi.checkHealth();
           setServerConnected(true, health.version);
         } catch (error) {
           setServerConnected(false);
           // Don't show error modal for health check failures
           console.warn('Backend not reachable:', error);
         }
       };

       // Initial check
       checkHealth();

       // Poll every 30 seconds
       const interval = setInterval(checkHealth, 30000);

       return () => clearInterval(interval);
     }, [setServerConnected, setError]);
   }
   ```

2. Call `useHealthCheck()` in `AppShell` component.

3. Update `ServerStatus` component to use store state.

**Files Created:**
- `src/hooks/use-health-check.ts`
- `src/hooks/index.ts`

**Files Modified:**
- `src/components/layout/app-shell.tsx` — add health check hook
- `src/components/layout/server-status.tsx` — connect to store

**Verification:**
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev
```
- ✅ With backend running: Green dot, "Server Connected"
- ✅ With backend stopped: Red dot, "Server Disconnected"
- ✅ Start backend while frontend running → status updates to Connected

---

### Task 6.7 — Create Error Dialog Component

**Objective:** Implement a global error dialog (per CONTEXT.md: modals for errors).

**Steps:**
1. Create `src/components/error-dialog.tsx`:
   ```typescript
   import { useAppStore } from '../store';
   import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
   import { Button } from './ui/button';

   export function ErrorDialog() {
     const { error, clearError } = useAppStore();

     return (
       <Dialog open={!!error} onOpenChange={(open) => !open && clearError()}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Error</DialogTitle>
           </DialogHeader>
           <p className="text-sm text-muted-foreground">{error}</p>
           <Button onClick={clearError}>Dismiss</Button>
         </DialogContent>
       </Dialog>
     );
   }
   ```

2. Add `ErrorDialog` to `AppShell` component (renders globally).

**Files Created:**
- `src/components/error-dialog.tsx`

**Files Modified:**
- `src/components/layout/app-shell.tsx` — add ErrorDialog

**Verification:**
```typescript
// In browser console:
useAppStore.getState().setError('Test error message');
```
- ✅ Error dialog appears with message
- ✅ Clicking "Dismiss" closes dialog and clears error

---

### Task 6.8 — Finalize File Structure and Exports

**Objective:** Ensure clean file organization and barrel exports.

**Steps:**
1. Create barrel exports:
   - `src/components/index.ts`
   - `src/components/layout/index.ts`
   - `src/components/ui/index.ts`
   - `src/pages/index.ts`
   - `src/services/index.ts`
   - `src/store/index.ts`
   - `src/hooks/index.ts`

2. Update imports to use barrel exports where appropriate.

3. Verify file naming follows kebab-case convention.

4. Create `src/types/index.ts` for frontend-only types (if needed).

**Final File Structure:**
```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   ├── server-status.tsx
│   │   └── index.ts
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── index.ts
│   ├── error-dialog.tsx
│   └── index.ts
├── hooks/
│   ├── use-health-check.ts
│   └── index.ts
├── lib/
│   └── utils.ts
├── pages/
│   ├── home-page.tsx
│   ├── templates-page.tsx
│   ├── ops-page.tsx
│   ├── editor-page.tsx
│   └── index.ts
├── services/
│   ├── api-client.ts
│   ├── health-api.ts
│   ├── templates-api.ts
│   ├── ops-api.ts
│   ├── generation-api.ts
│   ├── excel-api.ts
│   └── index.ts
├── store/
│   ├── app-store.ts
│   ├── templates-store.ts
│   ├── ops-store.ts
│   ├── editor-store.ts
│   └── index.ts
├── types/
│   └── index.ts
├── router.tsx
├── main.tsx
├── index.css
├── App.tsx (can be removed, replaced by router)
└── vite-env.d.ts
```

**Verification:**
```bash
cd frontend && npm run build && npm run lint
```
- ✅ Build completes without errors
- ✅ Lint passes (no unused imports, proper exports)

---

## Final Verification Checklist

Run the full verification after all tasks are complete:

```bash
# 1. Start backend
cd backend && npm run dev

# 2. Start frontend (in another terminal)
cd frontend && npm run dev
```

| Check | Expected Result |
|-------|-----------------|
| Open `http://localhost:5173` | Sidebar visible, Home page content shown |
| Server status indicator | Green dot, "Server Connected" |
| Click "Templates" in sidebar | URL changes to `/templates`, Templates page shown |
| Click "OPs" in sidebar | URL changes to `/ops`, OPs page shown |
| Navigate to `/editor/abc-123` | Editor page shows with ID "abc-123" |
| Stop backend server | Status changes to "Disconnected" (within 30s) |
| Restart backend server | Status changes back to "Connected" |
| `npm run build` in frontend | Completes without errors |

---

## Dependencies Summary

**NPM Packages to Install:**
```bash
cd frontend
npm install react-router-dom axios zustand lucide-react
npx shadcn@latest init
npx shadcn@latest add button card dialog
```

**Imports from Shared Package:**
- `Template`, `Page`, `Section` types
- `GeneratedOP`, `GenerationStatus` types
- `ExportFormat`, `ExportOptions` types

---

## Notes

- ShadCN components are copied into the project (not a dependency), allowing full customization.
- The API client uses axios for better error handling and interceptors.
- Health check polling interval (30s) matches the autosave interval defined in CONTEXT.md.
- Editor store is a stub — full implementation in Phase 13.
- All file names follow kebab-case per CONTEXT.md conventions.
