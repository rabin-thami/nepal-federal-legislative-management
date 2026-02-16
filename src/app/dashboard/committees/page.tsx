'use client';

import { MOCK_COMMITTEES } from '@/lib/mock-data';
import styles from './committees.module.css';

export default function CommitteesPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Committees</h1>
        <p className="page-subtitle">Parliamentary committees overseeing legislative review</p>
      </div>

      <div className={styles.committeeGrid}>
        {MOCK_COMMITTEES.map((committee) => (
          <div key={committee.id} className={styles.committeeCard}>
            <div className={styles.committeeHeader}>
              <div className={styles.committeeIcon}>🏛️</div>
              <div>
                <h3 className={styles.committeeName}>{committee.name}</h3>
                <p className={styles.committeeNameNe}>{committee.nameNe}</p>
              </div>
            </div>

            <p className={styles.committeeDescription}>{committee.description}</p>

            <div className={styles.committeeStats}>
              <div className={styles.committeeStat}>
                <span className={styles.committeeStatValue}>{committee.memberCount}</span>
                <span className={styles.committeeStatLabel}>Members</span>
              </div>
              <div className={styles.committeeStat}>
                <span className={styles.committeeStatValue}>{committee.activeBills}</span>
                <span className={styles.committeeStatLabel}>Active Bills</span>
              </div>
              <div className={styles.committeeStat}>
                <span className={styles.committeeStatValue}>{committee.quorum}</span>
                <span className={styles.committeeStatLabel}>Quorum</span>
              </div>
            </div>

            <div className={styles.committeeFooter}>
              <span className={`badge ${committee.house === 'HOR' ? 'badge-active' : 'badge-review'}`}>
                {committee.house === 'HOR' ? 'House of Representatives' : 'National Assembly'}
              </span>
              <span className={`badge ${committee.isActive ? 'badge-passed' : 'badge-draft'}`}>
                {committee.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
