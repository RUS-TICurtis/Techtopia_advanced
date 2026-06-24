import { useState, useMemo } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Trash2,
  X,
  TrendingUp,
  DollarSign,
  Target,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Edit2,
  Clock,
  Sparkles,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOpportunities, useContacts } from '../../hooks/useCrmData';
import { showToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import PipelineFlow from './PipelineFlow';
import './Pipeline.css';

export default function Pipeline({ searchValue: externalSearchValue = '' }) {
  // Database API hooks
  const { opportunities: rawOpportunities, isLoading: isLoadingDeals, createOpportunity, updateOpportunity, deleteOpportunity } = useOpportunities();
  const { contacts, isLoading: isLoadingContacts } = useContacts();

  const opportunities = useMemo(() => {
    return (rawOpportunities || []).map(deal => ({
      ...deal,
      amount: parseFloat(deal.amount) || 0,
      name: deal.name || 'Untitled Deal',
    }));
  }, [rawOpportunities]);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  // Filters State
  const [localSearch, setLocalSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('none'); // 'none' | 'value-asc' | 'value-desc'

  // Drag states
  const [draggingDealId, setDraggingDealId] = useState(null);
  const [activeDropStage, setActiveDropStage] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [companyNameStr, setCompanyNameStr] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('Lead');
  const [date, setDate] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [notes, setNotes] = useState('');

  const stages = ['Lead', 'Qualified', 'In Progress', 'Proposal', 'Won'];

  const stageColors = {
    'Lead': 'var(--brand-purple)',
    'Qualified': 'var(--brand-blue)',
    'In Progress': 'var(--brand-chartreuse)',
    'Proposal': 'var(--brand-magenta)',
    'Won': 'var(--brand-green)'
  };

  const stageProbabilities = {
    'Lead': 20,
    'Qualified': 40,
    'In Progress': 60,
    'Proposal': 85,
    'Won': 100
  };

  // Drag and Drop handlers
  const handleDragStart = (dealId) => {
    setDraggingDealId(dealId);
  };

  const handleDragEnd = () => {
    setDraggingDealId(null);
    setActiveDropStage(null);
  };

  const handleDragOver = (e, colStage) => {
    e.preventDefault();
    if (activeDropStage !== colStage) {
      setActiveDropStage(colStage);
    }
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    const dealId = draggingDealId || e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    try {
      await updateOpportunity({
        id: parseInt(dealId, 10),
        data: { stage: targetStage }
      });
      showToast('Success', 'Deal stage transitioned successfully.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to update deal stage.', 'error');
    }
    handleDragEnd();
  };

  const moveDealManual = async (deal, direction) => {
    const currentIdx = stages.indexOf(deal.stage);
    let nextIdx = currentIdx + direction;
    if (nextIdx >= 0 && nextIdx < stages.length) {
      const nextStage = stages[nextIdx];
      try {
        await updateOpportunity({
          id: deal.id,
          data: { stage: nextStage }
        });
        showToast('Success', 'Deal stage transitioned manually.', 'success');
      } catch (err) {
        showToast('Error', 'Failed to change stage.', 'error');
      }
    }
  };

  const handleDeleteDeal = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        await deleteOpportunity(id);
        showToast('Deleted', 'Deal has been successfully purged.', 'error');
      } catch (err) {
        showToast('Error', 'Failed to delete deal.', 'error');
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      const payload = {
        name: title,
        amount: parseFloat(value) || 0,
        stage,
        closeDate: date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      if (selectedContactId) {
        const contactObj = contacts.find(c => c.id === parseInt(selectedContactId, 10));
        payload.contact = { id: parseInt(selectedContactId, 10) };
        if (contactObj?.company) {
          payload.company = { id: contactObj.company.id };
        }
      }

      await createOpportunity(payload);

      // Reset Form
      setTitle(''); setCompanyNameStr(''); setValue(''); setStage('Lead');
      setDate(''); setSelectedContactId(''); setNotes('');
      setIsAddModalOpen(false);
      showToast('Created', 'New sales opportunity has been added.', 'success');
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to create opportunity.', 'error');
    }
  };

  const openEditModal = (deal, e) => {
    e.stopPropagation();
    setSelectedDeal(deal);
    setTitle(deal.name || '');
    setCompanyNameStr(deal.company?.name || '');
    setValue((deal.amount || 0).toString());
    setStage(deal.stage || 'Lead');
    setDate(deal.closeDate || '');
    setSelectedContactId(deal.contact?.id?.toString() || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeal || !title) return;

    try {
      const payload = {
        name: title,
        amount: parseFloat(value) || 0,
        stage,
        closeDate: date
      };

      if (selectedContactId) {
        const contactObj = contacts.find(c => c.id === parseInt(selectedContactId, 10));
        payload.contact = { id: parseInt(selectedContactId, 10) };
        if (contactObj?.company) {
          payload.company = { id: contactObj.company.id };
        }
      }

      await updateOpportunity({
        id: selectedDeal.id,
        data: payload
      });

      setIsEditModalOpen(false);
      setSelectedDeal(null);
      showToast('Success', 'Opportunity details modified.', 'success');
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to update opportunity.', 'error');
    }
  };

  const clearFilters = () => {
    setLocalSearch('');
    setPriorityFilter('All');
    setSortOrder('none');
  };

  // Combine external (navbar) and local search values
  const activeSearch = localSearch || externalSearchValue;

  // Filter and Sort deals
  let filteredDeals = opportunities.map(deal => {
    // Dynamic high-fidelity priority based on deal amount
    const computedPriority = (deal.amount || 0) >= 100000 ? 'High' : (deal.amount || 0) >= 30000 ? 'Medium' : 'Low';
    return { ...deal, priority: computedPriority };
  }).filter(deal => {
    const matchesSearch = 
      (deal.name || '').toLowerCase().includes((activeSearch || '').toLowerCase()) ||
      (deal.company?.name || '').toLowerCase().includes((activeSearch || '').toLowerCase());
    
    const matchesPriority = 
      priorityFilter === 'All' || deal.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  if (sortOrder === 'value-asc') {
    filteredDeals.sort((a, b) => a.amount - b.amount);
  } else if (sortOrder === 'value-desc') {
    filteredDeals.sort((a, b) => b.amount - a.amount);
  }

  const getStageStats = (stageName) => {
    const stageDeals = filteredDeals.filter(d => d.stage === stageName);
    const sum = stageDeals.reduce((acc, curr) => acc + curr.amount, 0);
    return { count: stageDeals.length, value: sum };
  };

  const activePipelineDeals = opportunities.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const totalPipelineValue = activePipelineDeals.reduce((acc, curr) => acc + curr.amount, 0);
  const totalWonValue = opportunities.filter(d => d.stage === 'Won').reduce((acc, curr) => acc + curr.amount, 0);

  const metrics = [
    { 
      label: 'Active Pipeline', 
      value: `$${totalPipelineValue.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'var(--brand-cyan)',
      gradient: 'linear-gradient(135deg, rgba(1, 253, 246, 0.15) 0%, rgba(55, 114, 255, 0.05) 100%)'
    },
    { 
      label: 'Active Deals', 
      value: activePipelineDeals.length, 
      icon: Target, 
      color: 'var(--brand-purple)',
      gradient: 'linear-gradient(135deg, rgba(138, 79, 255, 0.15) 0%, rgba(255, 71, 218, 0.05) 100%)'
    },
    { 
      label: 'Total Value Won', 
      value: `$${totalWonValue.toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'var(--brand-green)',
      gradient: 'linear-gradient(135deg, rgba(33, 250, 144, 0.15) 0%, rgba(1, 253, 246, 0.05) 100%)'
    },
  ];

  const headerActions = (
    <button className="btn btn-primary shadow-glow flex items-center gap-2" onClick={() => {
      setTitle(''); setCompanyNameStr(''); setValue(''); setStage('Lead');
      setDate(''); setSelectedContactId(''); setNotes('');
      setIsAddModalOpen(true);
    }}>
      <Plus size={18} /> New Deal
    </button>
  );

  return (
    <PageContainer className="pipeline-page">
      <PageHeader 
        title="Pipeline Manager"
        subtitle="Interactive visual sales funnel with drag-and-drop orchestration"
        icon={<span className="text-[#38BDF8]">âš¡</span>}
        actions={headerActions}
      />

      {/* Metrics Grid */}
      <div className="metrics-grid mb-6">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card metric-card premium-metric" style={{ background: m.gradient, borderColor: `${m.color}25` }}>
              <div className="metric-icon-wrapper" style={{ background: `${m.color}22` }}>
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

      {/* Filter and Control Bar */}
      <div className="pipeline-controls flex flex-col md:flex-row gap-4 justify-between items-center mb-6 bg-[#1E293B]/40 border border-gray-800/80 rounded-xl p-4 backdrop-blur-md">
        <div className="flex flex-1 w-full md:max-w-md items-center relative">
          <Search className="absolute left-3 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search deals by title or company..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/80 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#38BDF8] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#0F172A]/80 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#38BDF8] transition-all"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-gray-400" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-[#0F172A]/80 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#38BDF8] transition-all"
            >
              <option value="none">Default Sort</option>
              <option value="value-desc">Highest Value</option>
              <option value="value-asc">Lowest Value</option>
            </select>
          </div>

          {(localSearch || priorityFilter !== 'All' || sortOrder !== 'none') && (
            <button 
              onClick={clearFilters}
              className="btn btn-secondary text-xs px-4 py-2.5 flex items-center gap-1.5 hover:text-white"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* React Flow Kanban Board */}
      <div className="react-flow-wrapper mb-8">
        {isLoadingDeals ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
            <span>Loading pipeline deals...</span>
          </div>
        ) : (
          <PipelineFlow 
            stages={stages}
            stageColors={stageColors}
            stageProbabilities={stageProbabilities}
            deals={filteredDeals}
            onDealMove={async (dealId, targetStage) => {
              try {
                await updateOpportunity({
                  id: parseInt(dealId, 10),
                  data: { stage: targetStage }
                });
                showToast('Success', 'Deal stage transitioned successfully.', 'success');
              } catch (err) {
                showToast('Error', 'Failed to update deal stage.', 'error');
              }
            }}
            onEditDeal={openEditModal}
            onDeleteDeal={handleDeleteDeal}
          />
        )}
      </div>

      {/* Add Deal Modal using custom Modal primitive */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Deal Opportunity"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opportunity Title *</label>
            <input 
              type="text" 
              className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#38BDF8]" 
              placeholder="e.g. Enterprise CRM License Expansion"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Linked Customer Contact</label>
            <select 
              className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#38BDF8]" 
              value={selectedContactId} 
              onChange={e => setSelectedContactId(e.target.value)}
            >
              <option value="">-- Associate Contact --</option>
              {contacts.map(c => {
                const contactName = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email;
                return (
                  <option key={c.id} value={c.id}>
                    {contactName} {c.company ? `(${c.company.name})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deal Value ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#38BDF8]" 
                placeholder="e.g. 50000"
                value={value} 
                onChange={e => setValue(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Close Date</label>
              <input 
                type="date" 
                className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#38BDF8]" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel Stage</label>
              <select 
                className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#38BDF8]" 
                value={stage} 
                onChange={e => setStage(e.target.value)}
              >
                {stages.map(stg => <option key={stg} value={stg}>{stg}</option>)}
              </select>
            </div>
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
              className="px-5 py-2.5 rounded-lg text-sm bg-[#38BDF8] hover:bg-[#2563EB] text-[#0F172A] font-bold shadow-glow transition-all"
            >
              Create Opportunity
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Deal Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDeal(null);
        }}
        title="Manage Deal Opportunity"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opportunity Title *</label>
            <input 
              type="text" 
              className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#38BDF8]" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Linked Customer Contact</label>
            <select 
              className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#38BDF8]" 
              value={selectedContactId} 
              onChange={e => setSelectedContactId(e.target.value)}
            >
              <option value="">-- Associate Contact --</option>
              {contacts.map(c => {
                const contactName = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email;
                return (
                  <option key={c.id} value={c.id}>
                    {contactName} {c.company ? `(${c.company.name})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deal Value ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#38BDF8]" 
                value={value} 
                onChange={e => setValue(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Close Date</label>
              <input 
                type="date" 
                className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#38BDF8]" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel Stage</label>
              <select 
                className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#38BDF8]" 
                value={stage} 
                onChange={e => setStage(e.target.value)}
              >
                {stages.map(stg => <option key={stg} value={stg}>{stg}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button 
              type="button" 
              className="btn btn-secondary text-red-500 hover:text-red-400 border-red-950 bg-red-950/10 flex items-center gap-1.5"
              onClick={(e) => {
                setIsEditModalOpen(false);
                handleDeleteDeal(selectedDeal.id, e);
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
            <div className="flex gap-3">
              <button 
                type="button" 
                className="px-5 py-2.5 rounded-lg text-sm bg-gray-950 border border-gray-850 text-gray-300 hover:text-white transition-all" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedDeal(null);
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 rounded-lg text-sm bg-[#38BDF8] hover:bg-[#2563EB] text-[#0F172A] font-bold shadow-glow transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
