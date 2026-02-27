import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { bills } from "@/db/schema";
import { eq, sql, and, ilike, type SQL } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/bills
 *
 * Query params:
 *   house    — "pratinidhi_sabha" | "rastriya_sabha"
 *   status   — any billStatusEnum value
 *   category — "governmental" | "non_governmental"
 *   ministry — partial match (ilike)
 *   year     — BS year e.g. "2082"
 *   search   — searches titleNp, titleEn, registrationNo
 *   sort     — "newest" (default) | "oldest" | "status"
 *   limit    — number (default 100, max 500)
 *   offset   — number (default 0) for pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const house = searchParams.get("house");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const ministry = searchParams.get("ministry");
    const year = searchParams.get("year");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 500);
    const offset = Number(searchParams.get("offset")) || 0;

    // Build WHERE conditions
    const conditions: SQL[] = [];

    if (house) {
      conditions.push(sql`${bills.house} = ${house}`);
    }
    if (status) {
      conditions.push(sql`${bills.currentStatus} = ${status}`);
    }
    if (category) {
      conditions.push(sql`${bills.category} = ${category}`);
    }
    if (ministry) {
      conditions.push(ilike(bills.ministry, `%${ministry}%`));
    }
    if (year) {
      conditions.push(eq(bills.year, year));
    }
    if (search) {
      conditions.push(
        sql`(
          ${ilike(bills.titleNp, `%${search}%`)} OR
          ${ilike(bills.titleEn, `%${search}%`)} OR
          ${ilike(bills.registrationNo, `%${search}%`)}
        )`,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sort
    const orderBy =
      sort === "oldest"
        ? [sql`${bills.registeredDateAd} ASC NULLS LAST`]
        : sort === "status"
          ? [sql`${bills.currentPhase} ASC NULLS LAST`]
          : [sql`${bills.registeredDateAd} DESC NULLS LAST`];

    // Fetch bills
    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(bills)
        .where(whereClause)
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(bills)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    return NextResponse.json(
      {
        data,
        meta: {
          total,
          count: data.length,
          limit,
          offset,
          hasMore: offset + data.length < total,
          filters: {
            house: house || null,
            status: status || null,
            category: category || null,
            ministry: ministry || null,
            year: year || null,
            search: search || null,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/bills error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bills",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
