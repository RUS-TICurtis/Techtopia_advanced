import { useState } from 'react';
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
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Edit2,
  AlertCircle,
  Clock,
  Sparkles,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDb } from '../utils/mockDb';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import './Pipeline.css';

export default function Pipeline({ searchValue: externalSearchValue = '' }) {
  const [deals, setDeals] = useState(() => mockDb.getDeals());
  const [contacts] = useState(() => mockDb.getContacts());
  
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
  const [company, setCompany] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('Lead');
  const [priority, setPriority] = useState('Medium');
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

  const refreshDeals = () => {
    setDeals(mockDb.getDeals());
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

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const dealId = draggingDealId || e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    const allDeals = mockDb.getDeals();
    const deal = allDeals.find(d => d.id === dealId);
    if (deal && deal.stage !== targetStage) {
      deal.stage = targetStage;
      mockDb.updateDeal(deal);
      
      const allContacts = mockDb.getContacts();
      const contact = allContacts.find(c => c.id === deal.contactId);
      if (contact) {
        contact.status = targetStage === 'Lead' ? 'New' : targetStage;
        mockDb.updateContact(contact);
      }
      refreshDeals();
    }
    handleDragEnd();
  };

  const moveDealManual = (deal, direction) => {
    const currentIdx = stages.indexOf(deal.stage);
    let nextIdx = currentIdx + direction;
    if (nextIdx >= 0 && nextIdx < stages.length) {
      const nextStage = stages[nextIdx];
      deal.stage = nextStage;
      mockDb.updateDeal(deal);

      const allContacts = mockDb.getContacts();
      const contact = allContacts.find(c => c.id === deal.contactId);
      if (contact) {
        contact.status = nextStage === 'Lead' ? 'New' : nextStage;
        mockDb.updateContact(contact);
      }
      refreshDeals();
    }
  };

  const handleDeleteDeal = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this deal?")) {
      mockDb.deleteDeal(id);
      refreshDeals();
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    let finalCompany = company;
    if (selectedContactId) {
      const contact = contacts.find(c => c.id === selectedContactId);
      if (contact) finalCompany = contact.company;
    }

    mockDb.addDeal({
      title,
      company: finalCompany || "TechCorp Labs",
      value: parseFloat(value) || 0,
      stage,
      priority,
      contactId: selectedContactId || null,
      notes: notes || '',
      date: date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    // Reset Form
    setTitle(''); setCompany(''); setValue(''); setStage('Lead');
    setPriority('Medium'); setDate(''); setSelectedContactId(''); setNotes('');
    setIsAddModalOpen(false);
    refreshDeals();
  };

  const openEditModal = (deal, e) => {
    e.stopPropagation();
    setSelectedDeal(deal);
    setTitle(deal.title);
    setCompany(deal.company);
    setValue(deal.value.toString());
    setStage(deal.stage);
    setPriority(deal.priority);
    setDate(deal.date);
    setSelectedContactId(deal.contactId || '');
    setNotes(deal.notes || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedDeal || !title) return;

    let finalCompany = company;
    if (selectedContactId) {
      const contact = contacts.find(c => c.id === selectedContactId);
      if (contact) finalCompany = contact.company;
    }

    const updatedDeal = {
      ...selectedDeal,
      title,
      company: finalCompany,
      value: parseFloat(value) || 0,
      stage,
      priority,
      contactId: selectedContactId || null,
      notes,
      date
    };

    mockDb.updateDeal(updatedDeal);
    setIsEditModalOpen(false);
    setSelectedDeal(null);
    refreshDeals();
  };

  const clearFilters = () => {
    setLocalSearch('');
    setPriorityFilter('All');
    setSortOrder('none');
  };

  // Combine external (navbar) and local search values
  const activeSearch = localSearch || externalSearchValue;

  // Filter and Sort deals
  let filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
      deal.company.toLowerCase().includes(activeSearch.toLowerCase());
    
    const matchesPriority = 
      priorityFilter === 'All' || deal.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  if (sortOrder === 'value-asc') {
    filteredDeals.sort((a, b) => a.value - b.value);
  } else if (sortOrder === 'value-desc') {
    filteredDeals.sort((a, b) => b.value - a.value);
  }

  const getStageStats = (stageName) => {
    const stageDeals = filteredDeals.filter(d => d.stage === stageName);
    const sum = stageDeals.reduce((acc, curr) => acc + curr.value, 0);
    return { count: stageDeals.length, value: sum };
  };

  const activePipelineDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const totalPipelineValue = activePipelineDeals.reduce((acc, curr) => acc + curr.value, 0);
  const totalWonValue = deals.filter(d => d.stage === 'Won').reduce((acc, curr) => acc + curr.value, 0);

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
      // Reset form to default for ADD
      setTitle(''); setCompany(''); setValue(''); setStage('Lead');
      setPriority('Medium'); setDate(''); setSelectedContactId(''); setNotes('');
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
        icon={<span className="text-[#01FDF6]">⚡</span>}
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
      <div className="pipeline-controls flex flex-col md:flex-row gap-4 justify-between items-center mb-6 bg-[#0f1629]/40 border border-gray-800/80 rounded-xl p-4 backdrop-blur-md">
        <div className="flex flex-1 w-full md:max-w-md items-center relative">
          <Search className="absolute left-3 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search deals by title or company..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0a0f1e]/80 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#01FDF6] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#0a0f1e]/80 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#01FDF6] transition-all"
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
              className="bg-[#0a0f1e]/80 border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#01FDF6] transition-all"
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

      {/* Kanban Board */}
      <div className="kanban-board-wrapper">
        <div className="kanban-board">
          {stages.map(colStage => {
            const { count, value } = getStageStats(colStage);
            const colDeals = filteredDeals.filter(d => d.stage === colStage);
            const isOver = activeDropStage === colStage;
            const stageColor = stageColors[colStage];

            return (
              <div 
                key={colStage}
                className={`kanban-column ${isOver ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, colStage)}
                onDrop={(e) => handleDrop(e, colStage)}
                onDragLeave={() => setActiveDropStage(null)}
                style={{
                  '--stage-color': stageColor,
                  borderColor: isOver ? stageColor : 'var(--border-light)'
                }}
              >
                {/* Column Header */}
                <div className="kanban-column-header" style={{ borderBottomColor: `${stageColor}33` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stageColor, boxShadow: `0 0 8px ${stageColor}` }} />
                    <span className="kanban-column-title">{colStage}</span>
                    <span className="kanban-column-count">{count}</span>
                  </div>
                  <span className="kanban-column-value">
                    ${value.toLocaleString()}
                  </span>
                </div>

                {/* Cards Wrapper */}
                <div className="kanban-cards-wrapper custom-scrollbar mt-3">
                  <AnimatePresence mode="popLayout">
                    {colDeals.map(deal => {
                      const prob = stageProbabilities[deal.stage] || 50;
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          key={deal.id}
                          className="kanban-card premium-card"
                          draggable="true"
                          onDragStart={() => handleDragStart(deal.id)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => openEditModal(deal, e)}
                        >
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="kanban-card-title">{deal.title}</h4>
                            <div className="kanban-card-actions">
                              <button 
                                onClick={(e) => openEditModal(deal, e)} 
                                className="kanban-card-action-btn"
                                title="Edit Deal"
                              >
                                <Edit2 size={10} />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteDeal(deal.id, e)} 
                                className="kanban-card-action-btn delete"
                                title="Delete Deal"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>

                          <div className="kanban-card-company-row">
                            <Building2 size={12} />
                            <span className="kanban-card-company-name">{deal.company}</span>
                          </div>

                          {deal.notes && (
                            <p className="kanban-card-notes">
                              "{deal.notes}"
                            </p>
                          )}

                          <div className="kanban-card-meta-row">
                            <div className="flex items-center gap-1">
                              <Calendar size={11} />
                              <span>{deal.date}</span>
                            </div>
                            <div className="kanban-card-probability">
                              <Sparkles size={9} />
                              <span>Prob: {prob}%</span>
                            </div>
                          </div>

                          <div className="kanban-card-footer">
                            <span className="kanban-card-value">
                              ${deal.value.toLocaleString()}
                            </span>
                            <Badge 
                              variant={
                                deal.priority === 'High' ? 'error' : 
                                deal.priority === 'Medium' ? 'warning' : 'neutral'
                              }
                            >
                              {deal.priority}
                            </Badge>
                          </div>

                          {/* Quick manual navigation shortcuts */}
                          <div className="kanban-card-movers" onClick={e => e.stopPropagation()}>
                            <button 
                              className="mover-btn"
                              disabled={colStage === stages[0]}
                              onClick={() => moveDealManual(deal, -1)}
                              title="Move back stage"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <span className="mover-label">STAGE TUNER</span>
                            <button 
                              className="mover-btn"
                              disabled={colStage === stages[stages.length - 1]}
                              onClick={() => moveDealManual(deal, 1)}
                              title="Move next stage"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {colDeals.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="kanban-drop-zone flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl p-6 text-gray-500 text-center gap-2 bg-[#090f1e]/40 min-h-[150px] transition-colors"
                      style={{
                        borderColor: isOver ? stageColor : 'rgba(255,255,255,0.03)'
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-900/60 border border-gray-850 flex items-center justify-center mb-1">
                        <Clock size={14} className="text-gray-600" />
                      </div>
                      <span className="text-xs font-semibold">Stage Empty</span>
                      <span className="text-[10px] text-gray-600">Drag a deal card here</span>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              placeholder="e.g. Enterprise CRM License Expansion"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Linked Customer Contact</label>
            <select 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              value={selectedContactId} 
              onChange={e => {
                setSelectedContactId(e.target.value);
                const contact = contacts.find(c => c.id === e.target.value);
                if (contact) setCompany(contact.company);
              }}
            >
              <option value="">-- Associate Contact --</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>

          {!selectedContactId && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company / Entity Name</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                placeholder="e.g. Acme Innovations"
                value={company} 
                onChange={e => setCompany(e.target.value)} 
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deal Value ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                placeholder="e.g. 50000"
                value={value} 
                onChange={e => setValue(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Close Date</label>
              <input 
                type="date" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel Stage</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={stage} 
                onChange={e => setStage(e.target.value)}
              >
                {stages.map(stg => <option key={stg} value={stg}>{stg}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deal Priority</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={priority} 
                onChange={e => setPriority(e.target.value)}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opportunity Notes</label>
            <textarea 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6] h-20 resize-none" 
              placeholder="Provide strategic intelligence about this deal..."
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
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Linked Customer Contact</label>
            <select 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              value={selectedContactId} 
              onChange={e => {
                setSelectedContactId(e.target.value);
                const contact = contacts.find(c => c.id === e.target.value);
                if (contact) setCompany(contact.company);
              }}
            >
              <option value="">-- Associate Contact --</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company / Entity Name</label>
            <input 
              type="text" 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              value={company} 
              onChange={e => setCompany(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deal Value ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={value} 
                onChange={e => setValue(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Close Date</label>
              <input 
                type="date" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel Stage</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={stage} 
                onChange={e => setStage(e.target.value)}
              >
                {stages.map(stg => <option key={stg} value={stg}>{stg}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deal Priority</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={priority} 
                onChange={e => setPriority(e.target.value)}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opportunity Notes</label>
            <textarea 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6] h-20 resize-none" 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
            />
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
                className="px-5 py-2.5 rounded-lg text-sm bg-[#01FDF6] hover:bg-[#00e5df] text-[#0a0f1e] font-bold shadow-glow transition-all"
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
