'use client';

import { use } from 'react';
import Link from 'next/link';
import { MOCK_BILLS, MOCK_TRANSITIONS, MOCK_DEADLINES } from '@/lib/mock-data';
import { useAuth } from '@/components/providers/AuthProvider';
import { BILL_STATUS_LABELS, BILL_STATUS_BADGE_CLASS, BILL_TYPE_LABELS, BILL_LIFECYCLE_ORDER, BillStatus } from '@/types';
import { getAvailableTransitions } from '@/lib/state-machine/bill-machine';
import { formatRemainingTime, getDeadlineUrgency } from '@/lib/rules-engine/deadlines';
import styles from './bill-detail.module.css';

export default function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const bill = MOCK_BILLS.find(b => b.id === id);

  if (!bill) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📜</div>
        <div className="empty-state-title">Bill not found</div>
        <Link href="/dashboard/bills" className="btn btn-secondary mt-4">← Back to Bills</Link>
      </div>
    );
  }

  const transitions = MOCK_TRANSITIONS.filter(t => t.billId === bill.id);
  const deadlines = MOCK_DEADLINES.filter(d => d.billId === bill.id);
  const availableActions = user ? getAvailableTransitions(bill.status, user.role, bill.billType) : [];

  // Calculate lifecycle progress
  const currentIndex = BILL_LIFECYCLE_ORDER.indexOf(bill.status);
  const progressPercent = currentIndex >= 0 ? ((currentIndex + 1) / BILL_LIFECYCLE_ORDER.length) * 100 : 0;

  // Sample clauses for display
  const sampleClauses = [
    { number: 1, title: 'Short Title and Commencement', content: 'This Act may be called the ' + bill.title + '. It shall come into force on the date appointed by the Government of Nepal by notification in the Nepal Gazette.' },
    { number: 2, title: 'Definitions', content: 'In this Act, unless the subject or context otherwise requires: (a) "Digital governance" means the use of digital technology to deliver government services; (b) "Data protection" means the safeguarding of personal data...' },
    { number: 3, title: 'Objectives', content: 'The objectives of this Act are to: (a) establish a legal framework for digital transformation; (b) protect citizen data; (c) promote innovation in public service delivery...' },
  ];

  return (
    <div className="animate-fade-in">
      {/* ── Breadcrumb ── */}
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/bills">Bills</Link>
        <span>›</span>
        <span>{bill.billNumber || 'Draft'}</span>
      </div>

      {/* ── Bill Header ── */}
      <div className={styles.billHeader}>
        <div className={styles.billHeaderLeft}>
          <div className={styles.badges}>
            <span className={`badge ${BILL_STATUS_BADGE_CLASS[bill.status]}`}>
              {BILL_STATUS_LABELS[bill.status]}
            </span>
            <span className="badge badge-active">{bill.originHouse === 'HOR' ? 'HoR' : 'NA'}</span>
            {bill.isUrgent && <span className="badge badge-urgent">Urgent</span>}
            {bill.isFastTrack && <span className="badge badge-voting">Fast Track</span>}
          </div>
          <h1 className={styles.billTitle}>{bill.title}</h1>
          <p className={styles.billTitleNe}>{bill.titleNe}</p>
          <div className={styles.billMeta}>
            <span>Bill No: {bill.billNumber || 'Pending'}</span>
            <span>•</span>
            <span>{BILL_TYPE_LABELS[bill.billType]}</span>
            <span>•</span>
            <span>By {bill.authorName}</span>
            <span>•</span>
            <span>{bill.authorRole}</span>
          </div>
        </div>
        <div className={styles.billHeaderRight}>
          {availableActions.length > 0 && (
            <div className={styles.actionGroup}>
              <div className={styles.actionLabel}>Available Actions</div>
              {availableActions.map((action, i) => (
                <button key={i} className="btn btn-primary btn-sm" onClick={() => alert(`Action: ${action.label}\nTransition to: ${BILL_STATUS_LABELS[action.to]}`)}>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>Legislative Progress</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className={styles.detailGrid}>
        {/* ── Main Content ── */}
        <div className={styles.detailMain}>
          {/* Summary */}
          <div className="card">
            <h3 className={styles.sectionTitle}>Summary</h3>
            <p className={styles.summaryText}>{bill.summary}</p>
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{bill.clauseCount}</span>
                <span className={styles.statLbl}>Clauses</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{bill.amendmentCount}</span>
                <span className={styles.statLbl}>Amendments</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{bill.commentCount}</span>
                <span className={styles.statLbl}>Comments</span>
              </div>
            </div>
          </div>

          {/* Clauses */}
          <div className="card mt-4">
            <h3 className={styles.sectionTitle}>Clauses</h3>
            <div className={styles.clauseList}>
              {sampleClauses.map((clause) => (
                <div key={clause.number} className={styles.clauseItem}>
                  <div className={styles.clauseHeader}>
                    <span className={styles.clauseNumber}>Clause {clause.number}</span>
                    <span className={styles.clauseTitle}>{clause.title}</span>
                  </div>
                  <p className={styles.clauseContent}>{clause.content}</p>
                  <div className={styles.clauseActions}>
                    <button className="btn btn-ghost btn-sm">💬 Comment</button>
                    <button className="btn btn-ghost btn-sm">✏️ Propose Amendment</button>
                  </div>
                </div>
              ))}
              {bill.clauseCount > 3 && (
                <div className={styles.moreClauses}>
                  + {bill.clauseCount - 3} more clauses
                </div>
              )}
            </div>
          </div>

          {/* State Lifecycle Visualization */}
          <div className="card mt-4">
            <h3 className={styles.sectionTitle}>Bill Lifecycle</h3>
            <div className={styles.lifecycle}>
              {BILL_LIFECYCLE_ORDER.map((status, i) => {
                const isCurrent = status === bill.status;
                const isPast = BILL_LIFECYCLE_ORDER.indexOf(bill.status) > i;
                const isTerminal = ['LAPSED', 'WITHDRAWN'].includes(bill.status) && !isPast && !isCurrent;

                return (
                  <div
                    key={status}
                    className={`${styles.lifecycleStep} ${isCurrent ? styles.lifecycleCurrent : ''} ${isPast ? styles.lifecyclePast : ''} ${isTerminal ? styles.lifecycleSkipped : ''}`}
                  >
                    <div className={styles.lifecycleDot}>
                      {isPast ? '✓' : isCurrent ? '●' : i + 1}
                    </div>
                    <span className={styles.lifecycleLabel}>
                      {BILL_STATUS_LABELS[status]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className={styles.detailSide}>
          {/* Deadlines */}
          {deadlines.length > 0 && (
            <div className="card">
              <h3 className={styles.sectionTitle}>⏰ Active Deadlines</h3>
              {deadlines.map((dl) => {
                const urgency = getDeadlineUrgency(dl.expiresAt);
                return (
                  <div key={dl.id} className={styles.deadlineCard}>
                    <div className={styles.deadlineType}>{dl.type.replace(/_/g, ' ')}</div>
                    <div className={`${styles.deadlineTimer} ${styles[`timer-${urgency}`]}`}>
                      {formatRemainingTime(dl.expiresAt)}
                    </div>
                    <div className={styles.deadlineExpiry}>
                      Expires: {new Date(dl.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Transition History */}
          <div className="card mt-4">
            <h3 className={styles.sectionTitle}>📋 Transition History</h3>
            <div className="timeline">
              {transitions.map((tr) => (
                <div key={tr.id} className="timeline-item">
                  <div className="timeline-dot completed" />
                  <div className="timeline-content">
                    <div className="timeline-date">
                      {new Date(tr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="timeline-title">
                      {BILL_STATUS_LABELS[tr.toStatus]}
                    </div>
                    <div className="text-xs text-muted mt-2">
                      By {tr.triggeredBy} — {tr.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Info */}
          <div className="card mt-4">
            <h3 className={styles.sectionTitle}>📄 Bill Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Created</span>
                <span className={styles.infoValue}>{new Date(bill.createdAt).toLocaleDateString()}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Last Updated</span>
                <span className={styles.infoValue}>{new Date(bill.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Origin House</span>
                <span className={styles.infoValue}>{bill.originHouse === 'HOR' ? 'House of Representatives' : 'National Assembly'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Current House</span>
                <span className={styles.infoValue}>{bill.currentHouse === 'HOR' ? 'House of Representatives' : 'National Assembly'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
