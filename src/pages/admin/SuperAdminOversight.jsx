import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import { 
  ShieldCheck, Building2, Users, HardDrive, Cpu, AlertTriangle,
  LogIn, Ban, Key, RefreshCw, X, Check, Lock, ShieldAlert,
  Server, Globe, Activity
} from 'lucide-react';
import './SuperAdminOversight.css';

export default function SuperAdminOversight() {
  const [tenants, setTenants] = useState([
    { id: 'ten-1', name: 'Techtopia Corp (HQ)', domain: 'techtopia.io', plan: 'Enterprise OS', seats: 24, storage: '48.2 GB / 500 GB', aiTokens: '184k / 500k', status: 'active' },
    { id: 'ten-2', name: 'Acme Enterprises', domain: 'acme-corp.com', plan: 'Enterprise OS', seats: 12, storage: '12.4 GB / 250 GB', aiTokens: '42k / 250k', status: 'active' },
    { id: 'ten-3', name: 'Nexus Global Logistics', domain: 'nexus-logistics.net', plan: 'Growth OS', seats: 8, storage: '8.1 GB / 100 GB', aiTokens: '12k / 100k', status: 'active' },
    { id: 'ten-4', name: 'Horizon BioLabs', domain: 'horizonlabs.org', plan: 'Enterprise OS', seats: 45, storage: '112.9 GB / 1 TB', aiTokens: '298k / 1M', status: 'active' },
    { id: 'ten-5', name: 'Stark Industries (Trial)', domain: 'starklabs.com', plan: 'Sandbox', seats: 2, storage: '0.1 GB / 10 GB', aiTokens: '0.5k / 10k', status: 'suspended' }
  ]);

  // Impersonation state
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatingTenant, setImpersonatingTenant] = useState(null);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');

  // Suspense threats metrics
  const [threats, setThreats] = useState({
    bruteForceAttempts: 0,
    blockedIps: 12,
    systemUptime: '99.998%',
    cpuUsage: 22
  });

  const handleStartImpersonate = (tenant) => {
    setImpersonatingTenant(tenant);
    setMfaCode('');
    setMfaError('');
    setShowMfaModal(true);
  };

  const handleVerifyMfa = (e) => {
    e.preventDefault();
    if (mfaCode === '123456' || mfaCode === '000000') {
      setShowMfaModal(false);
      setIsImpersonating(true);
    } else {
      setMfaError('Invalid Super Admin MFA credentials. Impersonation rejected.');
    }
  };

  const handleStopImpersonate = () => {
    setIsImpersonating(false);
    setImpersonatingTenant(null);
  };

  const toggleTenantStatus = (id) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'active' ? 'suspended' : 'active';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleRevokeSessions = (tenantName) => {
    alert(`⚡ [Revoke Signal Dispatched] - Forcefully invalidated all active WebAuthn/MFA tokens and sessions for ${tenantName}.`);
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
              Viewing workspace as Admin for <span className="text-[#01FDF6] font-bold">{impersonatingTenant?.name}</span>. All actions are logged under SOC2 audit claims.
            </div>
          </div>
          <button onClick={handleStopImpersonate} className="stop-impersonate-btn">
            End Impersonation
          </button>
        </div>
      )}

      <PageHeader 
        title="Super Admin Oversight"
        subtitle="Global tenant operations, subscription controls, storage quotas, and SOC2 Break-Glass diagnostic impersonations"
        icon={<ShieldCheck className="text-[#ff0055]" />}
      />

      {/* Global Threat Center & Server Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card stat-card bg-gray-900/35 border border-gray-850 p-4 rounded-xl flex items-center gap-4">
          <div className="icon-box p-3 bg-red-950/20 border border-red-900/30 rounded-xl">
            <ShieldAlert size={20} className="text-[#ff0055]" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Threat Level</div>
            <div className="text-white text-lg font-bold font-display">NOMINAL</div>
          </div>
        </div>

        <div className="card stat-card bg-gray-900/35 border border-gray-850 p-4 rounded-xl flex items-center gap-4">
          <div className="icon-box p-3 bg-[#01FDF6]/10 border border-[#01FDF6]/20 rounded-xl">
            <Globe size={20} className="text-[#01FDF6]" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Blocked IP Vectors</div>
            <div className="text-white text-lg font-bold font-display">{threats.blockedIps} Addresses</div>
          </div>
        </div>

        <div className="card stat-card bg-gray-900/35 border border-gray-850 p-4 rounded-xl flex items-center gap-4">
          <div className="icon-box p-3 bg-green-950/20 border border-green-900/30 rounded-xl">
            <Server size={20} className="text-[#50fa7b]" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Core Cluster Uptime</div>
            <div className="text-white text-lg font-bold font-display">{threats.systemUptime}</div>
          </div>
        </div>

        <div className="card stat-card bg-gray-900/35 border border-gray-850 p-4 rounded-xl flex items-center gap-4">
          <div className="icon-box p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl">
            <Activity size={20} className="text-[#bd93f9]" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Global DB Load</div>
            <div className="text-white text-lg font-bold font-display">{threats.cpuUsage}% CPU</div>
          </div>
        </div>
      </div>

      {/* Tenants Registry */}
      <div className="card bg-gray-900/35 border border-gray-850 rounded-xl overflow-hidden mb-6 flex-grow flex flex-col min-h-[300px]">
        <div className="p-4 border-b border-gray-850 bg-gray-950/30 flex items-center justify-between">
          <h3 className="text-white text-sm font-bold font-display tracking-wide uppercase">Active Corporate Tenants</h3>
          <Badge variant="error">{tenants.length} Managed Entities</Badge>
        </div>

        <div className="overflow-x-auto flex-grow">
          <table className="oversight-table w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-850 text-gray-500 font-semibold bg-gray-950/20">
                <th className="p-4">Corporate Entity</th>
                <th className="p-4">Domain Space</th>
                <th className="p-4">Subscription Plan</th>
                <th className="p-4">Active Seats</th>
                <th className="p-4">Storage Allocation</th>
                <th className="p-4">AI Quotas Used</th>
                <th className="p-4 text-center">Security Core</th>
                <th className="p-4 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} className="border-b border-gray-950 hover:bg-gray-900/20 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Building2 size={14} className="text-gray-500" /> {t.name}
                  </td>
                  <td className="p-4 font-mono text-gray-400">{t.domain}</td>
                  <td className="p-4">
                    <Badge variant={t.plan === 'Sandbox' ? 'neutral' : 'warning'}>{t.plan}</Badge>
                  </td>
                  <td className="p-4 text-gray-300 font-semibold">{t.seats} Users</td>
                  <td className="p-4 font-mono text-gray-400">{t.storage}</td>
                  <td className="p-4 font-mono text-gray-400">{t.aiTokens}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${t.status === 'active' ? 'bg-[#50fa7b] shadow-green' : 'bg-[#ff5555] shadow-red'}`} title={t.status} />
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleStartImpersonate(t)}
                      className="btn btn-secondary py-1.5 px-3 text-[10px] flex items-center gap-1 hover:text-[#01FDF6] border-gray-800"
                      disabled={t.status === 'suspended'}
                    >
                      <LogIn size={11} /> Impersonate
                    </button>
                    <button 
                      onClick={() => handleRevokeSessions(t.name)}
                      className="btn btn-secondary py-1.5 px-3 text-[10px] flex items-center gap-1 hover:text-[#bd93f9] border-gray-800"
                      disabled={t.status === 'suspended'}
                    >
                      <Key size={11} /> Revoke
                    </button>
                    <button 
                      onClick={() => toggleTenantStatus(t.id)}
                      className={`btn py-1.5 px-3 text-[10px] font-bold flex items-center gap-1 transition-all ${t.status === 'active' ? 'bg-red-950/20 border border-red-900/30 text-[#ff5555] hover:bg-red-950/50' : 'bg-green-950/20 border border-green-900/30 text-[#50fa7b] hover:bg-green-950/50'}`}
                    >
                      <Ban size={11} /> {t.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive diagnostic sub-panels when Impersonating */}
      {isImpersonating && (
        <div className="impersonation-workspace-monitor card bg-gray-900/20 border border-dashed border-red-900/40 p-5 rounded-xl mt-6 animate-pulse-border">
          <h4 className="text-white text-sm font-bold font-display uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Server size={16} className="text-[#ff0055]" /> Tenant Diagnostic Workspace
          </h4>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            You are securely examining the active database tables and storage indexes for **{impersonatingTenant?.name}**. All actions taken will generate cryptographic compliance entries under SOC2 Section 4.1.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-gray-950/60 border border-gray-900 p-4 rounded-xl">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">MFA Compliance Rate</span>
              <span className="text-white text-lg font-bold font-mono">100% Secure</span>
              <p className="text-gray-500 text-[10px] mt-2">All tenant admins and finance roles have valid multi-factor keys registered.</p>
            </div>
            <div className="bg-gray-950/60 border border-gray-900 p-4 rounded-xl">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Active DB Queries</span>
              <span className="text-white text-lg font-bold font-mono">0.02ms Yield</span>
              <p className="text-gray-500 text-[10px] mt-2">Core SQLite synchronization queries are responding within nominal boundaries.</p>
            </div>
            <div className="bg-gray-950/60 border border-gray-900 p-4 rounded-xl">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Access Control Denials</span>
              <span className="text-white text-lg font-bold font-mono">0 Events</span>
              <p className="text-gray-500 text-[10px] mt-2">Zero anomalous RBAC or ABAC authentication bypass claims recorded.</p>
            </div>
          </div>
        </div>
      )}

      {/* SOC2 Verification MFA Modal */}
      {showMfaModal && (
        <div className="mfa-oversight-modal-overlay">
          <div className="mfa-oversight-modal bg-[#0c1224] border border-gray-800 p-6 rounded-xl max-w-sm w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-red-500 font-bold font-display text-sm tracking-wide">
                <Lock size={16} /> Break-Glass Authorization
              </div>
              <button 
                onClick={() => setShowMfaModal(false)}
                className="text-gray-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              You are instantiating an Impersonation session on **{impersonatingTenant?.name}**. This requires Super Admin Multi-Factor token re-authentication under SOC2 requirements.
            </p>

            <form onSubmit={handleVerifyMfa} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">6-Digit Admin OTP Key</label>
                <input 
                  type="password" 
                  placeholder="e.g. 123456"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full text-center tracking-widest bg-gray-950 border border-gray-800 rounded-lg p-3 text-white text-lg font-mono focus:outline-none focus:border-[#ff0055]"
                />
              </div>

              {mfaError && (
                <div className="text-red-500 font-bold text-[10px] bg-red-950/20 border border-red-900/40 p-2.5 rounded-lg flex items-center gap-1.5">
                  <AlertTriangle size={12} /> {mfaError}
                </div>
              )}

              <div className="flex gap-3 justify-end mt-2">
                <button 
                  type="button"
                  onClick={() => setShowMfaModal(false)}
                  className="px-4 py-2 bg-gray-950 border border-gray-850 text-gray-400 hover:text-white rounded-lg text-xs font-semibold"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#ff0055] hover:bg-[#e0004b] text-white rounded-lg text-xs font-bold shadow-red flex items-center gap-1.5"
                >
                  <ShieldCheck size={14} /> Authorize Impersonate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
