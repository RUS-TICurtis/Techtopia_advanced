import React, { useState } from 'react';
import { Users, Search, Plus, X, Shield, UserCheck, UserCog } from 'lucide-react';
import './Team.css';

export default function Team() {
  const [members, setMembers]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]     = useState('');
  const [form, setForm]         = useState({ name: '', email: '', role: 'Sales', department: '' });

  const ROLES = ['Admin', 'Sales', 'Support', 'Manager', 'Viewer'];

  const roleIcons = { Admin: Shield, Manager: UserCog, default: UserCheck };

  const metrics = [
    { label: 'Total Members', value: members.length,                          color: 'var(--brand-cyan)' },
    { label: 'Admins',        value: members.filter(m=>m.role==='Admin').length, color: 'var(--brand-purple)' },
    { label: 'Active',        value: members.length,                          color: 'var(--brand-green)' },
    { label: 'Sales',         value: members.filter(m=>m.role==='Sales').length, color: 'var(--brand-blue)' },
  ];

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setMembers(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ name: '', email: '', role: 'Sales', department: '' });
    setShowModal(false);
  };

  const roleColors = {
    Admin: 'badge-danger', Manager: 'badge-info',
    Sales: 'badge-success', Support: 'badge-warning', Viewer: 'badge-neutral'
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Manage your internal team members and their roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Invite Member
        </button>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        {metrics.map(m => (
          <div key={m.label} className="card team-metric-card">
            <div className="team-metric-icon" style={{ background: `${m.color}22`, color: m.color }}>
              <Users size={22} />
            </div>
            <div>
              <div className="team-metric-value">{m.value}</div>
              <div className="team-metric-label">{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="search-wrapper" style={{ maxWidth: 440 }}>
        
        <input style={{ maxWidth: 440 }} 
          className="search-input"
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        /><Search size={16} className="search-icon" />
      </div>

      {/* Empty / List */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <Users size={48} className="empty-icon" />
          <h3>No team members found</h3>
          <p>Internal team members will appear here once they sign in</p>
        </div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Department</th><th>Role</th></tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className="team-member-name">
                      <div className="team-member-avatar">{m.name.charAt(0).toUpperCase()}</div>
                      {m.name}
                    </div>
                  </td>
                  <td>{m.email}</td>
                  <td>{m.department || '—'}</td>
                  <td><span className={`badge ${roleColors[m.role] || 'badge-neutral'}`}>{m.role}</span></td>
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
              <h2>Invite Team Member</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Full Name *</label>
                  <input className="form-input" required value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Email *</label>
                  <input className="form-input" type="email" required value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Role</label>
                  <select className="form-input" value={form.role}
                    onChange={e => setForm({...form, role: e.target.value})}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Department</label>
                  <input className="form-input" value={form.department}
                    onChange={e => setForm({...form, department: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
