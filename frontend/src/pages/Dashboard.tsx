import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Calendar,
  Flame,
  GitCommit,
  LogOut,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Reveal } from "@/components/reveal";
import { StatCard } from "@/components/dashboard/stat-card";
import { Heatmap } from "@/components/dashboard/heatmap";
import { LanguageChart } from "@/components/dashboard/language-chart";
import { RepoTable } from "@/components/dashboard/repo-table";
import { ActiveTimeGrid } from "@/components/dashboard/active-time-grid";
import { useAuthContext } from "@/context/AuthContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { mockStats } from "@/lib/mock-dashboard";
import api from "@/lib/api";

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Section({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="py-2">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ComparisonRow({
  label,
  current,
  previous,
}: {
  label: string;
  current: number;
  previous: number;
}) {
  const delta = current - previous;
  const pct = previous === 0 ? 100 : Math.round((delta / previous) * 100);
  const up = delta >= 0;
  return (
    <div className="flex items-center justify-between px-1 py-2">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{current}</div>
        <div className="text-[11px] text-muted-foreground">Last month: {previous}</div>
      </div>
      <div
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
          up ? "bg-primary/15 text-primary" : "bg-red-500/15 text-red-400"
        }`}
      >
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {up ? "+" : ""}
        {pct}%
      </div>
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/[0.04] ${className ?? ""}`} />;
}

export default function Dashboard() {
  const { user, logout } = useAuthContext();
  const { state: statsState, startPolling } = useDashboardStats();
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const displayName = user?.displayName ?? user?.username ?? "Developer";
  const avatarUrl = user?.avatarUrl ?? "";
  const username = user?.username ?? "";
  const initials = displayName.slice(0, 2).toUpperCase();

  const isLoading = statsState.status === "loading";
  const isEmpty = statsState.status === "empty";
  const stats = statsState.status === "ok" ? statsState.data : null;

  // Clear syncing spinner once polling delivers fresh data
  const prevSyncedAt = useRef<string | null>(null);
  useEffect(() => {
    const newAt = stats?.lastSyncedAt ?? null;
    if (syncing && newAt && newAt !== prevSyncedAt.current) {
      setSyncing(false);
    }
    prevSyncedAt.current = newAt;
  }, [stats?.lastSyncedAt, syncing]);

  async function handleSync() {
    setSyncing(true);
    setSyncError(null);
    try {
      const currentSyncedAt =
        stats?.lastSyncedAt ?? user?.lastSynced ?? new Date(0).toISOString();
      await api.post("/api/sync");
      startPolling(currentSyncedAt);
      // polling will update state when done; clear syncing after 90s max
      setTimeout(() => setSyncing(false), 91_000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (err instanceof Error ? err.message : "Sync failed");
      setSyncError(msg);
      setSyncing(false);
    }
  }

  // Fall back to mock data only while syncing for the first time (empty state)
  const display = stats ?? (isEmpty ? mockStats : null);

  const syncedLabel = stats?.lastSyncedAt
    ? timeAgo(stats.lastSyncedAt)
    : user?.lastSynced
    ? timeAgo(user.lastSynced)
    : "never";

  return (
    <div className="dark relative min-h-screen bg-background text-foreground antialiased">
      <div className="relative z-10">
        {/* HEADER */}
        <header className="border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-sm font-semibold tracking-tight text-foreground">
                Pulse
              </Link>
              <span className="hidden h-4 w-px bg-white/10 sm:block" />
              <Avatar className="h-8 w-8 ring-1 ring-white/10">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="text-sm font-medium text-foreground">{displayName}</span>
                <span className="text-xs text-muted-foreground">@{username}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                Last synced {syncedLabel}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-white/10 bg-white/[0.02] text-foreground hover:bg-white/[0.06]"
                disabled={syncing || isLoading}
                onClick={handleSync}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing…" : "Sync"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={logout}
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
          {/* HEADING */}
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Welcome back, {displayName.split(" ")[0]}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isEmpty
                    ? "Your first sync is running — showing sample data in the meantime."
                    : "Here's a snapshot of your coding activity across all repositories."}
                </p>
              </div>
            </div>
          </Reveal>

          {/* OVERVIEW STATS */}
          <Reveal delay={0.05}>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <SkeletonBlock key={i} className="h-28" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Commits · 30d" value={display!.overview.totalCommits30d} icon={GitCommit} accent />
                <StatCard label="Active days · 30d" value={display!.overview.activeDays30d} icon={Calendar} hint="/ 30" />
                <StatCard label="Current streak" value={`${display!.overview.currentStreak}d`} icon={Flame} accent />
                <StatCard label="Longest streak" value={`${display!.overview.longestStreak}d`} icon={Trophy} />
              </div>
            )}
          </Reveal>

          {/* HEATMAP */}
          <Reveal delay={0.1}>
            <Section title="Contribution heatmap" description="Daily commit activity over the last 365 days">
              {isLoading ? <SkeletonBlock className="h-32" /> : <Heatmap data={display!.heatmap} />}
            </Section>
          </Reveal>

          {/* COMPARISON + LANGUAGES */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.15}>
              <Section title="Monthly comparison" description="This month vs. last month">
                {isLoading ? (
                  <div className="space-y-3">
                    <SkeletonBlock className="h-20" />
                    <SkeletonBlock className="h-20" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <ComparisonRow label="Commits" current={display!.comparison.thisMonth.commits} previous={display!.comparison.lastMonth.commits} />
                    <ComparisonRow label="Active days" current={display!.comparison.thisMonth.activeDays} previous={display!.comparison.lastMonth.activeDays} />
                  </div>
                )}
              </Section>
            </Reveal>
            <Reveal delay={0.2}>
              <Section title="Language breakdown" description="Distribution across your repositories">
                {isLoading ? <SkeletonBlock className="h-40" /> : <LanguageChart data={display!.languages} />}
              </Section>
            </Reveal>
          </div>

          {/* TOP REPOS */}
          <Reveal delay={0.15}>
            <Section title="Top repositories" description="Your most active projects in the last 30 days">
              {isLoading ? <SkeletonBlock className="h-40" /> : <RepoTable data={display!.topRepos} />}
            </Section>
          </Reveal>

          {/* ACTIVE TIME */}
          <Reveal delay={0.2}>
            <Section
              title="Active time heatmap"
              description="When you ship — by day of week and hour"
              action={
                <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                  <Activity className="h-3.5 w-3.5" />
                  Local timezone
                </span>
              }
            >
              {isLoading ? <SkeletonBlock className="h-40" /> : <ActiveTimeGrid data={display!.activeTime} />}
            </Section>
          </Reveal>

          {/* SYNC STATUS */}
          <Reveal delay={0.1}>
            <Section title="Sync status" description="Data freshness and pipeline health">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {isEmpty ? "First sync in progress…" : "All systems healthy"}
                    </div>
                    <div className="text-xs text-muted-foreground">Last successful sync {syncedLabel}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
                  disabled={syncing || isLoading}
                  onClick={handleSync}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing…" : "Manual sync"}
                </Button>
              </div>
            </Section>
          </Reveal>

          {isEmpty && (
            <p className="pt-4 text-center text-xs text-muted-foreground">
              Showing sample data — real data appears after first sync completes.
            </p>
          )}
          {syncError && (
            <p className="pt-2 text-center text-xs text-red-400">{syncError}</p>
          )}
        </main>
      </div>
    </div>
  );
}
