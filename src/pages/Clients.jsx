import React, { useState } from 'react';
import { UserCircle2, Plus, Search, X, ShieldAlert, Award, Briefcase, Activity } from 'lucide-react';
import Badge from '../components/ui/Badge';
import './Clients.css';

const TABS     = ['All', 'Active', 'Prospect', 'Inactive'];
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Other'];

const emptyForm = {
  companyName: '', industry: 'Technology', status: 'Prospect',
  website: '', phone: '', address: '', contactName: '', email: ''
};

export default function Clients({ searchValue = '' }) {
  const [clients, setClients]   = useState([
    { id: '1', companyName: 'CyberPulse Security', industry: 'Technology', status: 'Active', contactName: 'Curtis Miller', email: 'curtis@cyberpulse.io', phone: '+1 (555) 019-9233' },
    { id: '2', companyName: 'BioGen Lab Systems', industry: 'Healthcare', status: 'Prospect', contactName: 'Catherine Song', email: 'c.song@biogen.com', phone: '+1 (555) 014-8821' },
    { id: '3', companyName: 'Roma Tech Inc.', industry: 'Finance', status: 'Active', contactName: 'Faye Morgan', email: 'f.morgan@romatech.eu', phone: '+39 06 555 1290' },
  ]);
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

  const metrics = [
    { label: 'Total Clients', value: clients.length, icon: UserCircle2, color: 'var(--brand-blue)' },
    { label: 'Active',        value: clients.filter(c => c.status === 'Active').length, icon: Award, color: 'var(--brand-green)' },
    { label: 'Prospects',     value: clients.filter(c => c.status === 'Prospect').length, icon: Briefcase, color: 'var(--brand-cyan)' },
    { label: 'Inactive',      value: clients.filter(c => c.status === 'Inactive').length, icon: ShieldAlert, color: 'var(--brand-magenta)' }
  ];

  return (
    <div className="page-container clients-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <UserCircle2 className="text-[#3772FF]" />
            Corporate Clients
          </h1>
          <p className="page-subtitle">Manage executive business client accounts & profiles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Client
        </button>
      </div>

      {/* Premium KPI Metrics */}
      <div className="metrics-grid mb-6">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card metric-card">
              <div className="metric-icon-wrapper" style={{ background: `${m.color}15` }}>
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

      {/* Tabs Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="clients-tabs flex gap-2">
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

        <div className="search-wrapper w-full md:max-w-xs" style={{ margin: 0 }}>
          <Search size={16} className="search-icon" />
          <input 
            className="search-input w-full" 
            placeholder="Search clients..." 
            value={searchValue}  
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-main)'
            }}
          />
        </div>
      </div>

      {/* Table grid */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <UserCircle2 size={48} className="empty-icon" />
          <h3>No clients cataloged</h3>
          <p>Register your first business account to initialize portfolios.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Client
          </button>
        </div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Company</th><th>Primary Contact</th><th>Industry</th>
                <th>Phone</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-title)' }}>{c.companyName}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.contactName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.email}</div>
                  </td>
                  <td>{c.industry}</td>
                  <td><code>{c.phone || '—'}</code></td>
                  <td>
                    <Badge variant={c.status === 'Active' ? 'success' : c.status === 'Prospect' ? 'info' : 'neutral'}>
                      {c.status}
                    </Badge>
                  </td>
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
              <h2>New Client Account</h2>
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
