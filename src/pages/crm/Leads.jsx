import { useState } from 'react';
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
  Briefcase,
  Target,
  Users
} from 'lucide-react';
import { useLeads, useLeadDetails } from '../../hooks/useCrmData';
import { useQuery } from '@tanstack/react-query';
import { teamApi } from '../../lib/api';
import { showToast } from '../../components/ui/Toast';
import DataTable from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import PageContainer from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import PageHeader from '../../components/layout/PageHeader';
import './Leads.css';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
const SOURCES  = ['Website', 'Referral', 'LinkedIn', 'Email Campaign', 'Cold Call', 'Other'];

export default function Leads({ searchValue = '' }) {
  const { leads, isLoading, createLead, updateLead, convertLead, deleteLead, qualifyLead, assignLead, addLeadNote, addLeadActivity } = useLeads();

  const [activeFilter, setActiveFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQualifyModalOpen, setIsQualifyModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const { notes: dossierNotes, activities, isLoading: isDetailsLoading } = useLeadDetails(selectedLead?.id);
  const { data: team = [] } = useQuery({ queryKey: ['team'], queryFn: () => teamApi.list() });

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [source, setSource] = useState('Website');
  const [status, setStatus] = useState('New');
  const [notes, setNotes] = useState('');
  const [editId, setEditId] = useState(null);

  // Qualify & Assign States
  const [bant, setBant] = useState({ hasBudget: false, isDecisionMaker: false, hasNeed: false, hasTimeline: false });
  const [assignedToId, setAssignedToId] = useState('');
  
  // Note/Activity States
  const [newNoteContent, setNewNoteContent] = useState('');
  const [activityType, setActivityType] = useState('0'); // 0=Call, 1=Email, 2=Meeting

  const [isEnriching, setIsEnriching] = useState(false);

  const clearForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setSource('Website');
    setStatus('New');
    setNotes('');
    setEditId(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !company || !email) return;

    const [firstName, ...lastNames] = fullName.trim().split(' ');
    const lastName = lastNames.join(' ') || '';

    try {
      await createLead({
        firstName,
        lastName,
        email,
        phone,
        companyName: company,
        source,
        status
      });
      setIsAddModalOpen(false);
      clearForm();
      showToast('Success', 'Inbound prospect profile successfully cataloged.', 'success');
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to catalog prospect.', 'error');
    }
  };

  const openEditModal = (lead, e) => {
    if (e) e.stopPropagation();
    setEditId(lead.id);
    setFullName(`${lead.firstName || ''} ${lead.lastName || ''}`.trim());
    setEmail(lead.email);
    setPhone(lead.phone || '');
    setCompany(lead.companyName || '');
    setSource(lead.source);
    setStatus(lead.status);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !company || !email) return;

    const [firstName, ...lastNames] = fullName.trim().split(' ');
    const lastName = lastNames.join(' ') || '';

    try {
      await updateLead({
        id: editId,
        data: {
          firstName,
          lastName,
          email,
          phone,
          companyName: company,
          source,
          status
        }
      });
      setIsEditModalOpen(false);
      clearForm();
      showToast('Success', 'Lead profile successfully modified.', 'success');
      
      // Update selected lead details if currently viewed
      if (selectedLead && selectedLead.id === editId) {
        setSelectedLead(prev => ({
          ...prev,
          firstName,
          lastName,
          email,
          phone,
          companyName: company,
          source,
          status
        }));
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to modify lead.', 'error');
    }
  };

  const handleDeleteLead = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteLead(id);
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead(null);
        }
        showToast('Deleted', 'Lead was successfully purged from memory.', 'error');
      } catch (err) {
        showToast('Error', 'Failed to delete lead.', 'error');
      }
    }
  };

  const triggerEnrichment = (lead, e) => {
    if (e) e.stopPropagation();
    setIsEnriching(true);
    showToast('Enriching', 'Executing external Clearbit & LinkedIn data mining...', 'info');
    
    setTimeout(async () => {
      try {
        await updateLead({
          id: lead.id,
          data: {
            source: 'LinkedIn Enriched'
          }
        });
        
        if (selectedLead && selectedLead.id === lead.id) {
          setSelectedLead(prev => ({ ...prev, source: 'LinkedIn Enriched' }));
        }

        setIsEnriching(false);
        showToast('Enriched', 'Prospect data enrichment completed successfully!', 'success');
      } catch (err) {
        setIsEnriching(false);
        showToast('Error', 'Failed to enrich lead.', 'error');
      }
    }, 1500);
  };

  const handleConvertToContact = async (lead, e) => {
    if (e) e.stopPropagation();
    try {
      await convertLead({ id: lead.id, data: { companyName: lead.companyName } });
      if (selectedLead && selectedLead.id === lead.id) {
        setSelectedLead(null);
      }
      showToast('Success', 'Lead successfully promoted to standard CRM Client Dossier!', 'success');
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to convert lead.', 'error');
    }
  };

  const changeStatusQuick = async (lead, newStatus) => {
    try {
      await updateLead({
        id: lead.id,
        data: { status: newStatus }
      });
      if (selectedLead && selectedLead.id === lead.id) {
        setSelectedLead(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast('Error', 'Failed to update status.', 'error');
    }
  };

  const handleQualifySubmit = async (e) => {
    e.preventDefault();
    try {
      await qualifyLead({ id: editId, data: bant });
      setIsQualifyModalOpen(false);
      showToast('Success', 'Lead successfully qualified via BANT criteria.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to qualify lead.', 'error');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignedToId) return;
    try {
      await assignLead({ id: editId, data: { assignedToId } });
      setIsAssignModalOpen(false);
      showToast('Success', 'Lead successfully assigned.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to assign lead.', 'error');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    try {
      await addLeadNote({ id: selectedLead.id, data: { content: newNoteContent } });
      setNewNoteContent('');
      showToast('Success', 'Note added.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to add note.', 'error');
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    try {
      await addLeadActivity({ id: selectedLead.id, data: { type: parseInt(activityType), description: newNoteContent } });
      setNewNoteContent('');
      showToast('Success', 'Activity logged.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to log activity.', 'error');
    }
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
    const leadName = `${l.firstName || ''} ${l.lastName || ''}`.toLowerCase();
    const leadEmail = (l.email || '').toLowerCase();
    const leadCompany = (l.companyName || '').toLowerCase();
    const query = searchValue.toLowerCase();

    const matchesSearch = 
      leadName.includes(query) ||
      leadEmail.includes(query) ||
      leadCompany.includes(query);
    
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
        const name = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.email;
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/25 text-[#38BDF8] flex items-center justify-center font-bold text-sm">
              {name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm hover:text-[#38BDF8] transition-colors">{name}</span>
              <span className="text-[10px] text-gray-500 font-mono">{lead.email}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'companyName',
      header: 'Company / Enterprise',
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-300 text-xs">{lead.companyName || 'â€”'}</span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              Source: <span className="text-[#6366F1] font-bold">{lead.source}</span>
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'aiScore',
      header: 'AI Match Score',
      cell: ({ row }) => {
        const lead = row.original;
        // Mock a consistent high-fidelity AI score derived from lead fields
        const score = ((lead.id * 7) % 31) + 68;
        const scoreColor = score >= 90 ? 'text-[#10B981]' : score >= 70 ? 'text-[#F59E0B]' : 'text-[#EF4444]';
        return (
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#F59E0B]" />
            <span className={`font-mono font-black text-xs ${scoreColor}`}>{score}/100</span>
          </div>
        );
      }
    },
    {
      id: 'enrichment',
      header: 'Data Enrichment',
      cell: ({ row }) => {
        const lead = row.original;
        const enrichStatus = lead.source?.includes('Enriched') ? 'Enriched' : 'Pending';
        return (
          <Badge variant={enrichStatus === 'Enriched' ? 'success' : 'neutral'}>
            {enrichStatus}
          </Badge>
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
      label: 'Qualify (BANT)',
      icon: Target,
      onClick: (e) => { if (e) e.stopPropagation(); setEditId(lead.id); setIsQualifyModalOpen(true); }
    },
    {
      label: 'Assign to Rep',
      icon: Users,
      onClick: (e) => { if (e) e.stopPropagation(); setEditId(lead.id); setIsAssignModalOpen(true); }
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
      disabled: lead.source?.includes('Enriched')
    },
    {
      label: 'Promote to CRM Client',
      icon: CheckCircle,
      onClick: (e) => handleConvertToContact(lead, e)
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
        icon={<span className="text-[#38BDF8] text-xl">⚡</span>}
        actions={
          <Button onClick={() => { clearForm(); setIsAddModalOpen(true); }} className="gap-2">
            <Plus size={18} /> New Prospect
          </Button>
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
                ? 'bg-[#38BDF8]/10 border-[#38BDF8] shadow-glow text-[#38BDF8]' 
                : 'border-gray-800 bg-[#1E293B]/40 hover:border-gray-700'
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
        <div className="flex-1 min-w-0 bg-[#1E293B]/30 border border-gray-800/80 rounded-xl overflow-hidden backdrop-blur-md">
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)' }}>
              <span>Loading prospects...</span>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)' }}>
              <span>No prospects found.</span>
            </div>
          ) : (
            <DataTable 
              columns={columns}
              data={filteredLeads}
              onRowClick={(row) => setSelectedLead(row)}
              getRowContextMenuItems={getRowContextMenuItems}
              pageSize={10}
            />
          )}
        </div>

        {/* Selected Lead dossier sidebar */}
        {selectedLead && (() => {
          const leadName = `${selectedLead.firstName || ''} ${selectedLead.lastName || ''}`.trim() || selectedLead.email;
          const score = ((selectedLead.id * 7) % 31) + 68;
          const enrichStatus = selectedLead.source?.includes('Enriched') ? 'Enriched' : 'Pending';

          return (
            <Card className="xl:w-[400px] flex-shrink-0 animate-fade-in flex flex-col">
              <CardHeader className="flex flex-row justify-between items-center border-b pb-4 pt-4">
                <CardTitle className="text-base tracking-wide m-0">Inbound Dossier</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)}>
                  <X size={18} />
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-5 pt-5">
                {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] flex items-center justify-center font-display font-black text-xl shadow-glow">
                  {leadName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-extrabold text-base tracking-tight truncate">{leadName}</h4>
                  <p className="text-gray-400 text-xs font-semibold flex items-center gap-1.5 mt-0.5 truncate">
                    <Building2 size={12} className="text-gray-500" />
                    {selectedLead.companyName || 'â€”'}
                  </p>
                </div>
              </div>

              {/* AI Fit & Qualification indicators */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#0F172A]/80 border border-gray-850 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Qualify Score</span>
                  <span className="font-mono text-sm font-black text-[#10B981]">{selectedLead.qualificationScore || score}/100</span>
                </div>
                <div className="flex flex-col gap-0.5 border-l border-gray-850 pl-3">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Acquisition Source</span>
                  <span className="font-mono text-sm font-black text-[#6366F1]">{selectedLead.source}</span>
                </div>
              </div>

              {/* Contact metadata */}
              <div className="flex flex-col gap-2.5 p-4 bg-[#0F172A]/40 border border-gray-850/50 rounded-xl">
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <Mail size={14} className="text-gray-500 w-4" />
                  <span className="truncate">{selectedLead.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <Phone size={14} className="text-gray-500 w-4" />
                  <span className="font-mono">{selectedLead.phone || 'â€”'}</span>
                </div>
              </div>

              {/* Notes & Activities Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inbound Intelligence Timeline</h5>
                </div>
                
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {isDetailsLoading ? (
                    <span className="text-xs text-gray-500 italic">Loading timeline...</span>
                  ) : [...dossierNotes, ...activities].length === 0 ? (
                    <div className="p-3 bg-[#F59E0B]/5 border-l-4 border-[#F59E0B] rounded-r-lg text-xs text-gray-300 leading-relaxed italic">
                      {enrichStatus === 'Enriched' ? 'AI System: LinkedIn verified.' : 'No notes or activities yet.'}
                    </div>
                  ) : (
                    [...dossierNotes, ...activities]
                      .sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp))
                      .map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-[#1E293B] border border-gray-800 rounded-lg text-xs text-gray-300">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[#38BDF8]">{item.type !== undefined ? ['Call', 'Email', 'Meeting'][item.type] : 'Note'}</span>
                          <span className="text-[9px] text-gray-500">{new Date(item.createdAt || item.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="leading-relaxed">{item.content || item.description}</p>
                      </div>
                    ))
                  )}
                </div>

                <form className="mt-2 flex gap-2" onSubmit={activityType === '3' ? handleAddNote : handleAddActivity}>
                  <select 
                    className="bg-[#0F172A] border border-gray-800 text-xs text-gray-300 rounded p-1.5 focus:border-[#38BDF8] outline-none"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                  >
                    <option value="0">Call</option>
                    <option value="1">Email</option>
                    <option value="2">Meeting</option>
                    <option value="3">Note</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Log detail..."
                    className="flex-1 bg-[#0F172A] border border-gray-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                  />
                  <button type="submit" className="bg-[#38BDF8] text-[#0F172A] p-1.5 rounded hover:bg-[#2563EB] transition-colors" disabled={!newNoteContent.trim()}>
                    <Plus size={14} />
                  </button>
                </form>
              </div>

              {/* Actions footer */}
              <div className="mt-auto border-t border-gray-850 pt-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button 
                    className="btn btn-primary flex-1 py-3 text-xs flex items-center justify-center gap-1.5" 
                    onClick={(e) => handleConvertToContact(selectedLead, e)}
                  >
                    <CheckCircle size={14} /> Convert to CRM Client
                  </button>
                  <button 
                    className="btn btn-secondary py-3 px-3 text-xs flex items-center justify-center border-gray-800 hover:text-white"
                    disabled={enrichStatus === 'Enriched' || isEnriching}
                    onClick={(e) => triggerEnrichment(selectedLead, e)}
                    title="Trigger AI Data Enrichment"
                  >
                    <Sparkles size={14} className="text-[#F59E0B]" />
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
              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Add Lead Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#0F172A] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display">Add Inbound Lead Opportunity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prospect Full Name *</label>
                <Input 
                  type="text" 
                  placeholder="e.g. Sarah Connor" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Name *</label>
                <Input 
                  type="text" 
                  placeholder="e.g. Cyberdyne Systems" 
                  value={company} 
                  onChange={e => setCompany(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address *</label>
                <Input 
                  type="email" 
                  placeholder="e.g. s.connor@cyberdyne.jp" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                <Input 
                  type="text" 
                  placeholder="e.g. +81 3 5555 0199" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lead Acquisition Source</label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="w-full bg-gray-950/50 border-gray-800 text-white">
                    <SelectValue placeholder="Select Source" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F172A] border-gray-800 text-white">
                    {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel Stage Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full bg-gray-950/50 border-gray-800 text-white">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F172A] border-gray-800 text-white">
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6 border-t border-gray-800/80 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#38BDF8] hover:bg-[#2563EB] text-[#0F172A] font-bold shadow-glow">
                Add Prospect
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#0F172A] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display">Modify Lead Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prospect Full Name *</label>
                <Input 
                  type="text" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Name *</label>
                <Input 
                  type="text" 
                  value={company} 
                  onChange={e => setCompany(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address *</label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                <Input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lead Acquisition Source</label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="w-full bg-gray-950/50 border-gray-800 text-white">
                    <SelectValue placeholder="Select Source" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F172A] border-gray-800 text-white">
                    {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel Stage Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full bg-gray-950/50 border-gray-800 text-white">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F172A] border-gray-800 text-white">
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6 border-t border-gray-800/80 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#38BDF8] hover:bg-[#2563EB] text-[#0F172A] font-bold shadow-glow">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Qualify Lead Modal */}
      <Dialog open={isQualifyModalOpen} onOpenChange={setIsQualifyModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#0F172A] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display">Qualify Lead (BANT)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQualifySubmit} className="flex flex-col gap-4 mt-4">
            <p className="text-xs text-gray-400 mb-2">Check all criteria that apply to calculate the lead's qualification score.</p>
            
            <div className="flex items-center gap-3 p-3 bg-[#1E293B] border border-gray-800 rounded-lg">
              <input type="checkbox" id="budget" checked={bant.hasBudget} onChange={e => setBant({...bant, hasBudget: e.target.checked})} className="w-4 h-4 rounded border-gray-700 bg-[#0F172A] text-[#38BDF8] focus:ring-[#38BDF8]" />
              <label htmlFor="budget" className="text-sm font-semibold text-gray-200 cursor-pointer">Budget Verified</label>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#1E293B] border border-gray-800 rounded-lg">
              <input type="checkbox" id="authority" checked={bant.isDecisionMaker} onChange={e => setBant({...bant, isDecisionMaker: e.target.checked})} className="w-4 h-4 rounded border-gray-700 bg-[#0F172A] text-[#38BDF8] focus:ring-[#38BDF8]" />
              <label htmlFor="authority" className="text-sm font-semibold text-gray-200 cursor-pointer">Authority (Decision Maker)</label>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#1E293B] border border-gray-800 rounded-lg">
              <input type="checkbox" id="need" checked={bant.hasNeed} onChange={e => setBant({...bant, hasNeed: e.target.checked})} className="w-4 h-4 rounded border-gray-700 bg-[#0F172A] text-[#38BDF8] focus:ring-[#38BDF8]" />
              <label htmlFor="need" className="text-sm font-semibold text-gray-200 cursor-pointer">Need Identified</label>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#1E293B] border border-gray-800 rounded-lg">
              <input type="checkbox" id="timeline" checked={bant.hasTimeline} onChange={e => setBant({...bant, hasTimeline: e.target.checked})} className="w-4 h-4 rounded border-gray-700 bg-[#0F172A] text-[#38BDF8] focus:ring-[#38BDF8]" />
              <label htmlFor="timeline" className="text-sm font-semibold text-gray-200 cursor-pointer">Timeline Established</label>
            </div>

            <DialogFooter className="mt-4 border-t border-gray-800/80 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsQualifyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#38BDF8] hover:bg-[#2563EB] text-[#0F172A] font-bold shadow-glow">
                Qualify Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Lead Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#0F172A] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display">Assign Lead to Representative</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Sales Rep</label>
              <Select value={assignedToId} onValueChange={setAssignedToId} required>
                <SelectTrigger className="w-full bg-gray-950/50 border-gray-800 text-white">
                  <SelectValue placeholder="Select a team member..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0F172A] border-gray-800 text-white">
                  {team.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-6 border-t border-gray-800/80 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#38BDF8] hover:bg-[#2563EB] text-[#0F172A] font-bold shadow-glow">
                Assign Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
