import React, { useState } from 'react';
import { Mail, Plus, Users, TrendingUp, Search, Filter, Play, Pause } from 'lucide-react';

export default function Campaigns() {
  const [searchTerm, setSearchTerm] = useState('');

  const campaigns = [];

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Marketing Campaigns</h1>
          <p className="page-subtitle">Manage and track email marketing efforts</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={16} />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      <div className="finance-kpi-grid mb-6">
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8' }}>
            <Mail size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Active Campaigns</span>
            <span className="finance-kpi-value">{campaigns.filter(c => c.status === 'Active').length}</span>
          </div>
        </div>
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <Users size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Total Recipients</span>
            <span className="finance-kpi-value">2,440</span>
          </div>
        </div>
        <div className="finance-kpi-card card">
          <div className="finance-kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
            <TrendingUp size={22} />
          </div>
          <div className="finance-kpi-content">
            <span className="finance-kpi-label">Avg Open Rate</span>
            <span className="finance-kpi-value">44.6%</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-4 mb-4">
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
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
                <th>Campaign Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Open Rate</th>
                <th>Click Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map(camp => (
                <tr key={camp.id}>
                  <td className="font-semibold">{camp.name}</td>
                  <td>
                    <span className="badge badge-neutral badge-sm">{camp.type}</span>
                  </td>
                  <td>
                    <span className={`badge badge-sm ${
                      camp.status === 'Active' ? 'badge-success' : 
                      camp.status === 'Completed' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td>{camp.sent}</td>
                  <td className="font-semibold">{camp.openRate}</td>
                  <td className="font-semibold">{camp.clickRate}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {camp.status === 'Active' ? (
                        <button className="text-muted hover:text-warning transition-colors" title="Pause">
                          <Pause size={16} />
                        </button>
                      ) : (
                        <button className="text-muted hover:text-success transition-colors" title="Start">
                          <Play size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-muted">No campaigns found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
