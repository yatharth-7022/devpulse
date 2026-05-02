type Lang = { language: string; bytes: number; percentage: number };

const COLORS = [
  "oklch(0.78 0.18 152)",
  "oklch(0.7 0.16 200)",
  "oklch(0.75 0.17 80)",
  "oklch(0.7 0.18 30)",
  "oklch(0.65 0.2 300)",
  "oklch(0.7 0.14 240)",
];

export function LanguageChart({ data }: { data: Lang[] }) {
  return (
    <div className="space-y-3">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
        {data.map((l, i) => (
          <div
            key={l.language}
            style={{ width: `${l.percentage}%`, background: COLORS[i % COLORS.length] }}
            className="h-full"
            title={`${l.language} ${l.percentage}%`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
        {data.map((l, i) => (
          <div key={l.language} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="truncate text-foreground/90">{l.language}</span>
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              {l.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
