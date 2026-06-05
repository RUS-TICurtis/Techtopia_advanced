import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, ArrowRight, RefreshCw, Download, Filter } from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import './Finance.css';
import { useSettlements } from '../../hooks/useCrmData';

const STATUS_CONFIG = {
  settled:    { class: 'badge-success', icon: CheckCircle, label: 'Settled' },
  pending:    { class: 'badge-warning', icon: Clock, label: 'Pending' },
  processing: { class: 'badge-info', icon: RefreshCw, label: 'Processing' },
  failed:     { class: 'badge-danger', icon: AlertCircle, label: 'Failed' },
};

const GATEWAY_CONFIG = {
  Hubtel: { class: 'gateway-hubtel', color: '#FF8C00' },
  Paystack: { class: 'gateway-paystack', color: '#00C382' },
};

export default function FinanceSettlements() {
  const { settlements = [], isLoading } = useSettlements();
  const [gatewayFilter, setGatewayFilter] = useState('All');

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01FDF6]"></div>
      </div>
    );
  }

  const filtered = settlements.filter(s => gatewayFilter === 'All' || s.gateway === gatewayFilter);

  const totals = {
    gross: filtered.reduce((s, x) => s + (x.grossVol || 0), 0),
    fees: filtered.reduce((s, x) => s + (x.fees || 0), 0),
    net: filtered.reduce((s, x) => s + (x.net || 0), 0),
    pending: filtered.filter(x => x.status === 'pending').reduce((s, x) => s + (x.net || 0), 0),
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settlements</h1>
          <p className="page-subtitle">Track gateway settlement cycles, fees, and net payout records</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Download size={16} /><span>Export</span></button>
        </div>
      </div>

      {/* KPIs */}
      <div className="finance-kpi-grid">
        {[
          { label: 'Total Gross Volume', value: formatCurrency(totals.gross), color: '#01FDF6', bg: 'rgba(1,253,246,0.1)' },
          { label: 'Total Gateway Fees', value: formatCurrency(totals.fees), color: '#FF47DA', bg: 'rgba(255,71,218,0.1)' },
          { label: 'Net Settled', value: formatCurrency(totals.net - totals.pending), color: '#21FA90', bg: 'rgba(33,250,144,0.1)' },
          { label: 'Pending Settlement', value: formatCurrency(totals.pending), color: '#E4FF1A', bg: 'rgba(228,255,26,0.1)' },
        ].map(m => (
          <div key={m.label} className="finance-kpi-card card">
            <div className="finance-kpi-icon" style={{ background: m.bg, color: m.color }}><CheckCircle size={20} /></div>
            <div className="finance-kpi-content">
              <span className="finance-kpi-label">{m.label}</span>
              <span className="finance-kpi-value" style={{ fontSize: 18 }}>{m.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div className="finance-filter-bar">
          <select className="form-input" style={{ width: 'auto' }} value={gatewayFilter} onChange={e => setGatewayFilter(e.target.value)}>
            <option value="All">All Gateways</option>
            <option>Hubtel</option>
            <option>Paystack</option>
          </select>
        </div>
      </div>

      {/* Settlement Table */}
      <div className="card table-container" style={{ padding: 0 }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Settlement ID</th>
              <th>Gateway</th>
              <th>Period</th>
              <th>Transactions</th>
              <th>Gross Volume</th>
              <th>Fees</th>
              <th>Net Payout</th>
              <th>Status</th>
              <th>Settled Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(stl => {
              const cfg = STATUS_CONFIG[stl.status] || { class: 'badge-neutral', icon: Clock, label: stl.status || 'Pending' };
              const gwCfg = GATEWAY_CONFIG[stl.gateway] || { class: 'badge-neutral', color: '#627496' };
              const StatusIcon = cfg.icon || Clock;
              return (
                <tr key={stl.id}>
                  <td><span className="font-mono text-xs" style={{ color: 'var(--brand-cyan)' }}>{stl.id}</span></td>
                  <td><span className={`badge badge-sm ${gwCfg.class || ''}`}>{stl.gateway}</span></td>
                  <td className="text-sm">{stl.period}</td>
                  <td className="text-sm">{stl.txnCount} txns</td>
                  <td className="font-semibold">{formatCurrency(stl.grossVol)}</td>
                  <td style={{ color: 'var(--error)', fontWeight: 600 }}>-{formatCurrency(stl.fees)}</td>
                  <td className="font-semibold" style={{ color: '#21FA90' }}>{formatCurrency(stl.net)}</td>
                  <td>
                    <span className={`badge badge-sm ${cfg.class}`} style={{ gap: 4 }}>
                      <StatusIcon size={10} /> {cfg.label}
                    </span>
                  </td>
                  <td className="text-xs text-muted">{stl.settledDate || '—'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--border-light)', background: 'rgba(255,255,255,0.02)' }}>
              <td colSpan={4} style={{ padding: '12px', fontWeight: 700, color: 'var(--text-title)', fontSize: 13 }}>Totals</td>
              <td style={{ padding: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatCurrency(totals.gross)}</td>
              <td style={{ padding: '12px', fontWeight: 700, color: 'var(--error)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>-{formatCurrency(totals.fees)}</td>
              <td style={{ padding: '12px', fontWeight: 700, color: '#21FA90', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatCurrency(totals.net)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
 
      {/* Fee Breakdown */}
      <div className="card">
        <div className="card-title">Gateway Fee Structure</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {Object.entries(GATEWAY_CONFIG).map(([gw, cfg]) => {
            const gwData = settlements.filter(s => s.gateway === gw);
            const gwGross = gwData.reduce((s, x) => s + (x.grossVol || 0), 0);
            const gwFees = gwData.reduce((s, x) => s + (x.fees || 0), 0);
            const feeRate = gwGross > 0 ? ((gwFees / gwGross) * 100).toFixed(2) : '0.00';
            return (
              <div key={gw} className="finance-metric-mini" style={{ borderLeft: `3px solid ${cfg.color}` }}>
                <span className={`badge ${cfg.class} mb-2`}>{gw}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Effective Rate</span>
                  <span className="font-semibold">{feeRate}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Fees Paid</span>
                  <span style={{ color: 'var(--error)', fontWeight: 600 }}>{formatCurrency(gwFees)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Volume Processed</span>
                  <span className="font-semibold">{formatCurrency(gwGross)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
