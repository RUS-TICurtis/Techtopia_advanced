import React, { useState } from 'react';
import {
  ShoppingCart, Plus, Search, CheckCircle, Clock, X, AlertCircle,
  ThumbsUp, ThumbsDown, FileText, Building2, Send, Trash2
} from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import './Finance.css';
import { useProcurement, useVendors, useDepartments } from '../../hooks/useCrmData';

const STATUS_CONFIG = {
  Draft:     { class: 'badge-neutral', icon: FileText },
  Submitted: { class: 'badge-warning', icon: Clock },
  Approved:  { class: 'badge-success', icon: CheckCircle },
  Cancelled: { class: 'badge-danger',  icon: X },
  Completed: { class: 'badge-info',    icon: CheckCircle },
};

const PRIORITY_COLORS = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' };
const EMPTY_PO = { title: '', vendor: '', dept: '', amount: '', items: 1, priority: 'Medium', notes: '' };

export default function FinanceProcurement() {
  const { pos = [], isLoading: isLoadingPOs, createPurchaseOrder, approvePurchaseOrder, rejectPurchaseOrder, submitPurchaseOrder, deletePurchaseOrder } = useProcurement();
  const { vendors = [] } = useVendors();
  const { departments = [] } = useDepartments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPO, setNewPO] = useState(EMPTY_PO);

  const enrichedPOs = pos.map(po => {
    let title = "Purchase Order";
    let dept = "";
    if (po.notes) {
      const deptMatch = po.notes.match(/\(Dept: (.*?)\)/);
      if (deptMatch) dept = deptMatch[1];
      title = po.notes.split(' - ')[0].replace(/\(Dept:.*?\)/, '').trim() || po.notes;
    }
    const vendorName = vendors.find(v => v.id === po.vendorId)?.name || 'Unknown Vendor';
    
    return {
      ...po,
      displayId: po.poNumber || po.id.split('-')[0],
      title,
      vendor: vendorName,
      dept,
      amount: po.totalAmount || 0,
      date: new Date(po.orderDate).toLocaleDateString(),
      priority: 'Medium'
    };
  });

  const filtered = enrichedPOs.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.vendor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = enrichedPOs.filter(p => p.status === 'Submitted');

  const handleApprove = async (id) => {
    try {
      await approvePurchaseOrder(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectPurchaseOrder(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitDraft = async (id) => {
    try {
      await submitPurchaseOrder(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDraft = async (id) => {
    try {
      if (window.confirm('Are you sure you want to delete this draft purchase order?')) {
        await deletePurchaseOrder(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const isDraft = e.nativeEvent.submitter?.name === 'draft';
    
    // Fallback notes to title if empty, and append department if selected
    const finalNotes = newPO.notes 
      ? `${newPO.title} - ${newPO.notes} (Dept: ${newPO.dept || 'None'})`
      : `${newPO.title} (Dept: ${newPO.dept || 'None'})`;

    const itemCount = parseInt(newPO.items) || 1;
    const amount = parseFloat(newPO.amount) || 0;

    const payload = {
      vendorId: newPO.vendor,
      budgetId: null,
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: finalNotes,
      items: [
        {
          description: newPO.title || "PO Item",
          quantity: itemCount,
          unitPrice: amount / itemCount
        }
      ]
    };

    try {
      const createdPo = await createPurchaseOrder(payload);
      if (!isDraft && createdPo && createdPo.id) {
        await submitPurchaseOrder(createdPo.id);
      }
      setShowCreateModal(false);
      setNewPO(EMPTY_PO);
    } catch (err) {
      console.error(err);
    }
  };

  const approvedVendors = vendors.filter(v => ['Approved', 'Active'].includes(v.status));

  if (isLoadingPOs) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38BDF8]"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Procurement</h1>
          <p className="page-subtitle">Purchase orders, vendor requests, and approval workflows</p>
        </div>
        <div className="page-actions">
          {pending.length > 0 && (
            <button className="btn btn-secondary"><Clock size={16} /><span>Pending ({pending.length})</span></button>
          )}
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /><span>Create PO</span>
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="finance-metric-row">
        {[
          { label: 'Total POs', value: enrichedPOs.length },
          { label: 'Pending Approval', value: enrichedPOs.filter(p => p.status === 'Submitted').length },
          { label: 'Approved Value', value: formatCurrency(enrichedPOs.filter(p => ['Approved','Completed'].includes(p.status)).reduce((s, p) => s + p.amount, 0)) },
          { label: 'Cancelled', value: enrichedPOs.filter(p => p.status === 'Cancelled').length },
        ].map(m => (
          <div key={m.label} className="finance-metric-mini">
            <span className="finance-metric-mini-label">{m.label}</span>
            <span className="finance-metric-mini-value">{m.value}</span>
          </div>
        ))}
      </div>

      {/* Pending Approvals Queue */}
      {pending.length > 0 && (
        <div className="card">
          <div className="card-title"><Clock size={16} style={{ color: '#F59E0B' }} /> Awaiting Your Approval</div>
          {pending.map(po => (
            <div key={po.id} className="po-card" style={{ marginBottom: 10 }}>
              <ShoppingCart size={20} style={{ color: '#F59E0B', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p className="font-semibold text-sm">{po.title}</p>
                <p className="text-xs text-muted">{po.vendor} Â· {po.requestedBy} Â· {po.date}</p>
              </div>
              <span className="font-semibold" style={{ minWidth: 100, textAlign: 'right' }}>{formatCurrency(po.amount)}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleReject(po.id)}>
                  <ThumbsDown size={12} /> Reject
                </button>
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleApprove(po.id)}>
                  <ThumbsUp size={12} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div className="finance-filter-bar">
          <div className="finance-search-box">
            <Search size={14} />
            <input type="text" className="form-input" placeholder="Search purchase orders..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* PO Table */}
      <div className="card table-container" style={{ padding: 0 }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>PO Number</th><th>Title</th><th>Vendor</th><th>Dept</th>
              <th>Items</th><th>Amount</th><th>Priority</th><th>Date</th><th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(po => {
              const cfg = STATUS_CONFIG[po.status] || {};
              const StatusIcon = cfg.icon || FileText;
              return (
                <tr key={po.id}>
                  <td><span className="font-mono text-xs" style={{ color: 'var(--brand-cyan)' }}>{po.displayId}</span></td>
                  <td className="font-semibold text-sm">{po.title}</td>
                  <td className="text-sm text-muted">{po.vendor}</td>
                  <td className="text-xs text-muted">{po.dept}</td>
                  <td className="text-sm">{Array.isArray(po.items) ? po.items.length : po.items} items</td>
                  <td className="font-semibold">{formatCurrency(po.amount)}</td>
                  <td>
                    <span className="badge badge-sm" style={{ color: PRIORITY_COLORS[po.priority], background: `${PRIORITY_COLORS[po.priority]}15`, borderColor: `${PRIORITY_COLORS[po.priority]}30` }}>
                      {po.priority}
                    </span>
                  </td>
                  <td className="text-xs text-muted">{po.date}</td>
                  <td>
                    <span className={`badge badge-sm ${cfg.class}`} style={{ gap: 4 }}>
                      <StatusIcon size={10} /> {po.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {po.status === 'Submitted' && (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn-icon" onClick={() => handleApprove(po.id)} title="Approve"><ThumbsUp size={13} style={{ color: 'var(--success)' }} /></button>
                        <button className="btn-icon" onClick={() => handleReject(po.id)} title="Reject"><ThumbsDown size={13} style={{ color: 'var(--error)' }} /></button>
                      </div>
                    )}
                    {po.status === 'Draft' && (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn-icon" onClick={() => handleSubmitDraft(po.id)} title="Submit for Approval"><Send size={13} style={{ color: 'var(--brand-cyan)' }} /></button>
                        <button className="btn-icon" onClick={() => handleDeleteDraft(po.id)} title="Delete Draft"><Trash2 size={13} style={{ color: 'var(--error)' }} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create PO Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Purchase Order</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-group">
                <label>PO Title *</label>
                <input type="text" className="form-input" required value={newPO.title}
                  onChange={e => setNewPO(p => ({ ...p, title: e.target.value }))} placeholder="E.g. Server Rack Purchase" />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Vendor *</label>
                  <select className="form-input" required value={newPO.vendor}
                    onChange={e => setNewPO(p => ({ ...p, vendor: e.target.value }))}>
                    <option value="" disabled>Select Approved Vendor</option>
                    {approvedVendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Department</label>
                  <select className="form-input" value={newPO.dept}
                    onChange={e => setNewPO(p => ({ ...p, dept: e.target.value }))}>
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Amount (GHâ‚µ) *</label>
                  <input type="number" className="form-input" required min={0} value={newPO.amount}
                    onChange={e => setNewPO(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Number of Items</label>
                  <input type="number" className="form-input" min={1} value={newPO.items}
                    onChange={e => setNewPO(p => ({ ...p, items: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select className="form-input" value={newPO.priority} onChange={e => setNewPO(p => ({ ...p, priority: e.target.value }))}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-input" rows={2} value={newPO.notes}
                  onChange={e => setNewPO(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" name="draft" className="btn btn-secondary">Save Draft</button>
                <button type="submit" className="btn btn-primary"><ShoppingCart size={14} /> Submit for Approval</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
