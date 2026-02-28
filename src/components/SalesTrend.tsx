import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";

const weeklyData = [
  { day: "Mon", sales: 4200 },
  { day: "Tue", sales: 5800 },
  { day: "Wed", sales: 3900 },
  { day: "Thu", sales: 7100 },
  { day: "Fri", sales: 6500 },
  { day: "Sat", sales: 8200 },
  { day: "Sun", sales: 2100 },
];

const monthlyData = [
  { day: "W1", sales: 32000 },
  { day: "W2", sales: 28000 },
  { day: "W3", sales: 41000 },
  { day: "W4", sales: 35000 },
];

export function SalesTrend() {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const data = view === "weekly" ? weeklyData : monthlyData;

  return (
    <div className="bg-card rounded-lg p-5 shadow-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground">
          Sales Trend
        </h3>
        <div className="flex bg-muted rounded-md p-0.5">
          <button
            onClick={() => setView("weekly")}
            className={`text-[10px] font-body font-medium px-2.5 py-1 rounded transition-colors ${
              view === "weekly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView("monthly")}
            className={`text-[10px] font-body font-medium px-2.5 py-1 rounded transition-colors ${
              view === "monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Month
          </button>
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={view === "weekly" ? 24 : 40}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "hsl(210 10% 45%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "Inter",
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, "Sales"]}
            />
            <Bar dataKey="sales" fill="hsl(210 50% 20%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
