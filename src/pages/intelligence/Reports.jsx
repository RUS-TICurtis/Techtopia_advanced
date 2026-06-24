import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { FileSpreadsheet, FileDown, Plus, Download, Mail } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import './Reports.css';

const FINANCIAL_DATA = [
  { month: 'Jan', ARR: 240000, Expenses: 120000, Profit: 120000 },
  { month: 'Feb', ARR: 290000, Expenses: 135000, Profit: 155000 },
  { month: 'Mar', ARR: 350000, Expenses: 140000, Profit: 210000 },
  { month: 'Apr', ARR: 480000, Expenses: 160000, Profit: 320000 },
  { month: 'May', ARR: 520000, Expenses: 175000, Profit: 345000 },
  { month: 'Jun', ARR: 680000, Expenses: 190000, Profit: 490000 },
];

export default function Reports() {
  const [scheduledReports, setScheduledReports] = useState([
    { id: '1', name: 'Weekly Executive Sales Summary', type: 'Sales', frequency: 'Weekly', format: 'PDF', recipients: 'executives@techcorp.io' },
    { id: '2', name: 'Monthly Financial Audit', type: 'Financial', frequency: 'Monthly', format: 'Excel', recipients: 'finance@techcorp.io' },
    { id: '3', name: 'Daily Lead Conversion Rate', type: 'Marketing', frequency: 'Daily', format: 'Slack Alert', recipients: '#leads-channel' },
  ]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Sales');
  const [newFrequency, setNewFrequency] = useState('Weekly');
  const [newFormat, setNewFormat] = useState('PDF');
  const [newRecipients, setNewRecipients] = useState('');

  const handleAddReport = (e) => {
    e.preventDefault();
    if (!newName || !newRecipients) return;
    const newReport = {
      id: String(Date.now()),
      name: newName,
      type: newType,
      frequency: newFrequency,
      format: newFormat,
      recipients: newRecipients,
    };
    setScheduledReports([...scheduledReports, newReport]);
    setShowScheduleModal(false);
    setNewName('');
    setNewRecipients('');
  };

  const triggerExport = (reportName) => {
    alert(`Exporting "${reportName}" as ${newFormat || 'PDF'}. Check downloads folder.`);
  };

  return (
    <div className="page-container reports-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FileSpreadsheet className="text-[#10B981]" />
            Business Intelligence & Reports
          </h1>
          <p className="page-subtitle">
            Build custom metrics, download compliance sheets, or set up scheduled report tasks.
          </p>
        </div>
        <button onClick={() => setShowScheduleModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={16} /> Schedule Report
        </button>
      </div>

      {/* Executive Financial Metrics */}
      <div className="reports-main-grid mb-6">
        {/* Chart Panel */}
        <div className="card reports-chart-card">
          <h3 className="reports-card-title mb-4">Annual Recurring Revenue (ARR) Growth</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={FINANCIAL_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorARR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" opacity={0.3} />
                <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)', color: 'var(--text-title)' }} />
                <Area type="monotone" dataKey="ARR" stroke="#38BDF8" fillOpacity={1} fill="url(#colorARR)" />
                <Area type="monotone" dataKey="Profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Executive Metrics Info panel */}
        <div className="card reports-metrics-card flex flex-col justify-between">
          <div>
            <h3 className="reports-card-title mb-6">Executive Key Metrics</h3>
            <div className="reports-metrics-stack">
              <div className="reports-metric-box">
                <span className="reports-metric-label">Current ARR</span>
                <span className="reports-metric-value text-gradient font-black">$680,000</span>
                <span className="reports-metric-trend positive">â–² +30.7% vs last quarter</span>
              </div>
              <div className="reports-metric-box">
                <span className="reports-metric-label">Gross Margin</span>
                <span className="reports-metric-value" style={{ color: 'var(--brand-cyan)' }}>72%</span>
                <span className="reports-metric-trend neutral">Steady expansion across cloud licenses</span>
              </div>
            </div>
          </div>
          
          <button onClick={() => triggerExport('Q2 Financial Summary')} className="btn btn-secondary w-full flex items-center justify-center gap-2 mt-6">
            <FileDown size={16} /> Export Q2 Executive Report
          </button>
        </div>
      </div>

      {/* Scheduled Reports List */}
      <div className="table-container card" style={{ padding: 0 }}>
        <div className="reports-table-header-panel p-5 border-b border-light" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <h3 className="reports-card-title">Scheduled Reports & Notifications</h3>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Type</th>
              <th>Frequency</th>
              <th>Format</th>
              <th>Recipients / Channel</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scheduledReports.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-title)' }}>{r.name}</td>
                <td>
                  <Badge variant={r.type === 'Sales' ? 'success' : r.type === 'Financial' ? 'info' : 'warning'}>
                    {r.type}
                  </Badge>
                </td>
                <td>{r.frequency}</td>
                <td><code style={{ fontSize: 11 }}>{r.format}</code></td>
                <td>
                  <div className="flex items-center gap-1.5 color-text-muted">
                    <Mail size={13} style={{ color: 'var(--text-light)' }} />
                    <span>{r.recipients}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => triggerExport(r.name)} className="btn btn-secondary px-2.5 py-1 text-xs" title="Run manual download">
                    <Download size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Automated Report"
        size="md"
      >
        <form onSubmit={handleAddReport} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Report Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Pipeline Analysis"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Report Category</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="form-input"
              >
                <option value="Sales">Sales</option>
                <option value="Financial">Financial</option>
                <option value="Support">Support SLA</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Frequency</label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value)}
                className="form-input"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Export Format</label>
              <select
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value)}
                className="form-input"
              >
                <option value="PDF">PDF Report</option>
                <option value="Excel">Excel / CSV</option>
                <option value="Slack Alert">Slack Webhook</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recipient Email / Channel *</label>
              <input
                type="text"
                required
                placeholder="e.g. board@techcorp.io"
                value={newRecipients}
                onChange={(e) => setNewRecipients(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-footer mt-4">
            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Schedule Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
