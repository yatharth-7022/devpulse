# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Root (runs both services concurrently)

```bash
npm run dev        # start frontend :3000 + backend :8000 in parallel
npm run build      # build frontend then backend
npm run lint       # lint both workspaces
npm run format     # prettier across all files
```

### Frontend (`cd frontend`)

```bash
npm run dev        # Vite dev server on :3000
npm run build      # tsc + vite build → dist/
npm run lint       # eslint on ts/tsx
```

### Backend (`cd backend`)

```bash
npm run dev        # ts-node-dev with hot reload
npm run build      # tsc → dist/
npm run start      # node dist/index.js (production)
npm run db:migrate # prisma migrate dev
npm run db:studio  # Prisma Studio GUI
npm run db:reset   # drop + recreate DB (destructive)
```

## Environment Setup

Copy both env files before running:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend requires a running PostgreSQL instance. `DATABASE_URL` defaults to `localhost:5432/devpulse`. Run `npm run db:migrate` in `backend/` after first setup.

## Architecture

Monorepo: `frontend/` (React 18 + Vite + React Router v6) and `backend/` (Express + Prisma + PostgreSQL). No shared package between them — types are duplicated in `frontend/src/lib/types.ts`.

### Frontend

- `src/lib/api.ts` — Axios instance. Base URL from `VITE_API_URL`. Has a 401 interceptor that redirects to `/`. All API calls go through this.
- `src/lib/types.ts` — Canonical TypeScript interfaces: `User`, `Repository`, `Commit`, `RepoLanguage`, `SyncLog`, `DashboardStats`. Keep in sync with Prisma schema.
- Vite proxies `/api` and `/auth` to `:8000` in dev, so frontend code always uses relative paths (`/api/...`).
- Tailwind v3 with shadcn-style CSS variable color system. Dark theme is applied via `class="dark"` on a wrapper div (not `<html>`). Colors defined as HSL channels in `src/index.css` — use `hsl(var(--primary))` pattern in `tailwind.config.ts`. Opacity modifiers (`bg-primary/10`) work only with this pattern, not raw `var()` strings. Never use `oklch()` values in Tailwind config — Tailwind v3 can't resolve them for opacity modifiers.
- `src/components/ui/` — shadcn-style components. Depends on `@radix-ui/*`, `class-variance-authority`, `lucide-react`.
- `src/components/reveal.tsx` — Framer Motion scroll-reveal wrapper used throughout landing page.

### Backend

- `src/index.ts` — Express entry. CORS locked to `FRONTEND_URL`. Routes not yet wired (placeholders in `src/routes/`, `src/services/`, `src/jobs/`).
- All backend paths use `@/*` alias → `src/`. Same pattern in frontend.
- Auth flow: GitHub OAuth → `/auth/github` redirects to GitHub → `/auth/github/callback` exchanges code for token → upserts user → sets JWT cookie → redirects to `/dashboard`.
- JWT cookie carries session. All `/api/*` routes verify JWT middleware before responding.
- `syncUser(userId)` in `syncService.ts` is the core sync orchestrator: fetches repos → fetches commits per repo → fetches languages → bulk upserts → updates `last_synced`.

### Database

Five Prisma models: `User → Repository → Commit` (cascade deletes), `RepoLanguage` (per-repo language bytes), `SyncLog` (audit trail per sync run).

Critical indexes: `commits(userId, committedAt)` for heatmap/streak queries; `commits(repoId, committedAt)` for per-repo stats. Don't remove these — heatmap queries scan 365 days of data.

`access_token` on User stores the GitHub OAuth token. Treat as sensitive.

### Planned Pages (not yet built)

- `/auth/callback` — OAuth redirect handler, no UI
- `/dashboard` — protected, all charts and stats
- `/u/[username]` — public read-only profile

### Deployment

- Frontend → Vercel (static + CDN)
- Backend + PostgreSQL → Railway (same instance runs Express + node-cron)
- node-cron runs inside the Express process: daily sync at 2 AM, weekly email on Monday 8 AM

## Frontend Code Guidelines

- Always prefer small, reusable, and well-structured components over large monolithic components.
- Break UI into logical pieces (e.g., layout, sections, widgets, hooks).
- Keep components focused on a single responsibility.
- Extract logic into custom hooks when it grows complex.
- Avoid writing long components with mixed concerns (UI + state + API logic together).
- Use composition instead of deeply nested JSX.
- Keep files readable and maintainable — aim for clarity over cleverness.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **devpulse** (133 symbols, 151 relationships, 0 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/devpulse/context` | Codebase overview, check index freshness |
| `gitnexus://repo/devpulse/clusters` | All functional areas |
| `gitnexus://repo/devpulse/processes` | All execution flows |
| `gitnexus://repo/devpulse/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
