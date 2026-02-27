import fs from "fs/promises";
import path from "path";
import process from "process";

import { db } from "@/db/drizzle";
import {
  bills,
  billStatusHistory,
  billHouseEnum,
  billTypeEnum,
  billCategoryEnum,
  billStatusEnum,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/* ─── Types ─── */

type CleanedBill = {
  bill_id: string;
  type: "HoR" | "NA" | string;
  titleNp?: string;
  titleEn?: string;
  registration_number?: string;
  year?: string;
  sambat?: string;
  presenter?: string;
  ministry?: string;
  session?: string;
  government_type?: string;
  bill_type?: string;
  category?: string;
  resource_link?: string;
  current_status?: string;
  current_status_date?: string;
  status_timeline?: { label: string; date: string }[];
};

type BillHouse = (typeof billHouseEnum.enumValues)[number];
type BillType = (typeof billTypeEnum.enumValues)[number];
type BillCategory = (typeof billCategoryEnum.enumValues)[number];
type BillStatus = (typeof billStatusEnum.enumValues)[number];

/* ─── Mapping helpers ─── */

function normalizeYear(
  year?: string | null,
  sambat?: string | null,
): string | null {
  if (sambat) return String(sambat);
  if (!year) return null;
  const part = String(year).split("-")[0].split("/")[0];
  return part || null;
}

function mapHouse(t?: string | null): BillHouse | null {
  if (t === "HoR") return "pratinidhi_sabha";
  if (t === "NA") return "rastriya_sabha";
  return null;
}

function mapBillType(raw?: string | null): BillType | null {
  if (!raw) return null;
  if (raw.includes("मूल")) return "original";
  if (raw.includes("संशोधन")) return "amendment";
  return null;
}

function mapCategory(governmentType?: string | null): BillCategory | null {
  if (!governmentType) return null;
  if (governmentType.includes("गैर")) return "non_governmental";
  return "governmental";
}

/**
 * Map raw status label (scraped from parliament English site) → billStatusEnum value.
 *
 * Scraped labels we've seen:
 *   "Distribution to member"              → registered
 *   "Present in house of Representatives" → first_reading
 *   "General Discussion"                  → general_discussion
 *   "Discussion in house"                 → amendment_window
 *   "Discussion in Committee"             → committee_review
 *   "Report Submitted by Committee"       → clause_voting
 *   "Passed by House"                     → first_house_passed
 *   "Passed/Return By National Assembly"  → second_house
 *   "homePage.present_in_assembly"        → second_house
 *   "homePage.assembly_passed"            → second_house
 *   "Repassed"                            → joint_sitting
 */
const RAW_STATUS_MAP: Record<string, BillStatus> = {
  // Phase: Introduction
  "distribution to member": "registered",
  "present in house of representatives": "first_reading",
  "general discussion": "general_discussion",
  "discussion in house": "amendment_window",

  // Phase: Deep Scrutiny
  "discussion in committee": "committee_review",
  "report submitted by committee": "clause_voting",
  "passed by house": "first_house_passed",

  // Phase: Second House
  "passed/return by national assembly": "second_house",
  "homepage.present_in_assembly": "second_house",
  "homepage.assembly_passed": "second_house",

  // Phase: Joint / special
  repassed: "joint_sitting",
};

function mapRawStatus(raw?: string | null): BillStatus | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return RAW_STATUS_MAP[key] ?? null;
}

/**
 * Determine the phase number (2-6) from a billStatusEnum value.
 */
function statusToPhase(status: BillStatus): number {
  const phaseMap: Record<BillStatus, number> = {
    registered: 2,
    first_reading: 2,
    general_discussion: 2,
    amendment_window: 2,
    committee_review: 3,
    clause_voting: 3,
    first_house_passed: 3,
    second_house: 4,
    joint_sitting: 4,
    speaker_certification: 5,
    assented: 5,
    gazette_published: 5,
    amendment_or_repeal: 6,
  };
  return phaseMap[status] ?? 2;
}

