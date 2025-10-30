// components/ComparisonCharts.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PerformanceData } from "@/app/district/[slug]/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ComparisonChartsProps {
  latestData: PerformanceData;
  lastMonthData?: PerformanceData;
  previousYearData?: PerformanceData;
  stateAverageWage: number;
}

export default function ComparisonCharts({
  latestData,
  lastMonthData,
  previousYearData,
  stateAverageWage,
}: ComparisonChartsProps) {
  const householdsData = [
    {
      name: "पिछले महीने",
      value: lastMonthData?.Total_Households_Worked || 0,
    },
    {
      name: "इस महीने",
      value: latestData.Total_Households_Worked || 0,
    },
  ];

  const wageData = [
    {
      name: "राज्य औसत",
      value: stateAverageWage,
    },
    {
      name: "जिला",
      value: latestData.Average_Wage_rate_per_day_per_person || 0,
    },
  ];

  const expenditureData = [
    {
      name: "पिछले साल",
      value: previousYearData?.Total_Exp || 0,
    },
    {
      name: "इस साल",
      value: latestData.Total_Exp || 0,
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>कार्यरत परिवार</CardTitle>
            <CardDescription>
              इस महीने:{" "}
              {latestData.Total_Households_Worked?.toLocaleString() ?? "N/A"} |
              पिछले महीने:{" "}
              {lastMonthData?.Total_Households_Worked?.toLocaleString() ??
                "N/A"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={128}>
              <BarChart data={householdsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>औसत दैनिक मजदूरी</CardTitle>
            <CardDescription>
              आपका जिला: ₹
              {latestData.Average_Wage_rate_per_day_per_person?.toFixed(2) ??
                "N/A"}{" "}
              | राज्य औसत: ₹{stateAverageWage.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={128}>
              <BarChart data={wageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#9333ea" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>कुल व्यय (उसी महीने का)</CardTitle>
            <CardDescription>
              इस साल: ₹
              {latestData.Total_Exp?.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              }) ?? "N/A"}{" "}
              | पिछले साल: ₹
              {previousYearData?.Total_Exp?.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              }) ?? "N/A"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={128}>
              <BarChart data={expenditureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
                <Bar dataKey="value" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
