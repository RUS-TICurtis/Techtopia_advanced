import React, { useState } from 'react';
import { FileText, Plus, FileSignature, Send, Download, Search, Filter, X } from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';

export default function Quotes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuote, setNewQuote] = useState({ client: '', value: '', validUntil: '' });

  const quotes = [];

  const handleCreateQuote = (e) => {
    e.preventDefault();
    alert(`Generating Quote for: ${newQuote.client}`);
    setShowCreateModal(false);
  };

  const filteredQuotes = quotes.filter(q => 
    q.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotes & Proposals</h1>
          <p className="page-subtitle">Create and track sales proposals</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>New Quote</span>
          </button>
        </div>
      </div>

      <div className="finance-kpi-grid mb-6">
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8' }}>
            <FileText size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Active Quotes</span>
            <span className="finance-kpi-value">{quotes.filter(q => q.status === 'Sent' || q.status === 'Draft').length}</span>
          </div>
        </div>
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <FileSignature size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Accepted (YTD)</span>
            <span className="finance-kpi-value">{quotes.filter(q => q.status === 'Accepted').length}</span>
            <div className="finance-kpi-meta text-success">68% Win Rate</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-4">
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search quotes by client or ID..." 
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
                <th>Quote ID</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date Issued</th>
                <th>Valid Until</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map(quote => (
                <tr key={quote.id}>
                  <td className="font-mono text-xs text-brand-cyan">{quote.id}</td>
                  <td className="font-semibold">{quote.client}</td>
                  <td className="font-semibold">{formatCurrency(quote.value)}</td>
                  <td>
                    <span className={`badge badge-sm ${
                      quote.status === 'Accepted' ? 'badge-success' : 
                      quote.status === 'Declined' ? 'badge-danger' : 
                      quote.status === 'Sent' ? 'badge-info' : 'badge-neutral'
                    }`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="text-muted text-xs">{quote.date}</td>
                  <td className="text-muted text-xs">{quote.validUntil}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="text-muted hover:text-brand-cyan transition-colors" title="Send via Email">
                        <Send size={16} />
                      </button>
                      <button className="text-muted hover:text-brand-cyan transition-colors" title="Download PDF">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-muted">No quotes found.</td>
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
              <h2>Draft New Quote / Proposal</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateQuote} className="modal-body">
              <div className="form-group">
                <label>Client Name *</label>
                <input 
                  className="form-input" 
                  required 
                  placeholder="Enter client or prospect name"
                  value={newQuote.client}
                  onChange={e => setNewQuote({...newQuote, client: e.target.value})} 
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Total Value ($) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="form-input" 
                    required
                    placeholder="0.00"
                    value={newQuote.value}
                    onChange={e => setNewQuote({...newQuote, value: e.target.value})} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Valid Until *</label>
                  <input 
                    type="date"
                    className="form-input" 
                    required
                    value={newQuote.validUntil}
                    onChange={e => setNewQuote({...newQuote, validUntil: e.target.value})} 
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
