import { topUniversities } from "@/data/dashboard";
import { Panel } from "@/components/panel";

export function UniversityChart() {
  const max = Math.max(...topUniversities.map((u) => u.value));

  return (
    <Panel title="Top 5 Perguruan Tinggi Tujuan">
      <div className="flex h-full flex-col justify-between gap-3.5">
        {topUniversities.map((uni) => (
          <div key={uni.name} className="min-w-0">
            <div className="mb-1 flex min-w-0 items-center justify-between text-xs">
              <span className="min-w-0 flex-1 truncate pr-2 text-slate-700">{uni.name}</span>
              <span className="shrink-0 font-medium text-slate-900">
                {uni.value} ({uni.pct.toFixed(2).replace(".", ",")}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${(uni.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
