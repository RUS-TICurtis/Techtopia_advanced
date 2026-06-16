import React, { useState } from 'react';
import { Package, Plus, Calculator, Settings, Edit3, Trash2, X } from 'lucide-react';
import './Finance.css';
import { formatCurrency } from '../../services/finance/financeService';

export default function FinanceAssets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', category: '', purchaseValue: '', date: '' });

  const handleCreateAsset = (e) => {
    e.preventDefault();
    alert(`Registering Asset: ${newAsset.name}`);
    setShowCreateModal(false);
  };

  const assets = [];

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssetsValue = assets.reduce((sum, a) => sum + a.currentValue, 0);

  return (
    <>
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
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
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

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Register Fixed Asset</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAsset} className="modal-body">
              <div className="form-group">
                <label>Asset Name *</label>
                <input 
                  className="form-input" 
                  required 
                  placeholder="e.g. MacBook Pro M3"
                  value={newAsset.name}
                  onChange={e => setNewAsset({...newAsset, name: e.target.value})} 
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Category *</label>
                  <select 
                    className="form-input" 
                    required
                    value={newAsset.category}
                    onChange={e => setNewAsset({...newAsset, category: e.target.value})}
                  >
                    <option value="">Select category...</option>
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Furniture">Office Furniture</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Software">Software & IP</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Purchase Date *</label>
                  <input 
                    type="date"
                    className="form-input" 
                    required
                    value={newAsset.date}
                    onChange={e => setNewAsset({...newAsset, date: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Purchase Value ($) *</label>
                <input 
                  type="number"
                  step="0.01"
                  className="form-input" 
                  required 
                  placeholder="0.00"
                  value={newAsset.purchaseValue}
                  onChange={e => setNewAsset({...newAsset, purchaseValue: e.target.value})} 
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
