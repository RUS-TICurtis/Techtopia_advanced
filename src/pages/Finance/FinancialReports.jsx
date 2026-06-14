import React, { useState, useMemo } from 'react';
import {
  BarChart2, Download, FileText, TrendingUp, Calendar, RefreshCw,
  BarChart, PieChart, Table, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart as RBarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../services/finance/financeService';
import { useFinancialReport } from '../../hooks/useCrmData';
import './Finance.css';

const REPORT_TYPES = [
  { id: 'pl', label: 'Profit & Loss', icon: TrendingUp, color: '#10B981', desc: 'Income, expenses, and net profit' },
  { id: 'bs', label: 'Balance Sheet', icon: Table, color: '#38BDF8', desc: 'Assets, liabilities, and equity' },
  { id: 'cf', label: 'Cash Flow', icon: BarChart, color: '#6366F1', desc: 'Operating, investing, financing' },
  { id: 'ar', label: 'Accounts Receivable', icon: FileText, color: '#F59E0B', desc: 'Outstanding client balances' },
  { id: 'ap', label: 'Accounts Payable', icon: FileText, color: '#EF4444', desc: 'Outstanding vendor payments' },
  { id: 'tax', label: 'Tax Summary', icon: FileText, color: '#FF8C42', desc: 'VAT, income tax, withholding' },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1E293B', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: '#64748B', fontWeight: 700, marginBottom: 4, fontSize: 10, textTransform: 'uppercase' }}>{label}</p>
        {payload.map((e, i) => <p key={i} style={{ color: e.fill || e.color }}>{e.name}: {formatCurrency(Math.abs(e.value))}</p>)}
      </div>
    );
  }
  return null;
};

