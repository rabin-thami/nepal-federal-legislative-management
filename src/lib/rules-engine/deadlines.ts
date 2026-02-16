import { addDays } from 'date-fns';
import { DEADLINE_DURATIONS } from '../state-machine/bill-machine';

export interface DeadlineInfo {
  type: string;
  startsAt: Date;
  expiresAt: Date;
  durationDays: number;
  autoAction?: string;
}

export interface DeadlineCheck {
  isExpired: boolean;
  remainingMs: number;
  remainingDays: number;
  remainingHours: number;
  remainingMinutes: number;
  percentElapsed: number;
}

/**
 * Create a new deadline based on type.
 */
export function createDeadline(
  type: string,
  startDate: Date = new Date(),
  autoAction?: string
): DeadlineInfo {
  const durationDays = DEADLINE_DURATIONS[type] || 7;
  const expiresAt = addDays(startDate, durationDays);

  return {
    type,
    startsAt: startDate,
    expiresAt,
    durationDays,
    autoAction,
  };
}

/**
 * Check the status of a deadline.
 */
export function checkDeadline(expiresAt: Date | string): DeadlineCheck {
  const expiry = new Date(expiresAt);
  const now = new Date();
  const remainingMs = expiry.getTime() - now.getTime();

  const isExpired = remainingMs <= 0;
  const remainingDays = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60 * 24)));
  const remainingHours = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const remainingMinutes = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)));

  // Calculate percent elapsed (for progress bars)
  // We assume a start date that's `durationDays` before expiry
  // This is a simplified calculation
  const percentElapsed = isExpired ? 100 : Math.max(0, Math.min(100, ((Date.now() - (expiry.getTime() - 30 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000)) * 100));

  return {
    isExpired,
    remainingMs: Math.max(0, remainingMs),
    remainingDays,
    remainingHours,
    remainingMinutes,
    percentElapsed,
  };
}

/**
 * Format remaining time as a human-readable string.
 */
export function formatRemainingTime(expiresAt: Date | string): string {
  const check = checkDeadline(expiresAt);

  if (check.isExpired) return 'Expired';
  if (check.remainingDays > 0) {
    return `${check.remainingDays}d ${check.remainingHours}h remaining`;
  }
  if (check.remainingHours > 0) {
    return `${check.remainingHours}h ${check.remainingMinutes}m remaining`;
  }
  return `${check.remainingMinutes}m remaining`;
}

/**
 * Get urgency level based on remaining time.
 */
export function getDeadlineUrgency(expiresAt: Date | string): 'expired' | 'critical' | 'warning' | 'normal' {
  const check = checkDeadline(expiresAt);

  if (check.isExpired) return 'expired';
  if (check.remainingDays === 0 && check.remainingHours < 6) return 'critical';
  if (check.remainingDays <= 1) return 'warning';
  return 'normal';
}

/**
 * Get deadline rules for a specific bill type and status.
 */
export function getDeadlineRulesDescription(): { rule: string; duration: string; description: string }[] {
  return [
    { rule: 'Government Bill Notice', duration: '2 days', description: 'Notice period before first reading of a government bill' },
    { rule: 'Private Bill Notice', duration: '4 days', description: 'Notice period before first reading of a private member bill' },
    { rule: 'Amendment Window', duration: '72 hours', description: 'Duration for members to propose amendments' },
    { rule: 'NA Money Bill Return', duration: '15 days', description: 'National Assembly must return money bills within 15 days' },
    { rule: 'NA Other Bill Return', duration: '2 months', description: 'National Assembly must return non-money bills within 2 months' },
    { rule: 'Presidential Assent', duration: '15 days', description: 'President must act on a bill within 15 days' },
    { rule: 'Presidential Return Window', duration: '50 days', description: 'Window for returning a non-money bill to the house' },
  ];
}
