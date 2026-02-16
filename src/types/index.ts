// ─── TypeScript Types for Nepal Legislature System ───

export type UserRole = 
  | 'MINISTRY' | 'MP' | 'COMMITTEE_MEMBER' | 'SECRETARIAT' 
  | 'SPEAKER' | 'PRESIDENT' | 'ADMIN' | 'PUBLIC';

export type HouseType = 'HOR' | 'NA';

export type BillType = 
  | 'GOVERNMENT' | 'PRIVATE' | 'MONEY' 
  | 'CONSTITUTIONAL_AMENDMENT' | 'ORDINANCE_REPLACEMENT';

export type BillStatus =
  | 'DRAFT' | 'LAW_MINISTRY_REVIEW' | 'CABINET_APPROVED'
  | 'REGISTERED' | 'FIRST_READING' | 'GENERAL_DISCUSSION'
  | 'AMENDMENT_WINDOW_OPEN' | 'COMMITTEE_REVIEW' | 'CLAUSE_VOTING'
  | 'FIRST_HOUSE_PASSED' | 'SECOND_HOUSE_PROCESSING'
  | 'JOINT_SITTING' | 'SPEAKER_CERTIFICATION'
  | 'PRESIDENTIAL_REVIEW' | 'ASSENTED' | 'GAZETTE_PUBLISHED'
  | 'IMPLEMENTATION_MONITORING' | 'LAPSED' | 'WITHDRAWN' | 'FAST_TRACK';

export type VoteType = 'FOR' | 'AGAINST' | 'ABSTAIN';
export type AmendmentStatus = 'PROPOSED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

// ─── Display Mappings ───

export const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  DRAFT: 'Draft',
  LAW_MINISTRY_REVIEW: 'Law Ministry Review',
  CABINET_APPROVED: 'Cabinet Approved',
  REGISTERED: 'Registered',
  FIRST_READING: 'First Reading',
  GENERAL_DISCUSSION: 'General Discussion',
  AMENDMENT_WINDOW_OPEN: 'Amendment Window',
  COMMITTEE_REVIEW: 'Committee Review',
  CLAUSE_VOTING: 'Clause Voting',
  FIRST_HOUSE_PASSED: 'First House Passed',
  SECOND_HOUSE_PROCESSING: 'Second House',
  JOINT_SITTING: 'Joint Sitting',
  SPEAKER_CERTIFICATION: 'Speaker Certification',
  PRESIDENTIAL_REVIEW: 'Presidential Review',
  ASSENTED: 'Assented',
  GAZETTE_PUBLISHED: 'Gazette Published',
  IMPLEMENTATION_MONITORING: 'Implementation',
  LAPSED: 'Lapsed',
  WITHDRAWN: 'Withdrawn',
  FAST_TRACK: 'Fast Track',
};

export const BILL_STATUS_BADGE_CLASS: Record<BillStatus, string> = {
  DRAFT: 'badge-draft',
  LAW_MINISTRY_REVIEW: 'badge-review',
  CABINET_APPROVED: 'badge-review',
  REGISTERED: 'badge-active',
  FIRST_READING: 'badge-active',
  GENERAL_DISCUSSION: 'badge-active',
  AMENDMENT_WINDOW_OPEN: 'badge-voting',
  COMMITTEE_REVIEW: 'badge-review',
  CLAUSE_VOTING: 'badge-voting',
  FIRST_HOUSE_PASSED: 'badge-passed',
  SECOND_HOUSE_PROCESSING: 'badge-active',
  JOINT_SITTING: 'badge-voting',
  SPEAKER_CERTIFICATION: 'badge-review',
  PRESIDENTIAL_REVIEW: 'badge-review',
  ASSENTED: 'badge-assented',
  GAZETTE_PUBLISHED: 'badge-assented',
  IMPLEMENTATION_MONITORING: 'badge-passed',
  LAPSED: 'badge-lapsed',
  WITHDRAWN: 'badge-withdrawn',
  FAST_TRACK: 'badge-urgent',
};