/* ─── Main ─── */

async function main() {
  try {
    const root = process.cwd();
    const jsonPath = path.join(
      root,
      "services",
      "python",
      "data",
      "output",
      "bills_cleaned.json",
    );

    const raw = await fs.readFile(jsonPath, "utf-8");
    const data = JSON.parse(raw) as CleanedBill[];

    if (!Array.isArray(data) || data.length === 0) {
      console.log("No bills found in cleaned JSON; nothing to import.");
      process.exit(0);
    }

    const validBills = data.filter((b) => b.bill_id && b.registration_number);

    if (validBills.length === 0) {
      console.log(
        "No valid bills with bill_id and registration_number; nothing to import.",
      );
      process.exit(0);
    }

    let upserted = 0;
    let historyInserted = 0;

    for (const b of validBills) {
      const year = normalizeYear(b.year ?? null, b.sambat ?? null) ?? "";
      const currentStatus = mapRawStatus(b.current_status);
      const currentPhase = currentStatus ? statusToPhase(currentStatus) : null;

      const row = {
        parliamentId: b.bill_id,
        registrationNo: b.registration_number!,
        year,
        session: b.session ?? null,
        titleNp: b.titleNp ?? "",
        titleEn: b.titleEn ?? "",
        presenter: b.presenter ?? null,
        ministry: b.ministry ?? null,
        house: mapHouse(b.type ?? null),
        billType: mapBillType(b.bill_type ?? null),
        category: mapCategory(b.government_type ?? null),
        registeredDateBs: b.year ?? null,
        registeredBillUrl: b.resource_link ?? null,
        currentStatus,
        currentPhase,
        lastScrapedAt: new Date(),
        updatedAt: new Date(),
      };

      // Upsert: insert new OR update existing on conflict (registration_no, year)
      const result = await db
        .insert(bills)
        .values(row)
        .onConflictDoUpdate({
          target: [bills.registrationNo, bills.year],
          set: {
            parliamentId: sql`EXCLUDED.parliament_id`,
            titleNp: sql`EXCLUDED.title_np`,
            titleEn: sql`EXCLUDED.title_en`,
            session: sql`EXCLUDED.session`,
            presenter: sql`EXCLUDED.presenter`,
            ministry: sql`EXCLUDED.ministry`,
            house: sql`EXCLUDED.house`,
            billType: sql`EXCLUDED.bill_type`,
            category: sql`EXCLUDED.category`,
            registeredDateBs: sql`EXCLUDED.registered_date_bs`,
            registeredBillUrl: sql`EXCLUDED.registered_bill_url`,
            currentStatus: sql`EXCLUDED.current_status`,
            currentPhase: sql`EXCLUDED.current_phase`,
            lastScrapedAt: sql`EXCLUDED.last_scraped_at`,
            updatedAt: sql`EXCLUDED.updated_at`,
          },
        })
        .returning({ id: bills.id });

      upserted++;

      const billId = result[0]?.id;
      if (!billId) continue;

      // Import status timeline into bill_status_history
      const timeline = b.status_timeline ?? [];
      if (timeline.length > 0) {
        // Clear previous history for this bill (re-import fresh from scrape)
        await db
          .delete(billStatusHistory)
          .where(eq(billStatusHistory.billId, billId));

        for (const entry of timeline) {
          const status = mapRawStatus(entry.label);
          if (!status) continue;

          await db.insert(billStatusHistory).values({
            billId,
            status,
            rawStatus: entry.label,
            source: "parliament_scrape",
            statusDateBs: entry.date || null,
            notes: null,
            sourceUrl: null,
          });

          historyInserted++;
        }
      }
    }

    console.log(
      `✓ Upserted ${upserted} bills (new → inserted, existing → updated with latest data).`,
    );
    console.log(`✓ Imported ${historyInserted} status history entries.`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to import bills from JSON:", err);
    process.exit(1);
  }
}

void main();
