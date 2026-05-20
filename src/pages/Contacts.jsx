import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X,
  FileText,
  User,
  Phone,
  Mail,
  Building,
  Briefcase
} from 'lucide-react';
import { mockDb } from '../utils/mockDb';

export default function Contacts({ searchValue = '' }) {
  const [contacts, setContacts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedContact, setSelectedContact] = useState(null);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('New');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [editId, setEditId] = useState(null);

  // Load contacts
  useEffect(() => {
    setContacts(mockDb.getContacts());
  }, []);

  const refreshContacts = () => {
    setContacts(mockDb.getContacts());
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name || !company) return;

    mockDb.addContact({
      name,
      company,
      email,
      phone,
      status,
      value: parseFloat(value) || 0,
      notes
    });

    // Reset forms & close
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setStatus('New');
    setValue('');
    setNotes('');
    setIsAddModalOpen(false);
    refreshContacts();
  };

  const handleEditClick = (contact) => {
    setEditId(contact.id);
    setName(contact.name);
    setCompany(contact.company);
    setEmail(contact.email);
    setPhone(contact.phone);
    setStatus(contact.status);
    setValue(contact.value);
    setNotes(contact.notes || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!name || !company) return;

    mockDb.updateContact({
      id: editId,
      name,
      company,
      email,
      phone,
      status,
      value: parseFloat(value) || 0,
      notes,
      created: contacts.find(c => c.id === editId)?.created || new Date().toISOString().split('T')[0],
      owner: contacts.find(c => c.id === editId)?.owner || "Curtis Miller"
    });

    setIsEditModalOpen(false);
    refreshContacts();
    // Update selected contact if open
    if (selectedContact && selectedContact.id === editId) {
      setSelectedContact(mockDb.getContacts().find(c => c.id === editId));
    }
  };

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this contact?")) {
      mockDb.deleteContact(id);
      refreshContacts();
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact(null);
      }
    }
  };

  // Status mapping to badge classes
  const badgeClasses = {
    'New': 'badge-info',
    'Qualified': 'badge-success',
    'In Progress': 'badge-warning',
    'Proposal': 'badge-success',
    'Won': 'badge-success',
    'Lost': 'badge-danger'
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchValue.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      contact.phone.includes(searchValue);

    const matchesFilter = activeFilter === 'All' || contact.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-container">
      {/* Search & Actions Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['All', 'New', 'Qualified', 'In Progress', 'Proposal', 'Won', 'Lost'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: activeFilter === tab ? 'var(--primary)' : 'var(--bg-card)',
                color: activeFilter === tab ? '#FFFFFF' : 'var(--text-muted)',
                boxShadow: activeFilter === tab ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)',
                border: activeFilter === tab ? 'none' : '1px solid var(--border-light)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Add New Lead
        </button>
      </div>

      {/* Main Ledger Section */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedContact ? '1.8fr 1.2fr' : '1fr', gap: '30px', transition: 'all 0.3s' }}>
        
        {/* Leads Table Card */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Lead Ledger</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Showing {filteredContacts.length} results</span>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Contact Name</th>
                  <th>Company</th>
                  <th>Owner</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map(contact => (
                    <tr 
                      key={contact.id} 
                      onClick={() => setSelectedContact(contact)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedContact?.id === contact.id ? 'rgba(45, 96, 255, 0.03)' : 'transparent'
                      }}
                    >
                      <td style={{ fontWeight: 700, color: 'var(--text-title)' }}>{contact.name}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{contact.company}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>{contact.email}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>{contact.owner}</td>
                      <td style={{ fontWeight: 800, color: 'var(--text-title)' }}>${contact.value.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${badgeClasses[contact.status]}`}>
                          {contact.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            className="nav-icon-btn" 
                            style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)' }}
                            onClick={(e) => { e.stopPropagation(); handleEditClick(contact); }}
                            title="Edit Contact"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className="nav-icon-btn" 
                            style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', color: 'var(--error)' }}
                            onClick={(e) => handleDeleteClick(contact.id, e)}
                            title="Delete Contact"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No contacts found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Contact Detail Drawer Panel */}
        {selectedContact && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn var(--transition-fast) ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Client Dossier</h3>
              <button 
                onClick={() => setSelectedContact(null)} 
                style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Avatar Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                backgroundColor: 'rgba(45, 96, 255, 0.1)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 'bold'
              }}>
                {selectedContact.name.charAt(0)}
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-title)' }}>{selectedContact.name}</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>{selectedContact.company}</p>
              </div>
            </div>

            {/* Info grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Mail size={16} color="var(--text-muted)" />
                <span style={{ fontWeight: 500 }}>{selectedContact.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Phone size={16} color="var(--text-muted)" />
                <span style={{ fontWeight: 500 }}>{selectedContact.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Briefcase size={16} color="var(--text-muted)" />
                <span style={{ fontWeight: 500 }}>Estimated Value: <strong style={{ color: 'var(--primary)' }}>${selectedContact.value.toLocaleString()}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <User size={16} color="var(--text-muted)" />
                <span style={{ fontWeight: 500 }}>Lead Representative: {selectedContact.owner}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Building size={16} color="var(--text-muted)" />
                <span style={{ fontWeight: 500 }}>Registered Date: {selectedContact.created}</span>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)', marginBottom: '8px' }}>Administrative Notes</h5>
              <div style={{
                padding: '16px', 
                backgroundColor: 'rgba(255,187,56,0.04)', 
                borderLeft: '4px solid var(--accent-orange, #FFBB38)',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                fontSize: '14px',
                color: 'var(--text-main)',
                lineHeight: 1.5
              }}>
                {selectedContact.notes || "No administrative notes recorded for this lead yet."}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flexGrow: 1 }} onClick={() => handleEditClick(selectedContact)}>
                Edit Dossier
              </button>
              <button 
                className="btn btn-outline" 
                style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                onClick={(e) => handleDeleteClick(selectedContact.id, e)}
              >
                Delete Lead
              </button>
            </div>

          </div>
        )}
      </div>

      {/* ==========================================================================
         ADD NEW LEAD MODAL
         ========================================================================== */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Lead Profile</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" placeholder="Client Name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input type="text" className="form-input" placeholder="Company Name" value={company} onChange={e => setCompany(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="email@company.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-input" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Lead Stage</label>
                  <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="New">New</option>
                    <option value="Qualified">Qualified</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deal Value ($)</label>
                  <input type="number" className="form-input" placeholder="Estimated Value" value={value} onChange={e => setValue(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dossier Notes</label>
                <textarea className="form-textarea" placeholder="Add custom notes regarding customer contact..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
         EDIT LEAD MODAL
         ========================================================================== */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Modify Lead Profile</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input type="text" className="form-input" value={company} onChange={e => setCompany(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Lead Stage</label>
                  <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="New">New</option>
                    <option value="Qualified">Qualified</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deal Value ($)</label>
                  <input type="number" className="form-input" value={value} onChange={e => setValue(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dossier Notes</label>
                <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)}></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
