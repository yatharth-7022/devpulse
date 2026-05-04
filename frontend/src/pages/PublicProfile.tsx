import { useEffect, useState, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Calendar,
  Flame,
  GitCommit,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatCard } from "@/components/dashboard/stat-card";
import { Heatmap } from "@/components/dashboard/heatmap";
import { LanguageChart } from "@/components/dashboard/language-chart";
import { RepoTable } from "@/components/dashboard/repo-table";
import { ActiveTimeGrid } from "@/components/dashboard/active-time-grid";
import Loader from "@/components/ui/loader-4";
import { useAuthContext } from "@/context/AuthContext";
import api from "@/lib/api";
import type { PublicProfile } from "@/lib/types";

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

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: authUser } = useAuthContext();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "notFound" | "error" | "ok">("loading");

  useEffect(() => {
    if (!username) return;
    api
      .get<PublicProfile>(`/api/u/${username}`)
      .then(({ data }) => {
        setProfile(data);
        setStatus("ok");
      })
      .catch((err: { response?: { status?: number } }) => {
        setStatus(err?.response?.status === 404 ? "notFound" : "error");
      });
  }, [username]);

  const displayName = profile?.user.displayName ?? profile?.user.username ?? username ?? "";
  const initials = displayName.slice(0, 2).toUpperCase();
  const s = profile?.stats;

  return (
    <div className="dark relative min-h-screen bg-background text-foreground antialiased">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <img src="/devlens-logo.jpeg" alt="DevLens" className="h-6 w-6 rounded object-cover" />
            DevLens
          </Link>
          <div className="flex items-center gap-3">
            {authUser ? (
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 bg-white/[0.02] text-foreground hover:bg-white/[0.06]"
                asChild
              >
                <Link to="/dashboard">My dashboard</Link>
              </Button>
            ) : (
              <Button
                size="sm"
                className="gap-2"
                onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL ?? ""}/auth/github` }}
              >
                Sign up with GitHub
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* LOADING */}
        {status === "loading" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
            <Loader />
            <p className="text-sm text-muted-foreground">Loading profile…</p>
          </div>
        )}

        {/* NOT FOUND */}
        {status === "notFound" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <AlertCircle className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Profile not found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                No user named <span className="font-mono text-foreground">@{username}</span> exists on DevLens.
              </p>
            </div>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL ?? ""}/auth/github` }}
            >
              Join DevLens
            </Button>
          </div>
        )}

        {/* ERROR */}
        {status === "error" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-7 w-7 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
              <p className="mt-1 text-sm text-muted-foreground">Couldn't load this profile. Try again.</p>
            </div>
            <Button size="sm" variant="outline" className="border-white/10" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* PROFILE */}
        {status === "ok" && s && (
          <div className="space-y-8">
            {/* USER CARD */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-white/10">
                <AvatarImage src={profile!.user.avatarUrl ?? ""} alt={displayName} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{displayName}</h1>
                <p className="text-sm text-muted-foreground">@{profile!.user.username}</p>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Commits · 30d" value={s.overview.totalCommits30d} icon={GitCommit} accent />
              <StatCard label="Active days · 30d" value={s.overview.activeDays30d} icon={Calendar} hint="/ 30" />
              <StatCard label="Current streak" value={`${s.overview.currentStreak}d`} icon={Flame} accent />
              <StatCard label="Longest streak" value={`${s.overview.longestStreak}d`} icon={Trophy} />
            </div>

            {/* HEATMAP */}
            <Section title="Contribution heatmap" description="Daily commit activity over the last 365 days">
              <Heatmap data={s.heatmap} />
            </Section>

            {/* COMPARISON + LANGUAGES */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Section title="Monthly comparison" description="This month vs. last month">
                <div className="space-y-3">
                  <ComparisonRow label="Commits" current={s.comparison.thisMonth.commits} previous={s.comparison.lastMonth.commits} />
                  <ComparisonRow label="Active days" current={s.comparison.thisMonth.activeDays} previous={s.comparison.lastMonth.activeDays} />
                </div>
              </Section>
              <Section title="Language breakdown" description="Distribution across repositories">
                <LanguageChart data={s.languages} />
              </Section>
            </div>

            {/* TOP REPOS */}
            <Section title="Top repositories" description="Most active projects in the last 30 days">
              <RepoTable data={s.topRepos} />
            </Section>

            {/* ACTIVE TIME */}
            <Section
              title="Active time heatmap"
              description="When they ship — by day of week and hour"
              action={
                <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                  <Activity className="h-3.5 w-3.5" />
                  UTC timezone
                </span>
              }
            >
              <ActiveTimeGrid data={s.activeTime} />
            </Section>

            {/* CTA — only show if not logged in */}
            {!authUser && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-6 py-8 text-center">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  Track your own GitHub activity
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connect your GitHub and get a public profile like this one — free.
                </p>
                <Button
                  className="mt-5 gap-2"
                  onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL ?? ""}/auth/github` }}
                >
                  Sign up with GitHub
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
