'use client';

import { MOCK_BILLS, MOCK_DEADLINES } from '@/lib/mock-data';
import { BILL_STATUS_LABELS, BILL_STATUS_BADGE_CLASS } from '@/types';
import { formatRemainingTime, getDeadlineUrgency } from '@/lib/rules-engine/deadlines';

export default function PresidentialPage() {
  const billsForReview = MOCK_BILLS.filter(b => b.status === 'PRESIDENTIAL_REVIEW');
  const assented = MOCK_BILLS.filter(b => b.status === 'ASSENTED');
  const presidentialDeadlines = MOCK_DEADLINES.filter(d => d.type === 'PRESIDENTIAL_ASSENT');

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Presidential Dashboard</h1>
        <p className="page-subtitle">Bills awaiting presidential assent or return</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning-light)' }}>📋</div>
          <div className="stat-value">{billsForReview.length}</div>
          <div className="stat-label">Awaiting Action</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success-light)' }}>✅</div>
          <div className="stat-value">{assented.length}</div>
          <div className="stat-label">Assented</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger-light)' }}>⏰</div>
          <div className="stat-value">{presidentialDeadlines.length}</div>
          <div className="stat-label">Active Deadlines</div>
        </div>
      </div>

      {/* Bills for Review */}
      <div className="card mt-6">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)' }}>
          📋 Bills Awaiting Presidential Action
        </h3>

        {billsForReview.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-state-icon">🏢</div>
            <div className="empty-state-title">No bills pending</div>
          </div>
        ) : (
          billsForReview.map(bill => {
            const deadline = presidentialDeadlines.find(d => d.billId === bill.id);
            const urgency = deadline ? getDeadlineUrgency(deadline.expiresAt) : 'normal';

            return (
              <div key={bill.id} style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--space-6)',
                marginBottom: 'var(--space-4)',
                border: '1px solid var(--border-color)',
              }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-1)' }}>{bill.title}</h4>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>{bill.titleNe}</p>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                      Bill No: {bill.billNumber} • {bill.billType === 'MONEY' ? 'Money Bill' : bill.billType} • Certified by Speaker
                    </p>
                  </div>
                  <span className={`badge ${BILL_STATUS_BADGE_CLASS[bill.status]}`}>
                    {BILL_STATUS_LABELS[bill.status]}
                  </span>
                </div>

                {deadline && (
                  <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--border-radius)',
                    padding: 'var(--space-3)',
                    marginBottom: 'var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                      ⏰ Constitutional Deadline (15 days)
                    </span>
                    <span style={{
                      fontWeight: 'var(--font-weight-bold)',
                      color: urgency === 'critical' ? 'var(--color-danger-light)' : urgency === 'warning' ? 'var(--color-warning-light)' : 'var(--color-info-light)',
                    }}>
                      {formatRemainingTime(deadline.expiresAt)}
                    </span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button className="btn btn-primary" onClick={() => alert('Presidential Assent granted!')}>
                    ✅ Give Assent
                  </button>
                  {bill.billType !== 'MONEY' && (
                    <button className="btn btn-secondary" onClick={() => alert('Bill returned to Parliament')}>
                      ↩️ Return Bill
                    </button>
                  )}
                </div>
                {bill.billType === 'MONEY' && (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                    ⚠️ Money bills cannot be returned — assent is mandatory
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
