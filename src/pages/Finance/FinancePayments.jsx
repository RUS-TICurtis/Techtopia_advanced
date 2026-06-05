import React, { useState, useMemo } from 'react';
import {
  CreditCard, Search, Download, RefreshCw, Plus, CheckCircle,
  Clock, AlertCircle, X, ArrowUpRight, RotateCcw, Filter
} from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import './Finance.css';
import { usePayments } from '../../hooks/useCrmData';

const STATUS_CONFIG = {
  completed: { label: 'Completed', class: 'badge-success', icon: CheckCircle },
  pending:   { label: 'Pending',   class: 'badge-warning', icon: Clock },
  failed:    { label: 'Failed',    class: 'badge-danger',  icon: AlertCircle },
  refunded:  { label: 'Refunded',  class: 'badge-info',   icon: RotateCcw },
};

const GATEWAY_CLASS = { Hubtel: 'gateway-hubtel', Paystack: 'gateway-paystack', Manual: 'badge-neutral' };

export default function FinancePayments() {
  const { payments = [], isLoading, createPayment, refundPayment } = usePayments();
  const [search, setSearch] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showManualModal, setShowManualModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [manualPayment, setManualPayment] = useState({ client: '', invoiceId: '', amount: '', method: 'Bank Transfer', reference: '', notes: '' });

  const metrics = useMemo(() => ({
    collected: payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0),
    pending: payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0),
    failed: payments.filter(p => p.status === 'failed').length,
    refunded: payments.filter(p => p.status === 'refunded').reduce((s, p) => s + (p.amount || 0), 0),
  }), [payments]);

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = !search || p.client?.toLowerCase().includes(search.toLowerCase()) || p.reference?.toLowerCase().includes(search.toLowerCase());
      const matchGateway = gatewayFilter === 'All' || p.gateway === gatewayFilter;
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchSearch && matchGateway && matchStatus;
    });
  }, [payments, search, gatewayFilter, statusFilter]);

  const handleRecordManual = async (e) => {
    e.preventDefault();
    const payload = {
      client: manualPayment.client,
      invoiceId: manualPayment.invoiceId,
      amount: parseFloat(manualPayment.amount) || 0,
      method: manualPayment.method,
      reference: manualPayment.reference,
      notes: manualPayment.notes,
      gateway: 'Manual',
    };
    try {
      await createPayment(payload);
      setShowManualModal(false);
      setManualPayment({ client: '', invoiceId: '', amount: '', method: 'Bank Transfer', reference: '', notes: '' });
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
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Track gateway transactions, manual payments, refunds and reconciliation</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Download size={16} /><span>Export</span></button>
          <button className="btn btn-primary" onClick={() => setShowManualModal(true)}>
            <Plus size={16} /><span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="finance-kpi-grid">
        {[
          { label: 'Total Collected', value: formatCurrency(metrics.collected), color: '#21FA90', bg: 'rgba(33,250,144,0.1)', icon: CheckCircle },
          { label: 'Pending', value: formatCurrency(metrics.pending), color: '#E4FF1A', bg: 'rgba(228,255,26,0.1)', icon: Clock },
          { label: 'Failed Transactions', value: `${metrics.failed} payments`, color: '#FF47DA', bg: 'rgba(255,71,218,0.1)', icon: AlertCircle },
          { label: 'Total Refunded', value: formatCurrency(metrics.refunded), color: '#8A4FFF', bg: 'rgba(138,79,255,0.1)', icon: RotateCcw },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="finance-kpi-card card">
              <div className="finance-kpi-icon" style={{ background: m.bg, color: m.color }}>
                <Icon size={20} />
              </div>
              <div className="finance-kpi-content">
                <span className="finance-kpi-label">{m.label}</span>
                <span className="finance-kpi-value" style={{ fontSize: 18 }}>{m.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div className="finance-filter-bar">
          <div className="finance-search-box">
            <Search size={14} />
            <input type="text" className="form-input" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" style={{ width: 'auto' }} value={gatewayFilter} onChange={e => setGatewayFilter(e.target.value)}>
            <option value="All">All Gateways</option>
            <option value="Hubtel">Hubtel</option>
            <option value="Paystack">Paystack</option>
            <option value="Manual">Manual</option>
          </select>
          <select className="form-input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <div className="export-btn-group ml-auto">
            <button className="export-btn"><Download size={13} /> CSV</button>
            <button className="export-btn"><Download size={13} /> Excel</button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card table-container" style={{ padding: 0 }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Reference</th>
              <th>Client</th>
              <th>Invoice</th>
              <th>Amount</th>
              <th>Gateway</th>
              <th>Method</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(pay => {
              const cfg = STATUS_CONFIG[pay.status];
              const StatusIcon = cfg.icon;
              return (
                <tr key={pay.id}>
                  <td><span className="font-mono text-xs" style={{ color: 'var(--brand-cyan)' }}>{pay.id}</span></td>
                  <td><span className="font-mono text-xs text-muted">{pay.reference}</span></td>
                  <td className="font-semibold">{pay.client}</td>
                  <td><span className="text-xs" style={{ color: 'var(--info)' }}>{pay.invoiceId}</span></td>
                  <td className="font-semibold">{formatCurrency(pay.amount)}</td>
                  <td>
                    <span className={`badge badge-sm ${GATEWAY_CLASS[pay.gateway] || 'badge-neutral'}`}>{pay.gateway}</span>
                  </td>
                  <td className="text-xs text-muted">{pay.method}</td>
                  <td className="text-xs text-muted">{pay.date}</td>
                  <td>
                    <span className={`badge badge-sm ${cfg.class}`} style={{ gap: 4 }}>
                      <StatusIcon size={10} /> {cfg.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      {pay.status === 'completed' && (
                        <button className="btn-icon" title="Refund" onClick={() => setShowRefundModal(pay)}>
                          <RotateCcw size={14} />
                        </button>
                      )}
                      {pay.status === 'pending' && (
                        <button className="btn-icon" title="Verify">
                          <RefreshCw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10}>
                <div className="finance-empty-state">
                  <CreditCard size={40} />
                  <h3>No transactions found</h3>
                  <p>Try adjusting your filters.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reconciliation Panel */}
      <div className="card">
        <div className="card-title">
          Gateway Reconciliation Status
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Last synced: 2 hours ago</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { name: 'Hubtel', total: 84250, settled: 84250, pending: 0, color: '#FF8C00' },
            { name: 'Paystack', total: 60650, settled: 33000, pending: 27650, color: '#00C382' },
          ].map(gw => (
            <div key={gw.name} className="finance-metric-mini">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className={`badge ${GATEWAY_CLASS[gw.name]}`}>{gw.name}</span>
                <span className="badge badge-success badge-sm">Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Processed</span>
                <span className="font-semibold">{formatCurrency(gw.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Settled</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{formatCurrency(gw.settled)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Pending</span>
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{formatCurrency(gw.pending)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Payment Modal */}
      {showManualModal && (
        <div className="modal-overlay" onClick={() => setShowManualModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Record Manual Payment</h2>
              <button className="btn-icon" onClick={() => setShowManualModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleRecordManual} className="modal-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Client *</label>
                  <input type="text" className="form-input" required value={manualPayment.client}
                    onChange={e => setManualPayment(p => ({ ...p, client: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Invoice ID</label>
                  <input type="text" className="form-input" value={manualPayment.invoiceId}
                    onChange={e => setManualPayment(p => ({ ...p, invoiceId: e.target.value }))} placeholder="INV-2026-001" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Amount (GH₵) *</label>
                  <input type="number" className="form-input" required min={0} value={manualPayment.amount}
                    onChange={e => setManualPayment(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Payment Method</label>
                  <select className="form-input" value={manualPayment.method} onChange={e => setManualPayment(p => ({ ...p, method: e.target.value }))}>
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                    <option>Cheque</option>
                    <option>Mobile Money</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Reference / Receipt No.</label>
                <input type="text" className="form-input" value={manualPayment.reference}
                  onChange={e => setManualPayment(p => ({ ...p, reference: e.target.value }))} placeholder="Bank receipt or reference number" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-input" rows={2} value={manualPayment.notes}
                  onChange={e => setManualPayment(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowManualModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><CheckCircle size={14} /> Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(null)}>
          <div className="modal-content" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Process Refund</h2>
              <button className="btn-icon" onClick={() => setShowRefundModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                You are about to refund <strong>{formatCurrency(showRefundModal.amount)}</strong> to <strong>{showRefundModal.client}</strong> via <strong>{showRefundModal.gateway}</strong>.
              </p>
              <div className="form-group">
                <label>Reason for Refund</label>
                <textarea className="form-input" rows={3} placeholder="Enter refund reason..." value={refundReason} onChange={e => setRefundReason(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRefundModal(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: 'var(--error)' }} onClick={async () => {
                  try {
                    await refundPayment({ id: showRefundModal.id, reason: refundReason });
                    setShowRefundModal(null);
                    setRefundReason('');
                  } catch (err) {
                    console.error(err);
                  }
                }}>
                  <RotateCcw size={14} /> Confirm Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
