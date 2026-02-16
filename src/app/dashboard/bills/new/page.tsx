'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { BillType, HouseType, BILL_TYPE_LABELS, HOUSE_LABELS } from '@/types';

export default function NewBillPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    titleNe: '',
    summary: '',
    billType: 'GOVERNMENT' as BillType,
    originHouse: 'HOR' as HouseType,
    isUrgent: false,
    clauses: [{ number: 1, title: 'Short Title and Commencement', content: '' }],
  });

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addClause = () => {
    setFormData(prev => ({
      ...prev,
      clauses: [...prev.clauses, { number: prev.clauses.length + 1, title: '', content: '' }],
    }));
  };

  const handleSubmit = () => {
    alert('Bill draft submitted successfully!\n\nTitle: ' + formData.title + '\nType: ' + BILL_TYPE_LABELS[formData.billType]);
    router.push('/dashboard/bills');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <h1 className="page-title">Create New Bill</h1>
        <p className="page-subtitle">Draft a new legislative bill for the Federal Parliament</p>
      </div>

      {/* ── Step Indicator ── */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {[1, 2, 3].map(s => (
          <button
            key={s}
            className={`btn ${step === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setStep(s)}
            style={{ flex: 1 }}
          >
            Step {s}: {s === 1 ? 'Basic Info' : s === 2 ? 'Clauses' : 'Review'}
          </button>
        ))}
      </div>

      {/* ── Step 1: Basic Information ── */}
      {step === 1 && (
        <div className="card">
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-5)' }}>
            Basic Information
          </h3>

          <div className="form-group mb-4">
            <label className="form-label">Bill Title (English) *</label>
            <input
              className="input"
              placeholder="e.g., Digital Nepal Framework Act, 2082"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Bill Title (Nepali)</label>
            <input
              className="input"
              placeholder="e.g., डिजिटल नेपाल फ्रेमवर्क ऐन, २०८२"
              value={formData.titleNe}
              onChange={(e) => updateField('titleNe', e.target.value)}
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Summary *</label>
            <textarea
              className="input"
              placeholder="Describe the purpose and objectives of this bill..."
              value={formData.summary}
              onChange={(e) => updateField('summary', e.target.value)}
              rows={4}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Bill Type *</label>
              <select className="input" value={formData.billType} onChange={(e) => updateField('billType', e.target.value)}>
                {Object.entries(BILL_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Origin House *</label>
              <select className="input" value={formData.originHouse} onChange={(e) => updateField('originHouse', e.target.value)}>
                {Object.entries(HOUSE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group mt-4">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isUrgent}
                onChange={(e) => updateField('isUrgent', e.target.checked)}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>Mark as Urgent</span>
            </label>
          </div>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Next: Add Clauses →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Clauses ── */}
      {step === 2 && (
        <div className="card">
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-5)' }}>
            Bill Clauses
          </h3>

          {formData.clauses.map((clause, i) => (
            <div key={i} style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-3)',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <span style={{
                  background: 'var(--color-primary-50)',
                  color: 'var(--color-primary-light)',
                  padding: '2px 10px',
                  borderRadius: 'var(--border-radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-bold)',
                }}>
                  Clause {clause.number}
                </span>
                <input
                  className="input"
                  placeholder="Clause title..."
                  value={clause.title}
                  onChange={(e) => {
                    const updated = [...formData.clauses];
                    updated[i] = { ...updated[i], title: e.target.value };
                    updateField('clauses', updated);
                  }}
                  style={{ flex: 1, minHeight: 36 }}
                />
              </div>
              <textarea
                className="input"
                placeholder="Clause content..."
                value={clause.content}
                onChange={(e) => {
                  const updated = [...formData.clauses];
                  updated[i] = { ...updated[i], content: e.target.value };
                  updateField('clauses', updated);
                }}
                rows={3}
              />
            </div>
          ))}

          <button className="btn btn-secondary w-full" onClick={addClause}>
            + Add Clause
          </button>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Next: Review →</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Review ── */}
      {step === 3 && (
        <div className="card">
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-5)' }}>
            Review & Submit
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-color)' }}>
              <span className="text-sm text-muted">Title</span>
              <span className="font-semibold">{formData.title || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-color)' }}>
              <span className="text-sm text-muted">Title (Nepali)</span>
              <span>{formData.titleNe || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-color)' }}>
              <span className="text-sm text-muted">Type</span>
              <span className="badge badge-active">{BILL_TYPE_LABELS[formData.billType]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-color)' }}>
              <span className="text-sm text-muted">House</span>
              <span className="badge badge-review">{HOUSE_LABELS[formData.originHouse]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-color)' }}>
              <span className="text-sm text-muted">Clauses</span>
              <span className="font-semibold">{formData.clauses.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-color)' }}>
              <span className="text-sm text-muted">Urgent</span>
              <span>{formData.isUrgent ? '🔴 Yes' : 'No'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}>
              <span className="text-sm text-muted">Author</span>
              <span>{user?.name}</span>
            </div>
          </div>

          {formData.summary && (
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>Summary</h4>
              <p className="text-sm text-secondary">{formData.summary}</p>
            </div>
          )}

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
              📜 Submit Draft Bill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
