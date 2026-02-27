import fs from "fs/promises";
import path from "path";
import process from "process";

import { db } from "@/db/drizzle";
import { bills, billHouseEnum, billTypeEnum, billCategoryEnum } from "@/db/schema";

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
};

type BillHouse = (typeof billHouseEnum.enumValues)[number];
type BillType = (typeof billTypeEnum.enumValues)[number];
type BillCategory = (typeof billCategoryEnum.enumValues)[number];

function normalizeYear(year?: string | null, sambat?: string | null): string | null {
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
  if (governmentType.includes("गैर")) {
    return "non_governmental";
  }
  return "governmental";
}

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

    const rows = data
      .filter((b) => b.bill_id && b.registration_number)
      .map((b) => {
        const year = normalizeYear(b.year ?? null, b.sambat ?? null);

        return {
          parliamentId: b.bill_id,
          registrationNo: b.registration_number!,
          year: year ?? "",
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
        };
      });

    if (rows.length === 0) {
      console.log("No valid bills with bill_id and registration_number; nothing to import.");
      process.exit(0);
    }

    // Insert and ignore duplicates based on (registration_no, year)
    await db
      .insert(bills)
      .values(rows)
      .onConflictDoNothing({
        target: [bills.registrationNo, bills.year],
      });

    console.log(`Imported up to ${rows.length} bills (existing rows left unchanged).`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to import bills from JSON:", err);
    process.exit(1);
  }
}

void main();

