import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { 
  ShieldCheck, Building2, Users, HardDrive, Cpu, AlertTriangle,
  LogIn, Ban, Key, RefreshCw, X, Check, Lock, ShieldAlert,
  Server, Globe, Activity, Plus, Edit2, Trash2
} from 'lucide-react';
import { tenantsApi } from '../../lib/systemApi';
import './SuperAdminOversight.css';

export default function SuperAdminOversight() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tenant Form Modal State
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [tenantForm, setTenantForm] = useState({ name: '', slug: '', isActive: true });
  const [formSaving, setFormSaving] = useState(false);

  // Impersonation state
  const [isImpersonating, setIsImpersonating] = useState(
    localStorage.getItem('crm_is_impersonating') === 'true'
  );
  const [impersonatingTenant, setImpersonatingTenant] = useState(
    localStorage.getItem('crm_is_impersonating') === 'true'
      ? { name: localStorage.getItem('crm_impersonated_tenant_name') || 'Impersonated Tenant' }
      : null
  );
  // Suspense threats metrics coming soon

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tenantsApi.list();
      setTenants(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error(err);
      setError('Failed to load tenants from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateTenant = () => {
    setEditingTenant(null);
    setTenantForm({ name: '', slug: '', isActive: true });
    setShowTenantModal(true);
  };

  const handleOpenEditTenant = (tenant) => {
    setEditingTenant(tenant);
    setTenantForm({ name: tenant.name, slug: tenant.slug, isActive: tenant.isActive });
    setShowTenantModal(true);
  };

  const handleTenantSubmit = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    setError('');
    try {
      if (editingTenant) {
        await tenantsApi.update(editingTenant.id, tenantForm);
      } else {
        await tenantsApi.create(tenantForm);
      }
      setShowTenantModal(false);
      fetchTenants();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteTenant = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tenant? This action is permanent and may cascade delete all associated data.")) return;
    try {
      await tenantsApi.delete(id);
      fetchTenants();
    } catch (err) {
      console.error(err);
      alert('Failed to delete tenant.');
    }
  };

  const toggleTenantStatus = async (tenant) => {
    try {
      await tenantsApi.update(tenant.id, {
        name: tenant.name,
        slug: tenant.slug,
        isActive: !tenant.isActive
      });
      fetchTenants();
    } catch (err) {
      console.error(err);
      alert('Failed to update tenant status.');
    }
  };

  const handleStartImpersonate = (tenant) => {
    setImpersonatingTenant(tenant);
    setIsImpersonating(true);
    
    localStorage.setItem('crm_tenant_id', tenant.id);
    localStorage.setItem('crm_is_impersonating', 'true');
    localStorage.setItem('crm_impersonated_tenant_name', tenant.name);
    
    window.location.href = '/admin/oversight';
  };

  const handleStopImpersonate = () => {
    localStorage.removeItem('crm_is_impersonating');
    localStorage.removeItem('crm_impersonated_tenant_name');
    localStorage.setItem('crm_tenant_id', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    setIsImpersonating(false);
    setImpersonatingTenant(null);
    window.location.href = '/admin/oversight';
  };



  return (
    <PageContainer className="super-admin-oversight-page">
      {/* Impersonation Active Banner */}
      {isImpersonating && (
        <div className="impersonation-alert-banner">
          <div className="flex items-center gap-3">
            <span className="pulsing-red-dot"></span>
            <div className="text-xs font-mono">
              <span className="font-bold text-red-500 uppercase tracking-wider mr-2">SECURE IMPERSONATION ACTIVE:</span> 
              Viewing workspace as Admin for <span className="text-[#38BDF8] font-bold">{impersonatingTenant?.name}</span>. All actions are logged under SOC2 audit claims.
            </div>
          </div>
          <button onClick={handleStopImpersonate} className="stop-impersonate-btn">
            End Impersonation
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <PageHeader 
          title="Super Admin Oversight"
          subtitle="Global tenant operations, subscription controls, storage quotas, and SOC2 Break-Glass diagnostic impersonations"
          icon={<ShieldCheck className="text-[#EF4444]" />}
        />
        <button className="btn btn-primary" onClick={handleOpenCreateTenant}>
          <Plus size={18} /> Onboard New Tenant
        </button>
      </div>

      {error && <div className="error-banner mb-4 p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400">{error}</div>}

      {/* Global Threat Center & Server Monitor */}
      <div className="card stat-card bg-gray-900/35 border border-gray-850 p-6 rounded-xl flex items-center justify-center gap-4 mb-6">
        <ShieldAlert size={24} className="text-gray-600" />
        <div className="text-gray-500 font-bold tracking-wider">THREAT CENTER & METRICS (COMING SOON)</div>
      </div>

      {/* Tenants Registry */}
      <div className="card bg-gray-900/35 border border-gray-850 rounded-xl overflow-hidden mb-6 flex-grow flex flex-col min-h-[300px]">
        <div className="p-4 border-b border-gray-850 bg-gray-950/30 flex items-center justify-between">
          <h3 className="text-white text-sm font-bold font-display tracking-wide uppercase">Active Corporate Tenants</h3>
          <Badge variant="error">{tenants.length} Managed Entities</Badge>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No tenants found.</div>
        ) : (
          <div className="overflow-x-auto flex-grow">
            <table className="oversight-table w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-850 text-gray-500 font-semibold bg-gray-950/20">
                  <th className="p-4">Corporate Entity</th>
                  <th className="p-4">Domain Slug</th>
                  <th className="p-4">ID</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => (
                  <tr key={t.id} className="border-b border-gray-950 hover:bg-gray-900/20 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Building2 size={14} className="text-gray-500" /> {t.name}
                    </td>
                    <td className="p-4 font-mono text-gray-400">{t.slug}</td>
                    <td className="p-4 font-mono text-gray-500 text-[10px]">{t.id}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${t.isActive ? 'bg-[#10B981] shadow-green' : 'bg-[#EF4444] shadow-red'}`} title={t.isActive ? 'Active' : 'Suspended'} />
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleStartImpersonate(t)}
                        className="btn btn-secondary py-1.5 px-3 text-[10px] flex items-center gap-1 hover:text-[#38BDF8] border-gray-800"
                        disabled={!t.isActive}
                      >
                        <LogIn size={11} /> Impersonate
                      </button>
                      <button 
                        className="btn btn-secondary py-1.5 px-3 text-[10px] flex items-center gap-1 text-gray-600 border-gray-800 cursor-not-allowed"
                        disabled
                        title="Coming Soon"
                      >
                        <Key size={11} /> Revoke (Coming Soon)
                      </button>
                      <button 
                        onClick={() => handleOpenEditTenant(t)}
                        className="btn btn-secondary py-1.5 px-3 text-[10px] flex items-center gap-1 hover:text-white border-gray-800"
                      >
                        <Edit2 size={11} /> Edit
                      </button>
                      <button 
                        onClick={() => toggleTenantStatus(t)}
                        className={`btn py-1.5 px-3 text-[10px] font-bold flex items-center gap-1 transition-all ${t.isActive ? 'bg-red-950/20 border border-red-900/30 text-[#EF4444] hover:bg-red-950/50' : 'bg-green-950/20 border border-green-900/30 text-[#10B981] hover:bg-green-950/50'}`}
                      >
                        <Ban size={11} /> {t.isActive ? 'Suspend' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleDeleteTenant(t.id)}
                        className="btn btn-secondary py-1.5 px-3 text-[10px] flex items-center gap-1 text-[#EF4444] hover:bg-red-950/50 border-gray-800"
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add/Edit Tenant */}
      {showTenantModal && (
        <div className="modal-overlay" onClick={() => setShowTenantModal(false)}>
          <div className="modal-content bg-[#0F172A] border border-gray-800" onClick={e => e.stopPropagation()}>
            <div className="modal-header border-b border-gray-800 pb-4">
              <h2 className="text-white">{editingTenant ? 'Edit Tenant' : 'Onboard New Tenant'}</h2>
              <button className="btn-icon" onClick={() => setShowTenantModal(false)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>
            <form onSubmit={handleTenantSubmit} className="modal-body py-4">
              <div className="form-group mb-4">
                <label className="text-gray-400 text-xs mb-1 block">Tenant Name *</label>
                <input 
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white text-sm" 
                  required 
                  value={tenantForm.name}
                  onChange={e => setTenantForm({...tenantForm, name: e.target.value})} 
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="form-group mb-4">
                <label className="text-gray-400 text-xs mb-1 block">Domain Slug *</label>
                <input 
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white text-sm font-mono" 
                  required 
                  value={tenantForm.slug}
                  onChange={e => setTenantForm({...tenantForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} 
                  placeholder="e.g. acme-corp"
                />
              </div>
              {editingTenant && (
                <div className="form-group mb-4 flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="tenantActive"
                    checked={tenantForm.isActive}
                    onChange={e => setTenantForm({...tenantForm, isActive: e.target.checked})}
                    className="accent-[#38BDF8]"
                  />
                  <label htmlFor="tenantActive" className="text-gray-300 text-sm cursor-pointer">Tenant is Active</label>
                </div>
              )}
              <div className="modal-footer border-t border-gray-800 pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-sm" 
                  onClick={() => setShowTenantModal(false)}
                  disabled={formSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#38BDF8] hover:bg-[#0284C7] text-white rounded-lg text-sm font-semibold"
                  disabled={formSaving}
                >
                  {formSaving ? 'Saving...' : editingTenant ? 'Update Tenant' : 'Create Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive diagnostic sub-panels when Impersonating */}
      {isImpersonating && (
        <div className="impersonation-workspace-monitor card bg-gray-900/20 border border-dashed border-red-900/40 p-5 rounded-xl mt-6 animate-pulse-border">
          <h4 className="text-white text-sm font-bold font-display uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Server size={16} className="text-[#EF4444]" /> Tenant Diagnostic Workspace
          </h4>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            You are securely examining the active database tables and storage indexes for **{impersonatingTenant?.name}**. All actions taken will generate cryptographic compliance entries under SOC2 Section 4.1.
          </p>

          <div className="bg-gray-950/60 border border-gray-900 p-6 rounded-xl flex items-center justify-center">
            <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Diagnostic Metrics Coming Soon</span>
          </div>
        </div>
      )}

    </PageContainer>
  );
}
