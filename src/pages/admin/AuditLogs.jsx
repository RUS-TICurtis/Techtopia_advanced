import React, { useState, useEffect, useMemo } from 'react';
import { Download, Search, AlertCircle, Info, AlertTriangle, XOctagon } from 'lucide-react';
import { auditApi } from '../../lib/systemApi';
import DataTable from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { showToast as toast } from '../../components/ui/Toast';

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 1: return <AlertTriangle className="w-4 h-4 text-warning-main" />;
    case 2: return <XOctagon className="w-4 h-4 text-error-main" />;
    case 3: return <AlertCircle className="w-4 h-4 text-error-dark" />;
    default: return <Info className="w-4 h-4 text-info-main" />;
  }
};

const getSeverityBadge = (severity) => {
  switch (severity) {
    case 1: return <Badge variant="warning">Warning</Badge>;
    case 2: return <Badge variant="destructive">Error</Badge>;
    case 3: return <Badge variant="destructive">Critical</Badge>;
    default: return <Badge variant="info">Info</Badge>;
  }
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  // Fetch initial data
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditApi.list({ pageSize: 500 }); // Fetch a large chunk for client-side pagination
      setLogs(response.data || response); // Handle both {data} and array formats
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.info('Exporting audit logs...');
      const blob = await auditApi.export({ format: 'csv' });
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error('Failed to export audit logs');
    }
  };

  const columns = useMemo(() => [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      cell: ({ row }) => (
        <span className="text-sm text-foreground-muted whitespace-nowrap">
          {new Date(row.original.timestamp).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Severity',
      accessorKey: 'severity',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getSeverityIcon(row.original.severity)}
          {getSeverityBadge(row.original.severity)}
        </div>
      )
    },
    {
      header: 'Actor',
      accessorKey: 'actor',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{row.original.actor}</span>
      )
    },
    {
      header: 'Module & Action',
      accessorKey: 'action',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">{row.original.action}</span>
          <span className="text-xs text-foreground-muted">{row.original.module}</span>
        </div>
      )
    },
    {
      header: 'IP Address',
      accessorKey: 'ipAddress',
      cell: ({ row }) => (
        <span className="text-sm font-mono text-foreground-muted">{row.original.ipAddress || 'N/A'}</span>
      )
    },
  ], []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.actor?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.action?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = severityFilter === 'all' || log.severity?.toString() === severityFilter;
      const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;

      return matchesSearch && matchesSeverity && matchesModule;
    });
  }, [logs, searchTerm, severityFilter, moduleFilter]);

  const uniqueModules = useMemo(() => {
    return [...new Set(logs.map(log => log.module))].filter(Boolean);
  }, [logs]);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit Logs</h1>
          <p className="text-foreground-muted mt-1">Monitor system activities, user actions, and security events.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-surface-elevated border border-border p-4 rounded-xl shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <Input 
            placeholder="Search by actor or action..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="0">Info</SelectItem>
              <SelectItem value="1">Warning</SelectItem>
              <SelectItem value="2">Error</SelectItem>
              <SelectItem value="3">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {uniqueModules.map(module => (
                <SelectItem key={module} value={module}>{module}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <DataTable 
          columns={columns} 
          data={filteredLogs} 
          loading={loading} 
          pageSize={15} 
        />
      </div>
    </div>
  );
}
