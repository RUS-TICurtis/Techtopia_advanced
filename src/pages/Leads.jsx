import React, { useState } from 'react';
import { TrendingUp, Plus, Search, X, ChevronDown } from 'lucide-react';
import './Leads.css';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
const SOURCES  = ['Website', 'Referral', 'LinkedIn', 'Email Campaign', 'Cold Call', 'Other'];

const emptyForm = {
  fullName: '', email: '', phone: '',
  company: '', dealValue: '', source: 'Website',
  status: 'New', notes: ''
};

export default function Leads({ searchValue = '' }) {
  const [leads, setLeads]             = useState([]);
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState('All');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLeads(prev => [...prev, { ...form, id: Date.now() }]);
    setForm(emptyForm);
    setShowModal(false);
  };

  const filtered = leads.filter(l => {
    const matchesSearch = l.fullName.toLowerCase().includes(searchValue.toLowerCase()) ||
      l.email.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = filterStatus === 'All' || l.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length;
    return acc;
  }, {});

  const statusColors = {
    New: 'badge-info', Contacted: 'badge-neutral', Qualified: 'badge-warning',
    Proposal: 'badge-info', Won: 'badge-success', Lost: 'badge-danger'
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">Track and manage your sales leads</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Lead
        </button>
      </div>

      {/* Status metric pills */}
      <div className="leads-status-row">
        {STATUSES.map(s => (
          <div key={s} className={`leads-status-pill ${statusColors[s]}`}>
            <span className="leads-status-label">{s}</span>
            <span className="leads-status-count">{counts[s]}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="leads-filters">
        <div className="search-wrapper" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={16} className="search-icon" />
          <input className="search-input" placeholder="Search leads..." readOnly value={searchValue} />
        </div>
        <div className="filter-select-wrapper">
          <select
            className="form-input filter-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="filter-select-icon" />
        </div>
      </div>

      {/* Empty state / table */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <TrendingUp size={48} className="empty-icon" />
          <h3>No leads yet</h3>
          <p>Add your first lead to get started tracking your sales pipeline.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Lead
          </button>
        </div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Company</th>
                <th>Deal Value</th><th>Source</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id}>
                  <td style={{ fontWeight: 600 }}>{lead.fullName}</td>
                  <td>{lead.email}</td>
                  <td>{lead.company}</td>
                  <td>{lead.dealValue ? `$${lead.dealValue}` : '—'}</td>
                  <td>{lead.source}</td>
                  <td><span className={`badge ${statusColors[lead.status]}`}>{lead.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Lead</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Full Name *</label>
                  <input className="form-input" required value={form.fullName}
                    onChange={e => setForm({...form, fullName: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Email *</label>
                  <input className="form-input" type="email" required value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Phone</label>
                  <input className="form-input" value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Company</label>
                  <input className="form-input" value={form.company}
                    onChange={e => setForm({...form, company: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Deal Value ($)</label>
                  <input className="form-input" type="number" min="0" value={form.dealValue}
                    onChange={e => setForm({...form, dealValue: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Source</label>
                  <select className="form-input" value={form.source}
                    onChange={e => setForm({...form, source: e.target.value})}>
                    {SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-input" value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-input form-textarea" value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
