import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Cell = { weekday: number; hour: number; count: number };
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function intensity(c: number, max: number): string {
  if (c === 0) return "bg-white/[0.04]";
  const r = c / max;
  if (r < 0.25) return "bg-primary/20";
  if (r < 0.5) return "bg-primary/40";
  if (r < 0.75) return "bg-primary/[0.65]";
  return "bg-primary";
}

export function ActiveTimeGrid({ data }: { data: Cell[] }) {
  const max = Math.max(...data.map((c) => c.count), 1);
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  data.forEach((c) => (grid[c.weekday][c.hour] = c.count));

  return (
    <TooltipProvider delayDuration={50}>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="ml-10 flex gap-[3px] text-[10px] text-muted-foreground">
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="w-4 text-center">
                {h % 3 === 0 ? h : ""}
              </div>
            ))}
          </div>
          {grid.map((row, w) => (
            <div key={w} className="mt-[3px] flex items-center gap-[3px]">
              <div className="w-8 text-right text-[10px] text-muted-foreground">{DAYS[w]}</div>
              <div className="flex gap-[3px]">
                {row.map((c, h) => (
                  <Tooltip key={h}>
                    <TooltipTrigger asChild>
                      <div
                        className={`h-4 w-4 rounded-[3px] ${intensity(c, max)} transition-transform hover:scale-125`}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 text-xs text-white">
                      {DAYS[w]} {h}:00 — <span className="font-medium">{c}</span> events
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