export const BILL_TYPE_LABELS: Record<BillType, string> = {
  GOVERNMENT: 'Government Bill',
  PRIVATE: 'Private Member Bill',
  MONEY: 'Money Bill',
  CONSTITUTIONAL_AMENDMENT: 'Constitutional Amendment',
  ORDINANCE_REPLACEMENT: 'Ordinance Replacement',
};

export const HOUSE_LABELS: Record<HouseType, string> = {
  HOR: 'House of Representatives',
  NA: 'National Assembly',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  MINISTRY: 'Ministry',
  MP: 'Member of Parliament',
  COMMITTEE_MEMBER: 'Committee Member',
  SECRETARIAT: 'Secretariat',
  SPEAKER: 'Speaker',
  PRESIDENT: 'President',
  ADMIN: 'System Admin',
  PUBLIC: 'Public User',
};

// ─── Bill lifecycle ordered states for timeline ───

export const BILL_LIFECYCLE_ORDER: BillStatus[] = [
  'DRAFT',
  'LAW_MINISTRY_REVIEW',
  'CABINET_APPROVED',
  'REGISTERED',
  'FIRST_READING',
  'GENERAL_DISCUSSION',
  'AMENDMENT_WINDOW_OPEN',
  'COMMITTEE_REVIEW',
  'CLAUSE_VOTING',
  'FIRST_HOUSE_PASSED',
  'SECOND_HOUSE_PROCESSING',
  'JOINT_SITTING',
  'SPEAKER_CERTIFICATION',
  'PRESIDENTIAL_REVIEW',
  'ASSENTED',
  'GAZETTE_PUBLISHED',
  'IMPLEMENTATION_MONITORING',
];

// ─── Route permissions ───

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  MINISTRY: ['bills:create', 'bills:edit', 'bills:view', 'comments:create'],
  MP: ['bills:view', 'comments:create', 'amendments:propose', 'votes:cast'],
  COMMITTEE_MEMBER: ['bills:view', 'clauses:edit', 'reports:create', 'comments:create'],
  SECRETARIAT: ['bills:register', 'bills:view', 'sessions:manage', 'agenda:manage', 'gazette:publish'],
  SPEAKER: ['bills:certify', 'bills:view', 'joint-sitting:initiate'],
  PRESIDENT: ['bills:assent', 'bills:return', 'bills:view'],
  ADMIN: ['*'],
  PUBLIC: ['bills:view-public'],
};

// ─── Interfaces for API responses ───

export interface UserSummary {
  id: string;
  name: string;
  role: UserRole;
  house?: HouseType;
  party?: string;
}

export interface BillSummary {
  id: string;
  billNumber: string | null;
  title: string;
  billType: BillType;
  status: BillStatus;
  originHouse: HouseType;
  isFastTrack: boolean;
  isUrgent: boolean;
  author: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface BillDetail extends BillSummary {
  summary: string | null;
  titleNe: string | null;
  currentHouse: HouseType | null;
  sponsor: UserSummary | null;
  clauses: ClauseSummary[];
  transitions: TransitionSummary[];
  deadlines: DeadlineSummary[];
}

export interface ClauseSummary {
  id: string;
  number: number;
  title: string | null;
  content: string;
  isAmended: boolean;
  version: number;
}

export interface TransitionSummary {
  id: string;
  fromStatus: BillStatus;
  toStatus: BillStatus;
  triggeredBy: string | null;
  reason: string | null;
  createdAt: string;
}

export interface DeadlineSummary {
  id: string;
  type: string;
  startsAt: string;
  expiresAt: string;
  isExpired: boolean;
  isCompleted: boolean;
}

export interface VoteSessionSummary {
  id: string;
  billId: string;
  house: HouseType;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  result: string | null;
  totalFor: number;
  totalAgainst: number;
  totalAbstain: number;
  startedAt: string;
}

export interface CommitteeSummary {
  id: string;
  name: string;
  house: HouseType;
  memberCount: number;
  activeBills: number;
}

export interface DashboardStats {
  totalBills: number;
  activeBills: number;
  pendingVotes: number;
  activeCommittees: number;
  upcomingDeadlines: number;
  recentTransitions: TransitionSummary[];
}
