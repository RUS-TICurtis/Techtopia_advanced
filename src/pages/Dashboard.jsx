import { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  UserPlus
} from 'lucide-react';
import { mockDb } from '../utils/mockDb';
import { WeeklyActivityChart, DealPipelineChart, MonthlyTrendsChart } from '../components/Charts';

export default function Dashboard({ setCurrentTab }) {
  const [contacts, setContacts] = useState(() => mockDb.getContacts());
  const [deals, setDeals] = useState(() => mockDb.getDeals());
  const [quickLeadName, setQuickLeadName] = useState('');
  const [quickLeadCompany, setQuickLeadCompany] = useState('');
  const [quickLeadValue, setQuickLeadValue] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const totalValue = deals.reduce((acc, curr) => acc + curr.value, 0);
  const activeDealsCount = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length;
  const wonDealsCount = deals.filter(d => d.stage === 'Won').length;
  const totalLeads = contacts.length;

  const handleQuickLeadSubmit = (e) => {
    e.preventDefault();
    if (!quickLeadName || !quickLeadCompany) return;

    const leadVal = parseFloat(quickLeadValue) || 0;
    
    // Add to contacts db
    const newContact = mockDb.addContact({
      name: quickLeadName,
      company: quickLeadCompany,
      email: `${quickLeadName.toLowerCase().replace(/\s+/g, '.')}@${quickLeadCompany.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: "+1 (555) 000-0000",
      status: "New",
      value: leadVal,
      notes: "Quick Lead created from Overview dashboard."
    });

    // Add corresponding deal
    mockDb.addDeal({
      title: `${quickLeadCompany} API & Dev License`,
      company: quickLeadCompany,
      value: leadVal,
      stage: "Lead",
      priority: leadVal > 25000 ? "High" : leadVal > 10000 ? "Medium" : "Low",
      contactId: newContact.id,
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days out
    });

    // Update state
    setContacts(mockDb.getContacts());
    setDeals(mockDb.getDeals());

    setQuickLeadName('');
    setQuickLeadCompany('');
    setQuickLeadValue('');
    setSuccessMessage('Lead & Deal successfully created!');

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="page-container">
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(45, 96, 255, 0.1)', color: 'var(--primary)' }}>
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
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(24, 20, 243, 0.1)', color: 'var(--info)' }}>
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
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(65, 212, 48, 0.1)', color: 'var(--success)' }}>
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
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(255, 187, 56, 0.1)', color: 'var(--warning)' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="card">
            <div className="card-title">
              <span>Weekly Acquisition &amp; Revenue</span>
              <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setCurrentTab('analytics')}>
                View Details
              </button>
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

        {/* Right Side: Timeline & Quick Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Quick Lead Creator */}
          <div className="card">
            <div className="card-title">Quick Lead Portal</div>
            
            <form onSubmit={handleQuickLeadSubmit}>
              <div className="form-group">
                <label className="form-label">Lead Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. John Doe"
                  value={quickLeadName}
                  onChange={e => setQuickLeadName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Acme Corp"
                  value={quickLeadCompany}
                  onChange={e => setQuickLeadCompany(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deal Value ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 15000"
                  value={quickLeadValue}
                  onChange={e => setQuickLeadValue(e.target.value)}
                />
              </div>

              {successMessage && (
                <div style={{
                  color: 'var(--success)',
                  backgroundColor: 'var(--success-bg)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  {successMessage}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                <UserPlus size={18} />
                Create Lead &amp; Deal
              </button>
            </form>
          </div>

          {/* Recent CRM Log Activity */}
          <div className="card" style={{ flexGrow: 1 }}>
            <div className="card-title">Recent CRM Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '5px 0' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{
                  minWidth: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: 'var(--success-bg)', color: 'var(--success)',
                  display: 'flex', alignItems: 'center', justifyContents: 'center', alignSelf: 'flex-start',
                  justifyContent: 'center'
                }}>
                  <CheckCircle size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)' }}>Contract Signed</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>CyberPulse Security finalized Enterprise Support tier worth $75,000.</p>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>May 18, 2026</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{
                  minWidth: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: 'rgba(45, 96, 255, 0.1)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContents: 'center', alignSelf: 'flex-start',
                  justifyContent: 'center'
                }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)' }}>API SLA Proposal Sent</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>SLA draft dispatched to Catherine Song at BioGen Lab.</p>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>May 15, 2026</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{
                  minWidth: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: 'var(--warning-bg)', color: 'var(--warning)',
                  display: 'flex', alignItems: 'center', justifyContents: 'center', alignSelf: 'flex-start',
                  justifyContent: 'center'
                }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)' }}>Lead Discovery Scheduled</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Introductory sync scheduled with David Kross from FutureLogic.</p>
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
