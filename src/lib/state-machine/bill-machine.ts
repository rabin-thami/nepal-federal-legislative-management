import { BillStatus, BillType, UserRole } from '@/types';

// ─── Bill State Machine ───
// Defines valid transitions, guard conditions, and side effects

export interface TransitionGuard {
  requiredRoles: UserRole[];
  requiresQuorum?: boolean;
  requiresDeadlineExpiry?: boolean;
  billTypes?: BillType[];
  customCheck?: string; // name of custom validation function
}

export interface StateTransition {
  to: BillStatus;
  label: string;
  guards: TransitionGuard;
  sideEffects?: string[]; // e.g. 'CREATE_DEADLINE', 'NOTIFY_COMMITTEE'
}

export interface StateDefinition {
  label: string;
  description: string;
  transitions: StateTransition[];
  deadlines?: {
    type: string;
    durationDays: number;
    billTypes?: BillType[];
    autoTransitionTo?: BillStatus;
  }[];
}

// ─── Full Bill State Machine Definition ───

export const BILL_STATE_MACHINE: Record<BillStatus, StateDefinition> = {
  DRAFT: {
    label: 'Draft',
    description: 'Bill is being drafted by the sponsoring ministry or member.',
    transitions: [
      {
        to: 'LAW_MINISTRY_REVIEW',
        label: 'Submit for Law Ministry Review',
        guards: { requiredRoles: ['MINISTRY'] },
        sideEffects: ['LOG_TRANSITION', 'NOTIFY_LAW_MINISTRY'],
      },
      {
        to: 'WITHDRAWN',
        label: 'Withdraw Draft',
        guards: { requiredRoles: ['MINISTRY', 'MP'] },
        sideEffects: ['LOG_TRANSITION'],
      },
    ],
  },

  LAW_MINISTRY_REVIEW: {
    label: 'Law Ministry Review',
    description: 'Bill is under review by the Law Ministry for legal compliance.',
    transitions: [
      {
        to: 'CABINET_APPROVED',
        label: 'Approve for Cabinet',
        guards: { requiredRoles: ['MINISTRY'], billTypes: ['GOVERNMENT', 'MONEY'] },
        sideEffects: ['LOG_TRANSITION'],
      },
      {
        to: 'REGISTERED',
        label: 'Register Directly (Private)',
        guards: { requiredRoles: ['SECRETARIAT'], billTypes: ['PRIVATE'] },
        sideEffects: ['LOG_TRANSITION', 'CREATE_NOTICE_DEADLINE'],
      },
      {
        to: 'DRAFT',
        label: 'Return to Draft',
        guards: { requiredRoles: ['MINISTRY'] },
        sideEffects: ['LOG_TRANSITION'],
      },
    ],
  },

  CABINET_APPROVED: {
    label: 'Cabinet Approved',
    description: 'Bill has been approved by the cabinet and is ready for registration.',
    transitions: [
      {
        to: 'REGISTERED',
        label: 'Register Bill',
        guards: { requiredRoles: ['SECRETARIAT'] },
        sideEffects: ['LOG_TRANSITION', 'ASSIGN_BILL_NUMBER', 'CREATE_NOTICE_DEADLINE'],
      },
    ],
  },

  REGISTERED: {
    label: 'Registered',
    description: 'Bill has been officially registered by the Secretariat.',
    transitions: [
      {
        to: 'FIRST_READING',
        label: 'Schedule First Reading',
        guards: { requiredRoles: ['SECRETARIAT'], requiresDeadlineExpiry: true },
        sideEffects: ['LOG_TRANSITION', 'NOTIFY_ALL_MEMBERS'],
      },
      {
        to: 'FAST_TRACK',
        label: 'Mark as Fast Track',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION'],
      },
    ],
    deadlines: [
      { type: 'GOVERNMENT_BILL_NOTICE', durationDays: 2, billTypes: ['GOVERNMENT', 'MONEY'] },
      { type: 'PRIVATE_BILL_NOTICE', durationDays: 4, billTypes: ['PRIVATE'] },
    ],
  },

  FIRST_READING: {
    label: 'First Reading',
    description: 'Bill is introduced and read for the first time in the house.',
    transitions: [
      {
        to: 'GENERAL_DISCUSSION',
        label: 'Move to General Discussion',
        guards: { requiredRoles: ['SPEAKER', 'SECRETARIAT'] },
        sideEffects: ['LOG_TRANSITION'],
      },
      {
        to: 'COMMITTEE_REVIEW',
        label: 'Refer to Committee',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION', 'NOTIFY_COMMITTEE'],
      },
    ],
  },

  GENERAL_DISCUSSION: {
    label: 'General Discussion',
    description: 'Bill is under general discussion in the house.',
    transitions: [
      {
        to: 'AMENDMENT_WINDOW_OPEN',
        label: 'Open Amendment Window',
        guards: { requiredRoles: ['SPEAKER', 'SECRETARIAT'] },
        sideEffects: ['LOG_TRANSITION', 'CREATE_AMENDMENT_DEADLINE'],
      },
      {
        to: 'COMMITTEE_REVIEW',
        label: 'Refer to Committee',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION', 'NOTIFY_COMMITTEE'],
      },
    ],
  },

  AMENDMENT_WINDOW_OPEN: {
    label: 'Amendment Window',
    description: 'Members can propose amendments to the bill within the specified timeframe.',
    transitions: [
      {
        to: 'COMMITTEE_REVIEW',
        label: 'Send to Committee Review',
        guards: { requiredRoles: ['SPEAKER', 'SECRETARIAT'] },
        sideEffects: ['LOG_TRANSITION', 'NOTIFY_COMMITTEE'],
      },
      {
        to: 'CLAUSE_VOTING',
        label: 'Move to Clause Voting',
        guards: { requiredRoles: ['SPEAKER'], requiresDeadlineExpiry: true },
        sideEffects: ['LOG_TRANSITION'],
      },
    ],
    deadlines: [
      { type: 'AMENDMENT_WINDOW', durationDays: 3 },
    ],
  },

  COMMITTEE_REVIEW: {
    label: 'Committee Review',
    description: 'Bill is being reviewed by the assigned parliamentary committee.',
    transitions: [
      {
        to: 'CLAUSE_VOTING',
        label: 'Committee Report Accepted - Move to Voting',
        guards: { requiredRoles: ['SPEAKER', 'SECRETARIAT'], requiresQuorum: true },
        sideEffects: ['LOG_TRANSITION', 'NOTIFY_ALL_MEMBERS'],
      },
      {
        to: 'GENERAL_DISCUSSION',
        label: 'Return to General Discussion',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION'],
      },
    ],
  },

  CLAUSE_VOTING: {
    label: 'Clause Voting',
    description: 'Clause-by-clause voting in the house.',
    transitions: [
      {
        to: 'FIRST_HOUSE_PASSED',
        label: 'Bill Passed in First House',
        guards: { requiredRoles: ['SPEAKER'], requiresQuorum: true },
        sideEffects: ['LOG_TRANSITION', 'NOTIFY_SECOND_HOUSE'],
      },
      {
        to: 'LAPSED',
        label: 'Bill Rejected',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION'],
      },
    ],
  },

  FIRST_HOUSE_PASSED: {
    label: 'First House Passed',
    description: 'Bill has passed in the first house and is being sent to the second house.',
    transitions: [
      {
        to: 'SECOND_HOUSE_PROCESSING',
        label: 'Send to Second House',
        guards: { requiredRoles: ['SECRETARIAT'] },
        sideEffects: ['LOG_TRANSITION', 'CREATE_SECOND_HOUSE_DEADLINE'],
      },
    ],
  },

  SECOND_HOUSE_PROCESSING: {
    label: 'Second House Processing',
    description: 'Bill is being processed in the second house.',
    transitions: [
      {
        to: 'SPEAKER_CERTIFICATION',
        label: 'Second House Passed (No Amendments)',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION'],
      },
      {
        to: 'JOINT_SITTING',
        label: 'Disagreement - Initiate Joint Sitting',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION', 'NOTIFY_JOINT_SITTING'],
      },
      {
        to: 'LAPSED',
        label: 'Bill Rejected by Second House',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION'],
      },
    ],
    deadlines: [
      { type: 'NA_MONEY_BILL_RETURN', durationDays: 15, billTypes: ['MONEY'] },
      { type: 'NA_OTHER_BILL_RETURN', durationDays: 60 },
    ],
  },

  JOINT_SITTING: {
    label: 'Joint Sitting',
    description: 'Joint sitting of both houses to resolve disagreement. HoR:NA ratio 5:1.',
    transitions: [
      {
        to: 'SPEAKER_CERTIFICATION',
        label: 'Joint Sitting Resolved - Bill Passed',
        guards: { requiredRoles: ['SPEAKER'], requiresQuorum: true },
        sideEffects: ['LOG_TRANSITION'],
      },
      {
        to: 'LAPSED',
        label: 'Joint Sitting Rejected',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION'],
      },
    ],
  },

  SPEAKER_CERTIFICATION: {
    label: 'Speaker Certification',
    description: 'Speaker certifies the bill before sending to President.',
    transitions: [
      {
        to: 'PRESIDENTIAL_REVIEW',
        label: 'Certify and Send to President',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION', 'CREATE_PRESIDENTIAL_DEADLINE', 'NOTIFY_PRESIDENT'],
      },
    ],
  },

  PRESIDENTIAL_REVIEW: {
    label: 'Presidential Review',
    description: 'Bill is under review by the President for assent.',
    transitions: [
      {
        to: 'ASSENTED',
        label: 'Give Assent',
        guards: { requiredRoles: ['PRESIDENT'] },
        sideEffects: ['LOG_TRANSITION', 'NOTIFY_ALL'],
      },
      {
        to: 'GENERAL_DISCUSSION',
        label: 'Return Bill (Non-Money)',
        guards: {
          requiredRoles: ['PRESIDENT'],
          billTypes: ['GOVERNMENT', 'PRIVATE', 'CONSTITUTIONAL_AMENDMENT', 'ORDINANCE_REPLACEMENT'],
          customCheck: 'CHECK_NO_DOUBLE_RETURN',
        },
        sideEffects: ['LOG_TRANSITION', 'INCREMENT_RETURN_COUNT'],
      },
    ],
    deadlines: [
      { type: 'PRESIDENTIAL_ASSENT', durationDays: 15, autoTransitionTo: 'ASSENTED' },
    ],
  },

  ASSENTED: {
    label: 'Assented',
    description: 'Bill has received Presidential assent and is now law.',
    transitions: [
      {
        to: 'GAZETTE_PUBLISHED',
        label: 'Publish in Gazette',
        guards: { requiredRoles: ['SECRETARIAT'] },
        sideEffects: ['LOG_TRANSITION', 'CREATE_GAZETTE_ENTRY'],
      },
    ],
  },

  GAZETTE_PUBLISHED: {
    label: 'Gazette Published',
    description: 'Bill has been published in the Nepal Gazette.',
    transitions: [
      {
        to: 'IMPLEMENTATION_MONITORING',
        label: 'Begin Implementation Monitoring',
        guards: { requiredRoles: ['SECRETARIAT', 'ADMIN'] },
        sideEffects: ['LOG_TRANSITION'],
      },
    ],
  },

  IMPLEMENTATION_MONITORING: {
    label: 'Implementation Monitoring',
    description: 'Act is being monitored for implementation compliance.',
    transitions: [], // terminal state essentially
  },

  LAPSED: {
    label: 'Lapsed',
    description: 'Bill has lapsed due to rejection, session end, or deadline expiry.',
    transitions: [
      {
        to: 'DRAFT',
        label: 'Re-introduce as New Bill',
        guards: { requiredRoles: ['MINISTRY', 'MP'] },
        sideEffects: ['LOG_TRANSITION'],
      },
    ],
  },

  WITHDRAWN: {
    label: 'Withdrawn',
    description: 'Bill has been voluntarily withdrawn by the sponsor.',
    transitions: [
      {
        to: 'DRAFT',
        label: 'Re-submit as Draft',
        guards: { requiredRoles: ['MINISTRY', 'MP'] },
        sideEffects: ['LOG_TRANSITION'],
      },
    ],
  },

  FAST_TRACK: {
    label: 'Fast Track',
    description: 'Bill is on an expedited track with reduced timelines.',
    transitions: [
      {
        to: 'GENERAL_DISCUSSION',
        label: 'Move to General Discussion',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION'],
      },
      {
        to: 'COMMITTEE_REVIEW',
        label: 'Refer to Committee',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION', 'NOTIFY_COMMITTEE'],
      },
      {
        to: 'CLAUSE_VOTING',
        label: 'Move Directly to Voting',
        guards: { requiredRoles: ['SPEAKER'] },
        sideEffects: ['LOG_TRANSITION'],
      },
    ],
  },
};

