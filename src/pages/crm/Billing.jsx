import React, { useState } from 'react';
import { Receipt, Plus, X, DollarSign, Clock, FileText, AlertCircle } from 'lucide-react';
import { useInvoices } from '../../hooks/useCrmData';
import './Billing.css';

const TABS     = ['All', 'Draft', 'Sent', 'Paid', 'Overdue'];
const emptyForm = {
  client: '', dueDate: '', status: 'Draft',
  items: [{ description: '', qty: 1, rate: '' }]
};

const statusColors = {
  Draft: 'badge-neutral', Sent: 'badge-info',
  Paid: 'badge-success',  Overdue: 'badge-danger'
};

export default function Billing({ searchValue = '' }) {
  const { invoices = [], isLoading, createInvoice } = useInvoices();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]          = useState(emptyForm);
  const [activeTab, setActiveTab] = useState('All');

  const total = (inv) => {
    if (inv.amount) return inv.amount;
    return (inv.items || []).reduce((s, i) => s + (Number(i.qty) * Number(i.rate || i.unitPrice || 0) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemsPayload = form.items.map(item => ({
        description: item.description,
        qty: Number(item.qty) || 1,
        unitPrice: Number(item.rate) || 0
      }));
      const calcTotal = itemsPayload.reduce((s, i) => s + (i.qty * i.unitPrice), 0);

      await createInvoice({
        client: form.client,
        dueDate: form.dueDate || null,
        status: form.status,
        items: itemsPayload,
        amount: calcTotal,
        currency: 'USD',
        taxRate: 0,
        discount: 0
      });
      setForm(emptyForm);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create invoice.');
    }
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', qty: 1, rate: '' }] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, key, val) => setForm(f => ({
    ...f, items: f.items.map((item, i) => i === idx ? { ...item, [key]: val } : item)
  }));

  const filtered = invoices.filter(inv => {
    const matchesSearch = inv.client.toLowerCase().includes(searchValue.toLowerCase()) || (inv.invoiceNumber || inv.number || '').includes(searchValue);
    const matchesTab = activeTab === 'All' || inv.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const metrics = [
    { label: 'Total Revenue', value: `$${invoices.filter(i=>i.status==='Paid').reduce((s,i)=>s+total(i),0).toLocaleString()}`, icon: DollarSign, color: 'var(--brand-cyan)' },
    { label: 'Outstanding',   value: `$${invoices.filter(i=>i.status==='Sent').reduce((s,i)=>s+total(i),0).toLocaleString()}`,  icon: Clock,      color: 'var(--brand-purple)' },
    { label: 'Total Invoices',value: invoices.length,                                                                            icon: FileText,   color: 'var(--brand-blue)' },
    { label: 'Overdue',       value: invoices.filter(i=>i.status==='Overdue').length,                                           icon: AlertCircle,color: 'var(--brand-magenta)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing</h1>
          <p className="page-subtitle">Manage invoices and payments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Invoice
        </button>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card metric-card">
              <div className="metric-icon-wrapper" style={{ background: `${m.color}22` }}>
                <Icon size={22} style={{ color: m.color }} />
              </div>
              <div className="metric-info">
                <span className="metric-label">{m.label}</span>
                <span className="metric-value">{m.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="clients-tabs">
        {TABS.map(t => (
          <button key={t} className={`clients-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
            <span className="clients-tab-count">
              {t === 'All' ? invoices.length : invoices.filter(i => i.status === t).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <Receipt size={48} className="empty-icon" />
          <h3>No invoices yet</h3>
          <p>Create your first invoice to start tracking billing.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Invoice
          </button>
        </div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr><th>Number</th><th>Client</th><th>Amount</th><th>Due Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{inv.invoiceNumber || inv.number}</td>
                  <td>{inv.client}</td>
                  <td>${total(inv).toLocaleString()}</td>
                  <td>{inv.dueDate || '—'}</td>
                  <td><span className={`badge ${statusColors[inv.status]}`}>{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content billing-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Invoice</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Client *</label>
                  <input className="form-input" required value={form.client}
                    onChange={e => setForm({...form, client: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Due Date</label>
                  <input className="form-input" type="date" value={form.dueDate}
                    onChange={e => setForm({...form, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-input" value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}>
                  {['Draft','Sent','Paid','Overdue'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Line items */}
              <div className="billing-items-section">
                <div className="billing-items-header">
                  <label>Line Items</label>
                  <button type="button" className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={addItem}>
                    + Add Item
                  </button>
                </div>
                <div className="billing-items-table">
                  <div className="billing-items-cols">
                    <span>Description</span><span>Qty</span><span>Rate</span><span>Total</span><span></span>
                  </div>
                  {form.items.map((item, idx) => (
                    <div key={idx} className="billing-item-row">
                      <input className="form-input" placeholder="Item description"
                        value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                      <input className="form-input" type="number" min="1" value={item.qty}
                        onChange={e => updateItem(idx, 'qty', e.target.value)} style={{ width: 64 }} />
                      <input className="form-input" type="number" min="0" placeholder="0.00" value={item.rate}
                        onChange={e => updateItem(idx, 'rate', e.target.value)} />
                      <span className="billing-item-total">
                        ${(Number(item.qty) * Number(item.rate) || 0).toLocaleString()}
                      </span>
                      {form.items.length > 1 && (
                        <button type="button" className="btn-icon" onClick={() => removeItem(idx)}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="billing-total-row">
                    <span>Total</span>
                    <strong>${form.items.reduce((s,i)=>s+(Number(i.qty)*Number(i.rate)||0),0).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
