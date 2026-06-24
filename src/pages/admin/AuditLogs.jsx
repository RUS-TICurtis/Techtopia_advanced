import React, { useState, useEffect } from 'react';
import { useAuditLogs } from '../../hooks/useCrmData';
import { auditApi } from '../../lib/api';
import { Search, ShieldAlert, ArrowDownToLine, RefreshCw, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import './AuditLogs.css';

export default function AuditLogs() {
  const { logs = [], isLoading, refetch } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Track browser online/offline status for the indicator banner.
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Resolve severity for a log entry.
   *
   * Prefer the backend-stamped `severity` field which will be one of:
   *   'info' | 'warning' | 'critical'
   *
   * Fall back to client-side derivation only for legacy/mock records that
   * pre-date the backend integration and do not carry a severity field.
   */
  const getSeverity = (log) => {
    // --- Backend-stamped field (production path) ---
    if (log.severity) {
      const s = log.severity.toLowerCase();
      if (s === 'critical' || s === 'danger') return 'Danger';
      if (s === 'warning') return 'Warning';
      return 'Info';
    }
    // --- Legacy client-side derivation (fallback for mock data only) ---
    const act = (log.action || '').toUpperCase();
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('REVOKE') || act.includes('PURGE')) {
      return 'Danger';
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('MODIFY')) {
      return 'Warning';
    }
    return 'Info';
  };

  const filteredLogs = logs.filter(log => {
    const logActor = log.actor || log.user || '';
    const logAction = log.action || '';
    const logModule = log.module || log.resource || '';
    const logSeverity = getSeverity(log);

    const matchesSearch =
      logActor.toLowerCase().includes(search.toLowerCase()) ||
      logAction.toLowerCase().includes(search.toLowerCase()) ||
      logModule.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = !severity || logSeverity.toLowerCase() === severity.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  const limit = 10;
  const totalPages = Math.ceil(filteredLogs.length / limit) || 1;
  const paginatedLogs = filteredLogs.slice((page - 1) * limit, page * limit);

  /**
   * Export: calls the backend export endpoint (which returns a server-generated
   * file with all logs and proper IP/actor stamping). Falls back to a client-side
   * blob when the backend is offline.
   */
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const blob = await auditApi.export('json');
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `techtopia_crm_audit_logs_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page-container audit-logs-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShieldAlert className="text-[#EF4444]" />
            Security &amp; Audit Trail
          </h1>
          <p className="page-subtitle">
            Real-time security logs, RBAC policy audits, and data access compliance records.
          </p>
        </div>
        <button
          onClick={handleExportData}
          disabled={isExporting}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowDownToLine size={16} />
          {isExporting ? 'Exportingâ€¦' : 'Export Logs'}
        </button>
      </div>

      {/* Offline indicator */}
      {isOffline && (
        <div
          className="flex items-center gap-2 px-4 py-2 mb-4 rounded-lg text-sm font-medium"
          style={{ background: 'var(--color-warning-bg, #451a03)', color: '#fbbf24', border: '1px solid #92400e' }}
        >
          <WifiOff size={15} />
          You are offline. Showing cached logs â€” new events will be queued and synced when connectivity is restored.
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by user, action, resource..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="search-input w-full pl-10"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-main)'
            }}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={severity}
            onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
            className={`form-input severity-select ${
              severity === 'Info' ? 'sel-info' :
              severity === 'Warning' ? 'sel-warning' :
              severity === 'Danger' ? 'sel-danger' : ''
            }`}
            style={{ minWidth: 160 }}
          >
            <option value="">All Severities</option>
            <option value="Info">Info</option>
            <option value="Warning">Warning</option>
            <option value="Danger">Critical</option>
          </select>
          <button onClick={() => refetch()} className="btn btn-secondary px-3" title="Refresh">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container card" style={{ padding: 0 }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource / Module</th>
              <th>IP Address</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4"><div className="skeleton h-4 w-24"></div></td>
                  <td className="p-4"><div className="skeleton h-4 w-36"></div></td>
                  <td className="p-4"><div className="skeleton h-4 w-48"></div></td>
                  <td className="p-4"><div className="skeleton h-4 w-16"></div></td>
                  <td className="p-4"><div className="skeleton h-4 w-28"></div></td>
                  <td className="p-4"><div className="skeleton h-4 w-12"></div></td>
                </tr>
              ))
            ) : paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center text-gray-500">
                  No security audit logs match your search.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => {
                const logSeverity = getSeverity(log);
                return (
                  <tr key={log.id}>
                    <td className="font-mono" style={{ fontSize: 11 }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-title)' }}>{log.actor || log.user}</td>
                    <td>{log.action}</td>
                    <td><code style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.module || log.resource}</code></td>
                    <td>
                      <code title={log.ip ? 'Server-resolved IP' : 'IP unavailable'}>
                        {log.ip || 'â€”'}
                      </code>
                    </td>
                    <td>
                      <Badge variant={
                        logSeverity === 'Danger' ? 'error' :
                        logSeverity === 'Warning' ? 'warning' : 'info'
                      }>
                        {logSeverity}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t border-light" style={{ borderTop: '1px solid var(--border-light)' }}>
          <span className="text-xs text-gray-500">
            Showing Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary px-3 py-1 text-xs"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary px-3 py-1 text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

