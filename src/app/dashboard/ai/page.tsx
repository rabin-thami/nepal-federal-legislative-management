'use client';

import { MOCK_BILLS } from '@/lib/mock-data';
import { BILL_STATUS_LABELS, BILL_STATUS_BADGE_CLASS } from '@/types';
import styles from './ai.module.css';

export default function AIAnalysisPage() {
  const analyzableBills = MOCK_BILLS.filter(b => !['DRAFT', 'LAPSED', 'WITHDRAWN'].includes(b.status));

  const sampleAnalysis = {
    billId: 'bill-001',
    riskLevel: 'MEDIUM',
    complianceScore: 87,
    conflicts: [
      { article: 'Article 17(2)', description: 'Right to Information — Data protection clauses may need reconciliation with public information access' },
      { article: 'Article 28', description: 'Right to Communication — Digital governance must ensure no undue restrictions on communication' },
    ],
    affectedActs: [
      'Electronic Transaction Act, 2063',
      'Information Technology Act (proposed)',
      'Right to Information Act, 2064',
      'Privacy Act, 2075',
    ],
    summary: 'The Digital Nepal Framework Act establishes a comprehensive legal framework for digital governance. While generally compliant with constitutional provisions, there are potential tensions with information access rights under Article 17(2) and communication rights under Article 28. The data protection provisions need careful balancing with transparency requirements.',
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">AI Legal Intelligence</h1>
        <p className="page-subtitle">Constitutional compliance, risk analysis, and legal intelligence (RAG-powered)</p>
      </div>

      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA' }}>🤖</div>
          <div className="stat-value">{analyzableBills.length}</div>
          <div className="stat-label">Bills Analyzed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning-light)' }}>⚠️</div>
          <div className="stat-value">2</div>
          <div className="stat-label">Constitutional Risks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success-light)' }}>✅</div>
          <div className="stat-value">87%</div>
          <div className="stat-label">Avg. Compliance</div>
        </div>
      </div>

      <div className={styles.analysisGrid}>
        {/* ── Analysis Panel ── */}
        <div className={styles.analysisMain}>
          <div className="card">
            <h3 className={styles.sectionTitle}>🤖 AI Analysis: Digital Nepal Framework Act</h3>

            {/* Risk Level */}
            <div className={styles.riskBanner}>
              <div className={styles.riskLevel}>
                <span className={styles.riskDot} style={{ background: 'var(--color-warning)' }} />
                Risk Level: <strong>MEDIUM</strong>
              </div>
              <div className={styles.complianceScore}>
                <span className={styles.scoreValue}>87</span>
                <span className={styles.scoreLabel}>/ 100 Compliance</span>
              </div>
            </div>

            {/* Summary */}
            <div className={styles.analysisSection}>
              <h4 className={styles.analysisSectionTitle}>📝 AI Summary</h4>
              <p className={styles.analysisSummaryText}>{sampleAnalysis.summary}</p>
            </div>

            {/* Constitutional Conflicts */}
            <div className={styles.analysisSection}>
              <h4 className={styles.analysisSectionTitle}>⚠️ Constitutional Conflict Areas</h4>
              {sampleAnalysis.conflicts.map((conflict, i) => (
                <div key={i} className={styles.conflictItem}>
                  <div className={styles.conflictArticle}>{conflict.article}</div>
                  <p className={styles.conflictDescription}>{conflict.description}</p>
                </div>
              ))}
            </div>

            {/* Affected Acts */}
            <div className={styles.analysisSection}>
              <h4 className={styles.analysisSectionTitle}>📚 Affected Acts & Regulations</h4>
              <div className={styles.actsList}>
                {sampleAnalysis.affectedActs.map((act, i) => (
                  <div key={i} className={styles.actItem}>
                    <span className={styles.actIcon}>📖</span>
                    {act}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className={styles.analysisSide}>
          <div className="card">
            <h3 className={styles.sectionTitle}>🔍 Analyze a Bill</h3>
            <div className="form-group mb-4">
              <label className="form-label">Select Bill</label>
              <select className="input">
                {analyzableBills.map(bill => (
                  <option key={bill.id} value={bill.id}>{bill.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Analysis Type</label>
              <select className="input">
                <option>Full Compliance Check</option>
                <option>Constitutional Conflict Detection</option>
                <option>Affected Acts Analysis</option>
                <option>Public Summary Generation</option>
                <option>Risk Assessment</option>
              </select>
            </div>
            <button className="btn btn-primary w-full">
              🤖 Run Analysis
            </button>
            <p className="text-xs text-muted mt-2 text-center">
              Powered by RAG over Nepal&apos;s legal corpus
            </p>
          </div>

          <div className="card mt-4">
            <h3 className={styles.sectionTitle}>📊 Legal Corpus</h3>
            <div className={styles.corpusStats}>
              <div className={styles.corpusStat}>
                <span className={styles.corpusValue}>1</span>
                <span className={styles.corpusLabel}>Constitution</span>
              </div>
              <div className={styles.corpusStat}>
                <span className={styles.corpusValue}>312</span>
                <span className={styles.corpusLabel}>Acts</span>
              </div>
              <div className={styles.corpusStat}>
                <span className={styles.corpusValue}>85</span>
                <span className={styles.corpusLabel}>Regulations</span>
              </div>
              <div className={styles.corpusStat}>
                <span className={styles.corpusValue}>47</span>
                <span className={styles.corpusLabel}>Court Rulings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
