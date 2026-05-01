# DevPulse — System Architecture

## Project Overview

A developer productivity dashboard where users log in with GitHub and see meaningful insights about their coding activity across all their repositories.

**Tech Stack:** React + TypeScript + Tailwind + Recharts · Node.js + Express · PostgreSQL + Prisma · GitHub OAuth · node-cron · Resend · Vercel + Railway

---

## 1. High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SERVICES                              │
│                                                                             │
│   ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────────┐   │
│   │   GitHub OAuth   │    │   GitHub REST   │    │  Resend Email API   │   │
│   │  (auth provider) │    │   API v3/v4     │    │  (email delivery)   │   │
│   └────────┬─────────┘    └────────┬────────┘    └──────────┬──────────┘   │
└────────────│──────────────────────│────────────────────────│──────────────┘
             │                      │                        │
             ▼                      ▼                        ▲
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js + Express)                         │
│                              Railway deployment                              │
│                                                                             │
│  ┌─────────────────┐  ┌──────────────────────┐  ┌────────────────────────┐ │
│  │   Auth Service  │  │   GitHub Sync Service │  │  Email Service         │ │
│  │ /auth/github    │  │  fetchRepos()         │  │  sendWeeklySummary()   │ │
│  │ /auth/callback  │  │  fetchCommits()       │  │  buildEmailTemplate()  │ │
│  │ session/JWT     │  │  upsertData()         │  │                        │ │
│  └────────┬────────┘  └──────────┬───────────┘  └────────────────────────┘ │
│           │                      │                         ▲               │
│  ┌────────▼──────────────────────▼─────────────────────────┼──────────┐   │
│  │                        API Routes Layer                  │          │   │
│  │  GET  /api/user/me          GET  /api/stats/heatmap      │          │   │
│  │  GET  /api/stats/overview   GET  /api/stats/streaks      │          │   │
│  │  GET  /api/stats/languages  GET  /api/stats/repos        │          │   │
│  │  GET  /api/stats/comparison GET  /api/profile/:username  │          │   │
│  │  POST /api/sync             ──────────────────────────── │          │   │
│  └────────────────────────────────────────────────────────┬─┘          │   │
│                                                           │             │   │
│  ┌────────────────────────────────────────────────────────▼──────────┐ │   │
│  │                     Prisma ORM (query builder)                    │ │   │
│  └────────────────────────────────────────────────────────┬──────────┘ │   │
│                                                           │             │   │
│  ┌────────────────────────────────────────────────────────▼──────────┐ │   │
│  │                  node-cron  (background scheduler)                │─┘   │
│  │  Daily  @ 2:00 AM  → syncAllUsers()   (refresh GitHub data)       │     │
│  │  Weekly @ Mon 8AM  → sendWeeklyEmails() (email all users)         │     │
│  └───────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                  ┌────────────────────▼───────────────────┐
                  │     PostgreSQL  (Railway managed)       │
                  │         (schema detailed below)         │
                  └────────────────────┬───────────────────┘
                                       │
             ┌─────────────────────────▼────────────────────────────┐
             │              FRONTEND (React + TypeScript)             │
             │                  Vercel deployment                     │
             │            (detailed component tree below)             │
             └───────────────────────────────────────────────────────┘
