import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Globe, 
  Clock, 
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminIntegrationService from '../../services/adminIntegrationService';
import './Settings.css'; // Reuse settings styles

export default function IntegrationDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminIntegrationService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load dashboard", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleGlobalSync = async (type) => {
    try {
      setIsSyncing(true);
      await adminIntegrationService.forceGlobalSync(type);
      toast.success(`Global sync for ${type} triggered successfully`);
      setTimeout(fetchMetrics, 2000);
    } catch (err) {
      toast.error(`Failed to trigger global ${type} sync`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Integration Dashboard</h1>
            <p className="page-subtitle">System-wide Microsoft 365 Monitoring</p>
          </div>
        </div>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <AlertTriangle size={48} color="var(--error)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-title)', marginBottom: 8 }}>Failed to load dashboard</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error.message || 'An unexpected error occurred.'}</p>
          <button className="btn btn-primary" onClick={fetchMetrics}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading && !metrics) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Integration Dashboard</h1>
            <p className="page-subtitle">System-wide Microsoft 365 Monitoring</p>
          </div>
        </div>
        <div className="card" style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw className="animate-spin" size={32} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <span style={{ color: 'var(--text-muted)' }}>Loading metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Integration Dashboard</h1>
          <p className="page-subtitle">System-wide Microsoft 365 Monitoring</p>
        </div>
        <div>
          <button 
            className="btn btn-secondary" 
            onClick={fetchMetrics}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: '#3b82f6' }}>
            <Server size={24} />
          </div>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Active Tenants</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-title)', marginTop: 4 }}>
              {metrics?.totalConnections || 0}
            </h2>
          </div>
        </div>

        <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: '#10b981' }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Active Webhooks</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-title)', marginTop: 4 }}>
              {metrics?.activeSubscriptions || 0}
            </h2>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-title)' }}>Global Synchronization</h3>
        </div>
        <div style={{ padding: 24 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
            Manually force a background synchronization job across all connected tenants. This operation is resource-intensive.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleGlobalSync('Users')}
              disabled={isSyncing}
            >
              <Globe size={16} /> Sync All Users
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleGlobalSync('Groups')}
              disabled={isSyncing}
            >
              <Globe size={16} /> Sync All Groups
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleGlobalSync('Calendars')}
              disabled={isSyncing}
            >
              <Globe size={16} /> Sync All Calendars
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => handleGlobalSync('All')}
              disabled={isSyncing}
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
              Force Full Global Sync
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-title)' }}>Recent Sync Failures</h3>
        </div>
        
        {!metrics?.recentFailures || metrics.recentFailures.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <CheckCircle size={32} color="var(--brand-green)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-title)' }}>No Recent Failures</h4>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>All synchronization jobs are running smoothly.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-app)' }}>
                  <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Tenant ID</th>
                  <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Job Type</th>
                  <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Started</th>
                  <th style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Error</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentFailures.map(job => (
                  <tr key={job.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-title)', fontFamily: 'monospace' }}>
                      {job.tenantId.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-title)' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 4, 
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-light)',
                        fontSize: 12
                      }}>
                        {job.jobType}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} />
                      {new Date(job.startedAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--error)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <XCircle size={14} />
                        <span style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={job.errorMessage}>
                          {job.errorMessage || 'Unknown Error'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
