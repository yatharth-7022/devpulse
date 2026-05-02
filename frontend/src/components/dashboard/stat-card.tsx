import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  accent?: boolean;
};

export function StatCard({ label, value, icon: Icon, hint, accent }: Props) {
  return (
    <div className="group relative p-2 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <Icon className="h-4 w-4 text-primary opacity-70 transition-opacity group-hover:opacity-100" />
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            "text-3xl font-semibold tracking-tight",
            accent ? "text-primary" : "text-foreground",
          )}
        >
          {value}
        </span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
