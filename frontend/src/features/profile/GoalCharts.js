"use client";

import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BRAND = "rgb(var(--color-brand-ink))";
const TRACK = "rgb(var(--color-line))";
const MUTED = "rgb(var(--color-ink-muted))";

// Avoids a zero-size first render while the dialog is still being laid out.
const INITIAL_SIZE = { width: 224, height: 192 };

const tooltipStyle = {
  backgroundColor: "rgb(var(--color-surface))",
  border: "1px solid rgb(var(--color-line))",
  borderRadius: 8,
  color: "rgb(var(--color-ink))",
  fontSize: 13,
};

export default function GoalCharts({ progress, plan }) {
  const days = [
    { name: "Geçen gün", value: progress.elapsedDays, color: BRAND },
    { name: "Kalan gün", value: progress.remainingDays, color: TRACK },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
      <figure className="min-w-0">
        <figcaption className="text-sm font-medium">Süre</figcaption>
        <div className="relative mt-2 h-48">
          <ResponsiveContainer initialDimension={INITIAL_SIZE}>
            <PieChart>
              <Pie
                data={days}
                dataKey="value"
                nameKey="name"
                innerRadius={56}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
              >
                {days.map(({ name, color }) => (
                  <Cell key={name} style={{ fill: color }} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "inherit" }} />
            </PieChart>
          </ResponsiveContainer>
          <p className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums">%{progress.percent}</span>
            <span className="text-xs text-ink-muted">tamamlandı</span>
          </p>
        </div>
      </figure>

      <figure className="min-w-0">
        <figcaption className="text-sm font-medium">Planlanan kilo seyri</figcaption>
        <div className="mt-2 h-48">
          <ResponsiveContainer initialDimension={INITIAL_SIZE}>
            <LineChart data={plan} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
              <CartesianGrid style={{ stroke: TRACK }} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tickFormatter={(day) => `${day}. gün`}
                tick={{ fontSize: 12, style: { fill: MUTED } }}
                axisLine={{ style: { stroke: TRACK } }}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 12, style: { fill: MUTED } }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(day) => `${day}. gün`}
                formatter={(value) => [`${value} kg`, "Planlanan kilo"]}
                itemStyle={{ color: "inherit" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                style={{ stroke: BRAND }}
                strokeWidth={2}
                dot={{ r: 3, style: { stroke: BRAND, fill: "rgb(var(--color-surface))" } }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Mevcut kilondan hedef kilona eşit hızda ilerlediğin varsayılarak hesaplanır; ölçüm kaydı değildir.
        </p>
      </figure>
    </div>
  );
}
