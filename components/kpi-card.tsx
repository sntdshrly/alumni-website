import { Users, CheckCircle2, AlertTriangle, GraduationCap, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { kpiCards } from "@/data/dashboard";

const icons = {
  users: { Icon: Users, className: "bg-blue-50 text-blue-600" },
  check: { Icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
  alert: { Icon: AlertTriangle, className: "bg-amber-50 text-amber-600" },
  graduation: { Icon: GraduationCap, className: "bg-violet-50 text-violet-600" },
  university: { Icon: Landmark, className: "bg-cyan-50 text-cyan-600" },
} as const;

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {kpiCards.map((kpi) => {
        const { Icon, className } = icons[kpi.icon];
        return (
          <div
            key={kpi.label}
            className="rounded-xl border border-black/5 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{kpi.label}</p>
                <p className="mt-1.5 text-2xl font-semibold text-slate-900">
                  {kpi.value}
                </p>
              </div>
              <div className={cn("flex size-9 items-center justify-center rounded-lg", className)}>
                <Icon className="size-4.5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">{kpi.caption}</p>
          </div>
        );
      })}
    </div>
  );
}
