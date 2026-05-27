import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  X, 
  ChevronDown, 
  TrendingUp, 
  Sparkles, 
  Mail, 
  Phone, 
  Building2, 
  SlidersHorizontal,
  ArrowUpDown,
  User,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDb } from '../utils/mockDb';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import './Leads.css';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
const SOURCES  = ['Website', 'Referral', 'LinkedIn', 'Email Campaign', 'Cold Call', 'Other'];

const INITIAL_LEADS = [
  {
    id: "l1",
    fullName: "Sarah Connor",
    email: "s.connor@cyberdyne.jp",
    company: "Cyberdyne Systems",
    phone: "+81 3 5555 0199",
    dealValue: 150000,
    source: "LinkedIn",
    status: "Qualified",
    aiScore: 94,
    enrichStatus: "Enriched",
    notes: "Security director interested in advanced threat protection SaaS. High buying intent."
  },
  {
    id: "l2",
    fullName: "Bruce Wayne",
    email: "bruce@waynecorp.com",
    company: "Wayne Enterprises",
    phone: "+1 (555) 019-3900",
    dealValue: 500000,
    source: "Referral",
    status: "New",
    aiScore: 98,
    enrichStatus: "Enriched",
    notes: "Looking for institutional-scale multi-tenant secure dashboard system. Extremely high net worth."
  },
  {
    id: "l3",
    fullName: "Peter Parker",
    email: "p.parker@dailybugle.com",
    company: "Daily Bugle",
    phone: "+1 (555) 762-0900",
    dealValue: 12000,
    source: "Website",
    status: "Contacted",
    aiScore: 65,
    enrichStatus: "Pending",
    notes: "Inbound request regarding photo-processing API seat licenses. Small deal size."
  },
  {
    id: "l4",
    fullName: "Tony Stark",
    email: "tony@starkindustries.com",
    company: "Stark Industries",
    phone: "+1 (555) 018-2000",
    dealValue: 850000,
    source: "Email Campaign",
    status: "Proposal",
    aiScore: 99,
    enrichStatus: "Enriched",
    notes: "Wants premium custom neon themes and bespoke dashboard grids. Infinite budget."
  }
];

