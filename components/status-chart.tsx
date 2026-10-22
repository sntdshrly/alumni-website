"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { statusAlumni, dashboardData } from "@/data/dashboard";
import { Panel } from "@/components/panel";

export function StatusChart() {
  return (
    <Panel title="Status Alumni Setelah Lulus">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-[190px] w-[190px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusAlumni}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={1.5}
                strokeWidth={0}
              >
                {statusAlumni.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} alumni`, name]}
                contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-slate-500">Total Alumni</p>
            <p className="text-xl font-semibold text-slate-900">{dashboardData.totalAlumni}</p>
          </div>
        </div>

        <div className="grid w-full min-w-0 grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {statusAlumni.map((item) => (
            <div key={item.name} className="flex min-w-0 items-center gap-1.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="min-w-0 flex-1 truncate text-slate-600">{item.name}</span>
              <span className="ml-auto shrink-0 font-medium text-slate-800">
                {item.pct.toFixed(2).replace(".", ",")}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
