import React, { useState } from 'react';
import { Building2, Plus, Search, Phone, Mail, Globe, MapPin, Package, X, ExternalLink, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import { useVendors } from '../../hooks/useCrmData';
import './Finance.css';

const CATEGORY_COLORS = { 'IT Hardware': '#01FDF6', 'Cloud Services': '#8A4FFF', 'Office Supplies': '#21FA90', 'Logistics': '#E4FF1A', 'Printing': '#FF47DA' };
const EMPTY_VENDOR = { name: '', category: '', contact: '', email: '', phone: '', location: '', website: '' };

export default function FinanceVendors() {
  const { vendors, isLoading, createVendor, deleteVendor } = useVendors();
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVendor, setNewVendor] = useState(EMPTY_VENDOR);

  const filtered = vendors.filter(v =>
    !search || 
    (v.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (v.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await createVendor({
        totalOrders: 0, 
        totalSpend: 0, 
        status: 'active', 
        rating: 0,
        ...newVendor,
      });
      setShowAddModal(false);
      setNewVendor(EMPTY_VENDOR);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01FDF6]"></div>
      </div>
    );
  }


  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="page-subtitle">Manage supplier directory, contacts, and procurement relationships</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /><span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="finance-metric-row">
        {[
          { label: 'Total Vendors', value: vendors.length },
          { label: 'Active Vendors', value: vendors.filter(v => v.status === 'active').length },
          { label: 'Total Spend (YTD)', value: formatCurrency(vendors.reduce((s, v) => s + v.totalSpend, 0)) },
          { label: 'Avg Vendor Rating', value: `${(vendors.reduce((s, v) => s + v.rating, 0) / vendors.length).toFixed(1)} / 5.0` },
        ].map(m => (
          <div key={m.label} className="finance-metric-mini">
            <span className="finance-metric-mini-label">{m.label}</span>
            <span className="finance-metric-mini-value">{m.value}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div className="finance-search-box" style={{ maxWidth: 360 }}>
          <Search size={14} />
          <input type="text" className="form-input" placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Vendor Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {filtered.map(vendor => {
          const initial = vendor.name.charAt(0);
          const catColor = CATEGORY_COLORS[vendor.category] || '#627496';
          return (
            <div key={vendor.id} className="vendor-card" onClick={() => setSelectedVendor(vendor)}>
              <div className="vendor-avatar" style={{ background: `${catColor}20`, color: catColor, fontSize: 20 }}>
                {initial}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <p className="font-semibold text-sm">{vendor.name}</p>
                  <span className={`badge badge-sm ${vendor.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                    {vendor.status}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: catColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  {vendor.category}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Mail size={11} /> {vendor.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                    <MapPin size={11} /> {vendor.location}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-light)', fontSize: 12 }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Orders</p>
                    <p className="font-semibold">{vendor.totalOrders}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Spend</p>
                    <p className="font-semibold">{formatCurrency(vendor.totalSpend)}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Rating</p>
                    <p className="font-semibold" style={{ color: '#E4FF1A' }}>★ {vendor.rating}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vendor Detail Drawer */}
      {selectedVendor && (
        <div className="finance-drawer-overlay" onClick={() => setSelectedVendor(null)}>
          <div className="finance-drawer" onClick={e => e.stopPropagation()}>
            <div className="finance-drawer-header">
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Vendor Profile</p>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-title)' }}>{selectedVendor.name}</h2>
              </div>
              <button className="btn-icon" onClick={() => setSelectedVendor(null)}><X size={18} /></button>
            </div>
            <div className="finance-drawer-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Contact Person', value: selectedVendor.contact, icon: Building2 },
                  { label: 'Category', value: selectedVendor.category, icon: Package },
                  { label: 'Email', value: selectedVendor.email, icon: Mail },
                  { label: 'Phone', value: selectedVendor.phone, icon: Phone },
                  { label: 'Location', value: selectedVendor.location, icon: MapPin },
                  { label: 'Website', value: selectedVendor.website || '—', icon: Globe },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label}>
                      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>{f.label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                        <Icon size={12} style={{ color: 'var(--text-muted)' }} /> {f.value}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Total Orders', value: selectedVendor.totalOrders },
                  { label: 'Total Spend', value: formatCurrency(selectedVendor.totalSpend) },
                  { label: 'Rating', value: `★ ${selectedVendor.rating}` },
                ].map(m => (
                  <div key={m.label} className="finance-metric-mini">
                    <span className="finance-metric-mini-label">{m.label}</span>
                    <span className="finance-metric-mini-value" style={{ fontSize: 16 }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="finance-drawer-footer">
              <button className="btn btn-secondary" style={{ color: 'var(--error)' }} onClick={() => { if(window.confirm('Delete this vendor?')) { deleteVendor(selectedVendor.id); setSelectedVendor(null); } }}>Delete Vendor</button>
              <button className="btn btn-primary"><Package size={14} /> New PO</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Vendor</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="modal-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Vendor Name *</label>
                  <input type="text" className="form-input" required value={newVendor.name}
                    onChange={e => setNewVendor(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <input type="text" className="form-input" value={newVendor.category}
                    onChange={e => setNewVendor(p => ({ ...p, category: e.target.value }))} placeholder="IT Hardware, Logistics..." />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Contact Person</label>
                  <input type="text" className="form-input" value={newVendor.contact}
                    onChange={e => setNewVendor(p => ({ ...p, contact: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Email</label>
                  <input type="email" className="form-input" value={newVendor.email}
                    onChange={e => setNewVendor(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Phone</label>
                  <input type="tel" className="form-input" value={newVendor.phone}
                    onChange={e => setNewVendor(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Location</label>
                  <input type="text" className="form-input" value={newVendor.location}
                    onChange={e => setNewVendor(p => ({ ...p, location: e.target.value }))} placeholder="Accra, Ghana" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Building2 size={14} /> Add Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
