import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ districtName: string }> }
) {
  try {
    const { districtName } = await params;

    if (!districtName) {
      return NextResponse.json(
        { error: "District name is required" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_API_URL || "http://backend:8000";
    const apiUrl = `${backendUrl}/api/district`;

    const response = await axios.get(apiUrl, {
      params: {
        districtName: districtName,
      },
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    const data = response.data;

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("[API Route] Error:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;

        if (status === 404) {
          return NextResponse.json(
            { error: "District not found" },
            { status: 404 }
          );
        }

        return NextResponse.json(
          { error: "Failed to fetch data from backend" },
          { status }
        );
      } else if (error.request) {
        return NextResponse.json(
          { error: "Backend service unavailable" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
