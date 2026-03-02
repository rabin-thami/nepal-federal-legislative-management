import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  bills,
  billStatusHistory,
  billCommitteeAssignments,
  committees,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { sanitizeErrorMessage } from "@/lib/validation/api";
import { getClientIdentifier, rateLimit } from "@/lib/server/rate-limit";

/**
 * GET /api/bills/[id]
 *
 * Returns a single bill with its full status history and committee assignments.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    // Fetch the bill
    const bill = await db.query.bills.findFirst({
      where: eq(bills.id, id),
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Fetch status history and committee assignments in parallel
    const [statusHistory, committeeAssigns] = await Promise.all([
      db
        .select()
        .from(billStatusHistory)
        .where(eq(billStatusHistory.billId, id))
        .orderBy(desc(billStatusHistory.recordedAt)),
      db
        .select({
          id: billCommitteeAssignments.id,
          billId: billCommitteeAssignments.billId,
          committeeId: billCommitteeAssignments.committeeId,
          assignedDateBs: billCommitteeAssignments.assignedDateBs,
          assignedDateAd: billCommitteeAssignments.assignedDateAd,
          reportSubmittedDateBs: billCommitteeAssignments.reportSubmittedDateBs,
          reportSubmittedDateAd: billCommitteeAssignments.reportSubmittedDateAd,
          createdAt: billCommitteeAssignments.createdAt,
          committee: {
            id: committees.id,
            nameNp: committees.nameNp,
            nameEn: committees.nameEn,
            house: committees.house,
            createdAt: committees.createdAt,
          },
        })
        .from(billCommitteeAssignments)
        .leftJoin(
          committees,
          eq(billCommitteeAssignments.committeeId, committees.id),
        )
        .where(eq(billCommitteeAssignments.billId, id)),
    ]);

    return NextResponse.json(
      {
        data: {
          ...bill,
          statusHistory,
          committeeAssignments: committeeAssigns,
        },
      },
      { status: 200, headers: rateHeaders },
    );
  } catch (error) {
    console.error("GET /api/bills/[id] error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bill",
        message: sanitizeErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
