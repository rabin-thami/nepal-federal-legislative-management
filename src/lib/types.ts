// Types matching the database schema

export type BillStatus =
  | "registered"
  | "first_reading"
  | "general_discussion"
  | "amendment_window"
  | "committee_review"
  | "clause_voting"
  | "first_house_passed"
  | "second_house"
  | "joint_sitting"
  | "speaker_certification"
  | "assented"
  | "gazette_published"
  | "amendment_or_repeal";

export type BillHouse = "pratinidhi_sabha" | "rastriya_sabha";

export type BillType = "original" | "amendment";

export type BillCategory = "governmental" | "non_governmental";

export type StatusSource = "parliament_scrape" | "gazette_scrape" | "manual_entry";

export interface Committee {
  id: number;
  nameNp: string | null;
  nameEn: string | null;
  house: BillHouse | null;
  createdAt: Date;
}

export interface BillCommitteeAssignment {
  id: number;
  billId: string;
  committeeId: number;
  assignedDateBs: string | null;
  assignedDateAd: Date | null;
  reportSubmittedDateBs: string | null;
  reportSubmittedDateAd: Date | null;
  createdAt: Date;
  committee: Committee;
}

export interface BillStatusHistory {
  id: string;
  billId: string;
  status: BillStatus;
  rawStatus: string | null;
  source: StatusSource;
  statusDateBs: string | null;
  statusDateAd: Date | null;
  notes: string | null;
  sourceUrl: string | null;
  recordedAt: Date;
}

export interface Bill {
  id: string;
  parliamentId: string | null;
  registrationNo: string;
  year: string;
  session: string | null;
  titleNp: string | null;
  titleEn: string | null;
  presenter: string | null;
  ministry: string | null;
  house: BillHouse | null;
  billType: BillType | null;
  category: BillCategory | null;
  currentStatus: BillStatus | null;
  currentPhase: number | null;
  registeredDateBs: string | null;
  authenticatedDateBs: string | null;
  registeredDateAd: Date | null;
  authenticatedDateAd: Date | null;
  registeredBillUrl: string | null;
  authenticatedBillUrl: string | null;
  parliamentUrl: string | null;
  lastScrapedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Bill with full relations (used for detail pages)
export interface BillWithDetails extends Bill {
  statusHistory: BillStatusHistory[];
  committeeAssignments: BillCommitteeAssignment[];
}

export interface BillsResponse {
  data: Bill[];
  meta: {
    count: number;
    filters: {
      house: string | null;
      status: string | null;
      ministry: string | null;
      limit: number;
    };
  };
}

// Helper function to format bill status for display
export function formatBillStatus(status: BillStatus | null): string {
  if (!status) return "—";

  const statusMap: Record<BillStatus, string> = {
    registered: "Registered",
    first_reading: "First Reading",
    general_discussion: "General Discussion",
    amendment_window: "Amendment Window",
    committee_review: "Committee Review",
    clause_voting: "Clause Voting",
    first_house_passed: "First House Passed",
    second_house: "Second House",
    joint_sitting: "Joint Sitting",
    speaker_certification: "Speaker Certification",
    assented: "Assented",
    gazette_published: "Gazette Published",
    amendment_or_repeal: "Amendment/Repeal",
  };

  return statusMap[status];
}

// Helper function to get status color
export function getStatusColor(status: BillStatus | null): string {
  if (!status) return "bg-slate-800 text-slate-300";

  const colorMap: Partial<Record<BillStatus, string>> = {
    registered: "bg-blue-900/50 text-blue-200 border-blue-700/50",
    first_reading: "bg-cyan-900/50 text-cyan-200 border-cyan-700/50",
    general_discussion: "bg-teal-900/50 text-teal-200 border-teal-700/50",
    amendment_window: "bg-amber-900/50 text-amber-200 border-amber-700/50",
    committee_review: "bg-purple-900/50 text-purple-200 border-purple-700/50",
    clause_voting: "bg-pink-900/50 text-pink-200 border-pink-700/50",
    first_house_passed: "bg-green-900/50 text-green-200 border-green-700/50",
    second_house: "bg-emerald-900/50 text-emerald-200 border-emerald-700/50",
    joint_sitting: "bg-indigo-900/50 text-indigo-200 border-indigo-700/50",
    speaker_certification: "bg-violet-900/50 text-violet-200 border-violet-700/50",
    assented: "bg-lime-900/50 text-lime-200 border-lime-700/50",
    gazette_published: "bg-green-700/50 text-green-100 border-green-600/50",
  };

  return colorMap[status] || "bg-slate-800 text-slate-300 border-slate-700/50";
}

// Helper function to format house
export function formatHouse(house: BillHouse | null): string {
  if (!house) return "—";

  const houseMap: Record<BillHouse, string> = {
    pratinidhi_sabha: "House of Representatives",
    rastriya_sabha: "National Assembly",
  };

  return houseMap[house];
}

export function formatHouseShort(house: BillHouse | null): string {
  if (!house) return "—";

  const houseMap: Record<BillHouse, string> = {
    pratinidhi_sabha: "HoR",
    rastriya_sabha: "NA",
  };

  return houseMap[house];
}

// Helper function to format bill type
export function formatBillType(type: BillType | null): string {
  if (!type) return "—";

  const typeMap: Record<BillType, string> = {
    original: "Original",
    amendment: "Amendment",
  };

  return typeMap[type];
}

// Helper function to format category
export function formatCategory(category: BillCategory | null): string {
  if (!category) return "—";

  const categoryMap: Record<BillCategory, string> = {
    governmental: "Governmental",
    non_governmental: "Non‑governmental",
  };

  return categoryMap[category];
}
