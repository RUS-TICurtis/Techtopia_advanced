import React, { useState, useMemo } from 'react';
import {
  Receipt, Plus, Search, CheckCircle, Clock, X, AlertCircle,
  ThumbsUp, ThumbsDown, Upload, Filter, Download
} from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import './Finance.css';
import { useExpenses } from '../../hooks/useCrmData';

const EXPENSE_TYPES = ['Travel', 'Operations', 'Marketing', 'Payroll', 'Procurement', 'Infrastructure', 'Other'];

const STATUS_CONFIG = {
  Submitted:    { class: 'badge-warning', icon: Clock },
  'Under Review': { class: 'badge-info', icon: Clock },
  Approved:     { class: 'badge-success', icon: CheckCircle },
  Rejected:     { class: 'badge-danger', icon: X },
  Reimbursed:   { class: 'badge-success', icon: CheckCircle },
};

const TYPE_COLORS = {
  Travel: '#01FDF6', Operations: '#8A4FFF', Marketing: '#FF47DA',
  Payroll: '#21FA90', Procurement: '#E4FF1A', Infrastructure: '#3772FF', Other: '#627496',
};

const EMPTY_EXPENSE = { title: '', type: 'Operations', amount: '', dept: '', date: new Date().toISOString().slice(0, 10), notes: '', receipt: false };

