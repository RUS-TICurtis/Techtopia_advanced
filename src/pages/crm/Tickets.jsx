import React, { useState } from 'react';
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle, Search, Filter } from 'lucide-react';

export default function Tickets() {
  const [searchTerm, setSearchTerm] = useState('');

  const tickets = [];

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">Manage customer issues and requests</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">
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
  );
}