// ─── Helper Functions ───

export function getAvailableTransitions(
  currentStatus: BillStatus,
  userRole: UserRole,
  billType: BillType
): StateTransition[] {
  const state = BILL_STATE_MACHINE[currentStatus];
  if (!state) return [];

  return state.transitions.filter((t) => {
    // Check role
    if (!t.guards.requiredRoles.includes(userRole)) return false;
    // Check bill type restriction
    if (t.guards.billTypes && !t.guards.billTypes.includes(billType)) return false;
    return true;
  });
}

export function canTransition(
  currentStatus: BillStatus,
  targetStatus: BillStatus,
  userRole: UserRole,
  billType: BillType
): boolean {
  const transitions = getAvailableTransitions(currentStatus, userRole, billType);
  return transitions.some((t) => t.to === targetStatus);
}

export function getStateDefinition(status: BillStatus): StateDefinition {
  return BILL_STATE_MACHINE[status];
}

// ─── Deadline Duration Map (in days) ───

export const DEADLINE_DURATIONS: Record<string, number> = {
  GOVERNMENT_BILL_NOTICE: 2,
  PRIVATE_BILL_NOTICE: 4,
  AMENDMENT_WINDOW: 3, // 72 hours
  NA_MONEY_BILL_RETURN: 15,
  NA_OTHER_BILL_RETURN: 60, // 2 months
  PRESIDENTIAL_ASSENT: 15,
  PRESIDENTIAL_RETURN_WINDOW: 50,
};