```

---

## 2. Frontend — Page & Component Tree

```
src/
├── pages/
│   ├── /                          Landing Page
│   │   ├── <HeroSection />        headline + "Login with GitHub" CTA
│   │   ├── <FeatureList />        3-4 feature highlights
│   │   └── <Footer />
│   │
│   ├── /auth/callback             OAuth redirect handler (no UI, redirect only)
│   │
│   ├── /dashboard                 Protected — redirects to / if not authed
│   │   ├── <Navbar />             avatar, username, logout
│   │   ├── <SyncButton />         triggers POST /api/sync manually
│   │   ├── <CommitHeatmap />      52-week grid (like GitHub's) — Recharts rect
│   │   ├── <StreakCard />         current streak / longest streak
│   │   ├── <ActiveDaysChart />    bar chart: commits by day of week + hour of day
│   │   ├── <TopLanguages />       horizontal bar / donut — color coded by lang
│   │   ├── <MostActiveRepo />     top 5 repos by commit count (30d)
│   │   └── <MonthComparison />    this month vs last month — stat diffs
│   │
│   └── /u/[username]              Public shareable profile (no auth required)
│       ├── <PublicHeader />       avatar, name, github link
│       ├── <CommitHeatmap />      (read-only, same component)
│       ├── <StreakCard />         (read-only)
│       ├── <TopLanguages />       (read-only)
│       └── <ShareButton />        copy link to clipboard
│
├── components/
│   ├── charts/
│   │   ├── HeatmapGrid.tsx        core heatmap rendering logic (Recharts/custom SVG)
│   │   ├── BarChart.tsx           reusable bar chart wrapper (Recharts)
│   │   └── DonutChart.tsx         reusable donut (Recharts PieChart)
│   ├── ui/
│   │   ├── StatCard.tsx           number + label + trend arrow
│   │   ├── LoadingSkeleton.tsx    placeholder while data fetches
│   │   └── ErrorBoundary.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── ProtectedRoute.tsx     auth gate wrapper
│
├── hooks/
│   ├── useAuth.ts                 current user from /api/user/me
│   ├── useDashboardStats.ts       fetches all stat endpoints
│   └── usePublicProfile.ts        fetches /api/profile/:username
│
└── lib/
    ├── api.ts                     axios instance with base URL + auth header
    └── types.ts                   shared TypeScript interfaces
```

---

## 3. Backend — API Routes & Services

```
backend/
├── routes/
│   ├── auth.ts
│   │   ├── GET  /auth/github           → redirect to GitHub OAuth URL
│   │   └── GET  /auth/github/callback  → exchange code → token → upsert user
│   │                                      → set session/JWT → redirect /dashboard
│   │
│   ├── user.ts
│   │   └── GET  /api/user/me           → return authed user (from session)
│   │
│   ├── stats.ts
│   │   ├── GET  /api/stats/overview    → streak, total commits 30d, active days
│   │   ├── GET  /api/stats/heatmap     → 365 days of daily commit counts
│   │   ├── GET  /api/stats/languages   → bytes/commits per language, last 90d
│   │   ├── GET  /api/stats/repos       → top repos by commit count, last 30d
│   │   ├── GET  /api/stats/comparison  → this month vs last: commits, active days
│   │   └── GET  /api/stats/active-time → commits grouped by weekday + hour
│   │
│   ├── profile.ts
│   │   └── GET  /api/profile/:username → public stats (no auth, limited fields)
│   │
│   └── sync.ts
│       └── POST /api/sync              → trigger manual data refresh for authed user
│
├── services/
│   ├── githubService.ts
│   │   ├── getUserRepos(token)          → GET /user/repos (all, paginated)
│   │   ├── getCommitsForRepo(token, repo, since)  → GET /repos/:owner/:repo/commits
│   │   └── getLanguagesForRepo(token, repo)       → GET /repos/:owner/:repo/languages
│   │
│   ├── syncService.ts
│   │   ├── syncUser(userId)             → orchestrates full data refresh
│   │   └── syncAllUsers()              → called by cron, loops all users
│   │
│   └── emailService.ts
│       ├── buildWeeklySummary(userId)   → query DB for last 7 days stats
│       └── sendWeeklySummary(userId)    → render + send via Resend API
│
└── jobs/
    └── scheduler.ts
        ├── cron('0 2 * * *')   → syncAllUsers()        (every day 2 AM)
        └── cron('0 8 * * 1')   → sendAllWeeklyEmails() (every Monday 8 AM)
```

---

## 4. Database Schema

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           PostgreSQL Schema                               │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│         users           │
├─────────────────────────┤
│ id          UUID  PK    │
│ github_id   INT   UNIQUE│◄──────────────────────────────┐
│ username    TEXT  UNIQUE│                               │
│ email       TEXT        │                               │
│ avatar_url  TEXT        │                               │
│ access_token TEXT       │ (encrypted at rest)           │
│ created_at  TIMESTAMP   │                               │
│ last_synced TIMESTAMP   │                               │
└────────────┬────────────┘                               │
             │ 1                                          │
             │                                            │
             │ N                                          │
┌────────────▼────────────┐          ┌───────────────────┴──────┐
│      repositories       │          │        sync_logs          │
├─────────────────────────┤          ├──────────────────────────┤
│ id          UUID  PK    │          │ id          UUID  PK      │
│ user_id     UUID  FK───►│──users   │ user_id     UUID  FK─►users│
│ github_repo_id INT      │          │ status      ENUM          │
│ name        TEXT        │          │  (pending/success/error)  │
│ full_name   TEXT        │          │ started_at  TIMESTAMP     │
│ description TEXT        │          │ finished_at TIMESTAMP     │
│ is_private  BOOL        │          │ error_msg   TEXT nullable │
│ created_at  TIMESTAMP   │          └──────────────────────────┘
│ updated_at  TIMESTAMP   │
└────────────┬────────────┘
             │ 1
             │
             │ N
┌────────────▼────────────┐          ┌──────────────────────────┐
│        commits          │          │       repo_languages      │
├─────────────────────────┤          ├──────────────────────────┤
│ id          UUID  PK    │          │ id          UUID  PK      │
│ user_id     UUID  FK───►│──users   │ repo_id     UUID  FK─►repos│
│ repo_id     UUID  FK───►│──repos   │ language    TEXT           │
│ sha         TEXT  UNIQUE│          │ bytes       INT            │
│ committed_at TIMESTAMP  │          │ synced_at   TIMESTAMP      │
│ author_name TEXT        │          └──────────────────────────┘
└─────────────────────────┘

Indexes:
  commits(user_id, committed_at)  — heatmap + streak queries
  commits(repo_id, committed_at)  — per-repo stats
  repo_languages(repo_id)         — language rollup
```

---

## 5. Data Flow — Login to Dashboard

```
USER BROWSER                  BACKEND                   GITHUB API          DATABASE
     │                            │                          │                   │
     │── click "Login GitHub" ───►│                          │                   │
     │                            │── GET /auth/github ─────►│                   │
     │◄── redirect to github.com ─│  (OAuth consent screen)  │                   │
     │                            │                          │                   │
     │── authorize, redirect ─────►  /auth/callback          │                   │
     │   ?code=xxxxx              │── POST /login/oauth ─────►│                   │
     │                            │◄── access_token ─────────│                   │
     │                            │── GET /user ─────────────►│                   │
     │                            │◄── profile data ──────────│                   │
     │                            │                          │                   │
     │                            │── upsert user ────────────────────────────►  │
     │                            │── fetchRepos() ──────────►│                   │
     │                            │◄── [ repo list ] ─────────│                   │
     │                            │── fetchCommits(each repo)►│                   │
     │                            │◄── [ commit list ] ───────│                   │
     │                            │── fetchLanguages() ───────►│                  │
     │                            │◄── { lang: bytes } ───────│                   │
     │                            │── bulk upsert commits ─────────────────────► │
     │                            │── upsert repo_languages ───────────────────► │
     │                            │── update last_synced ──────────────────────► │
     │                            │── set JWT cookie           │                  │
     │◄── redirect /dashboard ────│                           │                   │
     │                            │                           │                   │
     │── GET /api/stats/* ────────►│                          │                   │
     │                            │── SELECT FROM commits ──────────────────────►│
     │                            │◄── aggregated rows ─────────────────────────│
     │◄── JSON stats ─────────────│                           │                   │
     │                            │                           │                   │
     │  render charts             │                           │                   │
```

---

## 6. Cron Job & Email Flow

```
                    node-cron scheduler (runs in same Express process)
                              │
              ┌───────────────┴───────────────┐
              │                               │
     Daily @ 2:00 AM                 Monday @ 8:00 AM
              │                               │
              ▼                               ▼
     syncAllUsers()               sendAllWeeklyEmails()
       │                               │
       │ SELECT all users              │ SELECT all users
       │ WHERE last_synced             │ WHERE email_opt_in = true
       │   < NOW() - 22h               │
       │                               │ for each user:
       │ for each user:                │   buildWeeklySummary(userId)
       │   syncUser(userId)            │     → query commits (last 7d)
       │     → call GitHub API         │     → compute: total commits,
       │     → upsert new commits      │       active days, top repo,
       │     → update last_synced      │       streak, language breakdown
       │     → write sync_log          │   sendWeeklySummary(userId)
       │                               │     → Resend API
       │                               │       FROM: noreply@devpulse.app
       │                               │       subject: "Your week in code"
       │                               │       body: HTML template
       ▼                               ▼
   PostgreSQL                      Resend API → User inbox
```

---

## 7. Deployment Topology

```
┌─────────────┐        ┌───────────────────────────────────────┐
│   Vercel    │        │              Railway                   │
│             │        │                                        │
│  React app  │◄──────►│  Express server (Node.js)             │
│  (static +  │  HTTPS │  + node-cron (same process)           │
│   CDN edge) │  API   │                                        │
└─────────────┘        │  PostgreSQL (managed Railway instance) │
                       └───────────────────────────────────────┘
```

### Environment Variables

| Frontend (Vercel)        | Backend (Railway)        |
|--------------------------|--------------------------|
| `VITE_API_URL`           | `DATABASE_URL`           |
| `VITE_GITHUB_CLIENT_ID`  | `GITHUB_CLIENT_ID`       |
|                          | `GITHUB_CLIENT_SECRET`   |
|                          | `JWT_SECRET`             |
|                          | `RESEND_API_KEY`         |
|                          | `FRONTEND_URL`           |

---

## 8. Build Phases

| Phase | Scope |
|-------|-------|
| **Phase 1** | GitHub OAuth + user storage + empty dashboard deployed live |
| **Phase 2** | GitHub API data fetching + storage + cron job sync |
| **Phase 3** | All charts and insights on dashboard |
| **Phase 4** | Email summary + public profile + polish |
