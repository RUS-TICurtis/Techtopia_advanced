import { useState, useEffect, useMemo } from 'react';
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
import Badge from '../../components/ui/Badge';
import { useAuditLogs } from '../../hooks/useCrmData';
import './Activities.css';

const MODULES = ['All', 'Pipeline', 'Leads', 'Billing', 'Support', 'Projects'];

export default function Activities() {
  const { logs = [], isLoading } = useAuditLogs();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const activities = useMemo(() => {
    return logs.map(act => {
      // Calculate a friendly relative time or standard localized string
      const timeDiff = Date.now() - new Date(act.timestamp).getTime();
      let timeStr = 'Just now';
      if (!isNaN(timeDiff)) {
        const mins = Math.floor(timeDiff / (60 * 1000));
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) timeStr = `${days}d ago`;
        else if (hours > 0) timeStr = `${hours}h ago`;
        else if (mins > 0) timeStr = `${mins}m ago`;
      } else {
        timeStr = new Date(act.timestamp).toLocaleDateString();
      }

      // Map module name to standard tab modules (Leads, Projects, Billing, Pipeline, Support)
      let displayModule = act.module || 'System';
      if (displayModule.toLowerCase() === 'opportunities') displayModule = 'Pipeline';
      else if (displayModule.toLowerCase() === 'invoices' || displayModule.toLowerCase() === 'payments' || displayModule.toLowerCase() === 'finance') displayModule = 'Billing';
      else if (displayModule.toLowerCase() === 'tickets') displayModule = 'Support';

      // Capitalize first letter
      displayModule = displayModule.charAt(0).toUpperCase() + displayModule.slice(1);

      return {
        id: `act_${act.id}`,
        user: act.actor || 'System',
        action: act.action || 'Performed action',
        details: act.newValue ? (act.previousValue ? `${act.previousValue} → ${act.newValue}` : act.newValue) : (act.previousValue || ''),
        module: displayModule,
        timestamp: timeStr,
        type: displayModule.toLowerCase()
      };
    });
  }, [logs]);

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

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const matchesSearch = 
        act.action.toLowerCase().includes(search.toLowerCase()) ||
        act.details.toLowerCase().includes(search.toLowerCase()) ||
        act.user.toLowerCase().includes(search.toLowerCase());
      
      const matchesTab = activeTab === 'All' || act.module === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [activities, search, activeTab]);

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01FDF6]"></div>
      </div>
    );
  }

  return (
    <div className="page-container activities-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <span className="text-[#E4FF1A]">⚡</span> Operation Timeline
          </h1>
          <p className="page-subtitle">Cross-module transaction streams, diagnostic compliance & live audit trails</p>
        </div>
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
              color: 'var(--text-main)',
              paddingLeft: '32px'
            }}
          />
          <Search className="absolute left-3 text-gray-500" size={14} style={{ top: '50%', transform: 'translateY(-50%)' }} />
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
    </div>
  );
}
