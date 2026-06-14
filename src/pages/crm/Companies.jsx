import React, { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, MapPin, Globe, Users, X } from 'lucide-react';
import { useCompanies } from '../../hooks/useCrmData';
import './Companies.css';

export default function Companies({ searchValue }) {
  const { companies = [], isLoading, createCompany } = useCompanies();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', industry: 'Technology', location: '', website: '', employees: '1-10', status: 'Prospect', value: 0 });

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      await createCompany({
        name: newCompany.name,
        industry: newCompany.industry,
        location: newCompany.location,
        website: newCompany.website || '',
        employees: newCompany.employees || '1-10',
        status: newCompany.status,
        value: parseFloat(newCompany.value) || 0
      });
      setShowAddModal(false);
      setNewCompany({ name: '', industry: 'Technology', location: '', website: '', employees: '1-10', status: 'Prospect', value: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCompanies = companies.filter(company => 
    (company.name || '').toLowerCase().includes((searchValue || '').toLowerCase()) ||
    (company.industry || '').toLowerCase().includes((searchValue || '').toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle">Manage your accounts and organizations</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[250px] bg-[#1E293B]/20 border border-gray-800 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38BDF8]"></div>
        </div>
      ) : (
        <div className="card table-container">
          <table className="custom-table companies-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Employees</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map(company => (
                <tr key={company.id}>
                  <td>
                    <div className="company-name-cell">
                      <div className="company-avatar">
                        {(company.name || 'C').charAt(0)}
                      </div>
                      <div className="company-details">
                        <div className="company-title">{company.name}</div>
                        <div className="company-meta">
                          <Globe size={12} /> {company.website || 'No website'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{company.industry}</td>
                  <td>
                    <div className="cell-flex">
                      <MapPin size={14} /> {company.location || 'Unknown'}
                    </div>
                  </td>
                  <td>
                    <div className="cell-flex">
                      <Users size={14} /> {company.employees || '1-10'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${company.status === 'Customer' ? 'badge-success' : company.status === 'Prospect' ? 'badge-warning' : 'badge-neutral'}`}>
                      {company.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-icon">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-secondary">
                    No companies found matching "{searchValue || ''}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Company</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCompany} className="modal-body">
              <div className="form-group">
                <label>Company Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  required
                  value={newCompany.name}
                  onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Industry</label>
                  <select 
                    className="form-input"
                    value={newCompany.industry}
                    onChange={e => setNewCompany({...newCompany, industry: e.target.value})}
                  >
                    <option>Technology</option>
                    <option>Software</option>
                    <option>Healthcare</option>
                    <option>Consulting</option>
                    <option>Security</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status</label>
                  <select 
                    className="form-input"
                    value={newCompany.status}
                    onChange={e => setNewCompany({...newCompany, status: e.target.value})}
                  >
                    <option>Customer</option>
                    <option>Prospect</option>
                    <option>Lead</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={newCompany.location}
                  onChange={e => setNewCompany({...newCompany, location: e.target.value})}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Company</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
