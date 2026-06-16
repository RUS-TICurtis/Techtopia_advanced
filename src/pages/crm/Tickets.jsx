import React, { useState } from 'react';
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle, Search, Filter, X } from 'lucide-react';

export default function Tickets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', client: '', priority: 'Medium', description: '' });

  const tickets = [];

  const handleCreateTicket = (e) => {
    e.preventDefault();
    alert(`Ticket created: ${newTicket.subject}`);
    setShowCreateModal(false);
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">Manage customer issues and requests</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      <div className="finance-kpi-grid mb-6">
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
            <LifeBuoy size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Open Tickets</span>
            <span className="finance-kpi-value">12</span>
            <div className="finance-kpi-meta text-danger">3 Critical</div>
          </div>
        </div>
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <Clock size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Avg Resolution Time</span>
            <span className="finance-kpi-value">4.2 hrs</span>
          </div>
        </div>
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <CheckCircle size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">CSAT Score</span>
            <span className="finance-kpi-value">94%</span>
            <div className="finance-kpi-meta text-success">+2% this month</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-4">
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search tickets by subject, ID, or client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Client</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Assignee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id}>
                  <td className="font-mono text-xs text-brand-cyan">{ticket.id}</td>
                  <td className="font-semibold">{ticket.subject}</td>
                  <td>{ticket.client}</td>
                  <td>
                    <span className={`badge badge-sm ${
                      ticket.priority === 'Critical' ? 'badge-danger' : 
                      ticket.priority === 'High' ? 'badge-warning' : 
                      ticket.priority === 'Medium' ? 'badge-info' : 'badge-neutral'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-sm ${
                      ticket.status === 'Open' ? 'badge-danger' : 
                      ticket.status === 'In Progress' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="text-muted text-xs">{ticket.created}</td>
                  <td>{ticket.assignee}</td>
                  <td>
                    <button className="btn btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                      <MessageSquare size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-muted">No tickets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Support Ticket</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateTicket} className="modal-body">
              <div className="form-group">
                <label>Subject *</label>
                <input 
                  className="form-input" 
                  required 
                  placeholder="Brief summary of the issue"
                  value={newTicket.subject}
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})} 
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Client / Contact *</label>
                  <input 
                    className="form-input" 
                    required
                    placeholder="Search client..."
                    value={newTicket.client}
                    onChange={e => setNewTicket({...newTicket, client: e.target.value})} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select 
                    className="form-input" 
                    value={newTicket.priority}
                    onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  className="form-input" 
                  rows={4}
                  required
                  placeholder="Detailed description of the issue..."
                  value={newTicket.description}
                  onChange={e => setNewTicket({...newTicket, description: e.target.value})} 
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
