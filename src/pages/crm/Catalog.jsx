import React, { useState } from 'react';
import { PackageSearch, Plus, Tag, Layers, Search, Filter, Edit3, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';

export default function Catalog() {
  const [searchTerm, setSearchTerm] = useState('');

  const products = [];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Product & Service Catalog</h1>
          <p className="page-subtitle">Manage your offerings and pricing</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="finance-kpi-grid mb-6">
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8' }}>
            <PackageSearch size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Total Items</span>
            <span className="finance-kpi-value">{products.length}</span>
          </div>
        </div>
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <Tag size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Active Subscriptions</span>
            <span className="finance-kpi-value">3</span>
          </div>
        </div>
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
            <Layers size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Categories</span>
            <span className="finance-kpi-value">4</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-4">
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search products or services..." 
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
                <th>Item ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Base Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(item => (
                <tr key={item.id}>
                  <td className="font-mono text-xs text-brand-cyan">{item.id}</td>
                  <td className="font-semibold">{item.name}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className="badge badge-neutral badge-sm">{item.type}</span>
                  </td>
                  <td className="font-semibold">{formatCurrency(item.price)}</td>
                  <td>
                    <span className={`badge badge-sm ${item.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {item.status}
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
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-muted">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
