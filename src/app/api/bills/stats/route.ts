import { NextResponse } from "next/server";
import { fetchBillStats } from "@/services/billStatsService";

export const runtime = "nodejs";

/**
 * GET /api/bills/stats
 *
 * Returns aggregate statistics for the landing page and dashboard.
 */
export async function GET() {
  try {
    const stats = await fetchBillStats();

    return NextResponse.json(
      {
        data: stats,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/bills/stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bill statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
