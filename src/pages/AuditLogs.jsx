import React, { useState, useEffect } from 'react';
import { mockApi } from '../lib/mockApi';
import { Search, ShieldAlert, ArrowDownToLine, RefreshCw } from 'lucide-react';
import Badge from '../components/ui/Badge';
import './AuditLogs.css';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (severity) filters.severity = severity;
      
      const res = await mockApi.getAuditLogs({
        search,
        filters,
        page,
        limit: 10
      });
      setLogs(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, severity, page]);

  return (
    <div className="page-container audit-logs-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShieldAlert className="text-[#FF47DA]" />
            Security & Audit Trail
          </h1>
          <p className="page-subtitle">
            Real-time security logs, RBAC policy audits, and data access compliance records.
          </p>
        </div>
        <button className="btn btn-secondary flex items-center gap-2">
          <ArrowDownToLine size={16} /> Export Logs
        </button>
      </div>

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
          <button onClick={fetchLogs} className="btn btn-secondary px-3" title="Refresh">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
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
              <th>Resource</th>
              <th>IP Address</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
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
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center text-gray-500">
                  No security audit logs match your search.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono" style={{ fontSize: 11 }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-title)' }}>{log.user}</td>
                  <td>{log.action}</td>
                  <td><code style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.resource}</code></td>
                  <td><code>{log.ip}</code></td>
                  <td>
                    <Badge variant={
                      log.severity === 'Danger' || log.severity === 'Critical' ? 'error' :
                      log.severity === 'Warning' ? 'warning' : 'info'
                    }>
                      {log.severity}
                    </Badge>
                  </td>
                </tr>
              ))
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
