import { db } from "@/db/drizzle";
import { bills } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function fetchBillStats() {
  const result = await db
    .select({
      total: sql<number>`count(*)::int`,
      gazettePublished: sql<number>`count(*) filter (where ${bills.currentStatus} = 'gazette_published')::int`,
      awaitingAuth: sql<number>`count(*) filter (where ${bills.currentStatus} in ('speaker_certification', 'assented'))::int`,
      inCommittee: sql<number>`count(*) filter (where ${bills.currentStatus} in ('committee_review', 'clause_voting'))::int`,
      pratinidhiSabha: sql<number>`count(*) filter (where ${bills.house} = 'pratinidhi_sabha')::int`,
      rastriyaSabha: sql<number>`count(*) filter (where ${bills.house} = 'rastriya_sabha')::int`,
      governmental: sql<number>`count(*) filter (where ${bills.category} = 'governmental')::int`,
      nonGovernmental: sql<number>`count(*) filter (where ${bills.category} = 'non_governmental')::int`,
    })
    .from(bills);

  const byStatus = await db
    .select({
      status: bills.currentStatus,
      count: sql<number>`count(*)::int`,
    })
    .from(bills)
    .groupBy(bills.currentStatus)
    .orderBy(sql`count(*) desc`);

  const byYear = await db
    .select({
      year: bills.year,
      count: sql<number>`count(*)::int`,
    })
    .from(bills)
    .groupBy(bills.year)
    .orderBy(sql`${bills.year} desc`);

  return {
    total: result[0]?.total ?? 0,
    gazettePublished: result[0]?.gazettePublished ?? 0,
    awaitingAuth: result[0]?.awaitingAuth ?? 0,
    inCommittee: result[0]?.inCommittee ?? 0,
    byHouse: {
      pratinidhiSabha: result[0]?.pratinidhiSabha ?? 0,
      rastriyaSabha: result[0]?.rastriyaSabha ?? 0,
    },
    byCategory: {
      governmental: result[0]?.governmental ?? 0,
      nonGovernmental: result[0]?.nonGovernmental ?? 0,
    },
    byStatus: byStatus.map((r) => ({
      status: r.status,
      count: r.count,
    })),
    byYear: byYear.map((r) => ({
      year: r.year,
      count: r.count,
    })),
  };
}
