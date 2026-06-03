import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { mockDb } from '../utils/mockDb';
import { useDashboardSummary } from '../hooks/useCrmData';
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

const AREA_DATA = [
  { month: 'Jan', Revenue: 42000, Leads: 18 },
  { month: 'Feb', Revenue: 58000, Leads: 25 },
  { month: 'Mar', Revenue: 75000, Leads: 31 },
  { month: 'Apr', Revenue: 61000, Leads: 22 },
  { month: 'May', Revenue: 93000, Leads: 40 },
  { month: 'Jun', Revenue: 120000, Leads: 52 },
];

const PIE_DATA = [
  { name: 'Won', value: 1, color: '#21FA90' },
  { name: 'In Progress', value: 2, color: '#01FDF6' },
  { name: 'Proposal', value: 1, color: '#8A4FFF' },
  { name: 'Lead', value: 1, color: '#E4FF1A' },
];

const ACTIVITY_FEED = [
  { id: 1, type: 'success', icon: CheckCircle, title: 'Contract Signed', desc: 'CyberPulse Security finalized Enterprise Support tier.', time: 'May 18, 2026' },
  { id: 2, type: 'info', icon: Clock, title: 'API SLA Proposal Sent', desc: 'SLA draft dispatched to Catherine Song at BioGen Lab.', time: 'May 15, 2026' },
  { id: 3, type: 'warning', icon: AlertTriangle, title: 'Ticket Escalated', desc: 'High-priority ticket TK-001 escalated to Tier-3 support.', time: 'May 14, 2026' },
  { id: 4, type: 'ai', icon: Sparkles, title: 'AI Lead Score Updated', desc: 'Alice Vance scored 92/100 — recommend immediate follow-up.', time: 'May 13, 2026' },
];

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
  const { summary } = useDashboardSummary();
  const [contacts] = useState(() => mockDb.getContacts());
  const [deals] = useState(() => mockDb.getDeals());

  const totalValue = summary?.crm?.totalWonValue ?? deals.reduce((acc, curr) => acc + curr.value, 0);
  const activeDealsCount = summary?.crm?.totalOpportunities ?? deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length;
  const wonDealsCount = summary?.crm?.wonCount ?? deals.filter(d => d.stage === 'Won').length;
  const totalLeads = summary?.crm?.totalLeads ?? contacts.length;

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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={AREA_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
            </div>
          </div>

          {/* Pipeline Stage Pie + Bar Charts */}
          <div className="dashboard-charts-grid">
            <div className="card">
              <div className="card-title">Deal Pipeline Stages</div>
              <div style={{ height: 210, display: 'flex', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, name) => [v, name]} contentStyle={{ backgroundColor: '#0f1629', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
                    <Legend iconSize={10} formatter={(val) => <span style={{ color: '#c8d6ef', fontSize: 12 }}>{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Monthly Conversion Trend</div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={AREA_DATA.slice(-4)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#3d4e6b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#3d4e6b" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1629', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="Leads" fill="#8A4FFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
              {ACTIVITY_FEED.map(item => {
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
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
