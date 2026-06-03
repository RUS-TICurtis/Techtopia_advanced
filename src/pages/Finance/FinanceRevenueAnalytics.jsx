import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Filter, Download } from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import './Finance.css';

const MONTHLY_REVENUE = [
  { month: 'Jan', Revenue: 128000, Target: 140000 },
  { month: 'Feb', Revenue: 145000, Target: 145000 },
  { month: 'Mar', Revenue: 162000, Target: 150000 },
  { month: 'Apr', Revenue: 139000, Target: 155000 },
  { month: 'May', Revenue: 198000, Target: 160000 },
  { month: 'Jun', Revenue: 234000, Target: 165000 },
  { month: 'Jul', Revenue: 218000, Target: 170000 },
  { month: 'Aug', Revenue: 251000, Target: 175000 },
  { month: 'Sep', Revenue: 287000, Target: 180000 },
  { month: 'Oct', Revenue: 312000, Target: 185000 },
  { month: 'Nov', Revenue: 298000, Target: 190000 },
  { month: 'Dec', Revenue: 341000, Target: 195000 },
];

const REVENUE_BY_STREAM = [
  { name: 'Subscriptions', value: 1164250, color: '#01FDF6', pct: 43 },
  { name: 'Professional Services', value: 729000, color: '#8A4FFF', pct: 27 },
  { name: 'License Fees', value: 459000, color: '#21FA90', pct: 17 },
  { name: 'Support Contracts', value: 243000, color: '#FF47DA', pct: 9 },
  { name: 'Training', value: 108500, color: '#E4FF1A', pct: 4 },
];

const COHORT_DATA = [
  { cohort: 'Jan 2026', month1: 100, month2: 85, month3: 78, month4: 72, month5: 69, month6: 65 },
  { cohort: 'Feb 2026', month1: 100, month2: 88, month3: 82, month4: 77, month5: 74 },
  { cohort: 'Mar 2026', month1: 100, month2: 91, month3: 86, month4: 80 },
  { cohort: 'Apr 2026', month1: 100, month2: 87, month3: 83 },
  { cohort: 'May 2026', month1: 100, month2: 90 },
  { cohort: 'Jun 2026', month1: 100 },
];

const GROWTH_METRICS = [
  { month: 'Jan', ARR: 1542000, ARPU: 4550, Churn: 2.1, NRR: 112 },
  { month: 'Feb', ARR: 1621000, ARPU: 4620, Churn: 1.9, NRR: 114 },
  { month: 'Mar', ARR: 1780000, ARPU: 4780, Churn: 1.7, NRR: 118 },
  { month: 'Apr', ARR: 1845000, ARPU: 4820, Churn: 2.2, NRR: 115 },
  { month: 'May', ARR: 1990000, ARPU: 4950, Churn: 1.8, NRR: 119 },
  { month: 'Jun', ARR: 2134000, ARPU: 5100, Churn: 1.6, NRR: 122 },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#0f1629', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: '#627496', fontWeight: 700, marginBottom: 4, fontSize: 10, textTransform: 'uppercase' }}>{label}</p>
        {payload.map((e, i) => <p key={i} style={{ color: e.color || '#fff' }}>{e.name}: {typeof e.value === 'number' && e.value > 1000 ? formatCurrency(e.value) : e.value}{e.name === 'Churn' ? '%' : ''}</p>)}
      </div>
    );
  }
  return null;
};

