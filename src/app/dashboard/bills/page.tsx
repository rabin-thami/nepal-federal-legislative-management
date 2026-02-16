'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_BILLS } from '@/lib/mock-data';
import { BILL_STATUS_LABELS, BILL_STATUS_BADGE_CLASS, BILL_TYPE_LABELS, BillStatus, BillType, HouseType } from '@/types';
import styles from './bills.module.css';

export default function BillsListPage() {
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<BillType | 'ALL'>('ALL');
  const [houseFilter, setHouseFilter] = useState<HouseType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBills = MOCK_BILLS.filter(bill => {
    if (statusFilter !== 'ALL' && bill.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && bill.billType !== typeFilter) return false;
    if (houseFilter !== 'ALL' && bill.originHouse !== houseFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return bill.title.toLowerCase().includes(q) || bill.titleNe.includes(q) || (bill.billNumber || '').toLowerCase().includes(q);
    }
    return true;
  });

  const statusCounts: Record<string, number> = {};
  MOCK_BILLS.forEach(b => {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Bills</h1>
            <p className="page-subtitle">All legislative bills in the Federal Parliament</p>
          </div>
          <Link href="/dashboard/bills/new" className="btn btn-primary">
            + New Bill
          </Link>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={styles.filters}>
        <div className="form-group">
          <input
            type="text"
            className="input"
            placeholder="Search bills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: 280 }}
          />
        </div>
        <div className="form-group">
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BillStatus | 'ALL')}>
            <option value="ALL">All Statuses</option>
            {Object.entries(BILL_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label} {statusCounts[key] ? `(${statusCounts[key]})` : ''}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as BillType | 'ALL')}>
            <option value="ALL">All Types</option>
            {Object.entries(BILL_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <select className="input" value={houseFilter} onChange={(e) => setHouseFilter(e.target.value as HouseType | 'ALL')}>
            <option value="ALL">Both Houses</option>
            <option value="HOR">House of Representatives</option>
            <option value="NA">National Assembly</option>
          </select>
        </div>
      </div>

      {/* ── Bills Table ── */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Bill No.</th>
              <th>Title</th>
              <th>Type</th>
              <th>House</th>
              <th>Status</th>
              <th>Author</th>
              <th>Clauses</th>
              <th>Amendments</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr key={bill.id}>
                <td>
                  <Link href={`/dashboard/bills/${bill.id}`} className={styles.billNumberLink}>
                    {bill.billNumber || '—'}
                  </Link>
                </td>
                <td>
                  <Link href={`/dashboard/bills/${bill.id}`} className={styles.billTitleLink}>
                    <span>{bill.title}</span>
                    {bill.isUrgent && <span className="badge badge-urgent" style={{ marginLeft: 8 }}>Urgent</span>}
                    {bill.isFastTrack && <span className="badge badge-voting" style={{ marginLeft: 8 }}>Fast Track</span>}
                  </Link>
                  <div className={styles.billTitleNe}>{bill.titleNe}</div>
                </td>
                <td><span className="text-sm">{BILL_TYPE_LABELS[bill.billType]}</span></td>
                <td>
                  <span className={`badge ${bill.originHouse === 'HOR' ? 'badge-active' : 'badge-review'}`}>
                    {bill.originHouse === 'HOR' ? 'HoR' : 'NA'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${BILL_STATUS_BADGE_CLASS[bill.status]}`}>
                    {BILL_STATUS_LABELS[bill.status]}
                  </span>
                </td>
                <td className="text-sm">{bill.authorName}</td>
                <td className="text-center">{bill.clauseCount}</td>
                <td className="text-center">{bill.amendmentCount}</td>
                <td className="text-sm text-muted">
                  {new Date(bill.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
            {filteredBills.length === 0 && (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📜</div>
                    <div className="empty-state-title">No bills found</div>
                    <div className="empty-state-description">
                      Try adjusting your filters or create a new bill.
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
