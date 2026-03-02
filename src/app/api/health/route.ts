import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { sanitizeErrorMessage } from "@/lib/validation/api";
import { getClientIdentifier, rateLimit } from "@/lib/server/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const { limited, headers: rateHeaders } = rateLimit(
      getClientIdentifier(request),
      // Health checks are often hit by monitors; keep a relaxed limit.
      { windowMs: 60_000, max: 120 },
    );
    if (limited) {
      return NextResponse.json(
        { status: "rate_limited" },
        { status: 429, headers: rateHeaders },
      );
    }

    // Check database connection
    await db.execute(`SELECT 1`);

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "nepal-federal-legislative-management-api",
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime ? process.uptime() : null,
      checks: {
        database: {
          status: "connected",
        },
      },
    };

    return NextResponse.json(health, { status: 200, headers: rateHeaders });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: "disconnected",
            error: sanitizeErrorMessage(error),
          },
        },
      },
      { status: 503 },
    );
  }
}