export default function Leads({ searchValue = '' }) {
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('crm_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  useEffect(() => {
    localStorage.setItem('crm_leads', JSON.stringify(leads));
  }, [leads]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [source, setSource] = useState('Website');
  const [status, setStatus] = useState('New');
  const [notes, setNotes] = useState('');
  const [editId, setEditId] = useState(null);

  const [isEnriching, setIsEnriching] = useState(false);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !company || !email) return;

    const newLead = {
      id: "l_" + Date.now(),
      fullName,
      email,
      phone,
      company,
      dealValue: parseFloat(dealValue) || 0,
      source,
      status,
      aiScore: Math.floor(Math.random() * 40) + 60, // random AI score 60-99
      enrichStatus: 'Pending',
      notes
    };

    setLeads(prev => [...prev, newLead]);
    setIsAddModalOpen(false);
    showToast('Success', 'Inbound prospect profile successfully cataloged.', 'success');
  };

  const openEditModal = (lead, e) => {
    if (e) e.stopPropagation();
    setEditId(lead.id);
    setFullName(lead.fullName);
    setEmail(lead.email);
    setPhone(lead.phone || '');
    setCompany(lead.company);
    setDealValue(lead.dealValue.toString());
    setSource(lead.source);
    setStatus(lead.status);
    setNotes(lead.notes || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !company || !email) return;

    setLeads(prev => prev.map(l => {
      if (l.id === editId) {
        return {
          ...l,
          fullName,
          email,
          phone,
          company,
          dealValue: parseFloat(dealValue) || 0,
          source,
          status,
          notes
        };
      }
      return l;
    }));

    setIsEditModalOpen(false);
    showToast('Success', 'Lead profile successfully modified.', 'success');
  };

  const handleDeleteLead = (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this lead?")) {
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(null);
      }
      showToast('Deleted', 'Lead was successfully purged from memory.', 'error');
    }
  };

  const triggerEnrichment = (lead, e) => {
    if (e) e.stopPropagation();
    setIsEnriching(true);
    showToast('Enriching', 'Executing external Clearbit & LinkedIn data mining...', 'info');
    
    setTimeout(() => {
      setLeads(prev => prev.map(l => {
        if (l.id === lead.id) {
          return {
            ...l,
            enrichStatus: 'Enriched',
            aiScore: Math.min(100, l.aiScore + 5),
            notes: l.notes + " (AI System: LinkedIn verified and enriched contact details.)"
          };
        }
        return l;
      }));
      setIsEnriching(false);
      showToast('Enriched', 'Prospect data enrichment completed successfully!', 'success');
    }, 1500);
  };

  const convertToContact = (lead, e) => {
    if (e) e.stopPropagation();
    
    // Add to CRM Contacts
    mockDb.addContact({
      name: lead.fullName,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      status: 'Qualified',
      value: lead.dealValue,
      notes: lead.notes + " (Converted from Inbound Leads Dashboard)"
    });

    // Delete from Leads
    setLeads(prev => prev.filter(l => l.id !== lead.id));
    if (selectedLead && selectedLead.id === lead.id) {
      setSelectedLead(null);
    }
    
    showToast('Success', 'Lead successfully promoted to standard CRM Client Dossier!', 'success');
  };

  const changeStatusQuick = (lead, newStatus) => {
    setLeads(prev => prev.map(l => {
      if (l.id === lead.id) {
        return { ...l, status: newStatus };
      }
      return l;
    }));
  };

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length;
    return acc;
  }, {});

  const statusVariants = {
    'New': 'info',
    'Contacted': 'neutral',
    'Qualified': 'purple',
    'Proposal': 'info',
    'Won': 'success',
    'Lost': 'error'
  };

  // Filter leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.fullName.toLowerCase().includes(searchValue.toLowerCase()) ||
      l.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      l.company.toLowerCase().includes(searchValue.toLowerCase());
    
    const matchesStatus = activeFilter === 'All' || l.status === activeFilter;

    return matchesSearch && matchesStatus;
  });

  // Table Columns
  const columns = [
    {
      accessorKey: 'fullName',
      header: 'Prospect Name',
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-[#01FDF6]/10 border border-[#01FDF6]/25 text-[#01FDF6] flex items-center justify-center font-bold text-sm">
              {lead.fullName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm hover:text-[#01FDF6] transition-colors">{lead.fullName}</span>
              <span className="text-[10px] text-gray-500 font-mono">{lead.email}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'company',
      header: 'Company / Enterprise',
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-300 text-xs">{lead.company}</span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              Source: <span className="text-[#8A4FFF] font-bold">{lead.source}</span>
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'aiScore',
      header: 'AI Match Score',
      cell: ({ getValue }) => {
        const score = getValue();
        const scoreColor = score >= 90 ? 'text-[#21FA90]' : score >= 70 ? 'text-[#E4FF1A]' : 'text-[#FF47DA]';
        return (
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#E4FF1A]" />
            <span className={`font-mono font-black text-xs ${scoreColor}`}>{score}/100</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'dealValue',
      header: 'Est. Deal Value',
      cell: ({ getValue }) => (
        <span className="font-display font-extrabold text-[#01FDF6] text-xs">
          ${getValue().toLocaleString()}
        </span>
      )
    },
    {
      accessorKey: 'enrichStatus',
      header: 'Data Enrichment',
      cell: ({ getValue }) => (
        <Badge variant={getValue() === 'Enriched' ? 'success' : 'neutral'}>
          {getValue()}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={statusVariants[getValue()] || 'neutral'}>
          {getValue()}
        </Badge>
      )
    }
  ];

  // Context Menu
  const getRowContextMenuItems = (lead) => [
    {
      label: 'View Dossier Details',
      icon: User,
      onClick: () => setSelectedLead(lead)
    },
    {
      label: 'Modify Lead Profile',
      icon: Edit2,
      onClick: (e) => openEditModal(lead, e)
    },
    {
      label: 'Transition Status',
      icon: SlidersHorizontal,
      children: STATUSES.map(s => ({
        label: s,
        onClick: () => changeStatusQuick(lead, s)
      }))
    },
    {
      label: 'Run AI Enrichment',
      icon: Sparkles,
      onClick: (e) => triggerEnrichment(lead, e),
      disabled: lead.enrichStatus === 'Enriched'
    },
    {
      label: 'Promote to CRM Client',
      icon: CheckCircle,
      onClick: (e) => convertToContact(lead, e)
    },
    { type: 'separator' },
    {
      label: 'Purge Lead Profile',
      icon: Trash2,
      variant: 'danger',
      onClick: (e) => handleDeleteLead(lead.id, e)
    }
  ];

  return (
    <PageContainer className="leads-page">
      <PageHeader
        title="Inbound Leads"
        subtitle="Prospect enrichment engine with integrated clearbit lookup & RBAC promotion"
        icon={<span className="text-[#01FDF6] text-xl">⚡</span>}
        actions={
          <button className="btn btn-primary shadow-glow flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} /> New Prospect
          </button>
        }
      />

      {/* Leads metrics pills */}
      <div className="leads-status-row grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {STATUSES.map(s => (
          <div 
            key={s} 
            onClick={() => setActiveFilter(s === activeFilter ? 'All' : s)}
            className={`leads-status-pill card flex justify-between items-center p-3 border transition-all cursor-pointer ${
              activeFilter === s 
                ? 'bg-[#01FDF6]/10 border-[#01FDF6] shadow-glow text-[#01FDF6]' 
                : 'border-gray-800 bg-[#0f1629]/40 hover:border-gray-700'
            }`}
          >
            <span className="text-xs font-bold text-gray-300">{s}</span>
            <span className="text-xs font-black font-mono px-2 py-0.5 bg-gray-950/60 rounded border border-gray-850">{counts[s] || 0}</span>
          </div>
        ))}
      </div>

      {/* Grid Layout (Table / Dossier details split) */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Table wrapper */}
        <div className="flex-1 min-w-0 bg-[#0f1629]/30 border border-gray-800/80 rounded-xl overflow-hidden backdrop-blur-md">
          <DataTable 
            columns={columns}
            data={filteredLeads}
            onRowClick={(row) => setSelectedLead(row)}
            getRowContextMenuItems={getRowContextMenuItems}
            pageSize={10}
          />
        </div>

        {/* Selected Lead dossier sidebar */}
        {selectedLead && (
          <div className="dossier-card card xl:w-[400px] flex-shrink-0 animate-fade-in flex flex-col gap-5 border border-gray-800/85 bg-[#0f1629]/80 backdrop-blur-lg">
            <div className="flex justify-between items-center border-b border-gray-850 pb-4">
              <h3 className="card-title text-white font-black font-display text-base tracking-wide m-0">Inbound Dossier</h3>
              <button 
                onClick={() => setSelectedLead(null)} 
                className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#01FDF6]/20 border border-[#01FDF6]/40 text-[#01FDF6] flex items-center justify-center font-display font-black text-xl shadow-glow">
                {selectedLead.fullName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-extrabold text-base tracking-tight truncate">{selectedLead.fullName}</h4>
                <p className="text-gray-400 text-xs font-semibold flex items-center gap-1.5 mt-0.5 truncate">
                  <Building2 size={12} className="text-gray-500" />
                  {selectedLead.company}
                </p>
              </div>
            </div>

            {/* AI Fit indicators */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#0a0f1e]/80 border border-gray-850 rounded-xl">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">AI Lead Match</span>
                <span className="font-mono text-sm font-black text-[#21FA90]">{selectedLead.aiScore}/100</span>
              </div>
              <div className="flex flex-col gap-0.5 border-l border-gray-850 pl-3">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Acquisition Source</span>
                <span className="font-mono text-sm font-black text-[#8A4FFF]">{selectedLead.source}</span>
              </div>
            </div>

            {/* Contact metadata */}
            <div className="flex flex-col gap-2.5 p-4 bg-[#0a0f1e]/40 border border-gray-850/50 rounded-xl">
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <Mail size={14} className="text-gray-500 w-4" />
                <span className="truncate">{selectedLead.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <Phone size={14} className="text-gray-500 w-4" />
                <span className="font-mono">{selectedLead.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-300 border-t border-gray-850/50 pt-2.5 mt-1">
                <Briefcase size={14} className="text-gray-500 w-4" />
                <span>
                  Est. Deal Value:{' '}
                  <strong className="text-[#01FDF6] font-display font-black ml-1">
                    ${selectedLead.dealValue.toLocaleString()}
                  </strong>
                </span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="flex flex-col gap-1.5">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inbound Intelligence Notes</h5>
              <div className="p-3 bg-[#E4FF1A]/5 border-l-4 border-[#E4FF1A] rounded-r-lg text-xs text-gray-300 leading-relaxed italic">
                {selectedLead.notes || "No prospective notes cataloged for this lead."}
              </div>
            </div>

            {/* Actions footer */}
            <div className="mt-auto border-t border-gray-850 pt-4 flex flex-col gap-2">
              <div className="flex gap-2">
                <button 
                  className="btn btn-primary flex-1 py-3 text-xs flex items-center justify-center gap-1.5" 
                  onClick={(e) => convertToContact(selectedLead, e)}
                >
                  <CheckCircle size={14} /> Convert to CRM Client
                </button>
                <button 
                  className="btn btn-secondary py-3 px-3 text-xs flex items-center justify-center border-gray-800 hover:text-white"
                  disabled={selectedLead.enrichStatus === 'Enriched' || isEnriching}
                  onClick={(e) => triggerEnrichment(selectedLead, e)}
                  title="Trigger AI Data Enrichment"
                >
                  <Sparkles size={14} className="text-[#E4FF1A]" />
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-secondary flex-1 py-2 text-xs border-gray-850 text-gray-400 hover:text-white" 
                  onClick={(e) => openEditModal(selectedLead, e)}
                >
                  Modify Prospect
                </button>
                <button 
                  className="btn btn-outline text-red-500 hover:text-white hover:bg-red-950/20 border-red-950/60 hover:border-red-800 py-2 px-3 text-xs flex items-center justify-center"
                  onClick={(e) => handleDeleteLead(selectedLead.id, e)}
                  title="Purge Lead"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Inbound Lead Opportunity"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prospect Full Name *</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                placeholder="e.g. Sarah Connor" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                required 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Name *</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                placeholder="e.g. Cyberdyne Systems" 
                value={company} 
                onChange={e => setCompany(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address *</label>
              <input 
                type="email" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                placeholder="e.g. s.connor@cyberdyne.jp" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                placeholder="e.g. +81 3 5555 0199" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lead Acquisition Source</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={source} 
                onChange={e => setSource(e.target.value)}
              >
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estimated Value ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                placeholder="e.g. 150000" 
                value={dealValue} 
                onChange={e => setDealValue(e.target.value)} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel Stage Status</label>
            <select 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              value={status} 
              onChange={e => setStatus(e.target.value)}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prospective Notes</label>
            <textarea 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6] h-20 resize-none" 
              placeholder="Provide context regarding lead generation..." 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
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
              className="px-5 py-2.5 rounded-lg text-sm bg-[#01FDF6] hover:bg-[#00e5df] text-[#0a0f1e] font-bold shadow-glow transition-all"
            >
              Add Prospect
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modify Lead Profile"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prospect Full Name *</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                required 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Name *</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={company} 
                onChange={e => setCompany(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address *</label>
              <input 
                type="email" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lead Acquisition Source</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={source} 
                onChange={e => setSource(e.target.value)}
              >
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estimated Value ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={dealValue} 
                onChange={e => setDealValue(e.target.value)} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel Stage Status</label>
            <select 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              value={status} 
              onChange={e => setStatus(e.target.value)}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prospective Notes</label>
            <textarea 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6] h-20 resize-none" 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
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
              className="px-5 py-2.5 rounded-lg text-sm bg-[#01FDF6] hover:bg-[#00e5df] text-[#0a0f1e] font-bold shadow-glow transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
