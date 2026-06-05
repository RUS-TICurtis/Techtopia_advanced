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
      <div style={{ background: '#0f1629', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: '#627496', fontWeight: 700, marginBottom: 6, fontSize: 10, textTransform: 'uppercase' }}>{label}</p>
        {payload.map((e, i) => <p key={i} style={{ color: e.color }}>{e.name}: {formatCurrency(e.value)}</p>)}
      </div>
    );
  }
  return null;
};

const EMPTY_BUDGET = { name: '', type: 'Department', allocated: '', period: 'FY 2026', threshold: 80 };

export default function FinanceBudgets() {
  const { budgets, isLoading, createBudget, deleteBudget } = useBudgets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBudget, setNewBudget] = useState(EMPTY_BUDGET);

  const VARIANCE_DATA = budgets.map(b => ({
    name: b.name.split(' ').slice(0, 2).join(' '),
    Allocated: b.allocated,
    Spent: b.spent,
    Remaining: Math.max(0, b.allocated - b.spent),
  }));

  const totals = {
    allocated: budgets.reduce((s, b) => s + b.allocated, 0),
    spent: budgets.reduce((s, b) => s + b.spent, 0),
    remaining: budgets.reduce((s, b) => s + Math.max(0, b.allocated - b.spent), 0),
    exceeded: budgets.filter(b => b.spent > b.allocated).length,
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createBudget({
        name: newBudget.name,
        type: newBudget.type,
        allocated: parseFloat(newBudget.allocated) || 0,
        period: newBudget.period,
        spent: 0,
        alerts: []
      });
      setShowCreateModal(false);
      setNewBudget(EMPTY_BUDGET);
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
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Track budget allocation, spending, and variance across departments and projects</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /><span>New Budget</span>
          </button>
        </div>
      </div>

      {/* Org-level Metrics */}
      <div className="finance-kpi-grid">
        {[
          { label: 'Total Budget Allocated', value: formatCurrency(totals.allocated), color: '#01FDF6', bg: 'rgba(1,253,246,0.1)' },
          { label: 'Total Spent (YTD)', value: formatCurrency(totals.spent), color: '#FF47DA', bg: 'rgba(255,71,218,0.1)' },
          { label: 'Remaining Budget', value: formatCurrency(totals.remaining), color: '#21FA90', bg: 'rgba(33,250,144,0.1)' },
          { label: 'Budgets Exceeded', value: `${totals.exceeded} dept/project`, color: '#E4FF1A', bg: 'rgba(228,255,26,0.1)' },
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VARIANCE_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="#3d4e6b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#3d4e6b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Allocated" fill="#3772FF" radius={[4, 4, 0, 0]} name="Allocated" />
                <Bar dataKey="Spent" fill="#FF47DA" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Budget Utilisation</div>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={budgets} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                  paddingAngle={2} dataKey="spent">
                  {budgets.map((b, i) => <Cell key={i} fill={b.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [formatCurrency(v), 'Spent']}
                  contentStyle={{ background: '#0f1629', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {budgets.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, display: 'inline-block' }} />
                {b.name.split(' ').slice(0, 2).join(' ')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Progress Cards */}
      <div className="card">
        <div className="card-title">Department & Project Budgets</div>
        {budgets.map(budget => {
          const pct = Math.min(100, Math.round((budget.spent / budget.allocated) * 100));
          const isExceeded = budget.spent > budget.allocated;
          const isWarning = pct >= 80 && !isExceeded;
          return (
            <div key={budget.id} className="budget-progress-item">
              <div className="budget-progress-header">
                <div>
                  <span className="font-semibold text-sm">{budget.name}</span>
                  <span className="badge badge-sm badge-neutral ml-2" style={{ fontSize: 10 }}>{budget.type}</span>
                  {budget.alerts && budget.alerts.length > 0 && (
                    <span className="ml-2" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: isExceeded ? 'var(--error)' : 'var(--warning)' }}>
                      <AlertTriangle size={11} /> {budget.alerts[0]}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                  <span className="text-sm font-semibold" style={{ color: isExceeded ? 'var(--error)' : 'var(--text-title)' }}>
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                  </span>
                  <span className="text-xs text-muted">({pct}%)</span>
                  <button onClick={() => { if(window.confirm('Delete this budget?')) deleteBudget(budget.id) }} className="btn-icon" style={{ color: 'var(--error)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="budget-progress-bar-track">
                <div className="budget-progress-bar-fill" style={{
                  width: `${pct}%`,
                  background: isExceeded ? 'var(--error)' : isWarning ? 'var(--warning)' : budget.color,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                <span>Remaining: {isExceeded ? `Over by ${formatCurrency(budget.spent - budget.allocated)}` : formatCurrency(budget.allocated - budget.spent)}</span>
                <span>{budget.period}</span>
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
              <h2>Create Budget</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-group">
                <label>Budget Name *</label>
                <input type="text" className="form-input" required value={newBudget.name}
                  onChange={e => setNewBudget(p => ({ ...p, name: e.target.value }))} placeholder="Engineering Department" />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Type</label>
                  <select className="form-input" value={newBudget.type} onChange={e => setNewBudget(p => ({ ...p, type: e.target.value }))}>
                    <option>Department</option><option>Project</option><option>Organization</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Period</label>
                  <input type="text" className="form-input" value={newBudget.period}
                    onChange={e => setNewBudget(p => ({ ...p, period: e.target.value }))} placeholder="FY 2026, Q3 2026..." />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Allocated Amount (GH₵) *</label>
                  <input type="number" className="form-input" required min={0} value={newBudget.allocated}
                    onChange={e => setNewBudget(p => ({ ...p, allocated: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Alert Threshold (%)</label>
                  <input type="number" className="form-input" min={0} max={100} value={newBudget.threshold}
                    onChange={e => setNewBudget(p => ({ ...p, threshold: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={14} /> Create Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
