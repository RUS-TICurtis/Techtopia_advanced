import React, { useState } from 'react';
import { LifeBuoy, Search, Plus, X, MessageSquare, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import './Support.css';

const TABS     = ['All', 'Open', 'In Progress', 'Resolved'];
const emptyForm = { subject: '', client: '', priority: 'Medium', status: 'Open', message: '' };

const statusColors = {
  Open: 'badge-danger', 'In Progress': 'badge-warning',
  Resolved: 'badge-success', Closed: 'badge-neutral'
};

const priorityColors = {
  High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low'
};

export default function Support({ searchValue = '' }) {
  const [tickets, setTickets]    = useState([]);
  const [showModal, setShowModal]  = useState(false);
  const [form, setForm]            = useState(emptyForm);
  const [activeTab, setActiveTab]  = useState('All');

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = `TK-${String(tickets.length + 1).padStart(4, '0')}`;
    setTickets(prev => [...prev, { ...form, id, lastUpdated: 'Just now' }]);
    setForm(emptyForm);
    setShowModal(false);
  };

  const filtered = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchValue.toLowerCase()) ||
      t.client.toLowerCase().includes(searchValue.toLowerCase()) ||
      t.id.toLowerCase().includes(searchValue.toLowerCase());
    const matchesTab = activeTab === 'All' || t.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const metrics = [
    { label: 'Open Tickets',    value: tickets.filter(t=>t.status==='Open').length,       icon: AlertCircle, color: 'var(--brand-magenta)' },
    { label: 'In Progress',     value: tickets.filter(t=>t.status==='In Progress').length,icon: Clock,       color: 'var(--brand-chartreuse)' },
    { label: 'Resolved',        value: tickets.filter(t=>t.status==='Resolved').length,   icon: CheckCircle, color: 'var(--brand-green)' },
    { label: 'Avg. Resolution', value: '4.2h',                                            icon: LifeBuoy,    color: 'var(--brand-cyan)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Support</h1>
          <p className="page-subtitle">Manage client requests and issue tickets</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Ticket
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
              {t === 'All' ? tickets.length : tickets.filter(ti => ti.status === t).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <MessageSquare size={48} className="empty-icon" />
          <h3>No tickets yet</h3>
          <p>Support tickets will appear here once submitted.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Ticket
          </button>
        </div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr><th>Ticket ID</th><th>Subject</th><th>Client</th><th>Priority</th><th>Status</th><th>Last Updated</th></tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{t.id}</td>
                  <td style={{ fontWeight: 600 }}>{t.subject}</td>
                  <td>{t.client}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--${priorityColors[t.priority] || 'text-muted'})` }}></span>
                      {t.priority}
                    </div>
                  </td>
                  <td><span className={`badge ${statusColors[t.status]}`}>{t.status}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.lastUpdated}</td>
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
              <h2>New Support Ticket</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Subject *</label>
                <input className="form-input" required value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Client *</label>
                <input className="form-input" required value={form.client}
                  onChange={e => setForm({...form, client: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select className="form-input" value={form.priority}
                    onChange={e => setForm({...form, priority: e.target.value})}>
                    {['Low','Medium','High'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status</label>
                  <select className="form-input" value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}>
                    {['Open','In Progress','Resolved'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Message / Description</label>
                <textarea className="form-input form-textarea" value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