export default function FinanceRevenueAnalytics() {
  const [period, setPeriod] = useState('FY 2026');
  const [activeMetric, setActiveMetric] = useState('revenue');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Revenue Analytics</h1>
          <p className="page-subtitle">Real-time revenue intelligence, growth metrics, and churn analysis · GH₵</p>
        </div>
        <div className="page-actions">
          <select className="form-input" style={{ width: 'auto' }} value={period} onChange={e => setPeriod(e.target.value)}>
            <option>FY 2026</option>
            <option>H1 2026</option>
            <option>Q2 2026</option>
            <option>Q1 2026</option>
          </select>
          <button className="btn btn-secondary"><Download size={16} /><span>Export</span></button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="finance-kpi-grid">
        {[
          { label: 'Annual Recurring Revenue', value: formatCurrency(2134000), change: '+38.3%', up: true, icon: DollarSign, color: '#01FDF6', bg: 'rgba(1,253,246,0.1)' },
          { label: 'Net Revenue Retention', value: '122%', change: '+7% vs Q1', up: true, icon: TrendingUp, color: '#21FA90', bg: 'rgba(33,250,144,0.1)' },
          { label: 'Avg Revenue Per User', value: formatCurrency(5100), change: '+12.1%', up: true, icon: Users, color: '#8A4FFF', bg: 'rgba(138,79,255,0.1)' },
          { label: 'Monthly Churn Rate', value: '1.6%', change: '-0.5% vs Q1', up: true, icon: TrendingDown, color: '#FF47DA', bg: 'rgba(255,71,218,0.1)' },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="finance-kpi-card card">
              <div className="finance-kpi-icon" style={{ background: m.bg, color: m.color }}><Icon size={20} /></div>
              <div className="finance-kpi-content">
                <span className="finance-kpi-label">{m.label}</span>
                <span className="finance-kpi-value" style={{ fontSize: 18 }}>{m.value}</span>
                <div className="finance-kpi-meta">
                  <span className={`finance-kpi-change ${m.up ? 'up' : 'down'}`}>
                    {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {m.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue vs Target */}
      <div className="card">
        <div className="card-title">
          Revenue vs Target — {period}
          <div style={{ display: 'flex', gap: 12 }}>
            <span className="finance-legend-dot" style={{ background: '#01FDF6' }}>Revenue</span>
            <span className="finance-legend-dot" style={{ background: '#627496' }}>Target</span>
          </div>
        </div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRev2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#01FDF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#01FDF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="#3d4e6b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#3d4e6b" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="Revenue" stroke="#01FDF6" strokeWidth={2.5} fill="url(#gradRev2)" name="Revenue" />
              <Line type="monotone" dataKey="Target" stroke="#627496" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Target" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Streams & Growth Metrics */}
      <div className="finance-charts-main">
        {/* Revenue by Stream */}
        <div className="card">
          <div className="card-title">Revenue by Stream</div>
          {REVENUE_BY_STREAM.map(stream => (
            <div key={stream.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: stream.color, display: 'inline-block' }} />
                  <span className="font-semibold">{stream.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="font-semibold" style={{ color: stream.color }}>{stream.pct}%</span>
                  <span className="text-muted ml-2" style={{ fontSize: 12 }}>{formatCurrency(stream.value)}</span>
                </div>
              </div>
              <div className="budget-progress-bar-track">
                <div className="budget-progress-bar-fill" style={{ width: `${stream.pct}%`, background: stream.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* ARR Growth */}
        <div className="card">
          <div className="card-title">ARR & NRR Trend</div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GROWTH_METRICS} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#3d4e6b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#3d4e6b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="ARR" fill="#8A4FFF" radius={[4, 4, 0, 0]} name="ARR" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Retention Cohort Heatmap */}
      <div className="card">
        <div className="card-title">
          Customer Retention Cohorts
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>% of customers retained by month</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Cohort</th>
                {['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map(m => (
                  <th key={m} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COHORT_DATA.map(row => (
                <tr key={row.cohort}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.cohort}</td>
                  {['month1', 'month2', 'month3', 'month4', 'month5', 'month6'].map(m => {
                    const val = row[m];
                    if (val === undefined) return <td key={m} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>—</td>;
                    const opacity = val / 100;
                    return (
                      <td key={m} style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '4px 10px', borderRadius: 4,
                          background: `rgba(33,250,144,${opacity * 0.6})`,
                          color: val > 80 ? '#21FA90' : val > 60 ? '#E4FF1A' : '#FF47DA',
                          fontWeight: 700,
                        }}>{val}%</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
