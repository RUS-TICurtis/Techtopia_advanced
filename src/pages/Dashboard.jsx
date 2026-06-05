import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  useDashboardSummary, 
  useLeads, 
  useOpportunities, 
  useFinanceSummary, 
  useAuditLogs 
} from '../hooks/useCrmData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
  Users, TrendingUp, CheckCircle, DollarSign,
  GitBranch, Sparkles, ShieldCheck, Zap, Clock,
  ArrowRight, AlertTriangle, Activity
} from 'lucide-react';
import './Dashboard.css';

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#0f1629', border: '1px solid #222', borderRadius: 8,
        padding: '10px 14px', fontSize: 13, color: '#fff'
      }}>
        <p style={{ marginBottom: 4, color: '#627496', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'Revenue' ? `$${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ setCurrentTab }) {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  // Real database query hooks
  const { summary, isLoading: isLoadingSummary } = useDashboardSummary();
  const { leads, isLoading: isLoadingLeads } = useLeads();
  const { opportunities, isLoading: isLoadingOpps } = useOpportunities();
  const { payments = [], isLoading: isLoadingFinance } = useFinanceSummary();
  const { logs = [], isLoading: isLoadingLogs } = useAuditLogs();

  const totalValue = summary?.crm?.totalWonValue ?? 0;
  const activeDealsCount = summary?.crm?.totalOpportunities ?? 0;
  const wonDealsCount = summary?.crm?.wonCount ?? 0;
  const totalLeads = summary?.crm?.totalLeads ?? 0;

  const nav = (path) => {
    if (navigate) navigate(path);
    else if (setCurrentTab) setCurrentTab(path.replace('/', '') || 'dashboard');
  };

  const quickActions = [
    { label: 'AI Assistant', icon: Sparkles, color: '#01FDF6', desc: 'Get AI-powered insights and automate tasks', path: '/ai' },
    { label: 'Sales Pipeline', icon: GitBranch, color: '#21FA90', desc: 'Manage deals and track opportunities', path: '/pipeline' },
    { label: 'Security & Audit', icon: ShieldCheck, color: '#8A4FFF', desc: 'View logs and monitor system activity', path: '/audit-logs' },
    { label: 'Automations', icon: Zap, color: '#FF47DA', desc: 'Build smart workflows and triggers', path: '/automations' },
  ];

  const metrics = [
    { label: 'Total Leads', value: totalLeads, change: '+12.5%', icon: Users, colorVar: 'var(--primary)', bgVar: 'var(--primary-bg)', accentClass: 'metric-card-primary' },
    { label: 'Active Deals', value: activeDealsCount, change: '+8%', icon: TrendingUp, colorVar: 'var(--info)', bgVar: 'var(--info-bg)', accentClass: 'metric-card-info' },
    { label: 'Closed Deals', value: wonDealsCount, change: '100% win rate', icon: CheckCircle, colorVar: 'var(--success)', bgVar: 'var(--success-bg)', accentClass: 'metric-card-success' },
    { label: 'Pipeline Value', value: `$${(totalValue / 1000).toFixed(0)}K`, change: '+18.4% growth', icon: DollarSign, colorVar: 'var(--warning)', bgVar: 'var(--warning-bg)', accentClass: 'metric-card-warning' },
  ];

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Compile monthly data dynamically
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const getMonthlyData = () => {
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: months[d.getMonth()],
        year: d.getFullYear(),
        Revenue: 0,
        Leads: 0
      });
    }

    if (Array.isArray(payments)) {
      payments.forEach(p => {
        if (p.status === 'completed' && p.time) {
          const pDate = new Date(p.time);
          const pMonth = months[pDate.getMonth()];
          const pYear = pDate.getFullYear();
          const bucket = last6Months.find(m => m.month === pMonth && m.year === pYear);
          if (bucket) {
            bucket.Revenue += (p.amount || 0);
          }
        }
      });
    }

    if (Array.isArray(leads)) {
      leads.forEach(l => {
        if (l.createdAt) {
          const lDate = new Date(l.createdAt);
          const lMonth = months[lDate.getMonth()];
          const lYear = lDate.getFullYear();
          const bucket = last6Months.find(m => m.month === lMonth && m.year === lYear);
          if (bucket) {
            bucket.Leads += 1;
          }
        }
      });
    }

    return last6Months;
  };

  const chartData = getMonthlyData();

  // Compile pie chart data dynamically
  const getPieData = () => {
    const stageCounts = {};
    if (Array.isArray(opportunities)) {
      opportunities.forEach(opp => {
        stageCounts[opp.stage] = (stageCounts[opp.stage] || 0) + 1;
      });
    }

    const colors = {
      'Qualification': '#01FDF6',
      'Proposal': '#8A4FFF',
      'Negotiation': '#FF47DA',
      'Closed Won': '#21FA90',
      'Closed Lost': '#FF4B4B'
    };

    const data = Object.entries(stageCounts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#627496'
    }));

    return data.length > 0 ? data : [{ name: 'No Deals', value: 0, color: '#627496' }];
  };

  const pieData = getPieData();

  // Compile recent activities from dynamic audit logs
  const getRecentActivities = () => {
    if (!Array.isArray(logs) || logs.length === 0) return [];
    
    return logs.slice(0, 4).map((log, idx) => {
      let icon = Activity;
      let type = 'info';
      if (log.action.includes('CREATE') || log.action.includes('WON') || log.action.includes('SIGN')) {
        icon = CheckCircle;
        type = 'success';
      } else if (log.action.includes('DELETE') || log.action.includes('ERROR') || log.action.includes('FAIL')) {
        icon = AlertTriangle;
        type = 'warning';
      } else if (log.action.includes('UPDATE')) {
        icon = Clock;
        type = 'info';
      }

      return {
        id: log.id || idx,
        type,
        icon,
        title: log.action.replace(/_/g, ' '),
        desc: `${log.actor || 'System'} modified ${log.module || 'Resource'}.`,
        time: new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      };
    });
  };

  const activityFeed = getRecentActivities();

  return (
    <div className="page-container">
      {/* Header with AI greeting */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {getHour()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="page-subtitle">
            Here's your Techtopia CRM overview for today. You have{' '}
            <span style={{ color: 'var(--brand-cyan)', fontWeight: 700 }}>{activeDealsCount} active deals</span>{' '}
            worth <span style={{ color: 'var(--brand-green)', fontWeight: 700 }}>${totalValue.toLocaleString()}</span> in your pipeline.
          </p>
        </div>
        <button
          onClick={() => nav('/ai')}
          className="btn btn-primary flex items-center gap-2"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Sparkles size={16} />
          Ask AI Assistant
          <ArrowRight size={16} />
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="metrics-grid">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className={`card metric-card ${m.accentClass}`}>
              <div className="metric-icon-wrapper" style={{ backgroundColor: m.bgVar, color: m.colorVar }}>
                <Icon size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-label">{m.label}</span>
                <span className="metric-value" style={{ color: 'var(--text-title)' }}>{m.value}</span>
                <span className="metric-change up">
                  <TrendingUp size={12} /> {m.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main 2-column grid */}
      <div className="dashboard-main-grid">
        {/* Left: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Revenue & Lead Area Chart (Recharts) */}
          <div className="card">
            <div className="card-title">Revenue & Lead Acquisition (6 Months)</div>
            <div style={{ height: 240 }}>
              {leads.length === 0 && payments.length === 0 ? (
                <div className="empty-state-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  <span>No data recorded for the selected period.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#01FDF6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#01FDF6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#21FA90" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#21FA90" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#3d4e6b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#3d4e6b" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                    <Area type="monotone" dataKey="Revenue" stroke="#01FDF6" strokeWidth={2} fill="url(#gradRevenue)" />
                    <Area type="monotone" dataKey="Leads" stroke="#21FA90" strokeWidth={2} fill="url(#gradLeads)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Pipeline Stage Pie + Bar Charts */}
          <div className="dashboard-charts-grid">
            <div className="card">
              <div className="card-title">Deal Pipeline Stages</div>
              <div style={{ height: 210, display: 'flex', alignItems: 'center' }}>
                {opportunities.length === 0 ? (
                  <div className="empty-state-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'var(--text-muted)', fontSize: 13 }}>
                    <span>0 opportunities in pipeline</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, name) => [v, name]} contentStyle={{ backgroundColor: '#0f1629', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
                      <Legend iconSize={10} formatter={(val) => <span style={{ color: '#c8d6ef', fontSize: 12 }}>{val}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-title">Monthly Conversion Trend</div>
              <div style={{ height: 180 }}>
                {leads.length === 0 ? (
                  <div className="empty-state-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 13 }}>
                    <span>0 leads converted</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={chartData.slice(-4)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#3d4e6b" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#3d4e6b" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f1629', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="Leads" fill="#8A4FFF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Access + Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Access */}
          <div className="card">
            <div className="card-title" style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Quick Access</div>
            <div className="quick-access-list">
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <button key={action.label} className="quick-access-item" onClick={() => nav(action.path)}>
                    <div className="quick-access-icon" style={{ color: action.color, backgroundColor: `${action.color}15` }}>
                      <Icon size={20} />
                    </div>
                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                      <span className="quick-access-name">{action.label}</span>
                      <span className="quick-access-desc">{action.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card" style={{ flexGrow: 1 }}>
            <div className="card-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={16} />
                Recent CRM Activity
              </span>
            </div>
            <div className="activity-feed">
              {activityFeed.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: 'var(--text-muted)', fontSize: 13 }}>
                  <span>No recent activity found.</span>
                </div>
              ) : (
                activityFeed.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="activity-item">
                      <div className={`activity-icon ${item.type}`}>
                        <Icon size={17} />
                      </div>
                      <div className="activity-content">
                        <h4>{item.title}</h4>
                        <p>{item.desc}</p>
                        <span className="activity-time">{item.time}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
