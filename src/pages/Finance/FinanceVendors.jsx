import React, { useState } from 'react';
import { Building2, Plus, Search, Phone, Mail, Globe, MapPin, Package, X, ExternalLink, Trash2, Edit3 } from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import { useVendors, useVendorCategories } from '../../hooks/useCrmData';
import './Finance.css';

// Status badge config (API returns 'Active', 'Inactive', etc.)
const STATUS_COLORS = {
  Active:   { badge: 'badge-success',  text: '#10B981' },
  Inactive: { badge: 'badge-neutral',  text: '#64748B' },
  Suspended:{ badge: 'badge-danger',   text: '#EF4444' },
};
const AVATAR_COLORS = ['#38BDF8', '#6366F1', '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#FB923C'];

// POST /api/v1/finance/vendors request body
const EMPTY_VENDOR = {
  name: '',
  registrationNumber: '',
  taxIdentificationNumber: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  country: 'Ghana',
  city: 'Accra',
};

export default function FinanceVendors() {
  const { vendors = [], isLoading, createVendor, updateVendor, deleteVendor } = useVendors();
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVendor, setNewVendor] = useState(EMPTY_VENDOR);

  const filtered = (vendors || []).filter(v =>
    !search ||
    (v.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.country || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newVendor.name,
        registrationNumber: newVendor.registrationNumber || null,
        taxIdentificationNumber: newVendor.taxIdentificationNumber || null,
        email: newVendor.email || null,
        phone: newVendor.phone || null,
        website: newVendor.website || null,
        address: newVendor.address || null,
        country: newVendor.country || 'Ghana',
        city: newVendor.city || 'Accra',
      };
      
      if (newVendor.id) {
        await updateVendor({ id: newVendor.id, data: payload });
        if (selectedVendor && selectedVendor.id === newVendor.id) {
          setSelectedVendor({ ...selectedVendor, ...payload });
        }
      } else {
        await createVendor(payload);
      }
      setShowAddModal(false);
      setNewVendor(EMPTY_VENDOR);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.details || err?.response?.data?.error || `Failed to ${newVendor.id ? 'update' : 'create'} vendor.`);
    }
  };

  const openEditModal = () => {
    if (!selectedVendor) return;
    setNewVendor({
      id: selectedVendor.id,
      name: selectedVendor.name || '',
      registrationNumber: selectedVendor.registrationNumber || '',
      taxIdentificationNumber: selectedVendor.taxIdentificationNumber || '',
      email: selectedVendor.email || '',
      phone: selectedVendor.phone || '',
      website: selectedVendor.website || '',
      address: selectedVendor.address || '',
      country: selectedVendor.country || 'Ghana',
      city: selectedVendor.city || 'Accra',
    });
    setShowAddModal(true);
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38BDF8]"></div>
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
          <button className="btn btn-primary" onClick={() => { setNewVendor(EMPTY_VENDOR); setShowAddModal(true); }}>
            <Plus size={16} /><span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="finance-metric-row">
        {[
          { label: 'Total Vendors', value: vendors.length },
          { label: 'Active Vendors', value: vendors.filter(v => v.status === 'Active').length },
          { label: 'Countries', value: new Set(vendors.map(v => v.country).filter(Boolean)).size || 0 },
          { label: 'Cities', value: new Set(vendors.map(v => v.city).filter(Boolean)).size || 0 },
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
        {filtered.map((vendor, i) => {
          const initial = (vendor.name || '?').charAt(0).toUpperCase();
          const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const statusCfg = STATUS_COLORS[vendor.status] || STATUS_COLORS.Inactive;
          return (
            <div key={vendor.id} className="vendor-card" onClick={() => setSelectedVendor(vendor)}>
              <div className="vendor-avatar" style={{ background: `${avatarColor}20`, color: avatarColor, fontSize: 20 }}>
                {initial}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <p className="font-semibold text-sm">{vendor.name}</p>
                  <span className={`badge badge-sm ${statusCfg.badge}`}>{vendor.status || 'Active'}</span>
                </div>
                {vendor.vendorCode && (
                  <p style={{ fontSize: 10, color: 'var(--brand-cyan)', fontFamily: 'monospace', marginBottom: 8, letterSpacing: 0.5 }}>
                    {vendor.vendorCode}
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {vendor.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Mail size={11} /> {vendor.email}
                    </div>
                  )}
                  {(vendor.city || vendor.country) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      <MapPin size={11} /> {[vendor.city, vendor.country].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {vendor.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Phone size={11} /> {vendor.phone}
                    </div>
                  )}
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
                  { label: 'Vendor Code', value: selectedVendor.vendorCode || '—', icon: Building2 },
                  { label: 'Email', value: selectedVendor.email || '—', icon: Mail },
                  { label: 'Phone', value: selectedVendor.phone || '—', icon: Phone },
                  { label: 'Website', value: selectedVendor.website || '—', icon: Globe },
                  { label: 'City', value: selectedVendor.city || '—', icon: MapPin },
                  { label: 'Country', value: selectedVendor.country || '—', icon: MapPin },
                  { label: 'Address', value: selectedVendor.address || '—', icon: Building2 },
                  { label: 'Reg. Number', value: selectedVendor.registrationNumber || '—', icon: Package },
                  { label: 'Tax ID (TIN)', value: selectedVendor.taxIdentificationNumber || '—', icon: Package },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label}>
                      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>{f.label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, wordBreak: 'break-word' }}>
                        <Icon size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {f.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="finance-drawer-footer">
              <button className="btn btn-secondary" style={{ color: 'var(--error)' }} onClick={() => { if(window.confirm('Delete this vendor?')) { deleteVendor(selectedVendor.id); setSelectedVendor(null); } }}>Delete</button>
              <button className="btn btn-secondary" onClick={openEditModal}><Edit3 size={14} /> Edit</button>
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
              <h2>{newVendor.id ? 'Edit Vendor' : 'Add Vendor'}</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="modal-body">
              <div className="form-group">
                <label>Vendor Name *</label>
                <input type="text" className="form-input" required value={newVendor.name}
                  onChange={e => setNewVendor(p => ({ ...p, name: e.target.value }))}
                  placeholder="Tech Corp, Acme Supplies Ltd…" />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Email</label>
                  <input type="email" className="form-input" value={newVendor.email}
                    onChange={e => setNewVendor(p => ({ ...p, email: e.target.value }))}
                    placeholder="contact@vendor.com" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Phone</label>
                  <input type="tel" className="form-input" value={newVendor.phone}
                    onChange={e => setNewVendor(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+233550000000" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Registration Number</label>
                  <input type="text" className="form-input" value={newVendor.registrationNumber}
                    onChange={e => setNewVendor(p => ({ ...p, registrationNumber: e.target.value }))}
                    placeholder="GH-123456" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tax ID (TIN)</label>
                  <input type="text" className="form-input" value={newVendor.taxIdentificationNumber}
                    onChange={e => setNewVendor(p => ({ ...p, taxIdentificationNumber: e.target.value }))}
                    placeholder="TIN-1234" />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" className="form-input" value={newVendor.address}
                  onChange={e => setNewVendor(p => ({ ...p, address: e.target.value }))}
                  placeholder="123 Main St, Industrial Area" />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>City</label>
                  <input type="text" className="form-input" value={newVendor.city}
                    onChange={e => setNewVendor(p => ({ ...p, city: e.target.value }))}
                    placeholder="Accra" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Country</label>
                  <input type="text" className="form-input" value={newVendor.country}
                    onChange={e => setNewVendor(p => ({ ...p, country: e.target.value }))}
                    placeholder="Ghana" />
                </div>
              </div>
              <div className="form-group">
                <label>Website</label>
                <input type="url" className="form-input" value={newVendor.website}
                  onChange={e => setNewVendor(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://vendor.com" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Building2 size={14} /> {newVendor.id ? 'Save Changes' : 'Add Vendor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
