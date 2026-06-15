import React, { useState } from 'react';
import { Building, Plus, Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import './Finance.css';
import { formatCurrency } from '../../services/finance/financeService';

export default function FinanceBankReconciliation() {
  const [activeTab, setActiveTab] = useState('unreconciled');

  const transactions = [];

  const filteredTransactions = activeTab === 'unreconciled' 
    ? transactions.filter(t => !t.matched)
    : transactions.filter(t => t.matched);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bank Reconciliation</h1>
          <p className="page-subtitle">Match bank feeds to internal transactions</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Upload size={16} />
            <span>Import Statement</span>
          </button>
          <button className="btn btn-primary">
            <RefreshCw size={16} />
            <span>Sync Bank Feeds</span>
          </button>
        </div>
      </div>

      <div className="finance-kpi-grid mb-6">
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8' }}>
            <Building size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Bank Balance</span>
            <span className="finance-kpi-value">{formatCurrency(145800.50)}</span>
            <div className="finance-kpi-meta">Last synced 2 hours ago</div>
          </div>
        </div>
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <CheckCircle size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Ledger Balance</span>
            <span className="finance-kpi-value">{formatCurrency(150000.00)}</span>
            <div className="finance-kpi-meta">Updated just now</div>
          </div>
        </div>
        <div className="finance-kpi-card card" style={{ borderColor: 'var(--brand-warning)' }}>
          <div className="finance-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <AlertCircle size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Unreconciled Difference</span>
            <span className="finance-kpi-value">{formatCurrency(4199.50)}</span>
            <div className="finance-kpi-meta text-warning">2 pending transactions</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title flex items-center justify-between">
          <span>Transactions</span>
          <div className="flex gap-2">
            <button 
              className={`btn btn-sm ${activeTab === 'unreconciled' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('unreconciled')}
            >
              Unreconciled
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'reconciled' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('reconciled')}
            >
              Reconciled
            </button>
          </div>
        </div>
        
        <div className="table-container mt-4">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td className="font-semibold">{t.description}</td>
                  <td className={`font-semibold ${t.amount < 0 ? 'text-danger' : 'text-success'}`}>
                    {formatCurrency(Math.abs(t.amount))}
                  </td>
                  <td>
                    <span className="badge badge-neutral badge-sm">{t.type}</span>
                  </td>
                  <td>
                    {t.matched ? (
                      <span className="badge badge-success badge-sm flex items-center gap-1">
                        <CheckCircle size={12} /> Matched
                      </span>
                    ) : (
                      <span className="badge badge-warning badge-sm flex items-center gap-1">
                        <AlertCircle size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    {!t.matched ? (
                      <button className="btn btn-primary text-xs py-1 px-3">Find Match</button>
                    ) : (
                      <button className="btn btn-secondary text-xs py-1 px-3">Details</button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-muted">
                    No {activeTab} transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
