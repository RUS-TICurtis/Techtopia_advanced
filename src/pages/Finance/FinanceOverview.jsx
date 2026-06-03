import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  Clock, Sparkles, ArrowRight, FileText, CreditCard, Receipt,
  BarChart3, Zap, RefreshCw, ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import './Finance.css';

// ── Mock data (replaced by API once backend is connected) ─────────────────
const REVENUE_DATA = [
  { month: 'Jan', Revenue: 128000, Expenses: 42000, Profit: 86000 },
  { month: 'Feb', Revenue: 145000, Expenses: 38000, Profit: 107000 },
  { month: 'Mar', Revenue: 162000, Expenses: 51000, Profit: 111000 },
  { month: 'Apr', Revenue: 139000, Expenses: 44000, Profit: 95000 },
  { month: 'May', Revenue: 198000, Expenses: 58000, Profit: 140000 },
  { month: 'Jun', Revenue: 234000, Expenses: 62000, Profit: 172000 },
  { month: 'Jul', Revenue: 218000, Expenses: 55000, Profit: 163000 },
  { month: 'Aug', Revenue: 251000, Expenses: 67000, Profit: 184000 },
  { month: 'Sep', Revenue: 287000, Expenses: 72000, Profit: 215000 },
  { month: 'Oct', Revenue: 312000, Expenses: 80000, Profit: 232000 },
  { month: 'Nov', Revenue: 298000, Expenses: 75000, Profit: 223000 },
  { month: 'Dec', Revenue: 341000, Expenses: 88000, Profit: 253000 },
];

const EXPENSE_BREAKDOWN = [
  { name: 'Operations', value: 32, color: '#01FDF6' },
  { name: 'Payroll', value: 28, color: '#8A4FFF' },
  { name: 'Marketing', value: 18, color: '#FF47DA' },
  { name: 'Infrastructure', value: 12, color: '#21FA90' },
  { name: 'Travel', value: 6, color: '#E4FF1A' },
  { name: 'Other', value: 4, color: '#3772FF' },
];

const INVOICE_AGING = [
  { range: '0-30 days', amount: 145000, color: '#21FA90' },
  { range: '31-60 days', amount: 87000, color: '#E4FF1A' },
  { range: '61-90 days', amount: 43000, color: '#FF8C42' },
  { range: '90+ days', amount: 22000, color: '#FF47DA' },
];

const RECENT_TRANSACTIONS = [
  { id: 'TXN-001', client: 'Acme Corp', amount: 12500, type: 'payment', status: 'completed', time: '2 hours ago', gateway: 'Hubtel' },
  { id: 'TXN-002', client: 'BioGen Labs', amount: 34200, type: 'invoice', status: 'sent', time: '4 hours ago', gateway: null },
  { id: 'TXN-003', client: 'CyberPulse', amount: 8900, type: 'payment', status: 'pending', time: '6 hours ago', gateway: 'Paystack' },
  { id: 'TXN-004', client: 'DataVault Inc', amount: 21000, type: 'payment', status: 'completed', time: '1 day ago', gateway: 'Hubtel' },
  { id: 'TXN-005', client: 'EcoLogistics', amount: 5600, type: 'expense', status: 'approved', time: '1 day ago', gateway: null },
];

