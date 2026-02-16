'use client';

import { MOCK_BILLS, MOCK_VOTE_SESSIONS, MOCK_COMMITTEES } from '@/lib/mock-data';
import { BillStatus, BILL_STATUS_LABELS } from '@/types';
import styles from './analytics.module.css';

export default function AnalyticsPage() {
  // ── Compute analytics ──
  const statusDistribution: Record<string, number> = {};
  MOCK_BILLS.forEach(b => {
    const label = BILL_STATUS_LABELS[b.status];
    statusDistribution[label] = (statusDistribution[label] || 0) + 1;
  });

  const typeDistribution: Record<string, number> = {};
  MOCK_BILLS.forEach(b => {
    typeDistribution[b.billType] = (typeDistribution[b.billType] || 0) + 1;
  });

  const houseDistribution = {
    HOR: MOCK_BILLS.filter(b => b.originHouse === 'HOR').length,
    NA: MOCK_BILLS.filter(b => b.originHouse === 'NA').length,
  };

  const totalVotes = MOCK_VOTE_SESSIONS.reduce((sum, v) => sum + v.totalFor + v.totalAgainst + v.totalAbstain, 0);
  const totalFor = MOCK_VOTE_SESSIONS.reduce((sum, v) => sum + v.totalFor, 0);
  const totalAgainst = MOCK_VOTE_SESSIONS.reduce((sum, v) => sum + v.totalAgainst, 0);

  const maxCount = Math.max(...Object.values(statusDistribution));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Legislative metrics, voting patterns, and committee performance</p>
      </div>

      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-light)' }}>📜</div>
          <div className="stat-value">{MOCK_BILLS.length}</div>
          <div className="stat-label">Total Bills</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success-light)' }}>🗳️</div>
          <div className="stat-value">{totalVotes}</div>
          <div className="stat-label">Total Votes Cast</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA' }}>🏛️</div>
          <div className="stat-value">{MOCK_COMMITTEES.length}</div>
          <div className="stat-label">Committees</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info-light)' }}>📊</div>
          <div className="stat-value">{totalVotes > 0 ? Math.round((totalFor / totalVotes) * 100) : 0}%</div>
          <div className="stat-label">Avg Approval Rate</div>
        </div>
      </div>

      <div className={styles.analyticsGrid}>
        {/* ── Bill Status Distribution ── */}
        <div className="card">
          <h3 className={styles.chartTitle}>Bill Status Distribution</h3>
          <div className={styles.barChart}>
            {Object.entries(statusDistribution).map(([label, count]) => (
              <div key={label} className={styles.barRow}>
                <span className={styles.barLabel}>{label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className={styles.barValue}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── House Split ── */}
        <div className="card">
          <h3 className={styles.chartTitle}>Bills by House</h3>
          <div className={styles.donutChart}>
            <div className={styles.donutVisual}>
              <svg viewBox="0 0 120 120" width="140" height="140">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-info)" strokeWidth="20"
                  strokeDasharray={`${(houseDistribution.HOR / MOCK_BILLS.length) * 314} ${314}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 60 60)"
                />
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-accent)" strokeWidth="20"
                  strokeDasharray={`${(houseDistribution.NA / MOCK_BILLS.length) * 314} ${314}`}
                  strokeDashoffset={`-${(houseDistribution.HOR / MOCK_BILLS.length) * 314}`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className={styles.donutCenter}>
                <span className={styles.donutTotal}>{MOCK_BILLS.length}</span>
                <span className={styles.donutLabel}>Total</span>
              </div>
            </div>
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: 'var(--color-info)' }} />
                <span>House of Representatives</span>
                <strong>{houseDistribution.HOR}</strong>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: 'var(--color-accent)' }} />
                <span>National Assembly</span>
                <strong>{houseDistribution.NA}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ── Voting Summary ── */}
        <div className="card">
          <h3 className={styles.chartTitle}>Voting Summary</h3>
          <div className={styles.votingSummary}>
            <div className={styles.voteMetric}>
              <div className={styles.voteMetricBar}>
                <div className={styles.voteBarFor} style={{ width: `${totalVotes > 0 ? (totalFor / totalVotes) * 100 : 0}%` }} />
                <div className={styles.voteBarAgainst} style={{ width: `${totalVotes > 0 ? (totalAgainst / totalVotes) * 100 : 0}%` }} />
              </div>
              <div className={styles.voteMetricLabels}>
                <span style={{ color: 'var(--color-success-light)' }}>✓ For: {totalFor}</span>
                <span style={{ color: 'var(--color-danger-light)' }}>✗ Against: {totalAgainst}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>○ Abstain: {totalVotes - totalFor - totalAgainst}</span>
              </div>
            </div>

            <div className={styles.sessionStats}>
              <div className={styles.sessionStat}>
                <span className={styles.sessionStatValue}>{MOCK_VOTE_SESSIONS.length}</span>
                <span className={styles.sessionStatLabel}>Total Sessions</span>
              </div>
              <div className={styles.sessionStat}>
                <span className={styles.sessionStatValue}>{MOCK_VOTE_SESSIONS.filter(v => v.result === 'PASSED').length}</span>
                <span className={styles.sessionStatLabel}>Passed</span>
              </div>
              <div className={styles.sessionStat}>
                <span className={styles.sessionStatValue}>{MOCK_VOTE_SESSIONS.filter(v => v.isActive).length}</span>
                <span className={styles.sessionStatLabel}>Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Committee Performance ── */}
        <div className="card">
          <h3 className={styles.chartTitle}>Committee Performance</h3>
          <div className={styles.committeeList}>
            {MOCK_COMMITTEES.map((c) => (
              <div key={c.id} className={styles.committeeRow}>
                <div className={styles.committeeName}>
                  <span>{c.name}</span>
                  <span className="badge badge-active" style={{ marginLeft: 8 }}>{c.house}</span>
                </div>
                <div className={styles.committeeMetrics}>
                  <span>{c.memberCount} members</span>
                  <span>•</span>
                  <span>{c.activeBills} bills</span>
                </div>
                <div className="progress-bar" style={{ width: 100, height: 4 }}>
                  <div className="progress-fill" style={{ width: `${Math.min(100, c.activeBills * 30)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
