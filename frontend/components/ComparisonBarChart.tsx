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
  Cell, // 1. Import Cell from recharts
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
  previousData?: PerformanceData;
  dataKey: keyof PerformanceData;
  label: string;
  title: string;
  description: string;
  currentLabel?: string;
  previousLabel?: string;
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
  currentBarColor = "hsl(var(--primary))", // Use theme-aware color
  previousBarColor = "hsl(var(--secondary))", // Use theme-aware color
}: ComparisonBarChartProps) {
  const chartData = [
    {
      name: currentLabel,
      value: (currentData[dataKey] as number) || 0,
      color: currentBarColor,
    },
    {
      name: previousLabel,
      value: previousData ? (previousData[dataKey] as number) || 0 : 0,
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ right: 30 }}>
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

            {/* 2. Remove the map from inside the <Bar> tag */}
            <Bar dataKey="value">
              {/* 3. Map over chartData to create a <Cell> for each bar */}
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
