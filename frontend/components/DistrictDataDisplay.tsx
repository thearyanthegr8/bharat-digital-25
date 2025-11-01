// components/DistrictDataDisplay.tsx
"use client";

// Import all components and utilities as before...
import { useEffect, useMemo, useState } from "react";
import { PerformanceData } from "@/app/district/[slug]/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SpeechButton from "./SpeechButton";
import { createReportSummary } from "@/utils/createReportSummary";
import TrendLineChart from "./TrendLineChart";
import ComparisonBarChart from "./ComparisonBarChart";
import { formatNumber } from "@/utils/formatters";

// Import Lucide Icons
import {
  Users,
  Wallet,
  Award,
  Banknote,
  HeartHandshake,
  UserCheck,
  Building,
  CheckCircle,
} from "lucide-react";

// --- (Keep all your helper functions: getPastMonthData, getPreviousYearData) ---
// ... (helper functions from your previous code go here) ...
function getPastMonthData(
  data: PerformanceData[],
  monthsAgo: number
): PerformanceData | undefined {
  if (!data || data.length === 0) return undefined;
  // Ensure data is sorted by date in descending order (most recent first)
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.report_date || "").getTime();
    const dateB = new Date(b.report_date || "").getTime();
    return dateB - dateA;
  });

  const targetDate = new Date(sortedData[0].report_date!);
  targetDate.setMonth(targetDate.getMonth() - monthsAgo);

  return sortedData.find((record) => {
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

  return data.find((record) => {
    return (
      record.fin_year === previousFinYear &&
      record.month === currentRecord.month
    );
  });
}

// --- Component Props Interface ---
interface DistrictDataDisplayProps {
  allData: PerformanceData[];
}

export default function DistrictDataDisplay({
  allData,
}: DistrictDataDisplayProps) {
  const { latestData, lastMonthData, previousYearData, last12MonthsData } =
    useMemo(() => {
      const sortedAllData = [...allData].sort((a, b) => {
        const dateA = new Date(a.report_date || "").getTime();
        const dateB = new Date(b.report_date || "").getTime();
        return dateB - dateA; // Sort descending
      });

      const latest = sortedAllData[0];
      const lastMonth = getPastMonthData(sortedAllData, 1);
      const previousYear = getPreviousYearData(sortedAllData, latest);
      const last12Months = sortedAllData.slice(0, 12).reverse();

      return {
        latestData: latest,
        lastMonthData: lastMonth,
        previousYearData: previousYear,
        last12MonthsData: last12Months,
      };
    }, [allData]);

  const stateAverageWage = 250; // Placeholder

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

  // Fallback for missing data
  if (!latestData) {
    return (
      <section className="px-4 md:px-6 py-12 flex flex-col gap-4 w-full flex-1 items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl text-muted-foreground text-center">
          इस ज़िले के लिए डेटा उपलब्ध नहीं है।
        </h1>
      </section>
    );
  }

  return (
    // Use larger gaps for better section separation
    <section className="px-4 md:px-6 py-6 rounded-xl flex flex-col gap-8 w-full flex-1">
      {/* === Section 1: Summary === */}
      <article className="w-full flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">
            रिपोर्ट का सारांश
          </h1>
          <SpeechButton textToSpeak={reportSummary} />
        </div>
        {/* Larger, muted text for the summary paragraph for better hierarchy */}
        <p className="text-lg text-muted-foreground">{reportSummary}</p>
      </article>

      {/* === Main Dashboard Grid === */}
      <div className="grid grid-cols-1 gap-8">
        {/* --- Section 2: Key Metrics "Right Now" --- */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            अभी की स्थिति (इस महीने)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  काम पाने वाले परिवार
                </CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold tracking-tighter">
                  {formatNumber(latestData.Total_Households_Worked)}
                </div>
                <CardDescription className="text-xs">
                  कितने परिवारों को इस महीने काम मिला।
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  समय पर भुगतान
                </CardTitle>
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold tracking-tighter">
                  {latestData.percentage_payments_gererated_within_15_days?.toFixed(
                    0
                  ) || "0"}
                  <span className="text-3xl text-muted-foreground">%</span>
                </div>
                <CardDescription className="text-xs">
                  100 में से कितनों को 15 दिन के अंदर पैसा मिला।
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  100 दिन पूरे
                </CardTitle>
                <Award className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold tracking-tighter">
                  {formatNumber(
                    latestData.Total_No_of_HHs_completed_100_Days_of_Wage_Employment
                  )}
                </div>
                <CardDescription className="text-xs">
                  परिवार जिन्होंने इस साल 100 दिन का काम पूरा किया।
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  औसत दैनिक मज़दूरी
                </CardTitle>
                <Banknote className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold tracking-tighter">
                  <span className="text-3xl font-medium align-middle">₹</span>
                  {latestData.Average_Wage_rate_per_day_per_person?.toFixed(
                    2
                  ) || "0.00"}
                </div>
                <CardDescription className="text-xs">
                  हर व्यक्ति को एक दिन का औसतन कितना पैसा मिला।
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- Section 3: Historical Trend Charts --- */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            काम का उतार-चढ़ाव (पिछले 12 महीने)
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <TrendLineChart
              data={last12MonthsData}
              dataKey="Total_Households_Worked"
              label="परिवार"
              title="काम पाने वाले परिवार"
              description="यह लाइन दिखाती है कि हर महीने कितने परिवारों को काम मिला।"
              // FIXED: Revert to the explicit Tailwind color
              color="#3b82f6"
            />
            <TrendLineChart
              data={last12MonthsData}
              dataKey="percentage_payments_gererated_within_15_days"
              label="%"
              title="पैसे मिलने की रफ़्तार"
              description="यह लाइन दिखाती है कि हर महीने पैसा कितने लोगों को समय पर मिला।"
              // FIXED: Revert to the explicit Tailwind color
              color="#10b981"
            />
          </div>
        </div>

        {/* --- Section 4: Comparison Charts --- */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            इस साल बनाम पिछला साल
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ComparisonBarChart
              currentData={latestData}
              previousData={previousYearData}
              dataKey="Total_Households_Worked"
              label="परिवार"
              title="काम पाने वाले परिवार"
              description="यह दिखाता है कि इस साल, पिछले साल के मुकाबले ज़्यादा परिवारों को काम मिला या कम।"
              currentLabel="इस साल"
              previousLabel="पिछला साल"
              // FIXED: Revert to the explicit Tailwind colors
              currentBarColor="#34d399"
              previousBarColor="#fbbf24"
            />
            <ComparisonBarChart
              currentData={latestData}
              previousData={previousYearData}
              dataKey="Total_No_of_HHs_completed_100_Days_of_Wage_Employment"
              label="परिवार"
              title="100 दिन पूरे करने वाले परिवार"
              description="यह तुलना करता है कि इस साल और पिछले साल कितने परिवारों ने 100 दिन का काम पूरा किया।"
              currentLabel="इस साल"
              previousLabel="पिछला साल"
              // FIXED: Revert to the explicit Tailwind colors
              currentBarColor="#60a5fa"
              previousBarColor="#a78bfa"
            />
          </div>
        </div>

        {/* --- Section 5: Social & Works Data --- */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            विवरण (Details)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  महिलाएं (कुल काम के दिन)
                </CardTitle>
                <HeartHandshake className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold tracking-tighter">
                  {formatNumber(latestData.Women_Persondays)}
                </div>
                <CardDescription className="text-xs">
                  इस महीने महिलाओं द्वारा किए गए कुल काम के दिन।
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  SC/ST समुदाय (काम के दिन)
                </CardTitle>
                <UserCheck className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold tracking-tighter">
                  {formatNumber(
                    (latestData.SC_persondays || 0) +
                      (latestData.ST_persondays || 0)
                  )}
                </div>
                <CardDescription className="text-xs">
                  SC/ST समुदाय द्वारा किए गए कुल काम के दिन।
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  काम जो अभी चल रहे हैं
                </CardTitle>
                <Building className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold tracking-tighter">
                  {formatNumber(latestData.Number_of_Ongoing_Works)}
                </div>
                <CardDescription className="text-xs">
                  कितने प्रोजेक्ट पर काम अभी जारी है।
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  पूरे हो चुके काम
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold tracking-tighter">
                  {formatNumber(latestData.Number_of_Completed_Works)}
                </div>
                <CardDescription className="text-xs">
                  इस महीने कितने नए प्रोजेक्ट पूरे किए गए।
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
