import { useState } from 'react';
import { 
  LifeBuoy, 
  Search, 
  Plus, 
  X, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Trash2,
  Edit2,
  Calendar,
  User,
  ShieldCheck,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { useTickets } from '../hooks/useCrmData';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { showToast } from '../components/ui/Toast';
import './Support.css';

const getAccountLead = (clientName) => {
  const client = String(clientName || '').toLowerCase();
  if (client.includes('cloudscale') || client.includes('acme')) {
    return { name: 'Curtis Tungsten', role: 'Super Admin', avatar: 'CT' };
  } else if (client.includes('devflow')) {
    return { name: 'Sarah Jenkins', role: 'Sales Executive', avatar: 'SJ' };
  } else if (client.includes('biogen')) {
    return { name: 'Faye Morgan', role: 'Finance Manager', avatar: 'FM' };
  } else if (client.includes('futurelogic')) {
    return { name: 'Patrick Mills', role: 'Project Manager', avatar: 'PM' };
  } else {
    return { name: 'Sam Porter', role: 'Support Agent', avatar: 'SP' };
  }
};

const TABS = ['All', 'Open', 'In Progress', 'Resolved'];

const emptyForm = {
  subject: '',
  client: '',
  priority: 'Medium',
  status: 'Open',
  message: ''
};

export default function Support({ searchValue = '' }) {
  const { tickets, createTicket, updateTicket, deleteTicket } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All'); // 'All' | 'Support Ticket' | 'Feature Request'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [client, setClient] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Open');
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !client) return;

    try {
      await createTicket({
        subject,
        client,
        priority,
        status,
        message,
      });

      // Reset Form
      setSubject('');
      setClient('');
      setPriority('Medium');
      setStatus('Open');
      setMessage('');
      setIsAddModalOpen(false);

      showToast('Ticket Created', `Support ticket has been registered in the system.`, 'success');
    } catch {
      showToast('Error', 'Failed to register ticket.', 'error');
    }
  };

  const openEditModal = (ticket, e) => {
    if (e) e.stopPropagation();
    setEditId(ticket.id);
    setSubject(ticket.subject);
    setClient(ticket.client);
    setPriority(ticket.priority);
    setStatus(ticket.status);
    setMessage(ticket.message || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !client) return;

    try {
      await updateTicket({
        id: editId,
        data: {
          subject,
          client,
          priority,
          status,
          message,
        }
      });
      setIsEditModalOpen(false);

      if (selectedTicket && selectedTicket.id === editId) {
        setSelectedTicket({
          id: editId,
          subject,
          client,
          priority,
          status,
          message,
        });
      }

      showToast('Success', `Ticket details have been successfully modified.`, 'success');
    } catch {
      showToast('Error', 'Failed to modify ticket.', 'error');
    }
  };

  const handleDeleteTicket = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ticket ${id}?`)) {
      try {
        await deleteTicket(id);
        if (selectedTicket && selectedTicket.id === id) {
          setSelectedTicket(null);
        }
        showToast('Deleted', `Ticket ${id} has been purged.`, 'error');
      } catch {
        showToast('Error', 'Failed to delete ticket.', 'error');
      }
    }
  };

  const changeStatusQuick = async (ticket, newStatus) => {
    try {
      await updateTicket({
        id: ticket.id,
        data: { status: newStatus }
      });
      if (selectedTicket && selectedTicket.id === ticket.id) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
      showToast('Updated', `Ticket status set to ${newStatus}.`, 'success');
    } catch {
      showToast('Error', 'Failed to update status.', 'error');
    }
  };

  const changePriorityQuick = async (ticket, newPriority) => {
    try {
      await updateTicket({
        id: ticket.id,
        data: { priority: newPriority }
      });
      if (selectedTicket && selectedTicket.id === ticket.id) {
        setSelectedTicket({ ...selectedTicket, priority: newPriority });
      }
      showToast('Updated', `Ticket priority set to ${newPriority}.`, 'success');
    } catch {
      showToast('Error', 'Failed to update priority.', 'error');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.subject.toLowerCase().includes(searchValue.toLowerCase()) ||
      t.client.toLowerCase().includes(searchValue.toLowerCase()) ||
      t.id.toLowerCase().includes(searchValue.toLowerCase());
    
    const matchesTab = activeTab === 'All' || t.status === activeTab;

    const matchesCategory = categoryFilter === 'All' || 
      (categoryFilter === 'Support Ticket' && t.category !== 'Feature Request') ||
      t.category === categoryFilter;

    return matchesSearch && matchesTab && matchesCategory;
  });

  const getSLAIndicator = (ticket) => {
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
      return { text: 'SLA Met', variant: 'success' };
    }
    
    // Simulated SLA metrics based on priority
    switch (ticket.priority) {
      case 'High':
        return { text: 'SLA: 45m left', variant: 'error', icon: AlertTriangle };
      case 'Medium':
        return { text: 'SLA: 4h remaining', variant: 'warning', icon: Clock };
      default:
        return { text: 'SLA: 24h limit', variant: 'neutral', icon: Clock };
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

  // Context Menu per row
  const getRowContextMenuItems = (ticket) => [
    {
      label: 'View Ticket Dossier',
      icon: Eye,
      onClick: () => setSelectedTicket(ticket)
    },
    {
      label: 'Modify Details',
      icon: Edit2,
      onClick: (e) => openEditModal(ticket, e)
    },
    {
      label: 'Transition Status',
      icon: SlidersHorizontal,
      children: [
        { label: 'Open', onClick: () => changeStatusQuick(ticket, 'Open') },
        { label: 'In Progress', onClick: () => changeStatusQuick(ticket, 'In Progress') },
        { label: 'Resolved', onClick: () => changeStatusQuick(ticket, 'Resolved') },
        { label: 'Closed', onClick: () => changeStatusQuick(ticket, 'Closed') }
      ]
    },
    {
      label: 'Modify Priority SLA',
      icon: Clock,
      children: [
        { label: 'Low (48h SLA)', onClick: () => changePriorityQuick(ticket, 'Low') },
        { label: 'Medium (12h SLA)', onClick: () => changePriorityQuick(ticket, 'Medium') },
        { label: 'High (2h SLA)', onClick: () => changePriorityQuick(ticket, 'High') }
      ]
    },
    { type: 'separator' },
    {
      label: 'Purge Ticket',
      icon: Trash2,
      variant: 'danger',
      onClick: (e) => handleDeleteTicket(ticket.id, e)
    }
  ];

  // TanStack Columns
  const columns = [
    {
      accessorKey: 'id',
      header: 'Ticket ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-bold text-[#01FDF6]">
          {getValue()}
        </span>
      )
    },
    {
      accessorKey: 'subject',
      header: 'Subject & Description',
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <div className="flex flex-col max-w-sm gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-white text-sm truncate">{ticket.subject}</span>
              {ticket.category === 'Feature Request' ? (
                <span className="text-[8px] px-1.5 py-0.5 rounded font-black bg-[#21FA90]/10 text-[#21FA90] border border-[#21FA90]/35 uppercase tracking-wider font-mono">Feature Request</span>
              ) : (
                <span className="text-[8px] px-1.5 py-0.5 rounded font-black bg-[#01FDF6]/10 text-[#01FDF6] border border-[#01FDF6]/35 uppercase tracking-wider font-mono">Support</span>
              )}
            </div>
            <span className="text-[10px] text-gray-500 truncate">{ticket.message || 'No description recorded'}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'client',
      header: 'Enterprise Client',
      cell: ({ getValue }) => <span className="font-semibold text-gray-300 text-xs">{getValue()}</span>
    },
    {
      accessorKey: 'priority',
      header: 'SLA Priority',
      cell: ({ row }) => {
        const ticket = row.original;
        const sla = getSLAIndicator(ticket);
        return (
          <div className="flex flex-col gap-0.5">
            <Badge variant={priorityVariants[ticket.priority]}>
              {ticket.priority}
            </Badge>
            <span className={`text-[9px] font-bold font-mono tracking-wide ${
              sla.variant === 'error' ? 'text-[#FF47DA]' : 
              sla.variant === 'warning' ? 'text-[#E4FF1A]' : 'text-gray-500'
            }`}>
              {sla.text}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Ticket Status',
      cell: ({ getValue }) => (
        <Badge variant={statusVariants[getValue()] || 'neutral'}>
          {getValue()}
        </Badge>
      )
    },
    {
      accessorKey: 'lastUpdated',
      header: 'Last SLA Activity',
      cell: ({ getValue }) => <span className="text-xs text-gray-500 font-medium font-mono">{getValue()}</span>
    }
  ];

  const metrics = [
    { label: 'Open Tickets', value: tickets.filter(t => t.status === 'Open').length, icon: AlertCircle, color: 'var(--brand-magenta)' },
    { label: 'In Progress', value: tickets.filter(t => t.status === 'In Progress').length, icon: Clock, color: 'var(--brand-chartreuse)' },
    { label: 'Resolved (SLA Met)', value: tickets.filter(t => t.status === 'Resolved').length, icon: CheckCircle, color: 'var(--brand-green)' },
    { label: 'Avg Resolution Time', value: '4.2h', icon: LifeBuoy, color: 'var(--brand-cyan)' },
  ];

  return (
    <div className="page-container support-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <span className="text-[#FF47DA]">⚡</span> Command Center
          </h1>
          <p className="page-subtitle">Manage client requests, SLA commitments, and engineering tickets</p>
        </div>
        <button className="btn btn-primary shadow-glow flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> New Ticket
        </button>
      </div>

      {/* Metrics */}
      <div className="metrics-grid mb-6">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card metric-card premium-metric border-l-4" style={{ borderLeftColor: m.color }}>
              <div className="metric-icon-wrapper" style={{ background: `${m.color}15` }}>
                <Icon size={22} style={{ color: m.color }} />
              </div>
              <div className="metric-info">
                <span className="metric-label">{m.label}</span>
                <span className="metric-value font-display font-black text-white">{m.value}</span>
              </div>
              <div className="metric-glow-dot" style={{ background: m.color }}></div>
            </div>
          );
        })}
      </div>

      {/* Tab select & totals */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                activeTab === tab 
                  ? 'bg-[#FF47DA] border-[#FF47DA] text-white shadow-glow' 
                  : 'bg-[#0f1629]/40 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab}
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono">
                {tab === 'All' ? tickets.length : tickets.filter(t => t.status === tab).length}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Filter Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0f1629]/60 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#01FDF6] cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Support Ticket">Support Escalations</option>
            <option value="Feature Request">Feature Proposals</option>
          </select>
          <div className="text-xs text-gray-500 font-mono ml-2 hidden md:block">
            SLA win rate: <span className="text-[#21FA90] font-black">98.2%</span>
          </div>
        </div>
      </div>

      {/* Roster & Details Split */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Table wrapper */}
        <div className="flex-1 min-w-0 bg-[#0f1629]/30 border border-gray-800/80 rounded-xl overflow-hidden backdrop-blur-md">
          <DataTable 
            columns={columns}
            data={filteredTickets}
            onRowClick={(row) => setSelectedTicket(row)}
            getRowContextMenuItems={getRowContextMenuItems}
            pageSize={10}
          />
        </div>

        {/* Selected Dossier sliding card */}
        {selectedTicket && (
          <div className="dossier-card card xl:w-[400px] flex-shrink-0 animate-fade-in flex flex-col gap-5 border border-gray-800/85 bg-[#0f1629]/80 backdrop-blur-lg">
            <div className="flex justify-between items-center border-b border-gray-850 pb-4">
              <h3 className="card-title text-white font-black font-display text-base tracking-wide m-0">Ticket Dossier</h3>
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Ticket Header Profile */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FF47DA]/20 border border-[#FF47DA]/40 text-[#FF47DA] flex items-center justify-center font-display font-black text-sm shadow-glow">
                {selectedTicket.id}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-extrabold text-sm tracking-tight leading-tight">{selectedTicket.subject}</h4>
                <p className="text-gray-400 text-[11px] font-semibold flex items-center gap-1.5 mt-1 truncate">
                  <Building2 size={12} className="text-gray-500" />
                  {selectedTicket.client}
                </p>
              </div>
            </div>

            {/* Meta details list */}
            <div className="flex flex-col gap-2.5 p-4 bg-[#0a0f1e]/80 border border-gray-850 rounded-xl">
              <div className="flex justify-between items-center text-xs text-gray-300">
                <span className="text-gray-500 font-bold flex items-center gap-1"><Clock size={12} /> Target SLA</span>
                <Badge variant={getSLAIndicator(selectedTicket).variant}>
                  {getSLAIndicator(selectedTicket).text}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-300 border-t border-gray-850/50 pt-2.5 mt-1">
                <span className="text-gray-500 font-bold flex items-center gap-1"><ShieldCheck size={12} /> Severity Tier</span>
                <Badge variant={priorityVariants[selectedTicket.priority]}>
                  {selectedTicket.priority} Priority
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-300">
                <span className="text-gray-500 font-bold flex items-center gap-1"><Calendar size={12} /> Log Date</span>
                <span className="font-mono text-gray-400">{selectedTicket.created || '2026-05-15'}</span>
              </div>
            </div>

            {/* Designated Account Lead info box */}
            {(() => {
              const lead = getAccountLead(selectedTicket.client);
              return (
                <div className="flex flex-col gap-2.5 p-4 bg-[#0a0f1e]/80 border border-gray-850 rounded-xl">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Designated Account Lead</div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#01FDF6]/15 border border-[#01FDF6]/35 text-[#01FDF6] flex items-center justify-center font-bold text-xs">
                      {lead.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">{lead.name}</div>
                      <div className="text-[9px] text-gray-500">{lead.role}</div>
                    </div>
                    <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded bg-gray-900 border border-gray-850 text-[#01FDF6] font-mono font-bold uppercase tracking-wider">Assigned SLA</span>
                  </div>
                </div>
              );
            })()}

            {/* Ticket Message Section */}
            <div className="flex flex-col gap-1.5">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Message / Intel</h5>
              <div className="p-3 bg-gray-900 border border-gray-850 rounded-lg text-xs text-gray-300 leading-relaxed italic">
                "{selectedTicket.message || 'No detailed descriptive logs submitted for this issue ticket.'}"
              </div>
            </div>

            {/* Simulated support history / response pipeline */}
            <div className="flex flex-col gap-2 border-t border-gray-850 pt-4">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare size={12} /> SLA History Logs
              </h5>
              <div className="flex flex-col gap-2.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                <div className="flex flex-col gap-1 p-2 bg-[#01FDF6]/5 border-l-2 border-[#01FDF6] rounded-r text-[10px] text-gray-300">
                  <span className="font-bold text-[#01FDF6]">Curtis Miller (Ops Tech) <span className="text-gray-500 font-normal ml-1">1h ago</span></span>
                  <span>Initiated diagnostic sequence. Re-routing cluster configurations.</span>
                </div>
                <div className="flex flex-col gap-1 p-2 bg-gray-950 border border-gray-850 rounded text-[10px] text-gray-400">
                  <span className="font-bold text-gray-400">System Bot <span className="text-gray-500 font-normal ml-1">2h ago</span></span>
                  <span>Ticket successfully registered and prioritized under {selectedTicket.priority} Priority SLA rules.</span>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="mt-auto border-t border-gray-850 pt-4 flex gap-3">
              <button 
                className="btn btn-primary flex-1 py-3 text-xs" 
                onClick={(e) => openEditModal(selectedTicket, e)}
              >
                Modify Ticket
              </button>
              <button 
                className="btn btn-outline text-red-500 hover:text-white hover:bg-red-950/20 border-red-950/60 hover:border-red-800 flex items-center justify-center p-3"
                onClick={(e) => handleDeleteTicket(selectedTicket.id, e)}
                title="Delete Ticket"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Support Ticket Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Open Support Ticket"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket Subject *</label>
            <input 
              type="text" 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF47DA]" 
              placeholder="e.g. Inbound API socket leak in production cluster" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client Enterprise *</label>
            <input 
              type="text" 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF47DA]" 
              placeholder="e.g. Wayne Enterprises" 
              value={client} 
              onChange={e => setClient(e.target.value)} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">SLA Priority Severity</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF47DA]" 
                value={priority} 
                onChange={e => setPriority(e.target.value)}
              >
                <option value="Low">Low (48h SLA)</option>
                <option value="Medium">Medium (12h SLA)</option>
                <option value="High">High (2h SLA)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel / Ticket Status</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF47DA]" 
                value={status} 
                onChange={e => setStatus(e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description & Detailed Message</label>
            <textarea 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF47DA] h-24 resize-none" 
              placeholder="Provide a detailed report of diagnostic indicators..." 
              value={message} 
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              className="px-5 py-2.5 rounded-lg text-sm bg-gray-950 border border-gray-850 text-gray-300 hover:text-white transition-all" 
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 rounded-lg text-sm bg-[#FF47DA] hover:bg-[#eb32c4] text-white font-bold shadow-glow transition-all"
            >
              Log Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Support Ticket Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modify Ticket Details"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket Subject *</label>
            <input 
              type="text" 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF47DA]" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client Enterprise *</label>
            <input 
              type="text" 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF47DA]" 
              value={client} 
              onChange={e => setClient(e.target.value)} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">SLA Priority Severity</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF47DA]" 
                value={priority} 
                onChange={e => setPriority(e.target.value)}
              >
                <option value="Low">Low (48h SLA)</option>
                <option value="Medium">Medium (12h SLA)</option>
                <option value="High">High (2h SLA)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel / Ticket Status</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF47DA]" 
                value={status} 
                onChange={e => setStatus(e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description & Detailed Message</label>
            <textarea 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF47DA] h-24 resize-none" 
              value={message} 
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              className="px-5 py-2.5 rounded-lg text-sm bg-gray-950 border border-gray-850 text-gray-300 hover:text-white transition-all" 
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 rounded-lg text-sm bg-[#FF47DA] hover:bg-[#eb32c4] text-white font-bold shadow-glow transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
