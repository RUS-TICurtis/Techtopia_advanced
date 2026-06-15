import React, { useState } from 'react';
import { Book, Plus, Filter, Download, Search, RefreshCw } from 'lucide-react';
import './Finance.css';
import { formatCurrency } from '../../services/finance/financeService';

export default function FinanceGeneralLedger() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const ledgerAccounts = [];

  const filteredAccounts = ledgerAccounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    account.id.includes(searchTerm)
  );

  return (
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
          <button className="btn btn-primary">
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
  );
}
