import React, { useState } from 'react';
import {
  BarChart2, Download, FileText, TrendingUp, Calendar, RefreshCw,
  BarChart, PieChart, Table, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart as RBarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../services/finance/financeService';
import './Finance.css';

const REPORT_TYPES = [
  { id: 'pl', label: 'Profit & Loss', icon: TrendingUp, color: '#21FA90', desc: 'Income, expenses, and net profit' },
  { id: 'bs', label: 'Balance Sheet', icon: Table, color: '#01FDF6', desc: 'Assets, liabilities, and equity' },
  { id: 'cf', label: 'Cash Flow', icon: BarChart, color: '#8A4FFF', desc: 'Operating, investing, financing' },
  { id: 'ar', label: 'Accounts Receivable', icon: FileText, color: '#E4FF1A', desc: 'Outstanding client balances' },
  { id: 'ap', label: 'Accounts Payable', icon: FileText, color: '#FF47DA', desc: 'Outstanding vendor payments' },
  { id: 'tax', label: 'Tax Summary', icon: FileText, color: '#FF8C42', desc: 'VAT, income tax, withholding' },
];

const PL_DATA = [
  { category: 'Total Revenue', amount: 2713000, type: 'income' },
  { category: 'Cost of Goods Sold', amount: -489000, type: 'expense' },
  { category: 'Gross Profit', amount: 2224000, type: 'subtotal' },
  { category: 'Operating Expenses', amount: -732000, type: 'expense' },
  { category: 'EBITDA', amount: 1492000, type: 'subtotal' },
  { category: 'Depreciation & Amortisation', amount: -42000, type: 'expense' },
  { category: 'EBIT', amount: 1450000, type: 'subtotal' },
  { category: 'Interest Expense', amount: -28000, type: 'expense' },
  { category: 'Pre-Tax Income', amount: 1422000, type: 'subtotal' },
  { category: 'Income Tax (22.5%)', amount: -319950, type: 'expense' },
  { category: 'Net Profit', amount: 1102050, type: 'total' },
];

const MONTHLY_CF = [
  { month: 'Jan', Operating: 86000, Investing: -12000, Financing: 0 },
  { month: 'Feb', Operating: 107000, Investing: -8000, Financing: 0 },
  { month: 'Mar', Operating: 111000, Investing: -22000, Financing: 50000 },
  { month: 'Apr', Operating: 95000, Investing: -5000, Financing: 0 },
  { month: 'May', Operating: 140000, Investing: -35000, Financing: 0 },
  { month: 'Jun', Operating: 172000, Investing: -18000, Financing: -25000 },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#0f1629', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: '#627496', fontWeight: 700, marginBottom: 4, fontSize: 10, textTransform: 'uppercase' }}>{label}</p>
        {payload.map((e, i) => <p key={i} style={{ color: e.fill || e.color }}>{e.name}: {formatCurrency(Math.abs(e.value))}</p>)}
      </div>
    );
  }
  return null;
};

export default function FinancialReports() {
  const [activeReport, setActiveReport] = useState('pl');
  const [dateRange, setDateRange] = useState({ from: '2026-01-01', to: '2026-12-31' });
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1200);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Reports</h1>
          <p className="page-subtitle">Generate, view, and export statutory and management reports · GH₵</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleGenerate} disabled={generating}>
            <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
            <span>{generating ? 'Generating...' : 'Refresh'}</span>
          </button>
          <button className="btn btn-primary"><Download size={16} /><span>Export PDF</span></button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {REPORT_TYPES.map(report => {
          const Icon = report.icon;
          const isActive = activeReport === report.id;
          return (
            <button key={report.id} onClick={() => setActiveReport(report.id)}
              style={{
                padding: '16px', border: `2px solid ${isActive ? report.color : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-lg)', background: isActive ? `${report.color}12` : 'var(--bg-card)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: 8
              }}>
              <Icon size={20} style={{ color: report.color }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-title)', margin: 0 }}>{report.label}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{report.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Date Range Filter */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div className="finance-filter-bar">
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 11, margin: 0, marginBottom: 4 }}>From</label>
            <input type="date" className="form-input" style={{ width: 160 }}
              value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 11, margin: 0, marginBottom: 4 }}>To</label>
            <input type="date" className="form-input" style={{ width: 160 }}
              value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} />
          </div>
          <button className="btn btn-primary" onClick={handleGenerate} style={{ alignSelf: 'flex-end' }}>
            <BarChart2 size={15} /> Generate Report
          </button>
          <div className="export-btn-group ml-auto" style={{ alignSelf: 'flex-end' }}>
            <button className="export-btn"><Download size={13} /> PDF</button>
            <button className="export-btn"><Download size={13} /> Excel</button>
            <button className="export-btn"><Download size={13} /> CSV</button>
          </div>
        </div>
      </div>

      {/* P&L Report */}
      {activeReport === 'pl' && (
        <>
          <div className="card">
            <div className="card-title">Profit & Loss Statement — FY 2026</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Line Item</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Amount (GH₵)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>% of Revenue</th>
                </tr>
              </thead>
              <tbody>
                {PL_DATA.map((row, i) => (
                  <tr key={i} style={{
                    borderBottom: '1px solid var(--border-light)',
                    background: row.type === 'subtotal' ? 'rgba(255,255,255,0.02)' : row.type === 'total' ? 'rgba(33,250,144,0.05)' : 'transparent',
                  }}>
                    <td style={{
                      padding: '12px 12px',
                      fontWeight: ['subtotal', 'total'].includes(row.type) ? 700 : 400,
                      paddingLeft: row.type === 'expense' ? 32 : 12,
                      color: row.type === 'total' ? '#21FA90' : row.type === 'subtotal' ? 'var(--text-title)' : 'var(--text-main)',
                    }}>
                      {row.category}
                    </td>
                    <td style={{
                      padding: '12px 12px', textAlign: 'right',
                      fontWeight: ['subtotal', 'total'].includes(row.type) ? 700 : 400,
                      color: row.amount < 0 ? 'var(--error)' : row.type === 'total' ? '#21FA90' : 'var(--text-main)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {row.amount < 0 ? `(${formatCurrency(Math.abs(row.amount))})` : formatCurrency(row.amount)}
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>
                      {Math.abs(Math.round((row.amount / 2713000) * 100))}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Cash Flow Report */}
      {activeReport === 'cf' && (
        <div className="card">
          <div className="card-title">Cash Flow Statement — FY 2026</div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RBarChart data={MONTHLY_CF} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#3d4e6b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#3d4e6b" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Operating" fill="#21FA90" radius={[4,4,0,0]} name="Operating" />
                <Bar dataKey="Investing" fill="#FF47DA" radius={[4,4,0,0]} name="Investing" />
                <Bar dataKey="Financing" fill="#8A4FFF" radius={[4,4,0,0]} name="Financing" />
              </RBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Generic placeholder for other report types */}
      {!['pl', 'cf'].includes(activeReport) && (
        <div className="card">
          <div className="finance-empty-state">
            <BarChart2 size={48} />
            <h3>{REPORT_TYPES.find(r => r.id === activeReport)?.label}</h3>
            <p>This report will be generated based on your selected date range. Click "Generate Report" to proceed.</p>
            <button className="btn btn-primary mt-4" onClick={handleGenerate}>
              <BarChart2 size={15} /> Generate Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
