// components/DistrictDataDisplay.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { PerformanceData } from "@/app/district/[slug]/page";
import TrendChart from "./TrendChart";
import ComparisonCharts from "./ComparisonCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SpeechButton from "./SpeechButton";
import { createReportSummary } from "@/utils/createReportSummary";

interface DistrictDataDisplayProps {
  allData: PerformanceData[];
}

function getPastMonthData(
  data: PerformanceData[],
  monthsAgo: number
): PerformanceData | undefined {
  if (!data || data.length === 0) return undefined;
  const targetDate = new Date(data[0].report_date!);
  targetDate.setMonth(targetDate.getMonth() - monthsAgo);

  return data.find((record) => {
    const recordDate = new Date(record.report_date!);
    return (
      recordDate.getFullYear() === targetDate.getFullYear() &&
      recordDate.getMonth() === targetDate.getMonth()
    );
  });
}

function getPreviousYearData(
  data: PerformanceData[],
  currentRecord: PerformanceData
): PerformanceData | undefined {
  if (!currentRecord?.fin_year || !currentRecord?.month) return undefined;

  const currentYear = parseInt(currentRecord.fin_year.split("-")[0]);
  const previousFinYear = `${currentYear - 1}-${currentYear}`;

  console.log("Looking for previous year:", previousFinYear);

  return data.find((record) => {
    return (
      record.fin_year === previousFinYear &&
      record.month === currentRecord.month
    );
  });
}
export default function DistrictDataDisplay({
  allData,
}: DistrictDataDisplayProps) {
  const { latestData, lastMonthData, previousYearData, last12MonthsData } =
    useMemo(() => {
      const latest = allData[0];
      const lastMonth = getPastMonthData(allData, 1);
      const previousYear = getPreviousYearData(allData, latest);
      const last12Months = allData.slice(0, 12).reverse();

      return {
        latestData: latest,
        lastMonthData: lastMonth,
        previousYearData: previousYear,
        last12MonthsData: last12Months,
      };
    }, [allData]);

  console.log("Available financial years:", [
    ...new Set(allData.map((d) => d.fin_year)),
  ]);
  console.log("Found previous year data:", previousYearData);

  const stateAverageWage = 250;

  const [reportSummary, setReportSummary] = useState(
    "रिपोर्ट लोड हो रही है..."
  );

  useEffect(() => {
    if (latestData) {
      const summary = createReportSummary(
        latestData,
        lastMonthData,
        previousYearData,
        stateAverageWage
      );

      setReportSummary(summary);
    } else {
      setReportSummary("डेटा उपलब्ध नहीं है।");
    }
  }, [latestData, lastMonthData, previousYearData, stateAverageWage]);

  return (
    <div className="bg-[#f7f7f7] px-4 py-6 rounded-xl flex flex-col gap-4">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl text-center md:text-left font-medium mb-2">
            मनरेगा प्रदर्शन:
          </h1>
          <p className="text-lg text-[#a4a9a7]">
            {latestData.district_name
              ?.split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ") ?? "N/A"}
            ,{" "}
            {latestData.state_name
              ?.split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ") ?? "N/A"}
          </p>
        </div>
        <SpeechButton textToSpeak={reportSummary} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="w-full bg-gradient-to-b from-[#164e32] to-[#207a50] text-white">
          <CardHeader>
            <CardTitle>कार्यरत परिवार</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-5xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {latestData.Total_Households_Worked?.toLocaleString() ?? "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>औसत दिन प्रति परिवार</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-5xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {latestData.Average_days_of_employment_provided_per_Household ??
                "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>औसत दैनिक मजदूरी (₹)</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-5xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {latestData.Average_Wage_rate_per_day_per_person?.toFixed(2) ??
                "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>पूर्ण कार्य</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-5xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {latestData.Number_of_Completed_Works?.toLocaleString() ?? "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>
      <ComparisonCharts
        latestData={latestData}
        lastMonthData={lastMonthData}
        previousYearData={previousYearData}
        stateAverageWage={stateAverageWage}
      />

      <TrendChart data={last12MonthsData} />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>विस्तृत आँकड़े (नवीनतम महीना)</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  मीट्रिक
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  मान
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  वित्तीय वर्ष
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {latestData.fin_year ?? "N/A"}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  100 दिन पूरे करने वाले परिवार (HH)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {latestData.Total_No_of_HHs_completed_100_Days_of_Wage_Employment?.toLocaleString() ??
                    "N/A"}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  समय पर भुगतान % (15 दिनों के भीतर)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {latestData.percentage_payments_gererated_within_15_days
                    ? `${latestData.percentage_payments_gererated_within_15_days}%`
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  महिला कार्यदिवस
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {latestData.Women_Persondays?.toLocaleString() ?? "N/A"}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  एससी (SC) कार्यदिवस
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {latestData.SC_persondays?.toLocaleString() ?? "N/A"}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  एसटी (ST) कार्यदिवस
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {latestData.ST_persondays?.toLocaleString() ?? "N/A"}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  चल रहे कार्य
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {latestData.Number_of_Ongoing_Works?.toLocaleString() ??
                    "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
