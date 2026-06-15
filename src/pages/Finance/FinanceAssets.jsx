import React, { useState } from 'react';
import { Package, Plus, Calculator, Settings, Edit3, Trash2 } from 'lucide-react';
import './Finance.css';
import { formatCurrency } from '../../services/finance/financeService';

export default function FinanceAssets() {
  const [searchTerm, setSearchTerm] = useState('');

  const assets = [];

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssetsValue = assets.reduce((sum, a) => sum + a.currentValue, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fixed Assets</h1>
          <p className="page-subtitle">Manage company physical and digital assets</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Calculator size={16} />
            <span>Run Depreciation</span>
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      <div className="finance-kpi-grid mb-6">
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8' }}>
            <Package size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Total Assets</span>
            <span className="finance-kpi-value">{assets.length}</span>
          </div>
        </div>
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <Calculator size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Current Net Book Value</span>
            <span className="finance-kpi-value">{formatCurrency(totalAssetsValue)}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title flex items-center justify-between">
          <span>Asset Register</span>
        </div>
        
        <div className="flex gap-4 mb-4 mt-2">
          <div className="search-bar" style={{ flex: 1 }}>
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary">
            <Settings size={16} /> Settings
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Purchase Date</th>
                <th>Purchase Value</th>
                <th>Current Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <tr key={asset.id}>
                  <td className="font-mono text-xs text-brand-cyan">{asset.id}</td>
                  <td className="font-semibold">{asset.name}</td>
                  <td>{asset.category}</td>
                  <td className="text-muted">{asset.purchaseDate}</td>
                  <td>{formatCurrency(asset.purchaseValue)}</td>
                  <td className="font-semibold text-success">{formatCurrency(asset.currentValue)}</td>
                  <td>
                    <span className={`badge badge-sm ${asset.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="text-muted hover:text-brand-cyan transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button className="text-muted hover:text-danger transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-muted">
                    No assets found.
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
