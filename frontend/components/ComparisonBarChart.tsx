// components/ComparisonBarChart.tsx
"use client";

import { PerformanceData } from "@/app/district/[slug]/page";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ComparisonBarChartProps {
  currentData: PerformanceData;
  previousData?: PerformanceData; // Optional, as previous year data might not always be there
  dataKey: keyof PerformanceData;
  label: string; // e.g., "परिवार" for families
  title: string;
  description: string;
  currentLabel?: string; // e.g., "इस साल"
  previousLabel?: string; // e.g., "पिछला साल"
  currentBarColor?: string;
  previousBarColor?: string;
}

export default function ComparisonBarChart({
  currentData,
  previousData,
  dataKey,
  label,
  title,
  description,
  currentLabel = "इस साल",
  previousLabel = "पिछला साल",
  currentBarColor = "#4ade80", // Greenish
  previousBarColor = "#facc15", // Yellowish
}: ComparisonBarChartProps) {
  const chartData = [
    {
      name: currentLabel,
      value: currentData[dataKey] || 0,
      color: currentBarColor,
    },
    {
      name: previousLabel,
      value: previousData ? previousData[dataKey] || 0 : 0,
      color: previousBarColor,
    },
  ];

  return (
    <Card className="w-full h-[300px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">{title}</CardTitle>
        <CardDescription className="text-xs text-center">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)]">
        {" "}
        {/* Adjust height to fit */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
            <XAxis
              type="number"
              tickFormatter={(value) => `${value} ${label}`}
              className="text-xs"
            />
            <YAxis dataKey="name" type="category" className="text-xs" />
            <Tooltip
              formatter={(value, name) => [`${value} ${label}`, name]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                fontSize: "0.875rem",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="value" fill="#8884d8">
              {chartData.map((entry, index) => (
                <Bar key={`bar-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
