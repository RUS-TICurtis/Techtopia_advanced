import React, { useState } from 'react';
import { UserCircle2, Plus, Search, X, ChevronDown } from 'lucide-react';
import './Clients.css';

const TABS     = ['All', 'Active', 'Prospect', 'Inactive'];
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Other'];

const emptyForm = {
  companyName: '', industry: 'Technology', status: 'Prospect',
  website: '', phone: '', address: '', contactName: '', email: ''
};

export default function Clients({ searchValue = '' }) {
  const [clients, setClients]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]          = useState(emptyForm);
  const [activeTab, setActiveTab] = useState('All');

  const handleSubmit = (e) => {
    e.preventDefault();
    setClients(prev => [...prev, { ...form, id: Date.now() }]);
    setForm(emptyForm);
    setShowModal(false);
  };

  const filtered = clients.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(searchValue.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchValue.toLowerCase());
    const matchesTab = activeTab === 'All' || c.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const statusColors = {
    Active: 'badge-success', Prospect: 'badge-info', Inactive: 'badge-neutral'
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your client accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Client
        </button>
      </div>

      {/* Tabs */}
      <div className="clients-tabs">
        {TABS.map(t => (
          <button
            key={t}
            className={`clients-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
            <span className="clients-tab-count">
              {t === 'All' ? clients.length : clients.filter(c => c.status === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-wrapper" style={{ maxWidth: 400 }}>
        <Search size={16} className="search-icon" />
        <input className="search-input" placeholder="Search clients..." readOnly value={searchValue} />
      </div>

      {/* Empty / Table */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <UserCircle2 size={48} className="empty-icon" />
          <h3>No clients yet</h3>
          <p>Add your first client to start managing your accounts.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Client
          </button>
        </div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Company</th><th>Contact</th><th>Industry</th>
                <th>Phone</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.companyName}</td>
                  <td>{c.contactName}<br/><span style={{fontSize:12,color:'var(--text-muted)'}}>{c.email}</span></td>
                  <td>{c.industry}</td>
                  <td>{c.phone || '—'}</td>
                  <td><span className={`badge ${statusColors[c.status] || 'badge-neutral'}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Client</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Company Name *</label>
                  <input className="form-input" required value={form.companyName}
                    onChange={e => setForm({...form, companyName: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Industry</label>
                  <select className="form-input" value={form.industry}
                    onChange={e => setForm({...form, industry: e.target.value})}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Contact Name</label>
                  <input className="form-input" value={form.contactName}
                    onChange={e => setForm({...form, contactName: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Email</label>
                  <input className="form-input" type="email" value={form.email}
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
                  <label>Status</label>
                  <select className="form-input" value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}>
                    {['Active','Prospect','Inactive'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Website</label>
                  <input className="form-input" placeholder="https://" value={form.website}
                    onChange={e => setForm({...form, website: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Address</label>
                  <input className="form-input" value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
