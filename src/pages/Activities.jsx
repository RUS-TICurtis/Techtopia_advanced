import { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  Plus, 
  X, 
  Filter, 
  SlidersHorizontal,
  ArrowUpDown,
  Building2,
  TrendingUp,
  DollarSign,
  User,
  ShieldCheck,
  LifeBuoy,
  GitBranch,
  CheckCircle,
  FileText
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { showToast } from '../components/ui/Toast';
import './Activities.css';

const MODULES = ['All', 'Pipeline', 'Leads', 'Billing', 'Support', 'Projects'];

const INITIAL_ACTIVITIES = [
  {
    id: "act1",
    user: "Curtis Miller",
    action: "Updated deal stage",
    details: "Quantum Core Cloud Migration → Qualified",
    module: "Pipeline",
    timestamp: "10m ago",
    type: "pipeline"
  },
  {
    id: "act2",
    user: "Sarah Jenkins",
    action: "Promoted prospect lead",
    details: "Bruce Wayne (Wayne Enterprises) promoted to CRM contact dossier",
    module: "Leads",
    timestamp: "1h ago",
    type: "leads"
  },
  {
    id: "act3",
    user: "Alex Client",
    action: "Paid billing invoice",
    details: "Settled INV-2026-002 ($45,000) for CloudScale Inc.",
    module: "Billing",
    timestamp: "2h ago",
    type: "billing"
  },
  {
    id: "act4",
    user: "Faye Morgan",
    action: "Issued new billing invoice",
    details: "Created INV-2026-004 ($15,000) for Roma Tech",
    module: "Billing",
    timestamp: "1d ago",
    type: "billing"
  },
  {
    id: "act5",
    user: "Sam Porter",
    action: "Resolved support ticket",
    details: "Closed ticket TK-0022 regarding cluster synchronization latency",
    module: "Support",
    timestamp: "2d ago",
    type: "support"
  }
];

export default function Activities() {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('crm_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  useEffect(() => {
    localStorage.setItem('crm_activities', JSON.stringify(activities));
  }, [activities]);

  const [activeTab, setActiveTab] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [user, setUser] = useState('Curtis Miller');
  const [action, setAction] = useState('');
  const [details, setDetails] = useState('');
  const [module, setModule] = useState('Pipeline');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!action || !details) return;

    const newActivity = {
      id: "act_" + Date.now(),
      user,
      action,
      details,
      module,
      timestamp: "Just now",
      type: module.toLowerCase()
    };

    setActivities([newActivity, ...activities]);
    setIsAddModalOpen(false);

    // Reset Form
    setAction(''); setDetails(''); setModule('Pipeline');

    showToast('Activity Logged', 'CRM transaction was cataloged on the audit timeline.', 'success');
  };

  const getModuleIcon = (mod) => {
    switch (mod.toLowerCase()) {
      case 'pipeline': return GitBranch;
      case 'leads': return TrendingUp;
      case 'billing': return DollarSign;
      case 'support': return LifeBuoy;
      default: return CheckCircle;
    }
  };

  const getModuleColor = (mod) => {
    switch (mod.toLowerCase()) {
      case 'pipeline': return '#01FDF6'; // Cyan
      case 'leads': return '#E4FF1A'; // Yellow
      case 'billing': return '#FF47DA'; // Magenta
      case 'support': return '#8A4FFF'; // Purple
      default: return '#21FA90'; // Green
    }
  };

  const filteredActivities = activities.filter(act => {
    const matchesSearch = 
      act.action.toLowerCase().includes(search.toLowerCase()) ||
      act.details.toLowerCase().includes(search.toLowerCase()) ||
      act.user.toLowerCase().includes(search.toLowerCase());
    
    const matchesTab = activeTab === 'All' || act.module === activeTab;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="page-container activities-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <span className="text-[#E4FF1A]">⚡</span> Operation Timeline
          </h1>
          <p className="page-subtitle">Cross-module transaction streams, diagnostic compliance & live audit trails</p>
        </div>
        <button className="btn btn-primary shadow-glow flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Record Event
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          {MODULES.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`activities-filter-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
              <span className="activities-filter-count">
                {tab === 'All' ? activities.length : activities.filter(act => act.module === tab).length}
              </span>
            </button>
          ))}
        </div>

        <div className="search-wrapper flex items-center gap-2 w-full md:max-w-xs relative">
          
          <input 
          className="search-input"
            type="text" 
            placeholder="Search timeline..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-main)'
            }}
          /><Search className="absolute left-3.5 text-gray-500" size={14} />
        </div>
      </div>

      {/* Glowing Timeline Stream */}
      <div className="card premium-panel activities-timeline-panel relative overflow-hidden">
        
        {/* Vertical line connector */}
        <div className="timeline-connector-line"></div>

        <div className="flex flex-col gap-6 relative z-10">
          {filteredActivities.map(act => {
            const Icon = getModuleIcon(act.module);
            const color = getModuleColor(act.module);

            return (
              <div key={act.id} className="timeline-item flex gap-4 items-start animate-fade-in">
                
                {/* Node icon wrapper */}
                <div 
                  className="timeline-node-dot"
                  style={{
                    border: `2px solid ${color}`,
                    boxShadow: `0 0 8px ${color}33`
                  }}
                >
                  <Icon size={14} style={{ color }} />
                </div>

                {/* Details Card */}
                <div className="timeline-item-card">
                  <div>
                    <span className="timeline-item-module" style={{ color }}>
                      {act.module}
                    </span>
                    <h4 className="timeline-item-action">
                      {act.action} <span className="timeline-item-by">by</span> <span className="timeline-item-user">{act.user}</span>
                    </h4>
                    <p className="timeline-item-details">
                      {act.details}
                    </p>
                  </div>
                  <div className="timeline-item-time">
                    <Clock size={11} />
                    <span>{act.timestamp}</span>
                  </div>
                </div>

              </div>
            );
          })}

          {filteredActivities.length === 0 && (
            <div className="text-center p-12 text-gray-500">
              No recorded operations match filter parameters.
            </div>
          )}
        </div>

      </div>

      {/* Manual Activity Logging Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Operations Event"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Representative *</label>
            <select 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#E4FF1A]" 
              value={user} 
              onChange={e => setUser(e.target.value)}
            >
              <option value="Curtis Miller">Curtis Miller</option>
              <option value="Sarah Jenkins">Sarah Jenkins</option>
              <option value="Alex Client">Alex Client</option>
              <option value="Faye Morgan">Faye Morgan</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel Module</label>
            <select 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#E4FF1A]" 
              value={module} 
              onChange={e => setModule(e.target.value)}
            >
              {MODULES.filter(m => m !== 'All').map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Event Action *</label>
            <input 
              type="text" 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#E4FF1A]" 
              placeholder="e.g. Cleared SLA database parameters" 
              value={action} 
              onChange={e => setAction(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction details *</label>
            <textarea 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#E4FF1A] h-20 resize-none" 
              placeholder="Provide exact parameter changes..." 
              value={details} 
              onChange={e => setDetails(e.target.value)} 
              required
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
              className="px-5 py-2.5 rounded-lg text-sm bg-[#E4FF1A] hover:bg-[#c9e016] text-[#0a0f1e] font-bold shadow-glow transition-all"
            >
              Log Transaction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
