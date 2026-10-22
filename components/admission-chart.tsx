"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { admissionChannels } from "@/data/dashboard";
import { Panel } from "@/components/panel";

export function AdmissionChart() {
  const total = admissionChannels.reduce((sum, item) => sum + item.value, 0);

  return (
    <Panel title="Jalur Penerimaan">
      <div className="flex min-w-0 flex-col items-center gap-4">
        <div className="relative h-[190px] w-[190px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={admissionChannels}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={1.5}
                strokeWidth={0}
              >
                {admissionChannels.map((entry) => (
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
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-xl font-semibold text-slate-900">{total}</p>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-1.5 text-xs">
          {admissionChannels.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-slate-600">{item.name}</span>
              <span className="ml-auto shrink-0 font-medium whitespace-nowrap text-slate-800">
                {item.pct.toFixed(2).replace(".", ",")}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
