import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";

export const runtime = "nodejs";

export async function GET() {
  try {
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

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      },
      { status: 503 },
    );
  }
}
