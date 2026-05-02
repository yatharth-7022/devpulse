import { GitCommit } from "lucide-react";

type Repo = { name: string; fullName: string; commitCount: number };

export function RepoTable({ data }: { data: Repo[] }) {
  const max = Math.max(...data.map((r) => r.commitCount));
  return (
    <div className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 font-medium">Repository</th>
            <th className="px-4 py-3 font-medium">Full name</th>
            <th className="px-4 py-3 text-right font-medium">Commits</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr
              key={r.fullName}
              className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03]"
            >
              <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.fullName}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(r.commitCount / max) * 100}%` }}
                    />
                  </div>
                  <span className="inline-flex items-center gap-1 tabular-nums text-foreground">
                    <GitCommit className="h-3 w-3 text-primary" />
                    {r.commitCount}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
