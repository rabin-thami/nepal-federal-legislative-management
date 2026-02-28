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

export const billQuerySchema = z.object({
  house: z.enum(["pratinidhi_sabha", "rastriya_sabha"]).optional(),
  status: z.enum(BILL_STATUSES).optional(),
  category: z.enum(["governmental", "non_governmental"]).optional(),
  ministry: z.string().max(200).optional(),
  year: z
    .string()
    .regex(/^\d{4}$/, "Year must be a 4-digit number")
    .optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(["newest", "oldest", "status"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
});

export type BillQueryParams = z.infer<typeof billQuerySchema>;

export function validateBillQuery(params: URLSearchParams): BillQueryParams {
  const raw = Object.fromEntries(params.entries());
  return billQuerySchema.parse(raw);
}

/** Sanitize error messages to avoid leaking internal details to clients */
export function sanitizeErrorMessage(error: unknown): string {
  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    return error.message;
  }
  return "An internal server error occurred";
}
