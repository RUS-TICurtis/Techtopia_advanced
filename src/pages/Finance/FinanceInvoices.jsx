import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, Download, Send, CheckCircle, Clock, AlertCircle,
  FileText, MoreVertical, X, Eye, Copy, Trash2, ChevronDown, RefreshCw
} from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import { useInvoices } from '../../hooks/useCrmData';
import './Finance.css';

// ── Status Config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Draft:           { class: 'status-draft',    icon: FileText },
  'Pending Approval': { class: 'status-pending', icon: Clock },
  Approved:        { class: 'status-approved', icon: CheckCircle },
  Sent:            { class: 'status-sent',     icon: Send },
  Viewed:          { class: 'status-viewed',   icon: Eye },
  'Partially Paid': { class: 'status-partial', icon: Clock },
  Paid:            { class: 'status-paid',     icon: CheckCircle },
  Overdue:         { class: 'status-overdue',  icon: AlertCircle },
  Cancelled:       { class: 'status-cancelled', icon: X },
};

const EMPTY_INVOICE = {
  client: '', project: '', email: '', phone: '', address: '',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: '', currency: 'GHS', notes: '', taxRate: 0, discount: 0,
  items: [{ description: '', qty: 1, unitPrice: 0 }],
};

export default function FinanceInvoices() {
  const { 
    invoices = [], 
    isLoading, 
    createInvoice, 
    updateInvoice, 
    deleteInvoice, 
    sendInvoice, 
    approveInvoice, 
    duplicateInvoice 
  } = useInvoices();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [newInvoice, setNewInvoice] = useState(EMPTY_INVOICE);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Sync selectedInvoice when invoices list updates
  const activeSelectedInvoice = useMemo(() => {
    if (!selectedInvoice) return null;
    return invoices.find(inv => inv.id === selectedInvoice.id) || selectedInvoice;
  }, [invoices, selectedInvoice]);

  // ── Derived metrics ──────────────────────────────────────────────────────
  const metrics = useMemo(() => ({
    total: invoices.reduce((s, inv) => s + (inv.amount || 0), 0),
    paid: invoices.filter(i => i.status === 'Paid').reduce((s, inv) => s + (inv.amount || 0), 0),
    overdue: invoices.filter(i => i.status === 'Overdue').reduce((s, inv) => s + (inv.amount || 0), 0),
    draft: invoices.filter(i => i.status === 'Draft').length,
    outstanding: invoices.filter(i => !['Paid', 'Cancelled', 'Draft'].includes(i.status)).reduce((s, inv) => s + ((inv.amount || 0) - (inv.paid || 0)), 0),
  }), [invoices]);

  // ── Filtered invoices ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = !search || inv.client.toLowerCase().includes(search.toLowerCase()) || (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  // ── Line items helpers ────────────────────────────────────────────────────
  const addLineItem = () => setNewInvoice(prev => ({ ...prev, items: [...prev.items, { description: '', qty: 1, unitPrice: 0 }] }));
  const removeLineItem = (idx) => setNewInvoice(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const updateLineItem = (idx, field, value) => setNewInvoice(prev => ({
    ...prev, items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
  }));

  const subtotal = newInvoice.items.reduce((s, item) => s + (item.qty * item.unitPrice), 0);
  const taxAmt = subtotal * (newInvoice.taxRate / 100);
  const discountAmt = subtotal * (newInvoice.discount / 100);
  const total = subtotal + taxAmt - discountAmt;

  // ── Create Invoice ────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createInvoice({
        client: newInvoice.client,
        project: newInvoice.project,
        email: newInvoice.email,
        phone: newInvoice.phone,
        address: newInvoice.address,
        currency: newInvoice.currency,
        issueDate: newInvoice.issueDate,
        dueDate: newInvoice.dueDate,
        notes: newInvoice.notes,
        taxRate: parseFloat(newInvoice.taxRate) || 0,
        discount: parseFloat(newInvoice.discount) || 0,
        items: newInvoice.items,
        amount: total,
      });
      setShowCreateModal(false);
      setNewInvoice(EMPTY_INVOICE);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === 'Sent') {
        await sendInvoice(id);
      } else if (newStatus === 'Approved') {
        await approveInvoice(id);
      } else {
        await updateInvoice({ id, data: { status: newStatus } });
      }
      setActiveDropdown(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Manage billing, track payments, and send invoices to clients</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><RefreshCw size={16} /><span>Export</span></button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /><span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="finance-kpi-grid">
        {[
          { label: 'Total Outstanding', value: formatCurrency(metrics.outstanding), color: '#E4FF1A', bg: 'rgba(228,255,26,0.1)' },
          { label: 'Overdue', value: formatCurrency(metrics.overdue), color: '#FF47DA', bg: 'rgba(255,71,218,0.1)' },
          { label: 'Draft Invoices', value: `${metrics.draft} invoices`, color: '#8A4FFF', bg: 'rgba(138,79,255,0.1)' },
          { label: 'Collected This Month', value: formatCurrency(metrics.paid), color: '#21FA90', bg: 'rgba(33,250,144,0.1)' },
        ].map(m => (
          <div key={m.label} className="finance-kpi-card card">
            <div className="finance-kpi-icon" style={{ background: m.bg, color: m.color }}>
              <FileText size={20} />
            </div>
            <div className="finance-kpi-content">
              <span className="finance-kpi-label">{m.label}</span>
              <span className="finance-kpi-value" style={{ fontSize: 18 }}>{m.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div className="finance-filter-bar">
          <div className="finance-search-box">
            <Search size={14} />
            <input type="text" className="form-input" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" style={{ width: 'auto', minWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="export-btn-group ml-auto">
            <button className="export-btn"><Download size={13} /> CSV</button>
            <button className="export-btn"><Download size={13} /> Excel</button>
            <button className="export-btn"><Download size={13} /> PDF</button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card table-container" style={{ padding: 0 }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Client</th>
              <th>Project</th>
              <th>Amount</th>
              <th>Balance Due</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => {
              const cfg = STATUS_CONFIG[inv.status] || {};
              const StatusIcon = cfg.icon || FileText;
              const balance = inv.amount - inv.paid;
              return (
                <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedInvoice(inv)}>
                  <td>
                    <span className="font-mono text-xs" style={{ color: 'var(--brand-cyan)' }}>{inv.invoiceNumber}</span>
                  </td>
                  <td className="font-semibold">{inv.client}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{inv.project}</td>
                  <td className="font-semibold">{formatCurrency(inv.amount)}</td>
                  <td style={{ color: balance > 0 ? 'var(--error)' : 'var(--success)', fontWeight: 700 }}>
                    {balance > 0 ? formatCurrency(balance) : '—'}
                  </td>
                  <td className="text-xs text-muted">{inv.issueDate}</td>
                  <td className="text-xs text-muted">{inv.dueDate}</td>
                  <td>
                    <span className={`badge badge-sm ${cfg.class}`} style={{ gap: 4 }}>
                      <StatusIcon size={10} /> {inv.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', position: 'relative' }}>
                      <button className="btn-icon" title="Download PDF"><Download size={15} /></button>
                      <button className="btn-icon" title="Send" onClick={() => handleStatusChange(inv.id, 'Sent')}><Send size={15} /></button>
                      <button className="btn-icon" title="More" onClick={() => setActiveDropdown(activeDropdown === inv.id ? null : inv.id)}>
                        <MoreVertical size={15} />
                      </button>
                      {activeDropdown === inv.id && (
                        <div style={{
                          position: 'absolute', right: 0, top: '100%', zIndex: 50,
                          background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)', padding: '6px', minWidth: 160,
                          boxShadow: 'var(--shadow-lg)'
                        }}>
                          {['Approved', 'Sent', 'Paid', 'Cancelled'].map(s => (
                            <button key={s} onClick={() => handleStatusChange(inv.id, s)}
                              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: 'var(--text-main)', borderRadius: 6, background: 'transparent' }}
                              onMouseEnter={e => e.target.style.background = 'var(--bg-app)'}
                              onMouseLeave={e => e.target.style.background = 'transparent'}
                            >Mark as {s}</button>
                          ))}
                          <hr style={{ margin: '4px 0', borderColor: 'var(--border-light)' }} />
                          <button onClick={() => { duplicateInvoice(inv.id); setActiveDropdown(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)', borderRadius: 6, background: 'transparent' }}>
                            <Copy size={12} /> Duplicate
                          </button>
                          <button onClick={() => { if(window.confirm('Delete this invoice?')) deleteInvoice(inv.id); setActiveDropdown(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: 'var(--error)', borderRadius: 6, background: 'transparent' }}>
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9}>
                <div className="finance-empty-state">
                  <FileText size={40} />
                  <h3>No invoices found</h3>
                  <p>Try adjusting your filters or create a new invoice.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Invoice Detail Drawer ───────────────────────────────────────── */}
      {activeSelectedInvoice && (
        <div className="finance-drawer-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="finance-drawer" onClick={e => e.stopPropagation()}>
            <div className="finance-drawer-header">
              <div>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 4 }}>Invoice</p>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-title)' }}>{activeSelectedInvoice.invoiceNumber}</h2>
              </div>
              <button className="btn-icon" onClick={() => setSelectedInvoice(null)}><X size={18} /></button>
            </div>
            <div className="finance-drawer-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <p className="text-xs text-muted mb-1">Client</p>
                  <p className="font-semibold">{activeSelectedInvoice.client}</p>
                  <p className="text-xs text-muted mt-1">{activeSelectedInvoice.project}</p>
                </div>
                <span className={`badge ${STATUS_CONFIG[activeSelectedInvoice.status]?.class}`} style={{ height: 'fit-content' }}>
                  {activeSelectedInvoice.status}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <p className="text-xs text-muted mb-1">Issue Date</p>
                  <p className="font-semibold text-sm">{activeSelectedInvoice.issueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Due Date</p>
                  <p className="font-semibold text-sm">{activeSelectedInvoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Invoice Total</p>
                  <p className="font-semibold text-lg" style={{ color: 'var(--text-title)' }}>{formatCurrency(activeSelectedInvoice.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Amount Paid</p>
                  <p className="font-semibold text-lg" style={{ color: 'var(--success)' }}>{formatCurrency(activeSelectedInvoice.paid)}</p>
                </div>
              </div>
              <div style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
                <p className="text-xs text-muted mb-2 font-semibold uppercase tracking-wider">Balance Due</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: activeSelectedInvoice.amount - activeSelectedInvoice.paid > 0 ? 'var(--error)' : 'var(--success)' }}>
                  {formatCurrency(activeSelectedInvoice.amount - activeSelectedInvoice.paid)}
                </p>
              </div>
              <div className="finance-timeline">
                {[
                  { label: 'Invoice Created', time: activeSelectedInvoice.issueDate, color: '#8A4FFF' },
                  { label: 'Invoice Sent to Client', time: activeSelectedInvoice.issueDate, color: '#01FDF6' },
                  { label: activeSelectedInvoice.status === 'Paid' ? 'Payment Received' : 'Awaiting Payment', time: activeSelectedInvoice.dueDate, color: activeSelectedInvoice.status === 'Paid' ? '#21FA90' : '#E4FF1A' },
                ].map((evt, i) => (
                  <div key={i} className="finance-timeline-item">
                    <div className="finance-timeline-dot" style={{ background: `${evt.color}20`, color: evt.color, fontSize: 12, fontWeight: 700 }}>
                      {i + 1}
                    </div>
                    <div className="finance-timeline-content">
                      <h4>{evt.label}</h4>
                    </div>
                    <div className="finance-timeline-time">{evt.time}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="finance-drawer-footer">
              <button className="btn btn-secondary"><Download size={15} /> PDF</button>
              <button className="btn btn-secondary" onClick={() => sendInvoice(activeSelectedInvoice.id)}><Send size={15} /> Send</button>
              <button className="btn btn-primary" onClick={() => handleStatusChange(activeSelectedInvoice.id, 'Paid')}>
                <CheckCircle size={15} /> Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Invoice Modal ─────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: 700, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Invoice</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Client Name *</label>
                  <input type="text" className="form-input" required value={newInvoice.client}
                    onChange={e => setNewInvoice(p => ({ ...p, client: e.target.value }))} placeholder="Acme Corp" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Project / Description</label>
                  <input type="text" className="form-input" value={newInvoice.project}
                    onChange={e => setNewInvoice(p => ({ ...p, project: e.target.value }))} placeholder="API Integration Project" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Client Email</label>
                  <input type="email" className="form-input" value={newInvoice.email}
                    onChange={e => setNewInvoice(p => ({ ...p, email: e.target.value }))} placeholder="client@company.com" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Currency</label>
                  <select className="form-input" value={newInvoice.currency} onChange={e => setNewInvoice(p => ({ ...p, currency: e.target.value }))}>
                    <option value="GHS">GHS — Ghana Cedi (GH₵)</option>
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                    <option value="GBP">GBP — British Pound (£)</option>
                    <option value="NGN">NGN — Nigerian Naira (₦)</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Issue Date *</label>
                  <input type="date" className="form-input" required value={newInvoice.issueDate}
                    onChange={e => setNewInvoice(p => ({ ...p, issueDate: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Due Date *</label>
                  <input type="date" className="form-input" required value={newInvoice.dueDate}
                    onChange={e => setNewInvoice(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>

              {/* Line Items */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ margin: 0 }}>Invoice Items</label>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={addLineItem}>
                    <Plus size={13} /> Add Item
                  </button>
                </div>
                <table className="invoice-items-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{ width: 70 }}>Qty</th>
                      <th style={{ width: 120 }}>Unit Price</th>
                      <th style={{ width: 120 }}>Total</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <input type="text" className="form-input" style={{ padding: '8px 10px', fontSize: 13 }}
                            value={item.description} onChange={e => updateLineItem(idx, 'description', e.target.value)}
                            placeholder="Service or product description" />
                        </td>
                        <td>
                          <input type="number" className="form-input" style={{ padding: '8px 10px', fontSize: 13 }} min={1}
                            value={item.qty} onChange={e => updateLineItem(idx, 'qty', parseFloat(e.target.value) || 0)} />
                        </td>
                        <td>
                          <input type="number" className="form-input" style={{ padding: '8px 10px', fontSize: 13 }} min={0} step="0.01"
                            value={item.unitPrice} onChange={e => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} />
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.qty * item.unitPrice, newInvoice.currency)}</td>
                        <td>
                          {newInvoice.items.length > 1 && (
                            <button type="button" className="btn-icon" onClick={() => removeLineItem(idx)}>
                              <X size={13} style={{ color: 'var(--error)' }} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16 }}>
                <div className="invoice-total-row"><span>Subtotal</span><span>{formatCurrency(subtotal, newInvoice.currency)}</span></div>
                <div className="invoice-total-row">
                  <span>Tax (%)</span>
                  <input type="number" className="form-input" style={{ width: 80, padding: '4px 8px', fontSize: 12 }} min={0} max={100}
                    value={newInvoice.taxRate} onChange={e => setNewInvoice(p => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))} />
                  <span>{formatCurrency(taxAmt, newInvoice.currency)}</span>
                </div>
                <div className="invoice-total-row">
                  <span>Discount (%)</span>
                  <input type="number" className="form-input" style={{ width: 80, padding: '4px 8px', fontSize: 12 }} min={0} max={100}
                    value={newInvoice.discount} onChange={e => setNewInvoice(p => ({ ...p, discount: parseFloat(e.target.value) || 0 }))} />
                  <span>-{formatCurrency(discountAmt, newInvoice.currency)}</span>
                </div>
                <div className="invoice-total-row grand"><span>Total</span><span>{formatCurrency(total, newInvoice.currency)}</span></div>
              </div>

              <div className="form-group">
                <label>Notes / Terms</label>
                <textarea className="form-input" rows={3} value={newInvoice.notes}
                  onChange={e => setNewInvoice(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Payment terms, bank details, or additional notes..." />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-secondary">Save as Draft</button>
                <button type="submit" className="btn btn-primary"><Send size={14} /> Create & Send</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
