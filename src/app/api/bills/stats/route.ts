import { NextRequest, NextResponse } from "next/server";
import { fetchBillStats } from "@/services/billStatsService";
import { sanitizeErrorMessage } from "@/lib/validation/api";
import { getClientIdentifier, rateLimit } from "@/lib/server/rate-limit";

/**
 * GET /api/bills/stats
 *
 * Returns aggregate statistics for the landing page and dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const { limited, headers: rateHeaders } = rateLimit(
      getClientIdentifier(request),
    );
    if (limited) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: rateHeaders },
      );
    }

    const stats = await fetchBillStats();

    return NextResponse.json(
      {
        data: stats,
      },
      { status: 200, headers: rateHeaders },
    );
  } catch (error) {
    console.error("GET /api/bills/stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bill statistics",
        message: sanitizeErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
