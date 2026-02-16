'use client';

import Link from 'next/link';
import { MOCK_VOTE_SESSIONS, MOCK_BILLS } from '@/lib/mock-data';
import styles from './voting.module.css';

export default function VotingPage() {
  const activeVotes = MOCK_VOTE_SESSIONS.filter(v => v.isActive);
  const completedVotes = MOCK_VOTE_SESSIONS.filter(v => v.isCompleted);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Voting</h1>
        <p className="page-subtitle">Vote sessions and legislative decisions</p>
      </div>

      {/* ── Active Vote Sessions ── */}
      <h2 className={styles.sectionHeading}>🗳️ Active Sessions</h2>
      {activeVotes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🗳️</div>
            <div className="empty-state-title">No active voting sessions</div>
          </div>
        </div>
      ) : (
        <div className={styles.voteGrid}>
          {activeVotes.map((vote) => {
            const total = vote.totalFor + vote.totalAgainst + vote.totalAbstain;
            const forPct = total > 0 ? (vote.totalFor / total) * 100 : 0;
            const againstPct = total > 0 ? (vote.totalAgainst / total) * 100 : 0;
            const abstainPct = total > 0 ? (vote.totalAbstain / total) * 100 : 0;

            return (
              <div key={vote.id} className={`${styles.voteCard} ${styles.voteActive}`}>
                <div className={styles.voteCardHeader}>
                  <span className="badge badge-voting">Active</span>
                  <span className="badge badge-active">{vote.house === 'HOR' ? 'HoR' : 'NA'}</span>
                </div>
                <h3 className={styles.voteCardTitle}>{vote.title}</h3>
                <Link href={`/dashboard/bills/${vote.billId}`} className={styles.voteBillLink}>
                  {vote.billTitle}
                </Link>

                {/* Vote Visualization */}
                <div className={styles.voteVisual}>
                  <div className={styles.voteCircle}>
                    <svg viewBox="0 0 120 120" className={styles.voteSvg}>
                      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="50" fill="none"
                        stroke="var(--color-success)" strokeWidth="10"
                        strokeDasharray={`${forPct * 3.14} ${314 - forPct * 3.14}`}
                        strokeDashoffset="0"
                        transform="rotate(-90 60 60)"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className={styles.voteCircleText}>
                      <span className={styles.voteCircleValue}>{Math.round(forPct)}%</span>
                      <span className={styles.voteCircleLabel}>In Favor</span>
                    </div>
                  </div>
                </div>

                <div className={styles.voteBreakdown}>
                  <div className={styles.voteBreakdownItem}>
                    <div className={styles.voteBreakdownDot} style={{ background: 'var(--color-success)' }} />
                    <span>For</span>
                    <span className="font-bold ml-auto">{vote.totalFor}</span>
                  </div>
                  <div className={styles.voteBreakdownItem}>
                    <div className={styles.voteBreakdownDot} style={{ background: 'var(--color-danger)' }} />
                    <span>Against</span>
                    <span className="font-bold ml-auto">{vote.totalAgainst}</span>
                  </div>
                  <div className={styles.voteBreakdownItem}>
                    <div className={styles.voteBreakdownDot} style={{ background: 'var(--text-tertiary)' }} />
                    <span>Abstain</span>
                    <span className="font-bold ml-auto">{vote.totalAbstain}</span>
                  </div>
                </div>

                <div className={styles.voteTotal}>
                  Total Votes: <strong>{total}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Completed ── */}
      <h2 className={styles.sectionHeading} style={{ marginTop: 'var(--space-8)' }}>✅ Completed Sessions</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Bill</th>
              <th>House</th>
              <th>For</th>
              <th>Against</th>
              <th>Abstain</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {completedVotes.map((vote) => (
              <tr key={vote.id}>
                <td className="font-semibold">{vote.title}</td>
                <td>
                  <Link href={`/dashboard/bills/${vote.billId}`} className={styles.voteBillLink}>
                    {vote.billTitle}
                  </Link>
                </td>
                <td>
                  <span className={`badge ${vote.house === 'HOR' ? 'badge-active' : 'badge-review'}`}>
                    {vote.house === 'HOR' ? 'HoR' : 'NA'}
                  </span>
                </td>
                <td style={{ color: 'var(--color-success-light)' }}>{vote.totalFor}</td>
                <td style={{ color: 'var(--color-danger-light)' }}>{vote.totalAgainst}</td>
                <td>{vote.totalAbstain}</td>
                <td>
                  <span className={`badge ${vote.result === 'PASSED' ? 'badge-passed' : 'badge-lapsed'}`}>
                    {vote.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
