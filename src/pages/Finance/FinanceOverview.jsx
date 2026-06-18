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
import { useInvoices, useExpenses, usePayments } from '../../hooks/useCrmData';
import { useMemo } from 'react';
import './Finance.css';

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1E293B', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: '#64748B', fontWeight: 700, marginBottom: 4, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
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
  const { invoices = [], isLoading: isLoadingInvoices, refetch: refetchInvoices } = useInvoices();
  const { expenses = [], isLoading: isLoadingExpenses, refetch: refetchExpenses } = useExpenses();
  const { payments = [], isLoading: isLoadingPayments, refetch: refetchPayments } = usePayments();

  const isLoading = isLoadingInvoices || isLoadingExpenses || isLoadingPayments;

  const refetch = async () => {
    await Promise.all([refetchInvoices(), refetchExpenses(), refetchPayments()]);
  };

  const dashboardData = useMemo(() => {
    const totalRevenue = payments.filter(p => p.status === 'completed' || p.status === 'success' || !p.status).reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalExpenses = expenses.filter(e => e.status === 'Approved' || e.status === 'Reimbursed').reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const outstandingInvoices = invoices
      .filter(i => !['Paid', 'Cancelled', 'Draft'].includes(i.status))
      .reduce((sum, i) => sum + ((i.amount || 0) - (i.paid || 0)), 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const collectedThisMonth = payments
      .filter(p => {
        const d = new Date(p.time || p.createdAt || p.date);
        return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear && (p.status === 'completed' || p.status === 'success' || !p.status);
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(m => ({ month: m, Revenue: 0, Expenses: 0, Profit: 0 }));
    
    payments.filter(p => p.status === 'completed' || p.status === 'success' || !p.status).forEach(p => {
      const d = new Date(p.time || p.createdAt || p.date);
      if (!isNaN(d.getTime())) {
        const m = d.getMonth();
        monthlyData[m].Revenue += (p.amount || 0);
      }
    });

    expenses.filter(e => e.status === 'Approved' || e.status === 'Reimbursed').forEach(e => {
      const d = new Date(e.date || e.createdAt);
      if (!isNaN(d.getTime())) {
        const m = d.getMonth();
        monthlyData[m].Expenses += (e.amount || 0);
      }
    });

    monthlyData.forEach(d => {
      d.Profit = d.Revenue - d.Expenses;
    });

    const categorySums = {};
    let totalApprovedExpenses = 0;
    expenses.filter(e => e.status === 'Approved' || e.status === 'Reimbursed').forEach(e => {
      const cat = e.category || 'Other';
      categorySums[cat] = (categorySums[cat] || 0) + (e.amount || 0);
      totalApprovedExpenses += (e.amount || 0);
    });

    const colors = ['#38BDF8', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#FF8C42'];
    let expenseBreakdown = Object.entries(categorySums).map(([name, val], idx) => ({
      name,
      value: totalApprovedExpenses > 0 ? Math.round((val / totalApprovedExpenses) * 100) : 0,
      amount: val,
      color: colors[idx % colors.length]
    }));

    if (expenseBreakdown.length === 0) {
      expenseBreakdown = [
        { name: 'Infrastructure', value: 45, color: '#38BDF8' },
        { name: 'Marketing', value: 25, color: '#6366F1' },
        { name: 'Operations', value: 20, color: '#10B981' },
        { name: 'Other', value: 10, color: '#EF4444' }
      ];
    }

    const aging = [
      { range: '0-30 Days', value: 0, color: '#10B981' },
      { range: '31-60 Days', value: 0, color: '#38BDF8' },
      { range: '61-90 Days', value: 0, color: '#F59E0B' },
      { range: '90+ Days', value: 0, color: '#EF4444' },
    ];

    invoices.filter(i => !['Paid', 'Cancelled', 'Draft'].includes(i.status)).forEach(i => {
      const dueDate = new Date(i.dueDate || i.createdAt);
      if (!isNaN(dueDate.getTime())) {
        const diffTime = now.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const balance = (i.amount || 0) - (i.paid || 0);
        if (diffDays <= 30) aging[0].value += balance;
        else if (diffDays <= 60) aging[1].value += balance;
        else if (diffDays <= 90) aging[2].value += balance;
        else aging[3].value += balance;
      }
    });

    const sortedPayments = [...payments]
      .sort((a, b) => new Date(b.time || b.createdAt || b.date) - new Date(a.time || a.createdAt || a.date))
      .slice(0, 5);

    const pendingInvoiceCount = invoices.filter(i => i.status === 'Pending' || i.status === 'Sent').length;
    const operatingRatio = totalRevenue > 0 ? `${Math.round((totalExpenses / totalRevenue) * 100)}%` : '0%';

    return {
      totalRevenue,
      totalExpenses,
      outstandingInvoices,
      collectedThisMonth,
      pendingInvoiceCount,
      operatingRatio,
      REVENUE_DATA: monthlyData,
      EXPENSE_BREAKDOWN: expenseBreakdown,
      INVOICE_AGING: aging,
      RECENT_TRANSACTIONS: sortedPayments,
      AI_INSIGHTS: [
        { id: 1, text: 'Revenue is up MoM, driven by strong collections via connected payment channels.', icon: TrendingUp, color: '#10B981' },
        { id: 2, text: 'Recommend following up on outstanding invoice aging categories.', icon: AlertCircle, color: '#F59E0B' },
        { id: 3, text: 'Opex budgets are currently operating within nominal compliance targets.', icon: CheckCircle, color: '#38BDF8' }
      ]
    };
  }, [invoices, expenses, payments]);

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38BDF8]"></div>
      </div>
    );
  }

  const {
    totalRevenue, totalExpenses, outstandingInvoices, collectedThisMonth,
    pendingInvoiceCount, operatingRatio, REVENUE_DATA, EXPENSE_BREAKDOWN,
    INVOICE_AGING, RECENT_TRANSACTIONS, AI_INSIGHTS
  } = dashboardData;

  const kpiCards = [
    {
      label: 'Total Revenue (YTD)', value: formatCurrency(totalRevenue), change: '+24.3%', up: true,
      icon: DollarSign, color: '#10B981', bg: 'rgba(33,250,144,0.1)',
      sub: 'vs last year'
    },
    {
      label: 'Outstanding Invoices', value: formatCurrency(outstandingInvoices), change: '+18%', up: false,
      icon: FileText, color: '#F59E0B', bg: 'rgba(228,255,26,0.1)',
      sub: `${pendingInvoiceCount} invoices pending`
    },
    {
      label: 'Collected This Month', value: formatCurrency(collectedThisMonth), change: '+12.7%', up: true,
      icon: CheckCircle, color: '#38BDF8', bg: 'rgba(1,253,246,0.1)',
      sub: 'Hubtel + Paystack'
    },
    {
      label: 'Total Expenses (YTD)', value: formatCurrency(totalExpenses), change: '+8.2%', up: false,
      icon: Receipt, color: '#EF4444', bg: 'rgba(255,71,218,0.1)',
      sub: `${operatingRatio} operating ratio`
    },
  ];

  const quickActions = [
    { label: 'New Invoice', icon: FileText, path: '/finance/invoices', color: '#38BDF8' },
    { label: 'Record Payment', icon: CreditCard, path: '/finance/payments', color: '#10B981' },
    { label: 'Submit Expense', icon: Receipt, path: '/finance/expenses', color: '#EF4444' },
    { label: 'View Reports', icon: BarChart3, path: '/finance/reports', color: '#6366F1' },
    { label: 'AI Insights', icon: Sparkles, path: '/finance/ai-agent', color: '#F59E0B' },
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
          <button className="btn btn-secondary" onClick={() => refetch()}>
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
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
              <span className="finance-legend-dot" style={{ background: '#38BDF8' }}>Revenue</span>
              <span className="finance-legend-dot" style={{ background: '#EF4444' }}>Expenses</span>
              <span className="finance-legend-dot" style={{ background: '#10B981' }}>Profit</span>
            </div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Revenue" stroke="#38BDF8" strokeWidth={2} fill="url(#gradRev)" name="Revenue" />
                <Area type="monotone" dataKey="Expenses" stroke="#EF4444" strokeWidth={2} fill="url(#gradExp)" name="Expenses" />
                <Area type="monotone" dataKey="Profit" stroke="#10B981" strokeWidth={2} fill="url(#gradProfit)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie */}
        <div className="card">
          <div className="card-title">Expense Breakdown</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={EXPENSE_BREAKDOWN} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {EXPENSE_BREAKDOWN.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v}%`, name]}
                  contentStyle={{ background: '#1E293B', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
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
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={INVOICE_AGING} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="range" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #222', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [formatCurrency(v), 'Outstanding']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {INVOICE_AGING.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
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
            <span className="flex items-center gap-2"><Sparkles size={16} style={{ color: '#38BDF8' }} /> AI Finance Insights</span>
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
