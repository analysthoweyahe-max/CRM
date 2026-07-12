# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server on port 3000 (proxies `/api` to `https://crm-hr.subcodeco.com`)
- `npm run build` — type-check (`tsc -b`) then production build
- `npm run lint` — ESLint over the whole repo
- `npm run preview` — preview the production build

There is no test runner configured in this project (no `test` script, no test framework in `package.json`). `tmp-login-test.cjs` at the repo root is a scratch script, not part of a suite.

## Architecture

This is "Howaya HR" (`hr-internal-system`) — a multi-role HR/project-management portal built with React 19 + TypeScript + Vite + Tailwind v4. There is no backend in this repo; it's a pure SPA client of a Laravel API (`crm-hr.subcodeco.com` in dev, via `VITE_API_URL`/`VITE_API_BASE_URL`).

### Role-based portal structure

The app serves six distinct role-based portals from one codebase, each with its own layout, dashboard, and route subtree: **admin/hr**, **manager** (project manager), **employee**, **seo-leader**, **seo-member**. A logged-in user's *backend* role slug (e.g. `hr-manager`, `pm-employee`, `seo-manager`) is mapped to one of the app's five portal roles by `mapRolesToAppRole` in [role.types.ts](src/shared/types/role.types.ts) — when a user has multiple roles, the highest-priority one wins (admin > hr > manager > seo-leader > seo-member > employee).

- [`src/app/router/routes.ts`](src/app/router/routes.ts) — single source of truth for every route path, namespaced by portal (`ROUTES.ADMIN.*`, `ROUTES.PROJECT_MANAGER.*`, `ROUTES.EMPLOYEE.*`, `ROUTES.SEO_LEADER.*`, `ROUTES.SEO_MEMBER.*`). Always add new paths here rather than hardcoding strings.
- [`src/app/router/AppRouter.tsx`](src/app/router/AppRouter.tsx) — all routes are lazy-loaded (`lazyImport`) and nested three guards deep: `AuthGuard` (logged in) → `RoleGuard` (portal role) → `PermissionGuard` (fine-grained permission slug), each wrapping a portal `*Layout`. Many pages (`MyTasksPage`, `WorkOverviewPage`, `PersonalDeductionsPage`, `AttendanceTimerPage`, `TemplatesPage`) are shared across portals and take a `layoutScope`/`module`/`seoRouteVariant` prop to adapt behavior per portal instead of being duplicated.
- [`src/app/guards/`](src/app/guards) — `AuthGuard`/`GuestGuard` check session presence; `RoleGuard` checks the mapped portal role and redirects to that role's dashboard on mismatch; `PermissionGuard` checks backend permission slugs/roles via [`authPermissions.utils.ts`](src/shared/utils/authPermissions.utils.ts), with a `super-admin` role or `isSuperAdmin` flag always bypassing checks.

### Module layout

Code lives under `src/modules/<role>/<feature>/` (e.g. `src/modules/hr/employees/`) or, when a feature is shared across portals, under `src/shared/modules/<feature>/` (e.g. `my-tasks`, `my-projects`, `work-overview`, `attendance`, `team-reports`). Each feature module follows the same internal shape:

```
api/       axios calls returning typed responses (thin wrapper over shared `http`)
components/
hooks/     @tanstack/react-query hooks (useQuery/useMutation) built on api/
pages/     route-level components composing hooks + components
schemas/   zod validation schemas (paired with react-hook-form)
services/  business logic that isn't a plain API call
types/     module-local TypeScript types
```

`src/shared/` holds cross-module primitives: `components/ui`, `components/form`, `components/tables`, `components/chat`, `hooks`, `lib`, `permissions`, `services`, `types`, `utils`.

### HTTP, auth, and realtime

- [`src/shared/services/http.service.ts`](src/shared/services/http.service.ts) — single axios instance (`http`) used by every module's `api/`. Request interceptor attaches the bearer token (from `localStorage`/`sessionStorage`, key `hr_auth_token`) and `Accept-Language`; response interceptor force-logs-out and redirects to `/auth/login` on a 401 (except for whitelisted public auth endpoints in `PUBLIC_AUTH_SEGMENTS`).
- Auth state lives in `src/modules/auth/context/AuthProvider.tsx` (exposed as `useAuth()` from `AuthContext`), separate from `src/app/providers/AuthProvider.tsx` which just re-exports it.
- `src/app/providers/AppProvider.tsx` composes `QueryProvider` (react-query) → `LanguageProvider` → `ThemeProvider`, plus a global `sonner` `Toaster`.
- Realtime messaging (`src/shared/realtime-messages/`) uses Laravel Echo + Pusher (`echo.ts`), gated by `VITE_PUSHER_APP_KEY` being set — when absent, Echo reports itself `disabled` and features fall back gracefully rather than erroring. Push notifications go through Firebase Cloud Messaging (`src/shared/lib/firebase.ts`, `src/shared/services/fcm.service.ts`), configured via `VITE_FIREBASE_*` env vars.

### i18n and theming

- Bilingual Arabic/English app, Arabic-first (`LanguageProvider` defaults to `'ar'` and flips `document.dir` to `rtl`/`ltr`). Translations are plain objects in `src/locales/{ar,en}.ts`, consumed via `useTrans()` from `src/locales/index.ts`. Module-local translations also exist (e.g. `src/modules/auth/i18n.ts`).
- Light/dark theme via `ThemeProvider` and CSS files in `src/styles/themes/`; global tokens in `src/styles/variables.css` and `src/styles/globals.css`.

### Permissions model

Two permission concepts coexist: a flat backend **permission slug** array (`user.permissions`, checked via `can`/`hasAnyPermission`/`canAccess` in `authPermissions.utils.ts`) and backend **role slugs** (`user.roles`, distinct from the app's mapped portal `Role`). `isSuperAdminUser` (role slug `super-admin` or an `isSuperAdmin` flag) always short-circuits both checks. `src/shared/permissions/` holds the admin-side permission catalog/labels used when building the Roles/Permissions management UI, separate from the runtime guard checks in `shared/utils`.

## Conventions worth knowing

- Path alias `@/*` → `src/*` (set in both `tsconfig.app.json` and `vite.config.ts`).
- `verbatimModuleSyntax` is on — use `import type { ... }` for type-only imports.
- All route-level page components are lazy-loaded through `lazyImport` (`src/shared/utils/lazyImport.utils.ts`), which retries/reloads on a stale-chunk error after a deploy rather than throwing.
- `dist.zip` at the repo root is a build artifact, not source — ignore it when exploring the codebase.
