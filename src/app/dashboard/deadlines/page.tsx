'use client';

import Link from 'next/link';
import { MOCK_DEADLINES, MOCK_BILLS } from '@/lib/mock-data';
import { formatRemainingTime, getDeadlineUrgency, getDeadlineRulesDescription } from '@/lib/rules-engine/deadlines';
import styles from './deadlines.module.css';

export default function DeadlinesPage() {
  const rules = getDeadlineRulesDescription();

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Deadlines</h1>
        <p className="page-subtitle">Constitutional timelines and deadline enforcement</p>
      </div>

      {/* ── Active Deadlines ── */}
      <h2 className={styles.sectionHeading}>⏰ Active Deadlines</h2>
      <div className={styles.deadlineGrid}>
        {MOCK_DEADLINES.map((dl) => {
          const urgency = getDeadlineUrgency(dl.expiresAt);
          const bill = MOCK_BILLS.find(b => b.id === dl.billId);
          const now = new Date().getTime();
          const start = new Date(dl.startsAt).getTime();
          const end = new Date(dl.expiresAt).getTime();
          const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));

          return (
            <div key={dl.id} className={`${styles.deadlineCard} ${styles[`urgency-${urgency}`]}`}>
              <div className={styles.deadlineHeader}>
                <span className={styles.deadlineType}>{dl.type.replace(/_/g, ' ')}</span>
                <span className={`badge ${urgency === 'critical' ? 'badge-lapsed' : urgency === 'warning' ? 'badge-voting' : 'badge-active'}`}>
                  {urgency === 'critical' ? '🔴 Critical' : urgency === 'warning' ? '🟡 Warning' : '🟢 Normal'}
                </span>
              </div>

              {bill && (
                <Link href={`/dashboard/bills/${bill.id}`} className={styles.deadlineBillLink}>
                  {bill.title}
                </Link>
              )}

              <div className={styles.deadlineCountdown}>
                {formatRemainingTime(dl.expiresAt)}
              </div>

              <div className="progress-bar" style={{ marginTop: 'var(--space-3)' }}>
                <div className="progress-fill" style={{
                  width: `${progress}%`,
                  background: urgency === 'critical'
                    ? 'linear-gradient(90deg, var(--color-danger), var(--color-danger-light))'
                    : urgency === 'warning'
                      ? 'linear-gradient(90deg, var(--color-warning), var(--color-warning-light))'
                      : undefined,
                }} />
              </div>

              <div className={styles.deadlineDates}>
                <span>Started: {new Date(dl.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span>Expires: {new Date(dl.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Constitutional Rules Reference ── */}
      <h2 className={styles.sectionHeading} style={{ marginTop: 'var(--space-8)' }}>📖 Constitutional Deadline Rules</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Rule</th>
              <th>Duration</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, i) => (
              <tr key={i}>
                <td className="font-semibold">{rule.rule}</td>
                <td><span className="badge badge-active">{rule.duration}</span></td>
                <td className="text-sm text-secondary">{rule.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
