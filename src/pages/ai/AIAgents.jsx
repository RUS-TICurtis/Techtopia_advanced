import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import { 
  Sparkles, ShieldCheck, TrendingUp, LifeBuoy, Users, 
  Receipt, ShieldAlert, BookOpen, ToggleLeft, ToggleRight,
  Cpu, Sliders, Play, AlertCircle, FileText, CheckCircle2,
  RefreshCw, Check
} from 'lucide-react';
import './AIAgents.css';

export default function AIAgents() {
  const [agents, setAgents] = useState([
    {
      id: 'agent-sales',
      name: 'Sales Orchestration Agent',
      codeName: 'APEX-SALES',
      icon: TrendingUp,
      color: '#ff79c6',
      active: true,
      role: 'Lead qualification, automated reminder follow-ups, win-probability forecasting',
      cognitiveLoad: 75,
      memoryUsage: '3.4 GB / 8.0 GB',
      lastExecution: '12 mins ago',
      successRate: 98.4,
      pendingApprovals: 0
    },
    {
      id: 'agent-support',
      name: 'Omni-Support Agent',
      codeName: 'SENTINEL-SUPPORT',
      icon: LifeBuoy,
      color: '#8be9fd',
      active: true,
      role: 'Ticket auto-classification, SLA escalation flags, sentiment analysis, drafts generation',
      cognitiveLoad: 60,
      memoryUsage: '2.1 GB / 8.0 GB',
      lastExecution: '4 mins ago',
      successRate: 97.8,
      pendingApprovals: 0
    },
    {
      id: 'agent-finance',
      name: 'Autonomous Ledger Agent',
      codeName: 'EQUILIBRIUM-FINANCE',
      icon: Receipt,
      color: '#f1fa8c',
      active: true,
      role: 'Invoice follow-ups, payment risk alerts, travel expense anomaly audits',
      cognitiveLoad: 90,
      memoryUsage: '6.7 GB / 16.0 GB',
      lastExecution: '1 hour ago',
      successRate: 99.9,
      pendingApprovals: 2
    },
    {
      id: 'agent-hr',
      name: 'Personnel & Ops Agent',
      codeName: 'SYNERGY-HR',
      icon: Users,
      color: '#ff5555',
      active: false,
      role: 'Onboarding scheduling, leave calendar conflict resolution, review drafts compiler',
      cognitiveLoad: 10,
      memoryUsage: '0.2 GB / 8.0 GB',
      lastExecution: 'Yesterday',
      successRate: 95.0,
      pendingApprovals: 1
    },
    {
      id: 'agent-admin',
      name: 'Governance & Security Agent',
      codeName: 'AEGIS-ADMIN',
      icon: ShieldCheck,
      color: '#ff0055',
      active: true,
      role: 'Access control matrices audits, suspicious login checks, user lifecycle cleaner',
      cognitiveLoad: 45,
      memoryUsage: '1.8 GB / 16.0 GB',
      lastExecution: 'Just now',
      successRate: 100.0,
      pendingApprovals: 0
    },
    {
      id: 'agent-knowledge',
      name: 'Semantic Knowledge Agent',
      codeName: 'COGNITIVE-WIKI',
      icon: BookOpen,
      color: '#ae81ff',
      active: true,
      role: 'Wiki embeddings indexer, corporate SOP search mapping, meeting transcripts extraction',
      cognitiveLoad: 80,
      memoryUsage: '11.4 GB / 32.0 GB',
      lastExecution: '28 mins ago',
      successRate: 99.2,
      pendingApprovals: 0
    }
  ]);

  // Log Execution History
  const [logs, setLogs] = useState([
    { id: 'l1', timestamp: '00:32:15', agent: 'AEGIS-ADMIN', action: 'Audit security token permissions', status: 'success', details: 'Validated 24 active sessions. Zero permission deviations detected.' },
    { id: 'l2', timestamp: '00:28:44', agent: 'SENTINEL-SUPPORT', action: 'Ticket Sentiment Analysis #TK-001', status: 'success', details: 'Sentiment: ANGRY. Escalated priority to HIGH and drafted canned reply.' },
    { id: 'l3', timestamp: '00:12:02', agent: 'APEX-SALES', action: 'Opportunity win-probability update', status: 'success', details: 'CloudScale Inc prospect probability elevated to 85% based on contract parameters.' },
    { id: 'l4', timestamp: '23:44:19', agent: 'EQUILIBRIUM-FINANCE', action: 'Overdue Invoice Audit', status: 'warning', details: 'Invoice INV-002 ($45,000) for CloudScale Inc overdue by 10 days. Created collection draft.' },
    { id: 'l5', timestamp: '22:15:02', agent: 'SYNERGY-HR', action: 'Leave Conflict Check', status: 'error', details: 'Conflict detected: 3 developers requested leave on 2026-06-15. Flagged to HR Lead.' }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleAgent = (id) => {
    setAgents(prev => prev.map(a => {
      if (a.id === id) {
        const nextActive = !a.active;
        // Append log item
        const newLog = {
          id: 'l_' + Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour12: false }),
          agent: a.codeName,
          action: nextActive ? 'Activate Agent Workforce' : 'Suspend Agent Workforce',
          status: 'success',
          details: nextActive ? `Active workload pipelines initialized successfully.` : `Deallocated resources. Agent entering hibernation.`
        };
        setLogs(prevLogs => [newLog, ...prevLogs]);
        return { ...a, active: nextActive, cognitiveLoad: nextActive ? 50 : 0 };
      }
      return a;
    }));
  };

  const handleSliderChange = (id, val) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, cognitiveLoad: val } : a));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Append a fresh log
      const newLog = {
        id: 'l_' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        agent: 'NEURAL-HUB',
        action: 'Workspace Synchronize Scan',
        status: 'success',
        details: 'Polled all active agent cores. Synchronized 5 execution thread trees.'
      };
      setLogs(prevLogs => [newLog, ...prevLogs]);
    }, 1000);
  };

  // SVG workload visualization calculations
  const getActiveCount = () => agents.filter(a => a.active).length;
  const totalLoad = agents.reduce((acc, a) => acc + (a.active ? a.cognitiveLoad : 0), 0);
  const avgLoad = getActiveCount() > 0 ? Math.round(totalLoad / getActiveCount()) : 0;

  return (
    <PageContainer className="ai-agents-page">
      <PageHeader 
        title="AI Workforce Orchestrator"
        subtitle="Provision, configure, and monitor autonomous specialized agents across departments"
        icon={<span className="text-[#01FDF6]">⚡</span>}
        actions={
          <button 
            onClick={handleRefresh} 
            className={`btn btn-secondary flex items-center gap-1.5 ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={14} /> Sync Cores
          </button>
        }
      />

      {/* Overview Analytics Cards */}
      <div className="metrics-grid mb-6">
        <div className="card metric-card premium-metric" style={{ background: 'linear-gradient(135deg, rgba(1, 253, 246, 0.15) 0%, rgba(55, 114, 255, 0.05) 100%)', borderColor: 'rgba(1, 253, 246, 0.15)' }}>
          <div className="metric-icon-wrapper bg-[#01FDF6]/10">
            <Cpu size={22} className="text-[#01FDF6]" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Autonomous Cores</span>
            <span className="metric-value font-display font-black text-white">{getActiveCount()} / {agents.length}</span>
          </div>
          <div className="metric-glow-dot bg-[#01FDF6]"></div>
        </div>

        <div className="card metric-card premium-metric" style={{ background: 'linear-gradient(135deg, rgba(189, 147, 249, 0.15) 0%, rgba(255, 71, 218, 0.05) 100%)', borderColor: 'rgba(189, 147, 249, 0.15)' }}>
          <div className="metric-icon-wrapper bg-[#bd93f9]/10">
            <Sliders size={22} className="text-[#bd93f9]" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Average Cognitive Workload</span>
            <span className="metric-value font-display font-black text-white">{avgLoad}%</span>
          </div>
          <div className="metric-glow-dot bg-[#bd93f9]"></div>
        </div>

        <div className="card metric-card premium-metric" style={{ background: 'linear-gradient(135deg, rgba(80, 250, 123, 0.15) 0%, rgba(1, 253, 246, 0.05) 100%)', borderColor: 'rgba(80, 250, 123, 0.15)' }}>
          <div className="metric-icon-wrapper bg-[#50fa7b]/10">
            <CheckCircle2 size={22} className="text-[#50fa7b]" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Mean Platform Accuracy</span>
            <span className="metric-value font-display font-black text-white">99.1%</span>
          </div>
          <div className="metric-glow-dot bg-[#50fa7b]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Active Agents Grid */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="section-title text-sm text-gray-500 font-bold uppercase tracking-wider px-1">Specialized Agent Workforce</div>
          <div className="agents-grid grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {agents.map(agent => {
              const Icon = agent.icon;
              return (
                <div key={agent.id} className={`agent-card premium-card border-l-4 ${!agent.active ? 'hibernating' : ''}`} style={{ '--agent-color': agent.color, borderColor: agent.active ? agent.color : 'rgba(255,255,255,0.05)' }}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="agent-icon-box p-2 bg-gray-900 border border-gray-800 rounded-xl" style={{ borderColor: agent.active ? `${agent.color}25` : 'rgba(255,255,255,0.05)' }}>
                        <Icon size={18} style={{ color: agent.active ? agent.color : 'var(--text-muted)' }} />
                      </div>
                      <div>
                        <h4 className="text-white text-xs font-bold font-display leading-tight">{agent.name}</h4>
                        <span className="text-[9px] text-gray-500 font-mono tracking-wider">{agent.codeName}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleAgent(agent.id)}
                      className="agent-toggle-switch cursor-pointer bg-transparent border-none text-gray-600 hover:text-white transition-colors"
                      style={{ color: agent.active ? agent.color : 'var(--text-muted)' }}
                    >
                      {agent.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </div>

                  <p className="agent-role-desc text-gray-400 text-[11px] leading-snug mb-3 min-h-[34px]">{agent.role}</p>

                  {/* Config Range Sliders */}
                  <div className="agent-slider-control mb-3">
                    <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1 font-sans">
                      <span>Throttle Core Allocation</span>
                      <span className="text-white font-mono">{agent.cognitiveLoad}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={agent.cognitiveLoad} 
                      disabled={!agent.active}
                      onChange={(e) => handleSliderChange(agent.id, parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-[#01FDF6]"
                    />
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-gray-900 pt-2.5 mt-2">
                    <div className="flex flex-col">
                      <span className="text-gray-600 uppercase font-semibold text-[8px]">Cognitive Cache</span>
                      <span className="text-gray-300 font-mono">{agent.memoryUsage}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-gray-600 uppercase font-semibold text-[8px]">Process Yield</span>
                      <span className="text-gray-300 font-mono">{agent.successRate}% Success</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workload Visualization & Live Logs */}
        <div className="flex flex-col gap-6">
          {/* Workload Analysis visual chart */}
          <div className="card bg-gray-900/35 border border-gray-850 p-4 rounded-xl flex flex-col">
            <h4 className="text-white text-xs font-bold font-display uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Cpu size={14} className="text-[#01FDF6]" /> Workload Analysis
            </h4>
            
            <div className="svg-chart-container h-36 flex items-center justify-center bg-gray-950/40 rounded-xl border border-gray-900 relative overflow-hidden p-2">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                <defs>
                  <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#01FDF6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#01FDF6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path 
                  d={`M 10 90 Q 50 ${90 - totalLoad*0.2} 100 ${90 - totalLoad*0.3} T 190 ${90 - avgLoad*0.6}`} 
                  fill="none" 
                  stroke="#01FDF6" 
                  strokeWidth="2.5" 
                  className="stroke-glow" 
                />
                <path 
                  d={`M 10 90 Q 50 ${90 - totalLoad*0.2} 100 ${90 - totalLoad*0.3} T 190 ${90 - avgLoad*0.6} L 190 90 L 10 90 Z`} 
                  fill="url(#glowGrad)" 
                />
                {/* Reference dots */}
                <circle cx="100" cy={90 - totalLoad*0.3} r="3.5" fill="#01FDF6" />
                <circle cx="190" cy={90 - avgLoad*0.6} r="3.5" fill="#ff79c6" />
              </svg>
              <div className="absolute bottom-2 left-3 text-[9px] text-gray-500 font-mono">Neural capacity sync: 100%</div>
            </div>
          </div>

          {/* Core Logs Console Panel */}
          <div className="card bg-gray-900/35 border border-gray-850 p-4 rounded-xl flex-1 flex flex-col min-h-[250px]">
            <h4 className="text-white text-xs font-bold font-display uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-[#ff0055]" /> Neural Audit Stream
            </h4>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2.5 font-mono text-[10px]">
              {logs.map(log => (
                <div key={log.id} className="log-line border-b border-gray-950 pb-2 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-gray-600">[{log.timestamp}]</span>
                    <span className="font-bold" style={{ color: log.status === 'success' ? '#50fa7b' : log.status === 'warning' ? '#f1fa8c' : '#ff5555' }}>
                      {log.agent}
                    </span>
                  </div>
                  <div className="text-gray-300 font-semibold">{log.action}</div>
                  <p className="text-gray-500 leading-snug">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
