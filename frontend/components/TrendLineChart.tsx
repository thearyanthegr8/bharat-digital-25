// components/TrendLineChart.tsx
"use client";

import { PerformanceData } from "@/app/district/[slug]/page";
import { formatMonthShort } from "@/utils/formatters";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendLineChartProps {
  data: PerformanceData[];
  dataKey: keyof PerformanceData;
  label: string; // e.g., "परिवार" for families, "%" for percentage
  title: string;
  description: string;
  color?: string; // Optional color for the line
}

export default function TrendLineChart({
  data,
  dataKey,
  label,
  title,
  description,
  color = "#8884d8", // Default purple-blue color
}: TrendLineChartProps) {
  // Filter out any data points where the dataKey value is null or undefined
  const cleanedData = data.filter(
    (item) => item[dataKey] !== null && item[dataKey] !== undefined
  );

  // Sort data by report_date to ensure the trend is correct
  const sortedData = [...cleanedData].sort((a, b) => {
    const dateA = new Date(a.report_date || "").getTime();
    const dateB = new Date(b.report_date || "").getTime();
    return dateA - dateB;
  });

  return (
    <div className="w-full h-[300px] bg-card p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-1 text-center">{title}</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">
        {description}
      </p>
      <ResponsiveContainer width="100%" height="70%">
        <LineChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
          <XAxis
            dataKey="month"
            tickFormatter={(value) => formatMonthShort(value)}
            className="text-xs"
          />
          <YAxis
            tickFormatter={(value) => `${value} ${label}`}
            className="text-xs"
          />
          <Tooltip
            formatter={(value) => [`${value} ${label}`, title]}
            labelFormatter={(label) => `महीना: ${formatMonthShort(label)}`}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              fontSize: "0.875rem",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Line
            type="monotone"
            dataKey={dataKey as string}
            stroke={color}
            strokeWidth={1}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
