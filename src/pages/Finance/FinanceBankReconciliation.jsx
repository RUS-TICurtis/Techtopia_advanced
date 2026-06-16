import React, { useState } from 'react';
import { Building, Plus, Upload, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import './Finance.css';
import { formatCurrency } from '../../services/finance/financeService';

export default function FinanceBankReconciliation() {
  const [activeTab, setActiveTab] = useState('unreconciled');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState('');

  const transactions = [];

  const handleImport = (e) => {
    e.preventDefault();
    alert("Importing bank statement...");
    setShowImportModal(false);
  };

  const filteredTransactions = activeTab === 'unreconciled' 
    ? transactions.filter(t => !t.matched)
    : transactions.filter(t => t.matched);

  return (
    <>
      <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bank Reconciliation</h1>
          <p className="page-subtitle">Match bank feeds to internal transactions</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
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

      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Import Bank Statement</h2>
              <button className="btn-icon" onClick={() => setShowImportModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleImport} className="modal-body">
              <div className="form-group">
                <label>Select Bank Account *</label>
                <select className="form-input" required>
                  <option value="">Select account...</option>
                  <option value="chase">Chase Business Checking (...1234)</option>
                  <option value="svb">SVB Operating Account (...9988)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Statement File (CSV, QBO, OFX) *</label>
                <input 
                  type="file"
                  className="form-input" 
                  required 
                  accept=".csv,.qbo,.ofx"
                  onChange={e => setImportFile(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowImportModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload & Parse</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