export default function FinanceExpenses() {
  const { expenses = [], isLoading, submitExpense, approveExpense, rejectExpense } = useExpenses();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showApprovalView, setShowApprovalView] = useState(false);
  const [newExpense, setNewExpense] = useState(EMPTY_EXPENSE);

  const metrics = useMemo(() => ({
    total: expenses.reduce((s, e) => s + (e.amount || 0), 0),
    pending: expenses.filter(e => ['Submitted', 'Under Review'].includes(e.status)).reduce((s, e) => s + (e.amount || 0), 0),
    approved: expenses.filter(e => e.status === 'Approved' || e.status === 'Reimbursed').reduce((s, e) => s + (e.amount || 0), 0),
    byType: EXPENSE_TYPES.map(t => ({
      type: t,
      total: expenses.filter(e => e.type === t).reduce((s, e) => s + (e.amount || 0), 0),
      count: expenses.filter(e => e.type === t).length,
    })).filter(t => t.count > 0),
  }), [expenses]);

  const filtered = useMemo(() => expenses.filter(e => {
    const matchSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.submitter?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || e.type === typeFilter;
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  }), [expenses, search, typeFilter, statusFilter]);

  const pendingApprovals = expenses.filter(e => ['Submitted', 'Under Review'].includes(e.status));

  const handleApprove = async (id) => {
    try {
      await approveExpense(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectExpense({ id, reason: 'Rejected by admin' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const payload = {
      title: newExpense.title,
      type: newExpense.type,
      dept: newExpense.dept || 'General',
      status: 'Submitted',
      receipt: newExpense.receipt,
      amount: parseFloat(newExpense.amount) || 0,
      date: newExpense.date,
      notes: newExpense.notes,
    };
    try {
      await submitExpense(payload);
      setShowSubmitModal(false);
      setNewExpense(EMPTY_EXPENSE);
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
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Submit, track, and approve employee expenses across departments</p>
        </div>
        <div className="page-actions">
          {pendingApprovals.length > 0 && (
            <button className="btn btn-secondary" onClick={() => setShowApprovalView(!showApprovalView)}>
              <Clock size={16} />
              <span>Approvals ({pendingApprovals.length})</span>
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowSubmitModal(true)}>
            <Plus size={16} /><span>Submit Expense</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="finance-kpi-grid">
        {[
          { label: 'Total Expenses (MTD)', value: formatCurrency(metrics.total), color: '#FF47DA', bg: 'rgba(255,71,218,0.1)' },
          { label: 'Pending Approval', value: formatCurrency(metrics.pending), color: '#E4FF1A', bg: 'rgba(228,255,26,0.1)' },
          { label: 'Approved & Reimbursed', value: formatCurrency(metrics.approved), color: '#21FA90', bg: 'rgba(33,250,144,0.1)' },
          { label: 'Awaiting Receipts', value: `${expenses.filter(e => !e.receipt).length} items`, color: '#8A4FFF', bg: 'rgba(138,79,255,0.1)' },
        ].map(m => (
          <div key={m.label} className="finance-kpi-card card">
            <div className="finance-kpi-icon" style={{ background: m.bg, color: m.color }}><Receipt size={20} /></div>
            <div className="finance-kpi-content">
              <span className="finance-kpi-label">{m.label}</span>
              <span className="finance-kpi-value" style={{ fontSize: 18 }}>{m.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Queue */}
      {showApprovalView && pendingApprovals.length > 0 && (
        <div className="card">
          <div className="card-title">
            <span className="flex items-center gap-2"><Clock size={16} style={{ color: '#E4FF1A' }} /> Pending Approvals</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingApprovals.map(exp => (
              <div key={exp.id} className="po-card">
                <div style={{ flex: 1 }}>
                  <p className="font-semibold text-sm">{exp.title}</p>
                  <p className="text-xs text-muted">{exp.submitter} · {exp.dept} · {exp.date}</p>
                </div>
                <span className={`badge badge-sm ${STATUS_CONFIG[exp.status]?.class}`}>{exp.status}</span>
                <span className="font-semibold" style={{ color: 'var(--text-title)', minWidth: 100, textAlign: 'right' }}>{formatCurrency(exp.amount)}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleReject(exp.id)}>
                    <ThumbsDown size={12} /> Reject
                  </button>
                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleApprove(exp.id)}>
                    <ThumbsUp size={12} /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div className="finance-filter-bar">
          <div className="finance-search-box">
            <Search size={14} />
            <input type="text" className="form-input" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" style={{ width: 'auto' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="form-input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="export-btn-group ml-auto">
            <button className="export-btn"><Download size={13} /> Export</button>
          </div>
        </div>
      </div>

      {/* Expense Breakdown by Type */}
      <div className="card">
        <div className="card-title">Expense by Category</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {metrics.byType.map(t => (
            <div key={t.type} style={{
              padding: '10px 16px', borderRadius: 'var(--radius-md)',
              background: `${TYPE_COLORS[t.type]}15`, border: `1px solid ${TYPE_COLORS[t.type]}30`,
              display: 'flex', flexDirection: 'column', gap: 2, minWidth: 140
            }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: TYPE_COLORS[t.type], fontWeight: 700 }}>{t.type}</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-title)' }}>{formatCurrency(t.total)}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.count} expenses</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card table-container" style={{ padding: 0 }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th><th>Title</th><th>Type</th><th>Submitter</th><th>Dept</th>
              <th>Amount</th><th>Date</th><th>Receipt</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(exp => {
              const cfg = STATUS_CONFIG[exp.status] || {};
              const StatusIcon = cfg.icon || Clock;
              return (
                <tr key={exp.id}>
                  <td><span className="font-mono text-xs" style={{ color: 'var(--brand-cyan)' }}>{exp.id}</span></td>
                  <td className="font-semibold text-sm">{exp.title}</td>
                  <td>
                    <span className="badge badge-sm" style={{ background: `${TYPE_COLORS[exp.type]}15`, color: TYPE_COLORS[exp.type], borderColor: `${TYPE_COLORS[exp.type]}30` }}>{exp.type}</span>
                  </td>
                  <td className="text-sm">{exp.submitter}</td>
                  <td className="text-xs text-muted">{exp.dept}</td>
                  <td className="font-semibold">{formatCurrency(exp.amount)}</td>
                  <td className="text-xs text-muted">{exp.date}</td>
                  <td>
                    {exp.receipt
                      ? <span className="badge badge-success badge-sm"><CheckCircle size={9} /> Yes</span>
                      : <span className="badge badge-danger badge-sm"><AlertCircle size={9} /> No</span>}
                  </td>
                  <td>
                    <span className={`badge badge-sm ${cfg.class}`} style={{ gap: 4 }}>
                      <StatusIcon size={10} /> {exp.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      {['Submitted', 'Under Review'].includes(exp.status) && (
                        <>
                          <button className="btn-icon" onClick={() => handleApprove(exp.id)} title="Approve"><ThumbsUp size={13} style={{ color: 'var(--success)' }} /></button>
                          <button className="btn-icon" onClick={() => handleReject(exp.id)} title="Reject"><ThumbsDown size={13} style={{ color: 'var(--error)' }} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Submit Expense Modal */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit Expense</h2>
              <button className="btn-icon" onClick={() => setShowSubmitModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Expense Title *</label>
                <input type="text" className="form-input" required value={newExpense.title}
                  onChange={e => setNewExpense(p => ({ ...p, title: e.target.value }))} placeholder="E.g. Client meeting lunch" />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Type *</label>
                  <select className="form-input" value={newExpense.type} onChange={e => setNewExpense(p => ({ ...p, type: e.target.value }))}>
                    {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Department</label>
                  <input type="text" className="form-input" value={newExpense.dept}
                    onChange={e => setNewExpense(p => ({ ...p, dept: e.target.value }))} placeholder="Sales, Engineering..." />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Amount (GH₵) *</label>
                  <input type="number" className="form-input" required min={0} step="0.01" value={newExpense.amount}
                    onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date *</label>
                  <input type="date" className="form-input" required value={newExpense.date}
                    onChange={e => setNewExpense(p => ({ ...p, date: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-input" rows={2} value={newExpense.notes}
                  onChange={e => setNewExpense(p => ({ ...p, notes: e.target.value }))} placeholder="Additional context..." />
              </div>
              <div className="form-group">
                <label>Receipt</label>
                <div style={{
                  border: '2px dashed var(--border-light)', borderRadius: 'var(--radius-md)',
                  padding: '24px', textAlign: 'center', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
                }}>
                  <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click to upload receipt (JPG, PNG, PDF)</p>
                  <input type="file" style={{ display: 'none' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSubmitModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Receipt size={14} /> Submit Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