const AI_INSIGHTS = [
  { id: 1, type: 'warning', icon: AlertCircle, color: '#E4FF1A', text: 'Outstanding invoices above GH₵10,000 increased by 18% this month. 7 clients need follow-up.' },
  { id: 2, type: 'danger', icon: TrendingDown, color: '#FF47DA', text: 'Projected cashflow risk in 27 days due to delayed collections from 3 enterprise clients.' },
  { id: 3, type: 'info', icon: Sparkles, color: '#01FDF6', text: 'Subscription churn risk detected for 2 accounts. Recommend proactive outreach this week.' },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#0f1629', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: '#627496', fontWeight: 700, marginBottom: 4, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color, margin: '2px 0' }}>{entry.name}: {formatCurrency(entry.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function FinanceOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const kpiCards = [
    {
      label: 'Total Revenue (YTD)', value: formatCurrency(2713000), change: '+24.3%', up: true,
      icon: DollarSign, color: '#21FA90', bg: 'rgba(33,250,144,0.1)',
      sub: 'vs GH₵2.19M last year'
    },
    {
      label: 'Outstanding Invoices', value: formatCurrency(297000), change: '+18%', up: false,
      icon: FileText, color: '#E4FF1A', bg: 'rgba(228,255,26,0.1)',
      sub: '34 invoices pending'
    },
    {
      label: 'Collected This Month', value: formatCurrency(341000), change: '+12.7%', up: true,
      icon: CheckCircle, color: '#01FDF6', bg: 'rgba(1,253,246,0.1)',
      sub: 'Hubtel + Paystack'
    },
    {
      label: 'Total Expenses (YTD)', value: formatCurrency(732000), change: '+8.2%', up: false,
      icon: Receipt, color: '#FF47DA', bg: 'rgba(255,71,218,0.1)',
      sub: '28% operating ratio'
    },
  ];

  const quickActions = [
    { label: 'New Invoice', icon: FileText, path: '/finance/invoices', color: '#01FDF6' },
    { label: 'Record Payment', icon: CreditCard, path: '/finance/payments', color: '#21FA90' },
    { label: 'Submit Expense', icon: Receipt, path: '/finance/expenses', color: '#FF47DA' },
    { label: 'View Reports', icon: BarChart3, path: '/finance/reports', color: '#8A4FFF' },
    { label: 'AI Insights', icon: Sparkles, path: '/finance/ai-agent', color: '#E4FF1A' },
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance Overview</h1>
          <p className="page-subtitle">Real-time financial intelligence for Techtopia Corp · GH₵ · FY 2026</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setLoading(!loading)}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/finance/invoices')}>
            <FileText size={16} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="finance-kpi-grid">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="finance-kpi-card card">
              <div className="finance-kpi-icon" style={{ background: kpi.bg, color: kpi.color }}>
                <Icon size={22} />
              </div>
              <div className="finance-kpi-content">
                <span className="finance-kpi-label">{kpi.label}</span>
                <span className="finance-kpi-value">{kpi.value}</span>
                <div className="finance-kpi-meta">
                  <span className={`finance-kpi-change ${kpi.up ? 'up' : 'down'}`}>
                    {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {kpi.change}
                  </span>
                  <span className="finance-kpi-sub">{kpi.sub}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Grid */}
      <div className="finance-charts-main">
        {/* Revenue vs Expenses Chart */}
        <div className="card finance-chart-primary">
          <div className="card-title">
            Revenue & Expenses — FY 2026
            <div className="flex gap-3">
              <span className="finance-legend-dot" style={{ background: '#01FDF6' }}>Revenue</span>
              <span className="finance-legend-dot" style={{ background: '#FF47DA' }}>Expenses</span>
              <span className="finance-legend-dot" style={{ background: '#21FA90' }}>Profit</span>
            </div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#01FDF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#01FDF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF47DA" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF47DA" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#21FA90" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#21FA90" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#3d4e6b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#3d4e6b" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Revenue" stroke="#01FDF6" strokeWidth={2} fill="url(#gradRev)" name="Revenue" />
                <Area type="monotone" dataKey="Expenses" stroke="#FF47DA" strokeWidth={2} fill="url(#gradExp)" name="Expenses" />
                <Area type="monotone" dataKey="Profit" stroke="#21FA90" strokeWidth={2} fill="url(#gradProfit)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie */}
        <div className="card">
          <div className="card-title">Expense Breakdown</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={EXPENSE_BREAKDOWN} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {EXPENSE_BREAKDOWN.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v}%`, name]}
                  contentStyle={{ background: '#0f1629', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="finance-pie-legend">
            {EXPENSE_BREAKDOWN.map(item => (
              <div key={item.name} className="finance-pie-legend-item">
                <span className="finance-pie-dot" style={{ background: item.color }} />
                <span>{item.name}</span>
                <span className="ml-auto font-semibold" style={{ color: item.color }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Aging & Quick Actions Row */}
      <div className="finance-secondary-grid">
        {/* Invoice Aging Bar Chart */}
        <div className="card">
          <div className="card-title">
            Invoice Aging Report
            <button className="btn btn-secondary text-xs py-1 px-3" onClick={() => navigate('/finance/invoices')}>
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INVOICE_AGING} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="range" stroke="#3d4e6b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#3d4e6b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid #222', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [formatCurrency(v), 'Outstanding']} />
                {INVOICE_AGING.map((entry, i) => (
                  <Bar key={i} dataKey="amount" fill={entry.color} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-title" style={{ fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Quick Actions
          </div>
          <div className="finance-quick-actions">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button key={action.label} className="finance-quick-action-btn" onClick={() => navigate(action.path)}>
                  <div className="finance-quick-action-icon" style={{ color: action.color, background: `${action.color}18` }}>
                    <Icon size={18} />
                  </div>
                  <span>{action.label}</span>
                  <ArrowRight size={14} className="ml-auto opacity-40" />
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Finance Insights */}
        <div className="card">
          <div className="card-title">
            <span className="flex items-center gap-2"><Sparkles size={16} style={{ color: '#01FDF6' }} /> AI Finance Insights</span>
            <button className="btn btn-secondary text-xs py-1 px-3" onClick={() => navigate('/finance/ai-agent')}>
              Ask AI <ArrowRight size={12} />
            </button>
          </div>
          <div className="finance-ai-insights">
            {AI_INSIGHTS.map(insight => {
              const Icon = insight.icon;
              return (
                <div key={insight.id} className="finance-ai-insight-card" style={{ borderLeftColor: insight.color }}>
                  <Icon size={16} style={{ color: insight.color, flexShrink: 0, marginTop: 2 }} />
                  <p>{insight.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-title">
          Recent Transactions
          <button className="btn btn-secondary text-xs py-1 px-3" onClick={() => navigate('/finance/payments')}>
            View All <ChevronRight size={12} />
          </button>
        </div>
        <div className="table-container" style={{ borderRadius: 'var(--radius-md)' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Client</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Gateway</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_TRANSACTIONS.map(txn => (
                <tr key={txn.id}>
                  <td className="font-mono text-xs" style={{ color: 'var(--brand-cyan)' }}>{txn.id}</td>
                  <td className="font-semibold">{txn.client}</td>
                  <td>
                    <span className="badge badge-neutral badge-sm" style={{ textTransform: 'capitalize' }}>{txn.type}</span>
                  </td>
                  <td className="font-semibold">{formatCurrency(txn.amount)}</td>
                  <td>{txn.gateway ? (
                    <span className="badge badge-info badge-sm">{txn.gateway}</span>
                  ) : <span className="text-muted text-xs">—</span>}</td>
                  <td>
                    <span className={`badge badge-sm ${
                      txn.status === 'completed' ? 'badge-success' :
                      txn.status === 'pending' ? 'badge-warning' :
                      txn.status === 'sent' ? 'badge-info' : 'badge-neutral'
                    }`}>{txn.status}</span>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{txn.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
