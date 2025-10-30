import { notFound } from "next/navigation";
import { Suspense } from "react";
import { districts } from "@/lib/districts";
import DistrictDataDisplay from "@/components/DistrictDataDisplay";
import axios from "axios";

export interface PerformanceData {
  id: number;
  fin_year: string | null;
  month: string | null;
  state_name: string | null;
  district_name: string | null;
  report_date: string | null;
  Total_Households_Worked: number | null;
  Average_days_of_employment_provided_per_Household: number | null;
  Total_No_of_HHs_completed_100_Days_of_Wage_Employment: number | null;
  percentage_payments_gererated_within_15_days: number | null;
  Average_Wage_rate_per_day_per_person: number | null;
  Women_Persondays: number | null;
  Number_of_Completed_Works: number | null;
  Total_Exp: number | null;
  SC_persondays: number | null;
  ST_persondays: number | null;
  Number_of_Ongoing_Works: number | null;
}

async function getDistrictData(
  districtName: string
): Promise<PerformanceData[]> {
  try {
    const url = `/api/district/${encodeURIComponent(districtName)}`;
    console.log(`Fetching data from Next.js API: ${url}`);

    const response = await axios.get(`http://localhost:3000${url}`);

    const data = response.data;

    if (!data) {
      return [];
    }

    return data.sort(
      (a: PerformanceData, b: PerformanceData) =>
        new Date(b.report_date!).getTime() - new Date(a.report_date!).getTime()
    );
  } catch (error: any) {
    console.error("Error fetching district data:", error.message);

    if (error.response && error.response.status === 404) {
      console.log(`Data not found for district: ${districtName}`);
    } else {
      console.error("Full error:", error);
    }

    return [];
  }
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      <p className="ml-4 text-xl text-gray-600">Loading data...</p>
    </div>
  );
}

async function DistrictDataContainer({
  districtName,
}: {
  districtName: string;
}) {
  const allData = await getDistrictData(districtName);

  if (!allData || allData.length === 0) {
    return (
      <>
        <h1 className="text-3xl font-bold mb-4">District: {districtName}</h1>
        <p className="text-xl text-gray-600">
          No performance data found for this district.
        </p>
      </>
    );
  }

  return <DistrictDataDisplay allData={allData} />;
}

export default async function DistrictPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const id_district = Number(slug);

  if (
    isNaN(id_district) ||
    id_district < 0 ||
    id_district >= districts.length
  ) {
    notFound();
  }

  const districtName = districts[id_district];

  return (
    <main className="bg-white min-h-screen w-full px-4 py-8 md:p-8">
      <Suspense fallback={<LoadingSpinner />}>
        <DistrictDataContainer districtName={districtName} />
      </Suspense>
    </main>
  );
}
