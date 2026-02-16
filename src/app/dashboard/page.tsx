'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { getDashboardStats, MOCK_BILLS, MOCK_DEADLINES, MOCK_VOTE_SESSIONS } from '@/lib/mock-data';
import { BILL_STATUS_LABELS, BILL_STATUS_BADGE_CLASS, BILL_TYPE_LABELS } from '@/types';
import { formatRemainingTime, getDeadlineUrgency } from '@/lib/rules-engine/deadlines';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const stats = getDashboardStats();

  const recentBills = MOCK_BILLS.slice(0, 5);
  const activeDeadlines = MOCK_DEADLINES.filter(d => !d.isExpired && !d.isCompleted);
  const activeVotes = MOCK_VOTE_SESSIONS.filter(v => v.isActive);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Overview of legislative activities in the Federal Parliament of Nepal
        </p>
      </div>

      {/* ── Stats Grid ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-light)' }}>📜</div>
          <div className="stat-value">{stats.totalBills}</div>
          <div className="stat-label">Total Bills</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info-light)' }}>📋</div>
          <div className="stat-value">{stats.activeBills}</div>
          <div className="stat-label">Active Bills</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success-light)' }}>✅</div>
          <div className="stat-value">{stats.passedBills}</div>
          <div className="stat-label">Passed / Assented</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning-light)' }}>🗳️</div>
          <div className="stat-value">{stats.pendingVotes}</div>
          <div className="stat-label">Pending Votes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA' }}>🏛️</div>
          <div className="stat-value">{stats.activeCommittees}</div>
          <div className="stat-label">Active Committees</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger-light)' }}>⏰</div>
          <div className="stat-value">{stats.upcomingDeadlines}</div>
          <div className="stat-label">Upcoming Deadlines</div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        {/* ── Recent Bills ── */}
        <div className={styles.gridMain}>
          <div className="card">
            <div className={styles.cardHeader}>
              <h3>Recent Bills</h3>
              <Link href="/dashboard/bills" className="btn btn-ghost btn-sm">
                View All →
              </Link>
            </div>
            <div className={styles.billList}>
              {recentBills.map((bill) => (
                <Link key={bill.id} href={`/dashboard/bills/${bill.id}`} className={styles.billItem}>
                  <div className={styles.billInfo}>
                    <div className={styles.billTitle}>
                      {bill.title}
                      {bill.isUrgent && <span className="badge badge-urgent" style={{ marginLeft: 8 }}>Urgent</span>}
                    </div>
                    <div className={styles.billMeta}>
                      <span>{bill.billNumber || 'Unregistered'}</span>
                      <span>•</span>
                      <span>{BILL_TYPE_LABELS[bill.billType]}</span>
                      <span>•</span>
                      <span>{bill.originHouse === 'HOR' ? 'HoR' : 'NA'}</span>
                    </div>
                  </div>
                  <span className={`badge ${BILL_STATUS_BADGE_CLASS[bill.status]}`}>
                    {BILL_STATUS_LABELS[bill.status]}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Active Votes ── */}
          {activeVotes.length > 0 && (
            <div className="card" style={{ marginTop: 'var(--space-4)' }}>
              <div className={styles.cardHeader}>
                <h3>🗳️ Active Voting Sessions</h3>
                <Link href="/dashboard/voting" className="btn btn-ghost btn-sm">
                  View All →
                </Link>
              </div>
              {activeVotes.map((vote) => (
                <div key={vote.id} className={styles.voteItem}>
                  <div className={styles.voteTitle}>{vote.title}</div>
                  <div className={styles.voteBar}>
                    <div className={styles.voteBarTrack}>
                      <div
                        className={styles.voteBarFor}
                        style={{ width: `${(vote.totalFor / (vote.totalFor + vote.totalAgainst + vote.totalAbstain)) * 100}%` }}
                      />
                      <div
                        className={styles.voteBarAgainst}
                        style={{ width: `${(vote.totalAgainst / (vote.totalFor + vote.totalAgainst + vote.totalAbstain)) * 100}%` }}
                      />
                    </div>
                    <div className={styles.voteCounts}>
                      <span className={styles.voteFor}>✓ {vote.totalFor}</span>
                      <span className={styles.voteAgainst}>✗ {vote.totalAgainst}</span>
                      <span className={styles.voteAbstain}>○ {vote.totalAbstain}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar: Deadlines + Activity ── */}
        <div className={styles.gridSide}>
          {/* Deadlines */}
          <div className="card">
            <div className={styles.cardHeader}>
              <h3>⏰ Upcoming Deadlines</h3>
            </div>
            {activeDeadlines.length === 0 ? (
              <p className="text-muted text-sm">No active deadlines</p>
            ) : (
              <div className={styles.deadlineList}>
                {activeDeadlines.map((dl) => {
                  const urgency = getDeadlineUrgency(dl.expiresAt);
                  const bill = MOCK_BILLS.find(b => b.id === dl.billId);
                  return (
                    <div key={dl.id} className={`${styles.deadlineItem} ${styles[`deadline-${urgency}`]}`}>
                      <div className={styles.deadlineType}>
                        {dl.type.replace(/_/g, ' ')}
                      </div>
                      <div className={styles.deadlineBill}>{bill?.title}</div>
                      <div className={styles.deadlineTime}>
                        {formatRemainingTime(dl.expiresAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card" style={{ marginTop: 'var(--space-4)' }}>
            <div className={styles.cardHeader}>
              <h3>📋 Recent Activity</h3>
            </div>
            <div className="timeline">
              {stats.recentTransitions.map((tr) => {
                const bill = MOCK_BILLS.find(b => b.id === tr.billId);
                return (
                  <div key={tr.id} className="timeline-item">
                    <div className="timeline-dot completed" />
                    <div className="timeline-content">
                      <div className="timeline-date">
                        {new Date(tr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="timeline-title">
                        {bill?.title?.substring(0, 40)}...
                      </div>
                      <div className="text-xs text-muted mt-2">
                        {BILL_STATUS_LABELS[tr.fromStatus]} → {BILL_STATUS_LABELS[tr.toStatus]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
