import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Filter, Download } from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import { useRevenueAnalytics } from '../../hooks/useCrmData';
import './Finance.css';

const COHORT_DATA = [
  { cohort: 'Jan 2026', month1: 100, month2: 85, month3: 78, month4: 72, month5: 69, month6: 65 },
  { cohort: 'Feb 2026', month1: 100, month2: 88, month3: 82, month4: 77, month5: 74 },
  { cohort: 'Mar 2026', month1: 100, month2: 91, month3: 86, month4: 80 },
  { cohort: 'Apr 2026', month1: 100, month2: 87, month3: 83 },
  { cohort: 'May 2026', month1: 100, month2: 90 },
  { cohort: 'Jun 2026', month1: 100 },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1E293B', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: '#64748B', fontWeight: 700, marginBottom: 4, fontSize: 10, textTransform: 'uppercase' }}>{label}</p>
        {payload.map((e, i) => (
          <p key={i} style={{ color: e.color || '#fff' }}>
            {e.name}: {typeof e.value === 'number' && e.value > 100 ? formatCurrency(e.value) : e.value}
            {e.name === 'Churn' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function FinanceRevenueAnalytics() {
  const { revenueData = [], isLoading } = useRevenueAnalytics();
  const [period, setPeriod] = useState('FY 2026');

  const processedData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // 1. Group Monthly Revenue
    const monthlyRevenue = months.map((m, index) => ({
      month: m,
      Revenue: 0,
      Target: 100000 + index * 15000,
    }));

    const gatewaySums = {};
    let totalRev = 0;

    if (Array.isArray(revenueData)) {
      revenueData.forEach(p => {
        const amt = p.amount || 0;
        totalRev += amt;

        // Gateway aggregation
        const gw = p.gateway || 'Other';
        gatewaySums[gw] = (gatewaySums[gw] || 0) + amt;

        // Month aggregation
        const date = new Date(p.date);
        if (!isNaN(date.getTime())) {
          const mIdx = date.getMonth();
          if (mIdx >= 0 && mIdx < 12) {
            monthlyRevenue[mIdx].Revenue += amt;
          }
        }
      });
    }

    // 2. Revenue by Stream
    const colors = { Hubtel: '#38BDF8', Paystack: '#10B981', Manual: '#6366F1', Other: '#64748B' };
    const revenueByStream = Object.entries(gatewaySums).map(([name, value]) => {
      const pct = totalRev > 0 ? Math.round((value / totalRev) * 100) : 0;
      return {
        name,
        value,
        pct,
        color: colors[name] || '#EF4444',
      };
    });

    // Fallback if empty
    if (revenueByStream.length === 0) {
      revenueByStream.push(
        { name: 'Hubtel', value: 0, pct: 0, color: '#38BDF8' },
        { name: 'Paystack', value: 0, pct: 0, color: '#10B981' },
        { name: 'Manual', value: 0, pct: 0, color: '#6366F1' }
      );
    }

    // 3. Growth Metrics MoM
    let accumulated = 0;
    const growthMetrics = months.map((m, index) => {
      const monthRev = monthlyRevenue[index].Revenue;
      accumulated += monthRev;
      
      // ARR is active MRR * 12. Simulate MoM growth.
      const arr = monthRev > 0 ? monthRev * 12 : (accumulated > 0 ? (accumulated / (index + 1)) * 12 : 120000);
      return {
        month: m,
        ARR: Math.round(arr),
        ARPU: 4500 + index * 100,
        Churn: Math.max(1.2, (2.2 - index * 0.1).toFixed(1)),
        NRR: 110 + index,
      };
    });

    // 4. Calculate current values
    const latestMonthIdx = new Date().getMonth();
    const currentARR = growthMetrics[latestMonthIdx]?.ARR || 120000;
    
    return {
      monthlyRevenue,
      revenueByStream,
      growthMetrics,
      currentARR,
      totalRev,
    };
  }, [revenueData]);

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38BDF8]"></div>
      </div>
    );
  }

  const { monthlyRevenue, revenueByStream, growthMetrics, currentARR, totalRev } = processedData;

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
          { label: 'Annual Recurring Revenue', value: formatCurrency(currentARR), change: '+38.3%', up: true, icon: DollarSign, color: '#38BDF8', bg: 'rgba(1,253,246,0.1)' },
          { label: 'Net Revenue Retention', value: '122%', change: '+7% vs Q1', up: true, icon: TrendingUp, color: '#10B981', bg: 'rgba(33,250,144,0.1)' },
          { label: 'Total Revenue (YTD)', value: formatCurrency(totalRev), change: '+12.1%', up: true, icon: Users, color: '#6366F1', bg: 'rgba(138,79,255,0.1)' },
          { label: 'Monthly Churn Rate', value: '1.6%', change: '-0.5% vs Q1', up: true, icon: TrendingDown, color: '#EF4444', bg: 'rgba(255,71,218,0.1)' },
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
            <span className="finance-legend-dot" style={{ background: '#38BDF8' }}>Revenue</span>
            <span className="finance-legend-dot" style={{ background: '#64748B' }}>Target</span>
          </div>
        </div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRev2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="Revenue" stroke="#38BDF8" strokeWidth={2.5} fill="url(#gradRev2)" name="Revenue" />
              <Line type="monotone" dataKey="Target" stroke="#64748B" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Target" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Streams & Growth Metrics */}
      <div className="finance-charts-main">
        {/* Revenue by Stream */}
        <div className="card">
          <div className="card-title">Revenue by Stream</div>
          {revenueByStream.map(stream => (
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
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={growthMetrics} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="ARR" fill="#6366F1" radius={[4, 4, 0, 0]} name="ARR" />
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
                          color: val > 80 ? '#10B981' : val > 60 ? '#F59E0B' : '#EF4444',
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
