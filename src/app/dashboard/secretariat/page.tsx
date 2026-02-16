'use client';

import { MOCK_BILLS, MOCK_DEADLINES } from '@/lib/mock-data';
import { BILL_STATUS_LABELS, BILL_STATUS_BADGE_CLASS } from '@/types';

export default function SecretariatPage() {
  const registrationQueue = MOCK_BILLS.filter(b => ['CABINET_APPROVED', 'LAW_MINISTRY_REVIEW'].includes(b.status));
  const schedulingQueue = MOCK_BILLS.filter(b => ['REGISTERED', 'FIRST_READING'].includes(b.status));
  const gazetteQueue = MOCK_BILLS.filter(b => b.status === 'ASSENTED');

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Secretariat Dashboard</h1>
        <p className="page-subtitle">Bill registration, scheduling, and administrative workflows</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info-light)' }}>📝</div>
          <div className="stat-value">{registrationQueue.length}</div>
          <div className="stat-label">Pending Registration</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning-light)' }}>📅</div>
          <div className="stat-value">{schedulingQueue.length}</div>
          <div className="stat-label">Pending Scheduling</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success-light)' }}>📰</div>
          <div className="stat-value">{gazetteQueue.length}</div>
          <div className="stat-label">Awaiting Gazette</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger-light)' }}>⏰</div>
          <div className="stat-value">{MOCK_DEADLINES.filter(d => !d.isExpired).length}</div>
          <div className="stat-label">Active Deadlines</div>
        </div>
      </div>

      {/* Registration Queue */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>📝 Registration Queue</h3>
        </div>
        {registrationQueue.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">All caught up!</div>
            <div className="empty-state-description">No bills pending registration</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Bill</th><th>Type</th><th>Status</th><th>Submitted</th><th>Action</th></tr>
              </thead>
              <tbody>
                {registrationQueue.map(bill => (
                  <tr key={bill.id}>
                    <td className="font-semibold">{bill.title}</td>
                    <td className="text-sm">{bill.billType}</td>
                    <td><span className={`badge ${BILL_STATUS_BADGE_CLASS[bill.status]}`}>{BILL_STATUS_LABELS[bill.status]}</span></td>
                    <td className="text-sm text-muted">{new Date(bill.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-primary btn-sm">Register</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gazette Queue */}
      <div className="card mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>📰 Gazette Publication Queue</h3>
        </div>
        {gazetteQueue.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-state-icon">📰</div>
            <div className="empty-state-title">No pending publications</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Bill</th><th>Assented On</th><th>Action</th></tr>
              </thead>
              <tbody>
                {gazetteQueue.map(bill => (
                  <tr key={bill.id}>
                    <td className="font-semibold">{bill.title}</td>
                    <td className="text-sm text-muted">{new Date(bill.updatedAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-primary btn-sm">Publish to Gazette</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
