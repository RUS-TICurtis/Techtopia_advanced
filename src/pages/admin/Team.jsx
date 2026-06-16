import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, X, Shield, UserCheck, UserCog, Edit2, Trash2, Key, Info, HelpCircle } from 'lucide-react';
import { usersApi, rolesApi } from '../../lib/api';
import './Team.css';

export default function Team() {
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'roles'
  
  // Data State
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  
  // Load States
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [errorUsers, setErrorUsers] = useState('');
  const [errorRoles, setErrorRoles] = useState('');
  
  // Form/Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deletingRole, setDeletingRole] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  // Forms
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    roleId: ''
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: ''
  });

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers('');
    try {
      const data = await usersApi.list();
      const usersList = Array.isArray(data) ? data : (data?.data || data?.items || data?.users || []);
      setUsers(usersList);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setErrorUsers('Failed to load team members from server.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRoles = async () => {
    setLoadingRoles(true);
    setErrorRoles('');
    try {
      const data = await rolesApi.list();
      const rolesList = Array.isArray(data) ? data : (data?.data || data?.items || data?.roles || []);
      setRoles(rolesList);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setErrorRoles('Failed to load roles from server.');
    } finally {
      setLoadingRoles(false);
    }
  };

  // Error extractor
  const getErrorMessage = (err) => {
    if (err.response?.data?.errors) {
      const errorsObj = err.response.data.errors;
      return Object.entries(errorsObj)
        .map(([key, messages]) => `${key}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join(' | ');
    }
    return err.response?.data?.message || err.response?.data?.Error || err.message || 'An unexpected error occurred.';
  };

  // Users CRUD Handlers
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      phoneNumber: '',
      roleId: roles[0]?.id || ''
    });
    setFormError('');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      username: user.username || '',
      password: '', // Password is not editable through PUT /api/v1/users/{id}
      phoneNumber: user.phoneNumber || '',
      roleId: '' // Role cannot be modified directly via UpdateUserRequest in PUT /users/{id}
    });
    setFormError('');
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSaving(true);
    try {
      if (editingUser) {
        // Edit flow
        const payload = {
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          phoneNumber: userForm.phoneNumber
        };
        await usersApi.update(editingUser.id, payload);
      } else {
        // Create flow
        const payload = {
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          email: userForm.email,
          username: userForm.username,
          password: userForm.password,
          phoneNumber: userForm.phoneNumber,
          roleIds: userForm.roleId ? [userForm.roleId] : []
        };
        await usersApi.create(payload);
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setFormError(getErrorMessage(err));
    } finally {
      setFormSaving(false);
    }
  };

  const handleUserDelete = async () => {
    if (!deletingUser) return;
    setFormSaving(true);
    setFormError('');
    try {
      // Optimistic UI update
      setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
      await usersApi.delete(deletingUser.id);
      setDeletingUser(null);
    } catch (err) {
      console.error(err);
      setErrorUsers(getErrorMessage(err));
      // Revert if failed
      fetchUsers();
    } finally {
      setFormSaving(false);
    }
  };

  // Roles CRUD Handlers
  const handleOpenCreateRole = () => {
    setRoleForm({ name: '', description: '' });
    setFormError('');
    setShowRoleModal(true);
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSaving(true);
    try {
      const payload = {
        name: roleForm.name,
        description: roleForm.description,
        permissionIds: [] // Currently permissions mapping backend-side is a stub
      };
      await rolesApi.create(payload);
      setShowRoleModal(false);
      fetchRoles();
    } catch (err) {
      console.error(err);
      setFormError(getErrorMessage(err));
    } finally {
      setFormSaving(false);
    }
  };

  const handleRoleDelete = async () => {
    if (!deletingRole) return;
    setFormSaving(true);
    setFormError('');
    try {
      // Optimistic UI update
      setRoles(prev => prev.filter(r => r.id !== deletingRole.id));
      await rolesApi.delete(deletingRole.id);
      setDeletingRole(null);
    } catch (err) {
      console.error(err);
      setErrorRoles(getErrorMessage(err));
      // Revert if failed
      fetchRoles();
    } finally {
      setFormSaving(false);
    }
  };

  // Filtering
  const filteredUsers = users.filter(u => {
    const term = searchQuery.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (u.username || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.phoneNumber || '').toLowerCase().includes(term)
    );
  });

  const filteredRoles = roles.filter(r => {
    const term = searchQuery.toLowerCase();
    return (
      (r.name || '').toLowerCase().includes(term) ||
      (r.description || '').toLowerCase().includes(term)
    );
  });

  // Metrics
  const adminUsersCount = users.filter(u => 
    u.roles && u.roles.some(role => 
      role.toLowerCase().includes('admin') || role.toLowerCase() === 'administrator'
    )
  ).length;

  const metrics = [
    { label: 'Total Members', value: users.length, color: 'var(--brand-cyan)' },
    { label: 'Administrators', value: adminUsersCount, color: 'var(--brand-purple)' },
    { label: 'Active Roles', value: roles.length, color: 'var(--brand-green)' },
    { label: 'Support / Sales', value: users.filter(u => u.roles && u.roles.some(r => ['sales', 'support'].includes(r.toLowerCase()))).length, color: 'var(--brand-blue)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team & Access Control</h1>
          <p className="page-subtitle">Manage internal team directory, role mapping, and security profiles</p>
        </div>
        <div>
          {activeTab === 'members' ? (
            <button className="btn btn-primary" onClick={handleOpenCreateUser}>
              <Plus size={18} /> Add Member
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleOpenCreateRole}>
              <Plus size={18} /> Create Role
            </button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        {metrics.map(m => (
          <div key={m.label} className="card team-metric-card">
            <div className="team-metric-icon" style={{ background: `${m.color}22`, color: m.color }}>
              <Users size={22} />
            </div>
            <div>
              <div className="team-metric-value">{m.value}</div>
              <div className="team-metric-label">{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Centralized Tabs */}
      <div className="team-tab-bar">
        <button 
          className={`team-tab ${activeTab === 'members' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('members'); setSearchQuery(''); }}
        >
          Team Members
        </button>
        <button 
          className={`team-tab ${activeTab === 'roles' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('roles'); setSearchQuery(''); }}
        >
          Roles & Permissions
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="search-wrapper" style={{ maxWidth: 440, marginBottom: 20 }}>
        <input 
          style={{ maxWidth: 440 }} 
          className="search-input"
          placeholder={activeTab === 'members' ? "Search members..." : "Search roles..."}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <Search size={16} className="search-icon" />
      </div>

      {/* Tab: Members */}
      {activeTab === 'members' && (
        <>
          {errorUsers && <div className="error-banner card">{errorUsers}</div>}
          
          {loadingUsers ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching team directory...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state card">
              <Users size={48} className="empty-icon" />
              <h3>No team members found</h3>
              <p>Try refining your search query or add a new team member above.</p>
            </div>
          ) : (
            <div className="table-container card" style={{ padding: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Roles</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => {
                    const initials = `${u.firstName || ''} ${u.lastName || ''}`
                      .split(' ')
                      .map(n => n.charAt(0))
                      .join('')
                      .toUpperCase() || 'CT';
                    
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="team-member-name">
                            <div className="team-member-avatar">{initials}</div>
                            <div>
                              <div className="font-semibold">{u.firstName} {u.lastName}</div>
                              {u.id === '22222222-2222-2222-2222-222222222222' && (
                                <span className="dev-tag">Seeded Account</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td><span className="font-mono text-xs">{u.username}</span></td>
                        <td>{u.email}</td>
                        <td>{u.phoneNumber || '—'}</td>
                        <td>
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map(r => (
                              <span key={r} className={`badge ${r.toLowerCase() === 'administrator' ? 'badge-danger' : 'badge-neutral'}`}>
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="badge badge-neutral">No Roles</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button 
                              className="btn-icon" 
                              title="Edit Details" 
                              onClick={() => handleOpenEditUser(u)}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              className="btn-icon text-danger" 
                              title="Delete Member" 
                              onClick={() => setDeletingUser(u)}
                              disabled={u.id === '22222222-2222-2222-2222-222222222222'} // Protect seeded admin
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab: Roles */}
      {activeTab === 'roles' && (
        <>
          {errorRoles && <div className="error-banner card">{errorRoles}</div>}
          
          {loadingRoles ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching access control roles...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="empty-state card">
              <Shield size={48} className="empty-icon" />
              <h3>No roles found</h3>
              <p>Try refining your search or create a custom role above.</p>
            </div>
          ) : (
            <div className="table-container card" style={{ padding: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Role ID</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map(r => (
                    <tr key={r.id}>
                      <td className="font-semibold">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Shield size={16} className="text-muted" />
                          {r.name}
                        </div>
                      </td>
                      <td>{r.description || '—'}</td>
                      <td><span className="font-mono text-xs text-muted">{r.id}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn-icon text-danger" 
                          title="Delete Role" 
                          onClick={() => setDeletingRole(r)}
                          disabled={r.id === '11111111-1111-1111-1111-111111111111'} // Protect seeded admin role
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal: Add/Edit User */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Edit Member Details' : 'Add Team Member'}</h2>
              <button className="btn-icon" onClick={() => setShowUserModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUserSubmit} className="modal-body">
              {formError && <div className="error-banner">{formError}</div>}
              
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>First Name *</label>
                  <input 
                    className="form-input" 
                    required 
                    value={userForm.firstName}
                    onChange={e => setUserForm({...userForm, firstName: e.target.value})} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Last Name *</label>
                  <input 
                    className="form-input" 
                    required 
                    value={userForm.lastName}
                    onChange={e => setUserForm({...userForm, lastName: e.target.value})} 
                  />
                </div>
              </div>

              {!editingUser ? (
                <>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Email *</label>
                      <input 
                        className="form-input" 
                        type="email" 
                        required 
                        value={userForm.email}
                        onChange={e => setUserForm({...userForm, email: e.target.value})} 
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Username *</label>
                      <input 
                        className="form-input" 
                        required 
                        value={userForm.username}
                        onChange={e => setUserForm({...userForm, username: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Password * (Min 6 chars)</label>
                      <input 
                        className="form-input" 
                        type="password" 
                        required 
                        value={userForm.password}
                        onChange={e => setUserForm({...userForm, password: e.target.value})} 
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Role Assignment *</label>
                      <select 
                        className="form-input" 
                        required
                        value={userForm.roleId}
                        onChange={e => setUserForm({...userForm, roleId: e.target.value})}
                      >
                        <option value="">Select a role...</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Email (Read-only)</label>
                    <input className="form-input" disabled value={userForm.email} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Username (Read-only)</label>
                    <input className="form-input" disabled value={userForm.username} />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  className="form-input" 
                  value={userForm.phoneNumber}
                  onChange={e => setUserForm({...userForm, phoneNumber: e.target.value})} 
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowUserModal(false)}
                  disabled={formSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={formSaving}
                >
                  {formSaving ? 'Saving...' : editingUser ? 'Update Member' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Role */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Custom Role</h2>
              <button className="btn-icon" onClick={() => setShowRoleModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleRoleSubmit} className="modal-body">
              {formError && <div className="error-banner">{formError}</div>}
              
              <div className="form-group">
                <label>Role Name *</label>
                <input 
                  className="form-input" 
                  required 
                  placeholder="e.g. Sales Specialist"
                  value={roleForm.name}
                  onChange={e => setRoleForm({...roleForm, name: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-input" 
                  rows={3}
                  placeholder="Summarize the core permissions and access of this role."
                  value={roleForm.description}
                  onChange={e => setRoleForm({...roleForm, description: e.target.value})} 
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowRoleModal(false)}
                  disabled={formSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={formSaving}
                >
                  {formSaving ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {deletingUser && (
        <div className="modal-overlay" onClick={() => setDeletingUser(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Remove Member</h2>
              <button className="btn-icon" onClick={() => setDeletingUser(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove <strong>{deletingUser.firstName} {deletingUser.lastName}</strong> from the CRM tenant database?</p>
              <p className="text-danger-subtle" style={{ marginTop: 10, fontSize: 12 }}>This action is permanent and cannot be undone.</p>
              <div className="modal-footer" style={{ marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setDeletingUser(null)} disabled={formSaving}>Cancel</button>
                <button className="btn btn-danger" onClick={handleUserDelete} disabled={formSaving}>
                  {formSaving ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Confirmation */}
      {deletingRole && (
        <div className="modal-overlay" onClick={() => setDeletingRole(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Role</h2>
              <button className="btn-icon" onClick={() => setDeletingRole(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the role <strong>{deletingRole.name}</strong>?</p>
              <p className="text-danger-subtle" style={{ marginTop: 10, fontSize: 12 }}>Members assigned to this role may lose access boundaries.</p>
              <div className="modal-footer" style={{ marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setDeletingRole(null)} disabled={formSaving}>Cancel</button>
                <button className="btn btn-danger" onClick={handleRoleDelete} disabled={formSaving}>
                  {formSaving ? 'Deleting...' : 'Delete Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
