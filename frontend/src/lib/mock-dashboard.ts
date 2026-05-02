export type DashboardStats = {
  overview: {
    totalCommits30d: number;
    activeDays30d: number;
    currentStreak: number;
    longestStreak: number;
  };
  heatmap: { date: string; count: number }[];
  languages: { language: string; bytes: number; percentage: number }[];
  topRepos: { name: string; fullName: string; commitCount: number }[];
  comparison: {
    thisMonth: { commits: number; activeDays: number };
    lastMonth: { commits: number; activeDays: number };
  };
  activeTime: { weekday: number; hour: number; count: number }[];
};

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildHeatmap(): { date: string; count: number }[] {
  const r = rng(42);
  const out: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const weekday = d.getDay();
    const base = weekday === 0 || weekday === 6 ? 0.35 : 0.85;
    const v = r();
    let count = 0;
    if (v < base) {
      count = Math.floor(r() * 12);
      if (r() > 0.85) count += Math.floor(r() * 8);
    }
    out.push({ date: d.toISOString().slice(0, 10), count });
  }
  return out;
}

function buildActiveTime(): { weekday: number; hour: number; count: number }[] {
  const r = rng(7);
  const out: { weekday: number; hour: number; count: number }[] = [];
  for (let w = 0; w < 7; w++) {
    for (let h = 0; h < 24; h++) {
      let weight = 0.05;
      if (h >= 9 && h <= 12) weight = 0.9;
      else if (h >= 14 && h <= 18) weight = 1;
      else if (h >= 19 && h <= 22) weight = 0.55;
      else if (h >= 7 && h <= 8) weight = 0.4;
      if (w === 0 || w === 6) weight *= 0.4;
      const count = Math.max(0, Math.floor(r() * 10 * weight));
      out.push({ weekday: w, hour: h, count });
    }
  }
  return out;
}

export const mockStats: DashboardStats = {
  overview: {
    totalCommits30d: 412,
    activeDays30d: 24,
    currentStreak: 9,
    longestStreak: 38,
  },
  heatmap: buildHeatmap(),
  languages: [
    { language: "TypeScript", bytes: 482000, percentage: 42 },
    { language: "Python", bytes: 254000, percentage: 22 },
    { language: "Rust", bytes: 138000, percentage: 12 },
    { language: "Go", bytes: 115000, percentage: 10 },
    { language: "CSS", bytes: 92000, percentage: 8 },
    { language: "Shell", bytes: 69000, percentage: 6 },
  ],
  topRepos: [
    { name: "pulse-core", fullName: "octocat/pulse-core", commitCount: 138 },
    { name: "edge-runtime", fullName: "octocat/edge-runtime", commitCount: 96 },
    { name: "design-tokens", fullName: "octocat/design-tokens", commitCount: 71 },
    { name: "cli-tools", fullName: "octocat/cli-tools", commitCount: 54 },
    { name: "docs-site", fullName: "octocat/docs-site", commitCount: 31 },
  ],
  comparison: {
    thisMonth: { commits: 412, activeDays: 24 },
    lastMonth: { commits: 356, activeDays: 21 },
  },
  activeTime: buildActiveTime(),
};
