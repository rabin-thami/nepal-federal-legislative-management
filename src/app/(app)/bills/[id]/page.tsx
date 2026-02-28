import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db/drizzle";
import {
  bills,
  billStatusHistory,
  billCommitteeAssignments,
  committees,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { BillDetail } from "@/components/bills/BillDetail";
import type { BillWithDetails } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const bill = await db.query.bills.findFirst({ where: eq(bills.id, id) });
  if (!bill) return { title: "Bill not found — Vidhan" };
  return {
    title: `${bill.registrationNo} — Vidhan`,
    description: bill.titleNp ?? bill.titleEn ?? undefined,
  };
}

export default async function BillDetailPage({ params }: Props) {
  const { id } = await params;

  const bill = await db.query.bills.findFirst({ where: eq(bills.id, id) });
  if (!bill) notFound();

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

  const billWithDetails: BillWithDetails = {
    ...(bill as BillWithDetails),
    statusHistory: statusHistory as BillWithDetails["statusHistory"],
    committeeAssignments:
      committeeAssigns as BillWithDetails["committeeAssignments"],
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/bills"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bills
      </Link>

      <BillDetail bill={billWithDetails} />
    </div>
  );
}
