import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Plus, MoreVertical, Download, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { mockDb } from '../utils/mockDb';
import './Invoices.css';

export default function Invoices({ searchValue }) {
  const [invoices, setInvoices] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ client: '', amount: '', issueDate: '', dueDate: '', status: 'Draft' });

  useEffect(() => {
    setInvoices(mockDb.getInvoices());
  }, []);

  const handleAddInvoice = (e) => {
    e.preventDefault();
    const invoice = {
      id: "INV-2026-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      amount: parseFloat(newInvoice.amount) || 0,
      ...newInvoice
    };
    const updated = [...invoices, invoice];
    mockDb.saveInvoices(updated);
    setInvoices(updated);
    setShowAddModal(false);
    setNewInvoice({ client: '', amount: '', issueDate: '', dueDate: '', status: 'Draft' });
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.client.toLowerCase().includes((searchValue || '').toLowerCase()) ||
    invoice.id.toLowerCase().includes((searchValue || '').toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Paid': return <CheckCircle size={14} />;
      case 'Sent': return <Clock size={14} />;
      case 'Overdue': return <AlertCircle size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Paid': return 'badge-success';
      case 'Sent': return 'badge-warning';
      case 'Overdue': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Track payments and billing</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      <div className="invoices-metrics">
        <div className="card invoice-metric-card">
          <div className="invoice-metric-label">Total Outstanding</div>
          <div className="invoice-metric-value">$60,000</div>
        </div>
        <div className="card invoice-metric-card">
          <div className="invoice-metric-label">Overdue</div>
          <div className="invoice-metric-value text-danger">$15,000</div>
        </div>
        <div className="card invoice-metric-card">
          <div className="invoice-metric-label">Drafts</div>
          <div className="invoice-metric-value">$30,000</div>
        </div>
        <div className="card invoice-metric-card">
          <div className="invoice-metric-label">Paid This Month</div>
          <div className="invoice-metric-value text-success">$75,000</div>
        </div>
      </div>

      <div className="card table-container">
        <table className="custom-table invoices-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(invoice => (
              <tr key={invoice.id}>
                <td className="font-medium text-primary">{invoice.id}</td>
                <td className="font-medium">{invoice.client}</td>
                <td>${invoice.amount.toLocaleString()}</td>
                <td className="cell-date">{invoice.issueDate}</td>
                <td className="cell-date">{invoice.dueDate}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(invoice.status)} status-badge`}>
                    {getStatusIcon(invoice.status)}
                    {invoice.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-icon" title="Download PDF">
                    <Download size={18} />
                  </button>
                  <button className="btn-icon">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-secondary">
                  No invoices found matching "{searchValue}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Invoice</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddInvoice} className="modal-body">
              <div className="form-group">
                <label>Client</label>
                <input 
                  type="text" 
                  className="form-input"
                  required
                  value={newInvoice.client}
                  onChange={e => setNewInvoice({...newInvoice, client: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Amount ($)</label>
                  <input 
                    type="number" 
                    className="form-input"
                    required
                    value={newInvoice.amount}
                    onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status</label>
                  <select 
                    className="form-input"
                    value={newInvoice.status}
                    onChange={e => setNewInvoice({...newInvoice, status: e.target.value})}
                  >
                    <option>Draft</option>
                    <option>Sent</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Issue Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    required
                    value={newInvoice.issueDate}
                    onChange={e => setNewInvoice({...newInvoice, issueDate: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    required
                    value={newInvoice.dueDate}
                    onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
