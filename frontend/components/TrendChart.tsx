// components/TrendChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PerformanceData } from "@/app/district/[slug]/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendChartProps {
  data: PerformanceData[];
}

const monthMap: { [key: string]: string } = {
  April: "अप्रैल",
  May: "मई",
  June: "जून",
  July: "जुलाई",
  Aug: "अगस्त",
  Sep: "सितंबर",
  Oct: "अक्टूबर",
  Nov: "नवंबर",
  Dec: "दिसंबर",
  Jan: "जनवरी",
  Feb: "फरवरी",
  March: "मार्च",
  "N/A": "N/A",
};

export default function TrendChart({ data }: TrendChartProps) {
  const chartData = data.map((record) => {
    const englishMonth = record.month || "N/A";
    return {
      month: monthMap[englishMonth] || englishMonth,
      households: record.Total_Households_Worked || 0,
    };
  });

  return (
    <section>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>प्रति माह कार्यरत कुल परिवार</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={256}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Line
                type="monotone"
                dataKey="households"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}
