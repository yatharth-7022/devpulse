import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Cell = { date: string; count: number };

function intensity(count: number): string {
  if (count === 0) return "bg-white/[0.04]";
  if (count < 3) return "bg-primary/20";
  if (count < 6) return "bg-primary/40";
  if (count < 10) return "bg-primary/[0.65]";
  return "bg-primary";
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function Heatmap({ data }: { data: Cell[] }) {
  const { weeks, monthLabels } = useMemo(() => {
    const first = new Date(data[0].date);
    const pad = first.getDay();
    const padded: (Cell | null)[] = [
      ...Array.from({ length: pad }, () => null),
      ...data,
    ];
    const weeks: (Cell | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }
    const monthLabels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((w, i) => {
      const firstReal = w.find((c) => c);
      if (!firstReal) return;
      const m = new Date(firstReal.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ col: i, label: MONTHS[m] });
        lastMonth = m;
      }
    });
    return { weeks, monthLabels };
  }, [data]);

  return (
    <TooltipProvider delayDuration={50}>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="relative ml-8 h-4">
            {monthLabels.map((m) => (
              <span
                key={`${m.col}-${m.label}`}
                className="absolute text-[10px] uppercase tracking-wider text-muted-foreground"
                style={{ left: `${m.col * 14}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex gap-[2px]">
            <div className="mr-1 flex flex-col gap-[2px] pt-[2px] text-[10px] text-muted-foreground">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <span key={i} className="h-3 leading-3">{d}</span>
              ))}
            </div>
            {weeks.map((w, i) => (
              <div key={i} className="flex flex-col gap-[2px]">
                {Array.from({ length: 7 }).map((_, j) => {
                  const c = w[j];
                  if (!c) return <div key={j} className="h-3 w-3" />;
                  return (
                    <Tooltip key={j}>
                      <TooltipTrigger asChild>
                        <div
                          className={`h-3 w-3 rounded-[2px] ${intensity(c.count)} transition-transform hover:scale-125`}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 text-xs text-white">
                        <span className="font-medium">{c.count}</span> commits on{" "}
                        {new Date(c.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-3 ml-8 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Less</span>
            {[0, 2, 5, 9, 12].map((n) => (
              <div key={n} className={`h-3 w-3 rounded-[2px] ${intensity(n)}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
