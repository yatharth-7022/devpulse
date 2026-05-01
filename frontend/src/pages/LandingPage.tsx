import { FallingPattern } from "@/components/ui/falling-pattern";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Activity,
  TrendingUp,
  Code2,
  Zap,
  Star,
  Plug,
  BarChart3,
  Sparkles,
  Check,
  Shield,
  Clock,
  Users,
  Workflow,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LandingPage() {
  return (
    <div className="dark relative min-h-screen overflow-hidden bg-background text-foreground antialiased">
      {/* GLOBAL FALLING PATTERN — fixed behind all content */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <FallingPattern
          color="oklch(0.78 0.18 152)"
          backgroundColor="oklch(0 0 0)"
          duration={160}
          blurIntensity="0.6em"
          density={1}
        />
      </div>

      <div className="relative z-10">
        {/* NAV */}
        <header className="relative z-20">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30 backdrop-blur">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Pulse</span>
            </div>
            <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#workflow" className="hover:text-foreground transition-colors">How it works</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            </div>
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <GitBranch className="h-4 w-4" />
              Sign in
            </Button>
          </nav>
        </header>

        {/* HERO */}
        <section className="relative">
          <div className="absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.10),transparent_60%)]" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 pb-32 text-center md:pt-32 md:pb-44">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Now indexing 2.4M repositories
            </div>

            <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight md:text-7xl">
              Your code,{" "}
              <span className="bg-gradient-to-br from-green-400 to-green-600 bg-clip-text text-transparent">
                measured
              </span>
              .
            </h1>

            <p className="mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
              Sign in with GitHub and instantly see what you actually shipped this week — across every
              repo, branch, and pull request. No setup. No spreadsheets.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <GitBranch className="h-5 w-5" />
                Continue with GitHub
              </Button>
              <Button size="lg" variant="ghost" className="text-muted-foreground hover:text-foreground">
                See a live demo →
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Free for personal repos · Read-only access · Revoke anytime
            </p>
          </div>
        </section>

        {/* METRICS STRIP */}
        <section className="relative z-10 bg-background/60 backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Commits tracked", value: "184M+" },
              { label: "Pull requests", value: "12.4M" },
              { label: "Active developers", value: "38k" },
              { label: "Avg. focus gain", value: "+27%" },
            ].map((m, i) => (
              <Reveal
                key={m.label}
                delay={i * 0.08}
                y={20}
                className="bg-background/80 px-6 py-8 text-center backdrop-blur"
              >
                <div className="text-3xl font-semibold tracking-tight text-foreground">{m.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{m.label}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="relative mx-auto max-w-7xl px-6 py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Insights</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              Everything your standup wishes it had.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pulse turns raw GitHub events into the metrics that actually matter — for you, not for managers.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-6 overflow-hidden rounded-2xl md:grid-cols-3">
            {[
              { icon: GitCommit, title: "Commit cadence", body: "Visualize your shipping rhythm across days, weeks, and quarters. Spot burnout before it spots you." },
              { icon: GitPullRequest, title: "PR cycle time", body: "From first commit to merge — see exactly where reviews stall and which repos drag the team down." },
              { icon: Code2, title: "Language breakdown", body: "Discover where your hours actually go. TypeScript? Terraform? YAML? The truth might surprise you." },
              { icon: TrendingUp, title: "Velocity trends", body: "Track output without counting lines. Pulse weighs complexity, refactors, and review depth." },
              { icon: Zap, title: "Focus windows", body: "Detect your peak hours from real commit timestamps and protect them on your calendar." },
              { icon: Star, title: "Repo health", body: "Stars, issues, contributor diversity — a snapshot of every project you maintain in one place." },
            ].map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 3) * 0.1}
                className="group relative bg-background/85 p-8 backdrop-blur transition-colors hover:bg-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 transition-colors group-hover:bg-primary/20">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="workflow" className="relative bg-background/40 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">Workflow</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                Three steps. Zero config.
              </h2>
              <p className="mt-4 text-muted-foreground">
                From sign-in to your first insight in under a minute. We do the heavy lifting in the background.
              </p>
            </Reveal>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                { icon: Plug, step: "01", title: "Connect GitHub", body: "OAuth in one click. We request read-only access to repository metadata — never your source code." },
                { icon: Workflow, step: "02", title: "We sync silently", body: "Pulse indexes your commit history, PRs, reviews, and issue activity in the background. Usually under 60 seconds." },
                { icon: BarChart3, step: "03", title: "Insights, forever", body: "Open your dashboard. Filter by repo, branch, or timeframe. Share read-only views with your team if you want." },
              ].map((s, i) => (
                <Reveal
                  key={s.step}
                  delay={i * 0.12}
                  className="relative rounded-2xl bg-background/70 p-8 backdrop-blur"
                >
                  <span className="text-xs font-mono text-primary/70">{s.step}</span>
                  <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* DASHBOARD PREVIEW */}
        <section className="relative mx-auto max-w-7xl px-6 py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Preview</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              A dashboard that respects your time.
            </h2>
            <p className="mt-4 text-muted-foreground">
              No vanity metrics. No "lines of code per hour." Just the signals that actually map to good engineering.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-14">
            <div className="relative overflow-hidden rounded-2xl bg-background/70 p-1 backdrop-blur-xl shadow-[0_0_120px_-20px_rgba(34,197,94,0.25)]">
              <div className="rounded-xl bg-gradient-to-b from-card/90 to-background/90 p-8">
                <div className="flex items-center justify-between pb-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">This week</div>
                    <div className="mt-1 text-2xl font-semibold">Welcome back, Alex</div>
                  </div>
                  <div className="hidden gap-2 md:flex">
                    {["7d", "30d", "90d", "1y"].map((t) => (
                      <div
                        key={t}
                        className={`rounded-md px-3 py-1.5 text-xs ${
                          t === "7d"
                            ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                            : "text-muted-foreground"
                        }`}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  {[
                    { l: "Commits", v: "47", d: "+12%" },
                    { l: "PRs merged", v: "9", d: "+3" },
                    { l: "Reviews", v: "21", d: "+18%" },
                    { l: "Focus hours", v: "22.4", d: "+4.1h" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg bg-background/60 p-4">
                      <div className="text-xs text-muted-foreground">{s.l}</div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <div className="text-2xl font-semibold">{s.v}</div>
                        <div className="text-xs text-primary">{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-background/60 p-5 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Activity</div>
                      <div className="text-xs text-muted-foreground">Last 12 weeks</div>
                    </div>
                    <div className="mt-4 flex h-32 items-end gap-1.5">
                      {[40, 55, 30, 70, 45, 80, 60, 95, 65, 75, 50, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-gradient-to-t from-primary/30 to-primary/80"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background/60 p-5">
                    <div className="text-sm font-medium">Top repos</div>
                    <div className="mt-4 space-y-3">
                      {[
                        { n: "pulse/web", v: 64 },
                        { n: "pulse/api", v: 41 },
                        { n: "infra/terraform", v: 23 },
                        { n: "docs", v: 9 },
                      ].map((r) => (
                        <div key={r.n}>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{r.n}</span>
                            <span className="text-foreground">{r.v}</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/40">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${(r.v / 64) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* WHO IT'S FOR */}
        <section className="relative bg-background/40 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">Built for</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                Whatever your role, Pulse fits.
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Code2,
                  title: "Solo developers",
                  body: "Track your own growth across side projects, OSS contributions, and freelance work — all in one timeline.",
                  points: ["Personal weekly digest", "Side-project momentum", "Public profile (optional)"],
                },
                {
                  icon: Users,
                  title: "Engineering teams",
                  body: "Spot bottlenecks, balance review load, and run honest retros backed by data — never guesswork.",
                  points: ["Team load balance", "Review distribution", "Sprint comparisons"],
                },
                {
                  icon: Sparkles,
                  title: "Engineering leaders",
                  body: "Get high-signal trends without micromanaging. Pulse surfaces what's healthy and what needs attention.",
                  points: ["Healthy-team scoring", "Burnout early signals", "Quarterly reports"],
                },
              ].map((u, i) => (
                <Reveal
                  key={u.title}
                  delay={i * 0.1}
                  className="rounded-2xl bg-background/70 p-8 backdrop-blur"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <u.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-medium">{u.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{u.body}</p>
                  <ul className="mt-5 space-y-2">
                    {u.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="relative mx-auto max-w-7xl px-6 py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Loved by builders</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              Developers who actually look forward to Mondays.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "Pulse showed me I was doing 80% of my real work between 9pm and 1am. I restructured my week and got my evenings back.",
                name: "Maya R.",
                role: "Staff Engineer, Linear",
              },
              {
                quote:
                  "We replaced three productivity tools and a half-baked spreadsheet with Pulse. The retros are finally based on something real.",
                name: "Diego F.",
                role: "Engineering Manager, Ramp",
              },
              {
                quote:
                  "I stopped feeling like an imposter the moment I saw my actual six-month commit graph. The data is brutal and honest.",
                name: "Priya S.",
                role: "Senior Backend Dev, Vercel",
              },
            ].map((t, i) => (
              <Reveal
                key={t.name}
                delay={i * 0.1}
                className="rounded-2xl bg-background/70 p-8 backdrop-blur"
              >
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-primary" />
                  ))}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3 pt-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="relative bg-background/40 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 py-28">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">Pricing</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                Simple. Fair. Free if you're solo.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start with everything. Upgrade only when you bring a team.
              </p>
            </Reveal>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {[
                {
                  name: "Solo",
                  price: "Free",
                  period: "forever",
                  features: ["Unlimited personal repos", "12 months of history", "Weekly digest email", "Public dev profile"],
                  cta: "Start free",
                  highlight: false,
                },
                {
                  name: "Team",
                  price: "$9",
                  period: "/dev / month",
                  features: ["Everything in Solo", "Unlimited team members", "5 years of history", "Sprint & cycle analytics", "Slack & Linear integrations"],
                  cta: "Start 14-day trial",
                  highlight: true,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  period: "annual",
                  features: ["SSO / SAML", "Self-hosted option", "Custom data retention", "Dedicated success manager", "SOC 2 Type II"],
                  cta: "Talk to sales",
                  highlight: false,
                },
              ].map((p, i) => (
                <Reveal
                  key={p.name}
                  delay={i * 0.1}
                  className={`relative rounded-2xl p-8 backdrop-blur ${
                    p.highlight
                      ? "bg-background/80 shadow-[0_0_60px_-15px_rgba(34,197,94,0.35)]"
                      : "bg-background/70"
                  }`}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Most popular
                    </div>
                  )}
                  <div className="text-sm font-medium text-muted-foreground">{p.name}</div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`mt-8 w-full ${
                      p.highlight
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {p.cta}
                  </Button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST / SECURITY STRIP */}
        <section className="relative mx-auto max-w-7xl px-6 py-28">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-widest text-primary">Security</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                We never read your code.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Pulse only requests read-only access to repository metadata — commits, PR titles, review timestamps.
                Source code stays in GitHub, where it belongs. Revoke access in a single click, anytime.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {["SOC 2 Type II", "GDPR ready", "Read-only OAuth", "EU data residency"].map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
                  >
                    <Shield className="h-3 w-3 text-primary" />
                    {b}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Shield, title: "Encrypted at rest", body: "AES-256 across all stored data." },
                  { icon: Clock, title: "Real-time sync", body: "Webhook-driven, never stale." },
                  { icon: GitBranch, title: "GitHub-native", body: "OAuth scopes you can audit." },
                  { icon: Users, title: "Role-based access", body: "Admin, member, viewer." },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="rounded-xl bg-background/70 p-5 backdrop-blur"
                  >
                    <c.icon className="h-5 w-5 text-primary" />
                    <div className="mt-3 text-sm font-medium">{c.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.body}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative bg-background/40 backdrop-blur-md">
          <div className="mx-auto max-w-3xl px-6 py-28">
            <Reveal className="text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">FAQ</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                Questions, answered.
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-12">
              <Accordion type="single" collapsible className="space-y-3">
                {[
                  {
                    q: "Does Pulse read my source code?",
                    a: "No. We request the minimum read-only OAuth scope needed to access commit metadata, PRs, reviews, and issues. Your source code never touches our servers.",
                  },
                  {
                    q: "How long does the initial sync take?",
                    a: "For most accounts, under 60 seconds. Very large monorepos with deep history can take a few minutes. You'll see live progress.",
                  },
                  {
                    q: "Can I use Pulse on private and organization repos?",
                    a: "Yes. After signing in, you choose which repos and orgs to grant access to. You can change this at any time from your GitHub settings.",
                  },
                  {
                    q: "Do you support GitLab or Bitbucket?",
                    a: "Not yet — GitLab support is on the roadmap for Q3. Bitbucket is being evaluated based on demand.",
                  },
                  {
                    q: "Will my manager see my data?",
                    a: "Only if you're on a Team plan and explicitly join an org workspace. Solo accounts are fully private — no sharing, no leaderboards.",
                  },
                  {
                    q: "Can I export my data?",
                    a: "Yes. Every chart and table can be exported as CSV or JSON. Your data is yours.",
                  },
                ].map((item, i) => (
                  <AccordionItem
                    key={item.q}
                    value={`item-${i}`}
                    className="rounded-xl bg-background/70 px-5 backdrop-blur"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative">
          <div className="absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.15),transparent_60%)]" />
          <Reveal className="relative z-10 mx-auto max-w-3xl px-6 py-32 text-center">
            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Stop guessing.{" "}
              <span className="bg-gradient-to-br from-green-400 to-green-600 bg-clip-text text-transparent">
                Start measuring.
              </span>
            </h2>
            <p className="mt-5 text-muted-foreground md:text-lg">
              Connect GitHub in 10 seconds. See your first dashboard before your coffee gets cold.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <GitBranch className="h-5 w-5" />
                Sign in with GitHub
              </Button>
              <Button size="lg" variant="ghost" className="text-muted-foreground hover:text-foreground">
                Book a demo →
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              No credit card · Cancel anytime · Trusted by 38,000+ developers
            </p>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer className="bg-background/60 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <div className="grid gap-10 md:grid-cols-4">
              <div className="md:col-span-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-lg font-semibold tracking-tight">Pulse</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Developer productivity insights from the GitHub data you already have.
                </p>
              </div>
              {[
                { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
                { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
                { title: "Resources", links: ["Docs", "API", "Status", "Security"] },
              ].map((col) => (
                <div key={col.title}>
                  <div className="text-sm font-medium text-foreground">{col.title}</div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {col.links.map((l) => (
                      <li key={l}>
                        <a href="#" className="hover:text-foreground transition-colors">{l}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 pt-6 text-sm text-muted-foreground md:flex-row">
              <span>© {new Date().getFullYear()} Pulse. Built for builders.</span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