export default function FinancialReports() {
  const [activeReport, setActiveReport] = useState('pl');
  const [dateRange, setDateRange] = useState({ from: '2026-01-01', to: '2026-12-31' });

  // Load backend reports in parallel
  const { reportData: revenueData = [], isLoading: isLoadingRev, refetch: refetchRev } = useFinancialReport('revenue', dateRange.from, dateRange.to);
  const { reportData: expenseData = [], isLoading: isLoadingExp, refetch: refetchExp } = useFinancialReport('expense', dateRange.from, dateRange.to);
  const { reportData: cashFlowData = [], isLoading: isLoadingCF, refetch: refetchCF } = useFinancialReport('cash-flow', dateRange.from, dateRange.to);
  const { reportData: genericData = [], isLoading: isLoadingGen, refetch: refetchGen } = useFinancialReport(activeReport, dateRange.from, dateRange.to);

  const isLoading = isLoadingRev || isLoadingExp || isLoadingCF || isLoadingGen;

  const handleGenerate = async () => {
    await Promise.all([refetchRev(), refetchExp(), refetchCF(), refetchGen()]);
  };

  // Compute Profit & Loss dynamically from payments and expenses
  const plStatement = useMemo(() => {
    const revs = Array.isArray(revenueData) ? revenueData : [];
    const exps = Array.isArray(expenseData) ? expenseData : [];
    
    const totalRev = revs.reduce((sum, r) => sum + (r.amount || 0), 0);
    const cogs = Math.round(totalRev * 0.18); // Assume cost of goods sold is 18% of revenue
    const grossProfit = totalRev - cogs;
    
    // Approved expenses
    const opex = exps.filter(e => e.status === 'Approved' || e.status === 'Reimbursed').reduce((sum, e) => sum + (e.amount || 0), 0);
    const ebitda = grossProfit - opex;
    
    const depreciation = Math.round(opex * 0.05); // 5% depreciation simulation
    const ebit = ebitda - depreciation;
    
    const interest = Math.round(totalRev * 0.01); // 1% interest
    const preTax = ebit - interest;
    
    const tax = Math.round(preTax > 0 ? preTax * 0.225 : 0); // 22.5% corporate tax
    const netProfit = preTax - tax;

    return [
      { category: 'Total Revenue', amount: totalRev, type: 'income' },
      { category: 'Cost of Goods Sold (18% sim)', amount: -cogs, type: 'expense' },
      { category: 'Gross Profit', amount: grossProfit, type: 'subtotal' },
      { category: 'Operating Expenses (Opex)', amount: -opex, type: 'expense' },
      { category: 'EBITDA', amount: ebitda, type: 'subtotal' },
      { category: 'Depreciation & Amortisation', amount: -depreciation, type: 'expense' },
      { category: 'EBIT', amount: ebit, type: 'subtotal' },
      { category: 'Interest Expense', amount: -interest, type: 'expense' },
      { category: 'Pre-Tax Income', amount: preTax, type: 'subtotal' },
      { category: 'Income Tax (22.5%)', amount: -tax, type: 'expense' },
      { category: 'Net Profit', amount: netProfit, type: 'total' },
    ];
  }, [revenueData, expenseData]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Reports</h1>
          <p className="page-subtitle">Generate, view, and export statutory and management reports · GH₵</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleGenerate} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Generating...' : 'Refresh'}</span>
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

      {/* Loading overlay */}
      {isLoading ? (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38BDF8]"></div>
        </div>
      ) : (
        <>
          {/* P&L Report */}
          {activeReport === 'pl' && (
            <div className="card">
              <div className="card-title">Profit & Loss Statement — {dateRange.from} to {dateRange.to}</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Line Item</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Amount (GH₵)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>% of Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {plStatement.map((row, i) => {
                    const totalRev = plStatement[0].amount || 1;
                    const pct = Math.abs(Math.round((row.amount / totalRev) * 100));
                    return (
                      <tr key={i} style={{
                        borderBottom: '1px solid var(--border-light)',
                        background: row.type === 'subtotal' ? 'rgba(255,255,255,0.02)' : row.type === 'total' ? 'rgba(33,250,144,0.05)' : 'transparent',
                      }}>
                        <td style={{
                          padding: '12px 12px',
                          fontWeight: ['subtotal', 'total'].includes(row.type) ? 700 : 400,
                          paddingLeft: row.type === 'expense' ? 32 : 12,
                          color: row.type === 'total' ? '#10B981' : row.type === 'subtotal' ? 'var(--text-title)' : 'var(--text-main)',
                        }}>
                          {row.category}
                        </td>
                        <td style={{
                          padding: '12px 12px', textAlign: 'right',
                          fontWeight: ['subtotal', 'total'].includes(row.type) ? 700 : 400,
                          color: row.amount < 0 ? 'var(--error)' : row.type === 'total' ? '#10B981' : 'var(--text-main)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {row.amount < 0 ? `(${formatCurrency(Math.abs(row.amount))})` : formatCurrency(row.amount)}
                        </td>
                        <td style={{ padding: '12px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Cash Flow Report */}
          {activeReport === 'cf' && (
            <div className="card">
              <div className="card-title">Cash Flow Statement — {dateRange.from} to {dateRange.to}</div>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <RBarChart data={Array.isArray(cashFlowData) ? cashFlowData : []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="inflows" fill="#10B981" radius={[4,4,0,0]} name="Inflow" />
                    <Bar dataKey="outflows" fill="#EF4444" radius={[4,4,0,0]} name="Outflow" />
                    <Bar dataKey="net" fill="#6366F1" radius={[4,4,0,0]} name="Net Flow" />
                  </RBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Generic placeholder for other report types */}
          {!['pl', 'cf'].includes(activeReport) && (
            <div className="card">
              {Array.isArray(genericData) && genericData.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <div className="card-title" style={{ textTransform: 'capitalize' }}>
                    {REPORT_TYPES.find(r => r.id === activeReport)?.label} Data
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)' }}>Index</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)' }}>Date/Range</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>Amount</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)' }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {genericData.map((row, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '8px 12px' }}>{index + 1}</td>
                          <td style={{ padding: '8px 12px' }}>{row.date || row.range || '—'}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(row.amount)}</td>
                          <td style={{ padding: '8px 12px' }}>{row.client || row.category || row.gateway || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="finance-empty-state">
                  <BarChart2 size={48} />
                  <h3>{REPORT_TYPES.find(r => r.id === activeReport)?.label}</h3>
                  <p>This report has no data for the selected period. Click "Generate Report" or select a different date range.</p>
                  <button className="btn btn-primary mt-4" onClick={handleGenerate}>
                    <BarChart2 size={15} /> Generate Now
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
