import { useState } from 'react';
import { 
  LifeBuoy, 
  Plus, 
  X, 
  MessageSquare, 
  Clock, 
  ArrowLeft,
  Calendar,
  Building2,
  Flag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { mockDb } from '../../utils/mockDb';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { showToast } from '../../components/ui/Toast';
import './ClientPortal.css';

export default function ClientSupport() {
  const user = useAuthStore(state => state.user);
  const companyName = user?.clientCompany || 'CloudScale Inc.';
  const displayCompany = companyName === 'ACME Corp' ? 'CloudScale Inc.' : companyName;

  const [tickets, setTickets] = useState(() => {
    return mockDb.getTickets() || [];
  });

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [message, setMessage] = useState('');

  const refreshTickets = () => {
    setTickets(mockDb.getTickets() || []);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!subject) return;

    const allTickets = mockDb.getTickets() || [];
    const id = `TK-${String(allTickets.length + 1).padStart(4, '0')}`;
    const newTicket = {
      id,
      subject,
      client: displayCompany,
      priority,
      status: 'Open',
      message,
      lastUpdated: 'Just now',
      created: new Date().toISOString().split('T')[0]
    };

    const updated = [newTicket, ...allTickets];
    mockDb.saveTickets(updated);
    refreshTickets();

    // Reset Form
    setSubject('');
    setPriority('Medium');
    setMessage('');
    setIsAddModalOpen(false);

    showToast('Ticket Opened', `Your issue ticket ${id} has been logged on the priority SLA pipeline.`, 'success');
  };

  const getSLAIndicator = (ticket) => {
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
      return { text: 'SLA Met', variant: 'success' };
    }
    
    switch (ticket.priority) {
      case 'High':
        return { text: 'Target: 2h SLA (45m left)', variant: 'error' };
      case 'Medium':
        return { text: 'Target: 12h SLA (4h left)', variant: 'warning' };
      default:
        return { text: 'Target: 48h SLA', variant: 'neutral' };
    }
  };

  const statusVariants = {
    'Open': 'error',
    'In Progress': 'warning',
    'Resolved': 'success',
    'Closed': 'neutral'
  };

  const priorityVariants = {
    'High': 'error',
    'Medium': 'warning',
    'Low': 'neutral'
  };

  const clientTickets = tickets.filter(t => t.client === displayCompany);

  const columns = [
    {
      accessorKey: 'id',
      header: 'Ticket ID',
      cell: ({ getValue }) => <span className="font-mono text-xs font-bold" style={{ color: 'var(--brand-cyan)' }}>{getValue()}</span>
    },
    {
      accessorKey: 'subject',
      header: 'Issue Subject',
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex flex-col max-w-xs">
            <span className="font-bold text-xs truncate" style={{ color: 'var(--text-title)' }}>{t.subject}</span>
            <span className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>{t.message || 'No description provided'}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'priority',
      header: 'SLA Priority',
      cell: ({ row }) => {
        const t = row.original;
        const sla = getSLAIndicator(t);
        return (
          <div className="flex flex-col gap-0.5">
            <Badge variant={priorityVariants[t.priority]}>
              {t.priority}
            </Badge>
            <span 
              className="text-[8px] font-bold font-mono tracking-wide" 
              style={{
                color: sla.variant === 'error' ? 'var(--brand-magenta)' : 
                       sla.variant === 'warning' ? 'var(--brand-chartreuse)' : 'var(--text-muted)'
              }}
            >
              {sla.text}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={statusVariants[getValue()] || 'neutral'}>
          {getValue()}
        </Badge>
      )
    },
    {
      accessorKey: 'lastUpdated',
      header: 'Activity Log',
      cell: ({ getValue }) => <span className="text-[10px] font-mono font-medium" style={{ color: 'var(--text-muted)' }}>{getValue()}</span>
    }
  ];

  return (
    <div className="page-container client-portal-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Link to="/client" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span style={{ color: 'var(--brand-magenta)' }}>⚡</span> Technical Helpdesk
          </h1>
          <p className="page-subtitle">File priority support tickets, monitor SLA timers, and review tech chat diagnostics</p>
        </div>
        <button className="btn btn-primary shadow-glow flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Open Ticket
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Table list */}
        <div className="flex-1 min-w-0 portal-panel p-0 overflow-hidden">
          <DataTable 
            columns={columns}
            data={clientTickets}
            onRowClick={(row) => setSelectedTicket(row)}
            pageSize={10}
          />
        </div>

        {/* Support details dossier card */}
        {selectedTicket && (
          <div className="dossier-card card xl:w-[400px] flex-shrink-0 animate-fade-in flex flex-col gap-5">
            <div className="portal-panel-header">
              <h3 className="portal-panel-title">Ticket Dossier</h3>
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded-lg transition-all"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Ticket Header Profile */}
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center font-display font-black text-sm shadow-glow border"
                style={{
                  background: 'rgba(255, 71, 218, 0.08)',
                  borderColor: 'rgba(255, 71, 218, 0.25)',
                  color: 'var(--brand-magenta)'
                }}
              >
                {selectedTicket.id}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="portal-text-title text-sm tracking-tight leading-tight">{selectedTicket.subject}</h4>
                <p className="text-[11px] font-semibold flex items-center gap-1.5 mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
                  <Building2 size={12} className="text-gray-500" />
                  {selectedTicket.client}
                </p>
              </div>
            </div>

            {/* Meta details list */}
            <div className="portal-info-box flex-col items-stretch gap-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Clock size={12} /> Target SLA</span>
                <Badge variant={getSLAIndicator(selectedTicket).variant}>
                  {getSLAIndicator(selectedTicket).text}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-light pt-2.5 mt-1" style={{ borderTop: '1px solid var(--border-light)' }}>
                <span className="font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Flag size={12} /> Severity Tier</span>
                <Badge variant={priorityVariants[selectedTicket.priority]}>
                  {selectedTicket.priority} Priority
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Calendar size={12} /> Log Date</span>
                <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{selectedTicket.created || '2026-05-15'}</span>
              </div>
            </div>

            {/* Ticket Message Section */}
            <div className="flex flex-col gap-1.5">
              <h5 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>My Message</h5>
              <div className="portal-bullet-item italic" style={{ color: 'var(--text-main)' }}>
                "{selectedTicket.message || 'No description recorded.'}"
              </div>
            </div>

            {/* Simulated diagnostic logs sync */}
            <div className="flex flex-col gap-2 border-t border-light pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
              <h5 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <MessageSquare size={12} /> Support Chat Logs
              </h5>
              <div className="portal-chat-logs">
                <div className="portal-chat-msg agent">
                  <span className="portal-chat-sender">
                    Curtis Miller (Operations)
                    <span className="portal-chat-time">1h ago</span>
                  </span>
                  <span>Received diagnostic parameters. Initiating cutover sync right now.</span>
                </div>
                <div className="portal-chat-msg">
                  <span className="portal-chat-sender">
                    System Bot
                    <span className="portal-chat-time">2h ago</span>
                  </span>
                  <span>Ticket successfully registered on support roster pipeline under {selectedTicket.priority} SLA.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Ticket Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Open Support Ticket"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Issue Subject *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Inbound cloud replication sync delay" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>SLA Priority Severity</label>
            <select 
              className="form-input" 
              value={priority} 
              onChange={e => setPriority(e.target.value)}
            >
              <option value="Low">Low Priority (48h SLA)</option>
              <option value="Medium">Medium Priority (12h SLA)</option>
              <option value="High">High Priority (2h SLA)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Descriptive message</label>
            <textarea 
              className="form-textarea" 
              placeholder="State logs, indicators and details of client issues..." 
              value={message} 
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              className="btn btn-secondary px-5 py-2.5 rounded-lg text-sm" 
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary px-5 py-2.5 rounded-lg text-sm"
              style={{ background: 'var(--brand-magenta)', color: '#fff' }}
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
