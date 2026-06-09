import React, { useState, useMemo } from 'react';
import {
  Receipt, Plus, Search, CheckCircle, Clock, X,
  ThumbsUp, ThumbsDown, Download, Send, Trash2
} from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import './Finance.css';
import { useExpenses } from '../../hooks/useCrmData';

const STATUS_CONFIG = {
  Draft:           { class: 'badge-neutral',  icon: Clock,       label: 'Draft' },
  Submitted:       { class: 'badge-warning',  icon: Clock,       label: 'Submitted' },
  PendingApproval: { class: 'badge-info',     icon: Clock,       label: 'Pending Approval' },
  Approved:        { class: 'badge-success',  icon: CheckCircle, label: 'Approved' },
  Rejected:        { class: 'badge-danger',   icon: X,           label: 'Rejected' },
  Paid:            { class: 'badge-success',  icon: CheckCircle, label: 'Paid' },
  Cancelled:       { class: 'badge-neutral',  icon: X,           label: 'Cancelled' },
};

const CURRENCIES = ['GHS', 'USD', 'EUR', 'GBP', 'NGN'];

const EMPTY_EXPENSE = {
  categoryId: '',
  vendorId: '',
  expenseDate: new Date().toISOString().slice(0, 10),
  amount: '',
  currency: 'GHS',
  description: '',
};

