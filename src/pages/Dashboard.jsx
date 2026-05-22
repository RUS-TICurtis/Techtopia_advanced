import { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  DollarSign, 
  UserPlus,
  Building2,
  GitBranch,
  Receipt,
  Calendar,
  MessageSquare,
  FileSignature,
  Settings as SettingsIcon,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { mockDb } from '../utils/mockDb';
import { WeeklyActivityChart, DealPipelineChart, MonthlyTrendsChart } from '../components/Charts';
import './Dashboard.css';

export default function Dashboard({ setCurrentTab }) {
  const [contacts] = useState(() => mockDb.getContacts());
  const [deals] = useState(() => mockDb.getDeals());

  const totalValue = deals.reduce((acc, curr) => acc + curr.value, 0);
  const activeDealsCount = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length;
  const wonDealsCount = deals.filter(d => d.stage === 'Won').length;
  const totalLeads = contacts.length;

  const quickActions = [
    { label: 'AI Assistant',    icon: Sparkles,   color: '#01FDF6', desc: 'Get AI-powered insights and automate tasks', action: () => setCurrentTab('ai-assistant') },
    { label: 'Sales Pipeline',  icon: GitBranch,  color: '#21FA90', desc: 'Manage deals and track opportunities',     action: () => setCurrentTab('pipeline') },
    { label: 'Security & Audit',icon: ShieldCheck,color: '#8A4FFF', desc: 'View logs and monitor system activity',    action: () => setCurrentTab('settings') },
    { label: 'Automations',     icon: Zap,        color: '#FF47DA', desc: 'Build smart workflows and triggers',       action: () => setCurrentTab('settings') },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back. Here is your overview.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)' }}>
            <Users />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Leads</span>
            <span className="metric-value">{totalLeads}</span>
            <span className="metric-change up">
              <TrendingUp size={14} /> +12.5% this month
            </span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
            <TrendingUp />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Deals</span>
            <span className="metric-value">{activeDealsCount}</span>
            <span className="metric-change up">
              <TrendingUp size={14} /> +8% vs last week
            </span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <CheckCircle />
          </div>
          <div className="metric-info">
            <span className="metric-label">Closed Deals</span>
            <span className="metric-value">{wonDealsCount}</span>
            <span className="metric-change up">
              <TrendingUp size={14} /> 100% win rate avg.
            </span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <DollarSign />
          </div>
          <div className="metric-info">
            <span className="metric-label">Expected Revenue</span>
            <span className="metric-value">${totalValue.toLocaleString()}</span>
            <span className="metric-change up">
              <TrendingUp size={14} /> +18.4% growth
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Quick Actions */}
      <div className="dashboard-main-grid">
        {/* Left Side: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-title">
              <span>Weekly Acquisition & Revenue</span>
            </div>
            <WeeklyActivityChart deals={deals} />
          </div>

          <div className="dashboard-charts-grid">
            <div className="card">
              <div className="card-title">Deal Pipeline Stage</div>
              <DealPipelineChart deals={deals} />
            </div>

            <div className="card">
              <div className="card-title">Monthly Conversion Trend</div>
              <MonthlyTrendsChart />
            </div>
          </div>
        </div>

        {/* Right Side: Quick Access & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Access */}
          <div className="card">
            <div className="card-title" style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Quick Access</div>
            <div className="quick-access-list">
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <button key={action.label} className="quick-access-item" onClick={action.action}>
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

          {/* Recent CRM Log Activity */}
          <div className="card" style={{ flexGrow: 1 }}>
            <div className="card-title">Recent CRM Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '5px 0' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="activity-icon success">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)' }}>Contract Signed</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>CyberPulse Security finalized Enterprise Support tier.</p>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>May 18, 2026</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="activity-icon info">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)' }}>API SLA Proposal Sent</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>SLA draft dispatched to Catherine Song at BioGen Lab.</p>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>May 15, 2026</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="activity-icon warning">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)' }}>Lead Discovery Scheduled</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Introductory sync scheduled with David Kross.</p>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>May 19, 2026</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
