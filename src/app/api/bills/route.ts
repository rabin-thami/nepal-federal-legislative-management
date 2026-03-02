import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { bills } from "@/db/schema";
import { eq, sql, and, ilike, type SQL } from "drizzle-orm";
import { z } from "zod";
import { validateBillQuery, sanitizeErrorMessage } from "@/lib/validation/api";
import { getClientIdentifier, rateLimit } from "@/lib/server/rate-limit";

/**
 * GET /api/bills
 *
 * Query params:
 *   house    — "pratinidhi_sabha" | "rastriya_sabha"
 *   status   — any billStatusEnum value
 *   category — "governmental" | "non_governmental"
 *   ministry — partial match (ilike), max 200 chars
 *   year     — 4-digit BS year e.g. "2082"
 *   search   — searches titleNp, titleEn, registrationNo, max 200 chars
 *   sort     — "newest" (default) | "oldest" | "status"
 *   limit    — number (default 25, max 100)
 *   offset   — number (default 0, max 10000)
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

    const { searchParams } = request.nextUrl;

    let validated;
    try {
      validated = validateBillQuery(searchParams);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid query parameters", details: err.issues },
          { status: 400 },
        );
      }
      throw err;
    }

    const {
      house,
      status,
      category,
      ministry,
      year,
      search,
      sort,
      limit,
      offset,
    } = validated;

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
      { status: 200, headers: rateHeaders },
    );
  } catch (error) {
    console.error("GET /api/bills error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bills",
        message: sanitizeErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
