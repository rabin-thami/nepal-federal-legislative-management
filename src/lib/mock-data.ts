import { BillStatus, BillType, HouseType } from '@/types';

// ─── Mock Data for the Application ───
// This eliminates the need for a running database during development

export interface MockBill {
  id: string;
  billNumber: string | null;
  title: string;
  titleNe: string;
  summary: string;
  billType: BillType;
  status: BillStatus;
  originHouse: HouseType;
  currentHouse: HouseType;
  isFastTrack: boolean;
  isUrgent: boolean;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  updatedAt: string;
  clauseCount: number;
  amendmentCount: number;
  commentCount: number;
}

export interface MockTransition {
  id: string;
  billId: string;
  fromStatus: BillStatus;
  toStatus: BillStatus;
  triggeredBy: string;
  reason: string | null;
  createdAt: string;
}

export interface MockDeadline {
  id: string;
  billId: string;
  type: string;
  startsAt: string;
  expiresAt: string;
  isExpired: boolean;
  isCompleted: boolean;
}

export interface MockCommittee {
  id: string;
  name: string;
  nameNe: string;
  house: HouseType;
  description: string;
  quorum: number;
  memberCount: number;
  activeBills: number;
  isActive: boolean;
}

export interface MockVoteSession {
  id: string;
  billId: string;
  billTitle: string;
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

export const MOCK_BILLS: MockBill[] = [
  {
    id: 'bill-001',
    billNumber: 'HOR-2082-001',
    title: 'Digital Nepal Framework Act, 2082',
    titleNe: 'डिजिटल नेपाल फ्रेमवर्क ऐन, २०८२',
    summary: 'An act to establish a comprehensive legal framework for digital governance, data protection, and cybersecurity in Nepal. This bill aims to modernize government services through digital infrastructure and ensure citizen data privacy.',
    billType: 'GOVERNMENT',
    status: 'COMMITTEE_REVIEW',
    originHouse: 'HOR',
    currentHouse: 'HOR',
    isFastTrack: false,
    isUrgent: false,
    authorId: 'user-ministry-1',
    authorName: 'Ram Prasad Sharma',
    authorRole: 'Ministry of Communication & IT',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-02-10T14:30:00Z',
    clauseCount: 45,
    amendmentCount: 8,
    commentCount: 23,
  },
  {
    id: 'bill-002',
    billNumber: 'HOR-2082-002',
    title: 'Climate Change Adaptation & Mitigation Act, 2082',
    titleNe: 'जलवायु परिवर्तन अनुकूलन र न्यूनीकरण ऐन, २०८२',
    summary: 'A comprehensive act addressing climate change impacts in Nepal, establishing carbon emission standards, promoting renewable energy, and creating a national climate fund.',
    billType: 'GOVERNMENT',
    status: 'GENERAL_DISCUSSION',
    originHouse: 'HOR',
    currentHouse: 'HOR',
    isFastTrack: false,
    isUrgent: true,
    authorId: 'user-ministry-1',
    authorName: 'Ram Prasad Sharma',
    authorRole: 'Ministry of Forest & Environment',
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-02-14T16:00:00Z',
    clauseCount: 62,
    amendmentCount: 3,
    commentCount: 45,
  },
  {
    id: 'bill-003',
    billNumber: 'HOR-2082-003',
    title: 'Local Government Revenue Enhancement Bill, 2082',
    titleNe: 'स्थानीय सरकार राजस्व बृद्धि विधेयक, २०८२',
    summary: 'A money bill to enhance revenue-sharing mechanisms between federal, province, and local governments, adjusting fiscal transfer formulas.',
    billType: 'MONEY',
    status: 'FIRST_HOUSE_PASSED',
    originHouse: 'HOR',
    currentHouse: 'NA',
    isFastTrack: false,
    isUrgent: false,
    authorId: 'user-ministry-1',
    authorName: 'Ram Prasad Sharma',
    authorRole: 'Ministry of Finance',
    createdAt: '2025-11-15T08:00:00Z',
    updatedAt: '2026-02-08T11:20:00Z',
    clauseCount: 28,
    amendmentCount: 12,
    commentCount: 67,
  },
  {
    id: 'bill-004',
    billNumber: 'NA-2082-001',
    title: 'National Education Reform Act, 2082',
    titleNe: 'राष्ट्रिय शिक्षा सुधार ऐन, २०८२',
    summary: 'An act to reform the national education system, including curriculum modernization, teacher training standards, and digital literacy requirements.',
    billType: 'GOVERNMENT',
    status: 'AMENDMENT_WINDOW_OPEN',
    originHouse: 'NA',
    currentHouse: 'NA',
    isFastTrack: false,
    isUrgent: false,
    authorId: 'user-ministry-1',
    authorName: 'Ram Prasad Sharma',
    authorRole: 'Ministry of Education',
    createdAt: '2026-01-20T07:30:00Z',
    updatedAt: '2026-02-15T09:45:00Z',
    clauseCount: 55,
    amendmentCount: 5,
    commentCount: 34,
  },
  {
    id: 'bill-005',
    billNumber: null,
    title: 'Public Health Emergency Preparedness Bill, 2082',
    titleNe: 'सार्वजनिक स्वास्थ्य आपतकालीन तयारी विधेयक, २०८२',
    summary: 'A bill to establish protocols for public health emergencies, pandemic preparedness, and healthcare system resilience.',
    billType: 'PRIVATE',
    status: 'DRAFT',
    originHouse: 'HOR',
    currentHouse: 'HOR',
    isFastTrack: false,
    isUrgent: false,
    authorId: 'user-mp-1',
    authorName: 'Sita Devi Thapa',
    authorRole: 'MP - House of Representatives',
    createdAt: '2026-02-10T13:00:00Z',
    updatedAt: '2026-02-16T10:00:00Z',
    clauseCount: 18,
    amendmentCount: 0,
    commentCount: 2,
  },
  {
    id: 'bill-006',
    billNumber: 'HOR-2082-004',
    title: 'Anti-Corruption Commission Strengthening Act, 2082',
    titleNe: 'भ्रष्टाचार निवारण आयोग सुदृढीकरण ऐन, २०८२',
    summary: 'An act to strengthen the anti-corruption commission with enhanced investigation powers, asset declaration requirements for public officials, and whistleblower protection.',
    billType: 'GOVERNMENT',
    status: 'PRESIDENTIAL_REVIEW',
    originHouse: 'HOR',
    currentHouse: 'HOR',
    isFastTrack: false,
    isUrgent: false,
    authorId: 'user-ministry-1',
    authorName: 'Ram Prasad Sharma',
    authorRole: 'Office of the PM & Council of Ministers',
    createdAt: '2025-09-10T06:00:00Z',
    updatedAt: '2026-02-12T15:00:00Z',
    clauseCount: 38,
    amendmentCount: 14,
    commentCount: 89,
  },
  {
    id: 'bill-007',
    billNumber: 'HOR-2081-012',
    title: 'Renewable Energy Promotion Act, 2081',
    titleNe: 'नवीकरणीय ऊर्जा प्रवर्द्धन ऐन, २०८१',
    summary: 'An act to promote renewable energy development in Nepal through subsidies, tax incentives, and regulatory frameworks for solar, wind, and hydropower.',
    billType: 'GOVERNMENT',
    status: 'ASSENTED',
    originHouse: 'HOR',
    currentHouse: 'HOR',
    isFastTrack: false,
    isUrgent: false,
    authorId: 'user-ministry-1',
    authorName: 'Ram Prasad Sharma',
    authorRole: 'Ministry of Energy',
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: '2026-01-28T12:00:00Z',
    clauseCount: 42,
    amendmentCount: 9,
    commentCount: 56,
  },
  {
    id: 'bill-008',
    billNumber: 'HOR-2082-005',
    title: 'Federal Civil Service Reform Bill, 2082',
    titleNe: 'संघीय निजामती सेवा सुधार विधेयक, २०८२',
    summary: 'A comprehensive reform of the civil service system, introducing merit-based promotions, digital governance training, and performance evaluation frameworks.',
    billType: 'GOVERNMENT',
    status: 'CLAUSE_VOTING',
    originHouse: 'HOR',
    currentHouse: 'HOR',
    isFastTrack: false,
    isUrgent: false,
    authorId: 'user-ministry-1',
    authorName: 'Ram Prasad Sharma',
    authorRole: 'Ministry of Federal Affairs',
    createdAt: '2025-10-20T09:00:00Z',
    updatedAt: '2026-02-13T17:00:00Z',
    clauseCount: 35,
    amendmentCount: 7,
    commentCount: 41,
  },
];

export const MOCK_TRANSITIONS: MockTransition[] = [
  { id: 'tr-001', billId: 'bill-001', fromStatus: 'DRAFT', toStatus: 'LAW_MINISTRY_REVIEW', triggeredBy: 'Ram Prasad Sharma', reason: 'Submitted for review', createdAt: '2025-12-05T10:00:00Z' },
  { id: 'tr-002', billId: 'bill-001', fromStatus: 'LAW_MINISTRY_REVIEW', toStatus: 'CABINET_APPROVED', triggeredBy: 'Ram Prasad Sharma', reason: 'Approved by Law Ministry', createdAt: '2025-12-20T14:00:00Z' },
  { id: 'tr-003', billId: 'bill-001', fromStatus: 'CABINET_APPROVED', toStatus: 'REGISTERED', triggeredBy: 'Ganesh Prasad Timilsina', reason: 'Bill registered', createdAt: '2026-01-02T09:30:00Z' },
  { id: 'tr-004', billId: 'bill-001', fromStatus: 'REGISTERED', toStatus: 'FIRST_READING', triggeredBy: 'Ganesh Prasad Timilsina', reason: 'Scheduled for first reading', createdAt: '2026-01-06T10:00:00Z' },
  { id: 'tr-005', billId: 'bill-001', fromStatus: 'FIRST_READING', toStatus: 'GENERAL_DISCUSSION', triggeredBy: 'Dev Raj Ghimire', reason: 'Moved to general discussion', createdAt: '2026-01-10T11:00:00Z' },
  { id: 'tr-006', billId: 'bill-001', fromStatus: 'GENERAL_DISCUSSION', toStatus: 'COMMITTEE_REVIEW', triggeredBy: 'Dev Raj Ghimire', reason: 'Referred to IT & Innovation Committee', createdAt: '2026-01-25T14:00:00Z' },
  { id: 'tr-007', billId: 'bill-006', fromStatus: 'SPEAKER_CERTIFICATION', toStatus: 'PRESIDENTIAL_REVIEW', triggeredBy: 'Dev Raj Ghimire', reason: 'Certified and sent to President', createdAt: '2026-02-12T15:00:00Z' },
];

export const MOCK_DEADLINES: MockDeadline[] = [
  {
    id: 'dl-001',
    billId: 'bill-004',
    type: 'AMENDMENT_WINDOW',
    startsAt: '2026-02-15T09:45:00Z',
    expiresAt: '2026-02-18T09:45:00Z',
    isExpired: false,
    isCompleted: false,
  },
  {
    id: 'dl-002',
    billId: 'bill-003',
    type: 'NA_MONEY_BILL_RETURN',
    startsAt: '2026-02-08T11:20:00Z',
    expiresAt: '2026-02-23T11:20:00Z',
    isExpired: false,
    isCompleted: false,
  },
  {
    id: 'dl-003',
    billId: 'bill-006',
    type: 'PRESIDENTIAL_ASSENT',
    startsAt: '2026-02-12T15:00:00Z',
    expiresAt: '2026-02-27T15:00:00Z',
    isExpired: false,
    isCompleted: false,
  },
];

export const MOCK_COMMITTEES: MockCommittee[] = [
  {
    id: 'com-001',
    name: 'Legislation Management Committee',
    nameNe: 'कानून व्यवस्थापन समिति',
    house: 'NA',
    description: 'Reviews all bills sent to National Assembly for legislative compliance.',
    quorum: 5,
    memberCount: 11,
    activeBills: 2,
    isActive: true,
  },
  {
    id: 'com-002',
    name: 'Finance Committee',
    nameNe: 'अर्थ समिति',
    house: 'HOR',
    description: 'Reviews money bills, fiscal policies, and financial legislation.',
    quorum: 7,
    memberCount: 15,
    activeBills: 3,
    isActive: true,
  },
  {
    id: 'com-003',
    name: 'International Relations Committee',
    nameNe: 'अन्तर्राष्ट्रिय सम्बन्ध समिति',
    house: 'HOR',
    description: 'Reviews treaties, international agreements, and foreign policy legislation.',
    quorum: 5,
    memberCount: 11,
    activeBills: 1,
    isActive: true,
  },
  {
    id: 'com-004',
    name: 'Education & Health Committee',
    nameNe: 'शिक्षा तथा स्वास्थ्य समिति',
    house: 'HOR',
    description: 'Reviews education, health, and social welfare legislation.',
    quorum: 5,
    memberCount: 13,
    activeBills: 2,
    isActive: true,
  },
  {
    id: 'com-005',
    name: 'IT & Innovation Committee',
    nameNe: 'सूचना प्रविधि तथा नवप्रवर्तन समिति',
    house: 'HOR',
    description: 'Reviews technology, digital governance, and innovation legislation.',
    quorum: 4,
    memberCount: 9,
    activeBills: 1,
    isActive: true,
  },
];

export const MOCK_VOTE_SESSIONS: MockVoteSession[] = [
  {
    id: 'vs-001',
    billId: 'bill-008',
    billTitle: 'Federal Civil Service Reform Bill, 2082',
    house: 'HOR',
    title: 'Clause-by-Clause Vote: Civil Service Reform',
    isActive: true,
    isCompleted: false,
    result: null,
    totalFor: 142,
    totalAgainst: 67,
    totalAbstain: 12,
    startedAt: '2026-02-13T17:00:00Z',
  },
  {
    id: 'vs-002',
    billId: 'bill-003',
    billTitle: 'Local Government Revenue Enhancement Bill, 2082',
    house: 'HOR',
    title: 'Final Vote: Revenue Enhancement Bill',
    isActive: false,
    isCompleted: true,
    result: 'PASSED',
    totalFor: 178,
    totalAgainst: 45,
    totalAbstain: 8,
    startedAt: '2026-02-07T14:00:00Z',
  },
];

// ─── Dashboard Stats ───

export function getDashboardStats() {
  const activeBills = MOCK_BILLS.filter(b => !['LAPSED', 'WITHDRAWN', 'ASSENTED', 'GAZETTE_PUBLISHED', 'IMPLEMENTATION_MONITORING'].includes(b.status));
  const pendingVotes = MOCK_VOTE_SESSIONS.filter(v => v.isActive);
  const upcomingDeadlines = MOCK_DEADLINES.filter(d => !d.isExpired && !d.isCompleted);

  return {
    totalBills: MOCK_BILLS.length,
    activeBills: activeBills.length,
    passedBills: MOCK_BILLS.filter(b => ['ASSENTED', 'GAZETTE_PUBLISHED', 'IMPLEMENTATION_MONITORING'].includes(b.status)).length,
    pendingVotes: pendingVotes.length,
    activeCommittees: MOCK_COMMITTEES.filter(c => c.isActive).length,
    upcomingDeadlines: upcomingDeadlines.length,
    totalMembers: 334, // HoR(275) + NA(59)
    recentTransitions: MOCK_TRANSITIONS.slice(-5).reverse(),
  };
}