export default function FinanceExpenses() {
  const {
    expenses = [],
    categories = [],
    isLoading,
    createExpense,
    submitExpense,
    approveExpense,
    rejectExpense,
    deleteExpense,
  } = useExpenses();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalView, setShowApprovalView] = useState(false);
  const [newExpense, setNewExpense] = useState(EMPTY_EXPENSE);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const metrics = useMemo(() => ({
    total: expenses.reduce((s, e) => s + (e.amount || 0), 0),
    pending: expenses
      .filter(e => ['PendingApproval', 'Submitted'].includes(e.status))
      .reduce((s, e) => s + (e.amount || 0), 0),
    approved: expenses
      .filter(e => ['Approved', 'Paid'].includes(e.status))
      .reduce((s, e) => s + (e.amount || 0), 0),
    draft: expenses.filter(e => e.status === 'Draft').length,
  }), [expenses]);

  const filtered = useMemo(() => expenses.filter(e => {
    const matchSearch = !search
      || (e.description || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchStatus;
  }), [expenses, search, statusFilter]);

  const pendingApprovals = useMemo(
    () => expenses.filter(e => e.status === 'PendingApproval'),
    [expenses]
  );

  const handleApprove = async (id) => {
    try {
      await approveExpense({ id, data: { decision: 'Approved', comment: 'Approved.' } });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.details || err?.response?.data?.error || 'Failed to approve expense.');
    }
  };

  const handleReject = async (id) => {
    const comment = window.prompt('Reason for rejection (required):');
    if (!comment || !comment.trim()) {
      if (comment !== null) alert('A rejection comment is required.');
      return;
    }
    try {
      await rejectExpense({ id, data: { decision: 'Rejected', comment: comment.trim() } });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.details || err?.response?.data?.error || 'Failed to reject expense.');
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await submitExpense(id);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.details || err?.response?.data?.error || 'Failed to submit expense.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense? This cannot be undone.')) return;
    try {
      await deleteExpense(id);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.details || err?.response?.data?.error || 'Failed to delete expense.');
    }
  };

  const handleCreate = async (ev) => {
    ev.preventDefault();
    setFormError('');
    setSubmitting(true);
    // POST /api/v1/finance/expenses
    const payload = {
      categoryId: newExpense.categoryId || null,
      vendorId: newExpense.vendorId || null,
      projectId: null,
      opportunityId: null,
      expenseDate: new Date(newExpense.expenseDate).toISOString(),
      amount: parseFloat(newExpense.amount) || 0,
      currency: newExpense.currency || 'GHS',
      description: newExpense.description,
    };
    try {
      await createExpense(payload);
      setShowCreateModal(false);
      setNewExpense(EMPTY_EXPENSE);
    } catch (err) {
      console.error(err);
      setFormError(
        err?.response?.data?.details ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to create expense.'
      );
    } finally {
      setSubmitting(false);
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
          <p className="page-subtitle">Submit, track, and approve expenses across the organisation</p>
        </div>
        <div className="page-actions">
          {pendingApprovals.length > 0 && (
            <button className="btn btn-secondary" onClick={() => setShowApprovalView(!showApprovalView)}>
              <Clock size={16} />
              <span>Approvals ({pendingApprovals.length})</span>
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /><span>New Expense</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="finance-kpi-grid">
        {[
          { label: 'Total Expenses (MTD)', value: formatCurrency(metrics.total), color: '#FF47DA', bg: 'rgba(255,71,218,0.1)' },
          { label: 'Pending Approval', value: formatCurrency(metrics.pending), color: '#E4FF1A', bg: 'rgba(228,255,26,0.1)' },
          { label: 'Approved & Paid', value: formatCurrency(metrics.approved), color: '#21FA90', bg: 'rgba(33,250,144,0.1)' },
          { label: 'Draft Expenses', value: `${metrics.draft} items`, color: '#8A4FFF', bg: 'rgba(138,79,255,0.1)' },
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
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} style={{ color: '#E4FF1A' }} /> Pending Approvals
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingApprovals.map(exp => (
              <div key={exp.id} className="po-card">
                <div style={{ flex: 1 }}>
                  <p className="font-semibold text-sm">{exp.description || '—'}</p>
                  <p className="text-xs text-muted">
                    {exp.currency} &middot; {exp.expenseDate
                      ? new Date(exp.expenseDate).toLocaleDateString()
                      : new Date(exp.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="badge badge-sm badge-info">Pending Approval</span>
                <span className="font-semibold" style={{ color: 'var(--text-title)', minWidth: 110, textAlign: 'right' }}>
                  {formatCurrency(exp.amount, exp.currency)}
                </span>
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
            <input
              type="text" className="form-input"
              placeholder="Search by description..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <div className="export-btn-group" style={{ marginLeft: 'auto' }}>
            <button className="export-btn"><Download size={13} /> Export</button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card table-container" style={{ padding: 0 }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Expense Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(exp => {
              const cfg = STATUS_CONFIG[exp.status] || { class: 'badge-neutral', icon: Clock, label: exp.status };
              const StatusIcon = cfg.icon;
              return (
                <tr key={exp.id}>
                  <td>
                    <span className="font-mono text-xs" style={{ color: 'var(--brand-cyan)' }}>
                      {exp.expenseCode || String(exp.id).slice(0, 8)}
                    </span>
                  </td>
                  <td className="font-semibold text-sm">{exp.description || '—'}</td>
                  <td className="font-semibold">{formatCurrency(exp.amount, exp.currency)}</td>
                  <td className="text-xs text-muted">{exp.currency || 'GHS'}</td>
                  <td className="text-xs text-muted">
                    {exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <span className={`badge badge-sm ${cfg.class}`} style={{ gap: 4 }}>
                      <StatusIcon size={10} /> {cfg.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      {exp.status === 'Draft' && (
                        <>
                          <button
                            className="btn-icon" title="Submit for Approval"
                            onClick={() => handleSubmitForApproval(exp.id)}
                          >
                            <Send size={13} style={{ color: 'var(--info)' }} />
                          </button>
                          <button className="btn-icon" title="Delete" onClick={() => handleDelete(exp.id)}>
                            <Trash2 size={13} style={{ color: 'var(--error)' }} />
                          </button>
                        </>
                      )}
                      {exp.status === 'PendingApproval' && (
                        <>
                          <button className="btn-icon" title="Approve" onClick={() => handleApprove(exp.id)}>
                            <ThumbsUp size={13} style={{ color: 'var(--success)' }} />
                          </button>
                          <button className="btn-icon" title="Reject" onClick={() => handleReject(exp.id)}>
                            <ThumbsDown size={13} style={{ color: 'var(--error)' }} />
                          </button>
                        </>
                      )}
                      {['Rejected', 'Cancelled'].includes(exp.status) && (
                        <button className="btn-icon" title="Delete" onClick={() => handleDelete(exp.id)}>
                          <Trash2 size={13} style={{ color: 'var(--error)' }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="finance-empty-state">
                    <Receipt size={40} />
                    <h3>No expenses found</h3>
                    <p>Create a new expense to get started. Drafts can be submitted for approval later.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Expense Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Expense</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              {formError && (
                <div style={{
                  background: 'rgba(255,71,71,0.1)', border: '1px solid var(--error)',
                  borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 16,
                  fontSize: 13, color: 'var(--error)'
                }}>
                  {formError}
                </div>
              )}
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text" className="form-input" required
                  value={newExpense.description}
                  onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))}
                  placeholder="E.g. Team lunch, cloud subscription, office supplies..."
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  {categories.length > 0 ? (
                    <select
                      className="form-input"
                      value={newExpense.categoryId}
                      onChange={e => setNewExpense(p => ({ ...p, categoryId: e.target.value }))}
                    >
                      <option value="">Select category…</option>
                      {categories.map(cat => (
                        <option key={cat.id ?? cat} value={cat.id ?? cat}>
                          {cat.name ?? cat}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text" className="form-input"
                      placeholder="Category ID (UUID) — optional"
                      value={newExpense.categoryId}
                      onChange={e => setNewExpense(p => ({ ...p, categoryId: e.target.value }))}
                    />
                  )}
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Currency</label>
                  <select
                    className="form-input"
                    value={newExpense.currency}
                    onChange={e => setNewExpense(p => ({ ...p, currency: e.target.value }))}
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Amount ({newExpense.currency}) *</label>
                  <input
                    type="number" className="form-input" required min={0} step="0.01"
                    value={newExpense.amount}
                    onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Expense Date *</label>
                  <input
                    type="date" className="form-input" required
                    value={newExpense.expenseDate}
                    onChange={e => setNewExpense(p => ({ ...p, expenseDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button" className="btn btn-secondary"
                  onClick={() => { setShowCreateModal(false); setFormError(''); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <Receipt size={14} />
                  {submitting ? 'Creating…' : 'Create Expense (Draft)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
