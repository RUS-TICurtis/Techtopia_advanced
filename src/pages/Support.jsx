import React, { useState, useEffect } from 'react';
import { LifeBuoy, Search, Filter, Plus, MoreVertical, MessageCircle, AlertCircle, CheckCircle, X } from 'lucide-react';
import { mockDb } from '../utils/mockDb';
import './Support.css';

export default function Support({ searchValue }) {
  const [tickets, setTickets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', client: '', priority: 'Medium', status: 'Open' });

  useEffect(() => {
    setTickets(mockDb.getTickets());
  }, []);

  const handleAddTicket = (e) => {
    e.preventDefault();
    const ticket = {
      id: "TK-2026-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      lastUpdated: "Just now",
      ...newTicket
    };
    const updated = [ticket, ...tickets];
    mockDb.saveTickets(updated);
    setTickets(updated);
    setShowAddModal(false);
    setNewTicket({ subject: '', client: '', priority: 'Medium', status: 'Open' });
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes((searchValue || '').toLowerCase()) ||
    ticket.client.toLowerCase().includes((searchValue || '').toLowerCase()) ||
    ticket.id.toLowerCase().includes((searchValue || '').toLowerCase())
  );

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Resolved': return 'badge-success';
      case 'In Progress': return 'badge-warning';
      case 'Open': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">Manage client requests and issues</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      <div className="support-metrics">
        <div className="card support-metric-card">
          <div className="support-metric-label">Open Tickets</div>
          <div className="support-metric-value text-danger">1</div>
        </div>
        <div className="card support-metric-card">
          <div className="support-metric-label">In Progress</div>
          <div className="support-metric-value text-warning">1</div>
        </div>
        <div className="card support-metric-card">
          <div className="support-metric-label">Avg. Resolution Time</div>
          <div className="support-metric-value">4.2 hours</div>
        </div>
      </div>

      <div className="card table-container">
        <table className="custom-table support-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>Client</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket.id}>
                <td className="font-medium text-primary">{ticket.id}</td>
                <td className="font-medium">{ticket.subject}</td>
                <td>{ticket.client}</td>
                <td>
                  <span className={`priority-indicator ${getPriorityClass(ticket.priority)}`}></span>
                  {ticket.priority}
                </td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(ticket.status)} status-badge`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="cell-date">{ticket.lastUpdated}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-outline">
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-secondary">
                  No tickets found matching "{searchValue}"
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
              <h2>Create Ticket</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTicket} className="modal-body">
              <div className="form-group">
                <label>Subject</label>
                <input 
                  type="text" 
                  className="form-input"
                  required
                  value={newTicket.subject}
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Client</label>
                <input 
                  type="text" 
                  className="form-input"
                  required
                  value={newTicket.client}
                  onChange={e => setNewTicket({...newTicket, client: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select 
                    className="form-input"
                    value={newTicket.priority}
                    onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status</label>
                  <select 
                    className="form-input"
                    value={newTicket.status}
                    onChange={e => setNewTicket({...newTicket, status: e.target.value})}
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
