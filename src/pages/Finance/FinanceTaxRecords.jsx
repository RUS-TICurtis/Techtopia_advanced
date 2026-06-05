import React, { useState } from 'react';
import { Plus, Download, Search, CheckCircle, Clock, X, AlertCircle, FileText } from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import './Finance.css';
import { useTaxRecords } from '../../hooks/useCrmData';

const TAX_TYPES = ['VAT', 'Income Tax', 'Withholding Tax', 'PAYE', 'SSNIT', 'Other'];

const STATUS_CONFIG = {
  Filed:    { class: 'badge-success', icon: CheckCircle },
  Pending:  { class: 'badge-warning', icon: Clock },
  Overdue:  { class: 'badge-danger',  icon: AlertCircle },
  Draft:    { class: 'badge-neutral', icon: FileText },
};

const EMPTY_RECORD = { type: 'VAT', period: '', grossRevenue: '', taxableAmount: '', taxRate: 15, dueDate: '' };

export default function FinanceTaxRecords() {
  const { records = [], isLoading, createRecord } = useTaxRecords();
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRecord, setNewRecord] = useState(EMPTY_RECORD);

  const filtered = records.filter(r => {
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchType && matchStatus;
  });

  const totals = {
    due: records.reduce((s, r) => s + (r.taxDue || 0), 0),
    paid: records.reduce((s, r) => s + (r.taxPaid || 0), 0),
    outstanding: records.reduce((s, r) => s + ((r.taxDue || 0) - (r.taxPaid || 0)), 0),
    overdue: records.filter(r => r.status === 'Overdue').length,
  };

  const computedTax = parseFloat(newRecord.taxableAmount || 0) * (parseFloat(newRecord.taxRate || 0) / 100);

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      type: newRecord.type,
      period: newRecord.period,
      taxableAmount: parseFloat(newRecord.taxableAmount) || 0,
      taxRate: parseFloat(newRecord.taxRate) || 0,
      taxDue: computedTax,
      dueDate: newRecord.dueDate,
    };
    try {
      await createRecord(payload);
      setShowCreateModal(false);
      setNewRecord(EMPTY_RECORD);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01FDF6]"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tax Records</h1>
          <p className="page-subtitle">Ghana Revenue Authority (GRA) compliance — VAT, Income Tax, PAYE, SSNIT</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Download size={16} /><span>GRA Export</span></button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /><span>New Tax Record</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="finance-kpi-grid">
        {[
          { label: 'Total Tax Liability (YTD)', value: formatCurrency(totals.due), color: '#01FDF6', bg: 'rgba(1,253,246,0.1)' },
          { label: 'Tax Paid', value: formatCurrency(totals.paid), color: '#21FA90', bg: 'rgba(33,250,144,0.1)' },
          { label: 'Outstanding Tax', value: formatCurrency(totals.outstanding), color: totals.outstanding > 0 ? '#FF47DA' : '#21FA90', bg: 'rgba(255,71,218,0.1)' },
          { label: 'Overdue Filings', value: `${totals.overdue} items`, color: '#E4FF1A', bg: 'rgba(228,255,26,0.1)' },
        ].map(m => (
          <div key={m.label} className="finance-kpi-card card">
            <div className="finance-kpi-icon" style={{ background: m.bg, color: m.color }}><FileText size={20} /></div>
            <div className="finance-kpi-content">
              <span className="finance-kpi-label">{m.label}</span>
              <span className="finance-kpi-value" style={{ fontSize: 18 }}>{m.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue Alert */}
      {records.some(r => r.status === 'Overdue') && (
        <div style={{
          padding: '14px 20px', borderRadius: 'var(--radius-md)',
          background: 'rgba(255,71,218,0.08)', border: '1px solid rgba(255,71,218,0.3)',
          display: 'flex', alignItems: 'center', gap: 12, fontSize: 13
        }}>
          <AlertCircle size={18} style={{ color: '#FF47DA', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#FF47DA' }}>Action Required:</strong>
            <span style={{ color: 'var(--text-main)' }}> {records.filter(r => r.status === 'Overdue').length} tax filing(s) are overdue. File immediately to avoid GRA penalties.</span>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div className="finance-filter-bar">
          <select className="form-input" style={{ width: 'auto' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="All">All Tax Types</option>
            {TAX_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="form-input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Tax Records Table */}
      <div className="card table-container" style={{ padding: 0 }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Record ID</th><th>Tax Type</th><th>Period</th><th>Taxable Amount</th>
              <th>Rate</th><th>Tax Due</th><th>Tax Paid</th><th>Balance</th>
              <th>Due Date</th><th>Filed Date</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(rec => {
              const cfg = STATUS_CONFIG[rec.status] || {};
              const StatusIcon = cfg.icon || FileText;
              const balance = rec.taxDue - rec.taxPaid;
              return (
                <tr key={rec.id}>
                  <td><span className="font-mono text-xs" style={{ color: 'var(--brand-cyan)' }}>{rec.id}</span></td>
                  <td><span className="badge badge-sm badge-info">{rec.type}</span></td>
                  <td className="text-sm font-semibold">{rec.period}</td>
                  <td className="text-sm">{formatCurrency(rec.taxableAmount)}</td>
                  <td className="text-sm">{rec.taxRate}%</td>
                  <td className="font-semibold">{formatCurrency(rec.taxDue)}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>{rec.taxPaid > 0 ? formatCurrency(rec.taxPaid) : '—'}</td>
                  <td style={{ color: balance > 0 ? 'var(--error)' : 'var(--success)', fontWeight: 700 }}>
                    {balance > 0 ? formatCurrency(balance) : <CheckCircle size={14} />}
                  </td>
                  <td className="text-xs text-muted">{rec.dueDate}</td>
                  <td className="text-xs text-muted">{rec.filedDate || '—'}</td>
                  <td>
                    <span className={`badge badge-sm ${cfg.class}`} style={{ gap: 4 }}>
                      <StatusIcon size={10} /> {rec.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Tax Record</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tax Type *</label>
                  <select className="form-input" required value={newRecord.type}
                    onChange={e => setNewRecord(p => ({ ...p, type: e.target.value }))}>
                    {TAX_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Period *</label>
                  <input type="text" className="form-input" required value={newRecord.period}
                    onChange={e => setNewRecord(p => ({ ...p, period: e.target.value }))} placeholder="Q1 2026, Jan 2026..." />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Taxable Amount (GH₵) *</label>
                  <input type="number" className="form-input" required min={0} value={newRecord.taxableAmount}
                    onChange={e => setNewRecord(p => ({ ...p, taxableAmount: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tax Rate (%) *</label>
                  <input type="number" className="form-input" required min={0} max={100} step="0.1" value={newRecord.taxRate}
                    onChange={e => setNewRecord(p => ({ ...p, taxRate: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tax Due (calculated)</label>
                  <input type="text" className="form-input" readOnly value={formatCurrency(computedTax)}
                    style={{ background: 'var(--bg-app)', color: 'var(--brand-cyan)', fontWeight: 700 }} />
                </div>
              </div>
              <div className="form-group">
                <label>Filing Due Date *</label>
                <input type="date" className="form-input" required value={newRecord.dueDate}
                  onChange={e => setNewRecord(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><FileText size={14} /> Create Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
