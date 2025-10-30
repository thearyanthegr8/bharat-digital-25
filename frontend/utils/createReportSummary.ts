// utils/createReportSummary.ts

import { PerformanceData } from "@/app/district/[slug]/page";

// Import the PerformanceData interface

// A small helper to format numbers and handle null/undefined
function formatNum(
  value: number | null | undefined,
  decimals: number = 0
): number {
  return parseFloat((value ?? 0).toFixed(decimals));
}

/**
 * Creates a dynamic, conversational Hindi summary for the text-to-speech engine.
 *
 * @param currentData - The data for the currently selected month.
 * @param pastMonthData - Data for the previous month (for comparison).
 * @param previousYearData - Data for the same month last year (for comparison).
 * @param stateAverageWage - The average wage for the entire state (for comparison).
 * @returns A string in simple Hindi.
 */
export function createReportSummary(
  currentData: PerformanceData,
  pastMonthData: PerformanceData | undefined,
  previousYearData: PerformanceData | undefined,
  stateAverageWage: number // You'll need to pass this in
): string {
  if (!currentData) {
    return "डेटा लोड करने में कोई समस्या हुई। कृपया बाद में प्रयास करें।";
  }

  // --- 1. Extract and format key data ---
  const district = currentData.district_name ?? "आपके ज़िले";
  // const month = currentData.month ?? "इस महीने";

  const households = formatNum(currentData.Total_Households_Worked);
  const avgDays = formatNum(
    currentData.Average_days_of_employment_provided_per_Household,
    0
  );
  const avgWage = formatNum(
    currentData.Average_Wage_rate_per_day_per_person,
    2
  );
  const completedWorks = formatNum(currentData.Number_of_Completed_Works);

  // Assuming Total_Exp is in Lakhs as per your UI example (₹15, ₹23)
  const totalExp = formatNum(currentData.Total_Exp, 0);

  const hundredDaysHH = formatNum(
    currentData.Total_No_of_HHs_completed_100_Days_of_Wage_Employment
  );
  const womenPersondays = formatNum(currentData.Women_Persondays);

  // --- 2. Build the summary sentence by sentence ---
  const summary: string[] = [];

  summary.push(`नमस्ते! यह ${district} ज़िले की मनरेगा रिपोर्ट है।`);

  // --- Households Comparison ---
  summary.push(
    `इस महीने, ${households.toLocaleString("hi-IN")} परिवारों को काम मिला।`
  );
  if (pastMonthData) {
    const prevHouseholds = formatNum(pastMonthData.Total_Households_Worked);
    if (households > prevHouseholds) {
      summary.push(
        `यह पिछले महीने के ${prevHouseholds.toLocaleString(
          "hi-IN"
        )} परिवारों से ज़्यादा है।`
      );
    } else if (households < prevHouseholds) {
      summary.push(
        `यह पिछले महीने के ${prevHouseholds.toLocaleString(
          "hi-IN"
        )} परिवारों से कम है।`
      );
    } else {
      summary.push(`यह पिछले महीने के बराबर है।`);
    }
  }

  // --- Average Days ---
  summary.push(`हर परिवार को औसतन ${avgDays} दिन का काम मिला।`);

  // --- Average Wage Comparison ---
  const stateWage = formatNum(stateAverageWage, 2);
  summary.push(`औसत दैनिक मज़दूरी ${avgWage} रुपए थी।`);
  if (stateWage > 0) {
    if (avgWage > stateWage) {
      summary.push(`यह राज्य के औसत ${stateWage} रुपए से ज़्यादा है।`);
    } else if (avgWage < stateWage) {
      summary.push(`यह राज्य के औसत ${stateWage} रुपए से कम है।`);
    }
  }

  // --- Completed Works ---
  summary.push(`इस दौरान ${completedWorks} काम पूरे किए गए।`);

  // --- Expenditure Comparison (Assuming data is in Lakhs) ---
  summary.push(`इस महीने कुल ${totalExp} लाख रुपए खर्च हुए।`);
  if (previousYearData) {
    const prevYearExp = formatNum(previousYearData.Total_Exp, 0);
    if (prevYearExp > 0) {
      summary.push(
        `पिछले साल इसी महीने में ${prevYearExp} लाख रुपए खर्च हुए थे।`
      );
    }
  }

  // --- Key Social Metrics ---
  if (hundredDaysHH > 0) {
    summary.push(
      `${hundredDaysHH} परिवारों ने 100 दिन का काम पूरा कर लिया है।`
    );
  } else {
    summary.push(`अभी तक किसी भी परिवार ने 100 दिन का काम पूरा नहीं किया है।`);
  }

  if (womenPersondays > 0) {
    summary.push(
      `महिलाओं को ${womenPersondays.toLocaleString("hi-IN")} दिन का काम मिला।`
    );
  }

  // --- 3. Join all sentences into a single string ---
  return summary.join(" ");
}
