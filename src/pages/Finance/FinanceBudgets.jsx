import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Plus, X, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import { useBudgets } from '../../hooks/useCrmData';
import './Finance.css';

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1E293B', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: '#64748B', fontWeight: 700, marginBottom: 6, fontSize: 10, textTransform: 'uppercase' }}>{label}</p>
        {payload.map((e, i) => <p key={i} style={{ color: e.color }}>{e.name}: {formatCurrency(e.value)}</p>)}
      </div>
    );
  }
  return null;
};

const BUDGET_COLORS = ['#38BDF8', '#6366F1', '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#FB923C', '#64748B'];

const EMPTY_BUDGET = {
  name: '',
  description: '',
  type: 'Departmental',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  totalAmount: '',
};

export default function FinanceBudgets() {
  const { budgets = [], isLoading, createBudget, updateBudget, deleteBudget } = useBudgets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBudget, setNewBudget] = useState(EMPTY_BUDGET);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Map API response fields → chart data
  // API returns: totalAmount, consumedAmount, remainingAmount, allocatedAmount
  const VARIANCE_DATA = budgets.map((b, i) => {
    const nameStr = b.name || '';
    const name = nameStr.split(' ').slice(0, 2).join(' ');
    const allocated = b.totalAmount || 0;
    const spent = b.consumedAmount || 0;
    return {
      name,
      Allocated: allocated,
      Spent: spent,
      Remaining: Math.max(0, allocated - spent),
      color: BUDGET_COLORS[i % BUDGET_COLORS.length],
    };
  });

  const totals = {
    allocated: budgets.reduce((s, b) => s + (b.totalAmount || 0), 0),
    spent: budgets.reduce((s, b) => s + (b.consumedAmount || 0), 0),
    remaining: budgets.reduce((s, b) => s + (b.remainingAmount || Math.max(0, (b.totalAmount || 0) - (b.consumedAmount || 0))), 0),
    exceeded: budgets.filter(b => (b.consumedAmount || 0) > (b.totalAmount || 0)).length,
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    // Guard: validate dates before sending
    if (!newBudget.startDate || !newBudget.endDate) {
      setFormError('Start date and end date are required.');
      return;
    }
    const startIso = new Date(newBudget.startDate + 'T00:00:00').toISOString();
    const endIso = new Date(newBudget.endDate + 'T23:59:59').toISOString();
    if (isNaN(Date.parse(startIso)) || isNaN(Date.parse(endIso))) {
      setFormError('Invalid date values. Please check start and end dates.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: newBudget.name,
        description: newBudget.description || null,
        type: newBudget.type,
        startDate: startIso,
        endDate: endIso,
        totalAmount: parseFloat(newBudget.totalAmount) || 0,
      };

      if (newBudget.id) {
        await updateBudget({ id: newBudget.id, data: payload });
      } else {
        await createBudget(payload);
      }
      setShowCreateModal(false);
      setNewBudget(EMPTY_BUDGET);
      setFormError('');
    } catch (err) {
      console.error(err);
      setFormError(
        err?.response?.data?.details ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        `Failed to ${newBudget.id ? 'update' : 'create'} budget. Please check all fields and try again.`
      );
    } finally {
      setSubmitting(false);
    }
  };
 
  const openEditModal = (budget) => {
    setNewBudget({
      id: budget.id,
      name: budget.name || '',
      description: budget.description || '',
      type: budget.type || 'Departmental',
      startDate: budget.startDate ? budget.startDate.slice(0, 10) : '',
      endDate: budget.endDate ? budget.endDate.slice(0, 10) : '',
      totalAmount: budget.totalAmount || '',
    });
    setShowCreateModal(true);
  };
 
  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38BDF8]"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Track budget allocation, spending, and variance across departments and projects</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setNewBudget(EMPTY_BUDGET); setShowCreateModal(true); }}>
            <Plus size={16} /><span>New Budget</span>
          </button>
        </div>
      </div>

      {/* Org-level Metrics */}
      <div className="finance-kpi-grid">
        {[
          { label: 'Total Budget Allocated', value: formatCurrency(totals.allocated), color: '#38BDF8', bg: 'rgba(1,253,246,0.1)' },
          { label: 'Total Spent (YTD)', value: formatCurrency(totals.spent), color: '#EF4444', bg: 'rgba(255,71,218,0.1)' },
          { label: 'Remaining Budget', value: formatCurrency(totals.remaining), color: '#10B981', bg: 'rgba(33,250,144,0.1)' },
          { label: 'Budgets Exceeded', value: `${totals.exceeded} dept/project`, color: '#F59E0B', bg: 'rgba(228,255,26,0.1)' },
        ].map(m => (
          <div key={m.label} className="finance-kpi-card card">
            <div className="finance-kpi-icon" style={{ background: m.bg, color: m.color }}>
              <TrendingUp size={20} />
            </div>
            <div className="finance-kpi-content">
              <span className="finance-kpi-label">{m.label}</span>
              <span className="finance-kpi-value" style={{ fontSize: 18 }}>{m.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="finance-charts-main">
        <div className="card">
          <div className="card-title">Budget vs Actual Spend</div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={VARIANCE_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Allocated" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Allocated" />
                <Bar dataKey="Spent" fill="#EF4444" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Budget Utilisation</div>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={budgets} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                  paddingAngle={2} dataKey="consumedAmount">
                  {budgets.map((b, i) => <Cell key={i} fill={BUDGET_COLORS[i % BUDGET_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [formatCurrency(v), 'Spent']}
                  contentStyle={{ background: '#1E293B', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {budgets.map((b, i) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: BUDGET_COLORS[i % BUDGET_COLORS.length], display: 'inline-block' }} />
                {(b.name || '').split(' ').slice(0, 2).join(' ')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Progress Cards */}
      <div className="card">
        <div className="card-title">Department & Project Budgets</div>
        {budgets.map((budget, i) => {
          const allocated = budget.totalAmount || 0;
          const spent = budget.consumedAmount || 0;
          const remaining = budget.remainingAmount ?? Math.max(0, allocated - spent);
          const pct = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
          const isExceeded = spent > allocated;
          const isWarning = pct >= 80 && !isExceeded;
          const barColor = BUDGET_COLORS[i % BUDGET_COLORS.length];
          return (
            <div key={budget.id} className="budget-progress-item">
              <div className="budget-progress-header">
                <div>
                  <span className="font-semibold text-sm">{budget.name}</span>
                  <span className="badge badge-sm badge-neutral ml-2" style={{ fontSize: 10 }}>{budget.type}</span>
                  {budget.budgetCode && (
                    <span className="font-mono text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{budget.budgetCode}</span>
                  )}
                  <span className="badge badge-sm ml-2" style={{
                    fontSize: 10,
                    background: budget.status === 'Active' ? 'rgba(33,250,144,0.15)' : 'rgba(98,116,150,0.15)',
                    color: budget.status === 'Active' ? 'var(--success)' : 'var(--text-muted)',
                  }}>{budget.status || 'Draft'}</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                  <span className="text-sm font-semibold" style={{ color: isExceeded ? 'var(--error)' : 'var(--text-title)' }}>
                    {formatCurrency(spent)} / {formatCurrency(allocated)}
                  </span>
                  <span className="text-xs text-muted">({pct}%)</span>
                  <button
                    onClick={() => openEditModal(budget)}
                    className="btn-icon" style={{ color: 'var(--text-main)' }} title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Delete this budget?')) deleteBudget(budget.id); }}
                    className="btn-icon" style={{ color: 'var(--error)' }} title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="budget-progress-bar-track">
                <div className="budget-progress-bar-fill" style={{
                  width: `${pct}%`,
                  background: isExceeded ? 'var(--error)' : isWarning ? 'var(--warning)' : barColor,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                <span>Remaining: {isExceeded
                  ? `Over by ${formatCurrency(spent - allocated)}`
                  : formatCurrency(remaining)}
                </span>
                <span>
                  {budget.startDate && budget.endDate
                    ? `${new Date(budget.startDate).toLocaleDateString()} – ${new Date(budget.endDate).toLocaleDateString()}`
                    : budget.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Budget Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{newBudget.id ? 'Edit Budget' : 'Create Budget'}</h2>
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
                <label>Budget Name *</label>
                <input type="text" className="form-input" required value={newBudget.name}
                  onChange={e => setNewBudget(p => ({ ...p, name: e.target.value }))}
                  placeholder="Q3 Marketing Budget, Engineering FY2026…" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows={2} value={newBudget.description}
                  onChange={e => setNewBudget(p => ({ ...p, description: e.target.value }))}
                  placeholder="Purpose of this budget…" />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Type</label>
                  <select className="form-input" value={newBudget.type}
                    onChange={e => setNewBudget(p => ({ ...p, type: e.target.value }))}>
                    <option value="Departmental">Departmental</option>
                    <option value="Project">Project</option>
                    <option value="Capital">Capital</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Total Amount (GH₵) *</label>
                  <input type="number" className="form-input" required min={0} step="0.01"
                    value={newBudget.totalAmount}
                    onChange={e => setNewBudget(p => ({ ...p, totalAmount: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Start Date *</label>
                  <input type="date" className="form-input" required value={newBudget.startDate}
                    onChange={e => setNewBudget(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>End Date *</label>
                  <input type="date" className="form-input" required value={newBudget.endDate}
                    onChange={e => setNewBudget(p => ({ ...p, endDate: e.target.value }))} />
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
                  <Plus size={14} />
                  {submitting ? 'Saving…' : (newBudget.id ? 'Save Changes' : 'Create Budget')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
