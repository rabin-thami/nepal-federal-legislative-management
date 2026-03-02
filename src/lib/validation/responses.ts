import { z } from "zod";

const BILL_STATUSES = [
  "registered",
  "first_reading",
  "general_discussion",
  "amendment_window",
  "committee_review",
  "clause_voting",
  "first_house_passed",
  "second_house",
  "joint_sitting",
  "speaker_certification",
  "assented",
  "gazette_published",
  "amendment_or_repeal",
] as const;

const BILL_HOUSES = ["pratinidhi_sabha", "rastriya_sabha"] as const;
const BILL_TYPES = ["original", "amendment"] as const;
const BILL_CATEGORIES = ["governmental", "non_governmental"] as const;
const urlField = z.string().url().or(z.string().startsWith("/")).nullable();

const dateField = z.preprocess((v) => {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}, z.date().nullable());

const requiredDateField = z.preprocess((v) => {
  if (v instanceof Date) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}, z.date());

export const billSchema = z.object({
  id: z.string(),
  parliamentId: z.string().nullable(),
  registrationNo: z.string(),
  year: z.string(),
  session: z.string().nullable(),
  titleNp: z.string().nullable(),
  titleEn: z.string().nullable(),
  presenter: z.string().nullable(),
  ministry: z.string().nullable(),
  house: z.enum(BILL_HOUSES).nullable(),
  billType: z.enum(BILL_TYPES).nullable(),
  category: z.enum(BILL_CATEGORIES).nullable(),
  currentStatus: z.enum(BILL_STATUSES).nullable(),
  currentPhase: z.number().nullable(),
  registeredDateBs: z.string().nullable(),
  authenticatedDateBs: z.string().nullable(),
  registeredDateAd: dateField,
  authenticatedDateAd: dateField,
  registeredBillUrl: urlField,
  authenticatedBillUrl: urlField,
  parliamentUrl: urlField,
  lastScrapedAt: dateField,
  createdAt: requiredDateField,
  updatedAt: requiredDateField,
});

export const billStatusHistorySchema = z.object({
  id: z.string(),
  billId: z.string(),
  status: z.enum(BILL_STATUSES),
  rawStatus: z.string().nullable(),
  source: z.enum(["parliament_scrape", "gazette_scrape", "manual_entry"]),
  statusDateBs: z.string().nullable(),
  statusDateAd: dateField,
  notes: z.string().nullable(),
  sourceUrl: urlField,
  recordedAt: requiredDateField,
});

export const committeeSchema = z.object({
  id: z.number(),
  nameNp: z.string().nullable(),
  nameEn: z.string().nullable(),
  house: z.enum(BILL_HOUSES).nullable(),
  createdAt: requiredDateField,
});

export const billCommitteeAssignmentSchema = z.object({
  id: z.number(),
  billId: z.string(),
  committeeId: z.number(),
  assignedDateBs: z.string().nullable(),
  assignedDateAd: dateField,
  reportSubmittedDateBs: z.string().nullable(),
  reportSubmittedDateAd: dateField,
  createdAt: requiredDateField,
  committee: committeeSchema.optional().nullable(),
});

export const billWithDetailsSchema = billSchema.extend({
  statusHistory: z.array(billStatusHistorySchema),
  committeeAssignments: z.array(billCommitteeAssignmentSchema),
});

export const billsResponseSchema = z.object({
  data: z.array(billSchema),
  meta: z.object({
    total: z.number(),
    count: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
    filters: z.object({
      house: z.string().nullable(),
      status: z.string().nullable(),
      category: z.string().nullable(),
      ministry: z.string().nullable(),
      year: z.string().nullable(),
      search: z.string().nullable(),
    }),
  }),
});

export const billWithDetailsResponseSchema = z.object({
  data: billWithDetailsSchema,
});

export type BillResponse = z.infer<typeof billSchema>;
export type BillsResponse = z.infer<typeof billsResponseSchema>;
export type BillWithDetailsResponse = z.infer<typeof billWithDetailsSchema>;
