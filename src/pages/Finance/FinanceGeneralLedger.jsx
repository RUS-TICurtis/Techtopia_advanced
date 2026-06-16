import React, { useState } from 'react';
import { Book, Plus, Filter, Download, Search, RefreshCw, X } from 'lucide-react';
import './Finance.css';
import { formatCurrency } from '../../services/finance/financeService';

export default function FinanceGeneralLedger() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ account: '', debit: '', credit: '', description: '' });

  const ledgerAccounts = [];

  const handleCreateEntry = (e) => {
    e.preventDefault();
    alert(`Journal Entry Recorded: ${newEntry.description}`);
    setShowCreateModal(false);
  };

  const filteredAccounts = ledgerAccounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    account.id.includes(searchTerm)
  );

  return (
    <>
      <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">General Ledger</h1>
          <p className="page-subtitle">Chart of accounts and double-entry bookkeeping</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Download size={16} />
            <span>Export Trial Balance</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>New Journal Entry</span>
          </button>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-title">
          Chart of Accounts
        </div>
        <div className="flex gap-4 mb-4">
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search accounts by name or ID..." 
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
                <th>Account ID</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Current Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map(account => (
                <tr key={account.id}>
                  <td className="font-mono text-xs text-brand-cyan">{account.id}</td>
                  <td className="font-semibold">{account.name}</td>
                  <td>
                    <span className="badge badge-neutral badge-sm">{account.type}</span>
                  </td>
                  <td className="font-semibold">{formatCurrency(account.balance)}</td>
                  <td>
                    <span className="badge badge-success badge-sm">{account.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-secondary text-xs py-1 px-2">View Ledger</button>
                  </td>
                </tr>
              ))}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-muted">No accounts found matching "{searchTerm}"</td>
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
              <h2>New Journal Entry</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateEntry} className="modal-body">
              <div className="form-group">
                <label>Account *</label>
                <select 
                  className="form-input" 
                  required
                  value={newEntry.account}
                  onChange={e => setNewEntry({...newEntry, account: e.target.value})}
                >
                  <option value="">Select account...</option>
                  <option value="cash">1000 - Cash</option>
                  <option value="ar">1200 - Accounts Receivable</option>
                  <option value="revenue">4000 - Sales Revenue</option>
                  <option value="expense">5000 - General Expenses</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Debit Amount</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="form-input" 
                    placeholder="0.00"
                    value={newEntry.debit}
                    onChange={e => setNewEntry({...newEntry, debit: e.target.value})} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Credit Amount</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="form-input" 
                    placeholder="0.00"
                    value={newEntry.credit}
                    onChange={e => setNewEntry({...newEntry, credit: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description / Memo *</label>
                <input 
                  className="form-input" 
                  required 
                  placeholder="e.g. Monthly software subscriptions"
                  value={newEntry.description}
                  onChange={e => setNewEntry({...newEntry, description: e.target.value})} 
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Record Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
