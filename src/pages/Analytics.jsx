import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  Percent, 
  Award, 
  Sliders,
  ChevronRight
} from 'lucide-react';
import { mockDb } from '../utils/mockDb';
import { WeeklyActivityChart, MonthlyTrendsChart } from '../components/Charts';

export default function Analytics() {
  const [deals, setDeals] = useState([]);
  const [targetConversion, setTargetConversion] = useState(25); // default 25% target

  useEffect(() => {
    setDeals(mockDb.getDeals());
  }, []);

  const totalValue = deals.reduce((acc, curr) => acc + curr.value, 0);
  const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const activePipelineValue = activeDeals.reduce((acc, curr) => acc + curr.value, 0);

  // Projected revenue based on slider conversion rate
  const projectedRevenue = (activePipelineValue * (targetConversion / 100));

  const regionData = [
    { name: "North America (AMER)", leads: 14, sales: 85000, pct: 45 },
    { name: "Europe & UK (EMEA)", leads: 8, sales: 42000, pct: 28 },
    { name: "Asia Pacific (APAC)", leads: 6, sales: 25000, pct: 17 },
    { name: "Latin America (LATAM)", leads: 3, sales: 15000, pct: 10 }
  ];

  return (
    <div className="page-container">
      {/* Overview stats cards */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <Award />
          </div>
          <div className="metric-info">
            <span className="metric-label">Sales Conversion Rate</span>
            <span className="metric-value">64.2%</span>
            <span className="metric-change up">
              <TrendingUp size={14} /> +4.2% higher than Q1
            </span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(45, 96, 255, 0.1)', color: 'var(--primary)' }}>
            <DollarSign />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Sales Pipeline</span>
            <span className="metric-value">${activePipelineValue.toLocaleString()}</span>
            <span className="metric-change up">
              <TrendingUp size={14} /> 5 active deals in play
            </span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <Percent />
          </div>
          <div className="metric-info">
            <span className="metric-label">Average Contract Value</span>
            <span className="metric-value">${(totalValue / (deals.length || 1)).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            <span className="metric-change up">
              <TrendingUp size={14} /> High-tier SaaS average
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Main Details */}
      <div className="dashboard-main-grid">
        
        {/* Left column: Projection simulator & Monthly trend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Revenue Projection Simulator Card */}
          <div className="card">
            <div className="card-title">
              <span>Interactive Revenue Simulator</span>
              <Sliders size={20} color="var(--primary)" />
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Adjust the target win rate slider to simulate projected close values against the current 
              active pipeline (<strong>${activePipelineValue.toLocaleString()}</strong>).
            </p>

            <div style={{ padding: '20px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '15px', fontWeight: 700 }}>
                <span style={{ color: 'var(--text-title)' }}>Target Conversion Win Rate:</span>
                <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)', fontSize: '18px' }}>
                  {targetConversion}%
                </span>
              </div>

              <input 
                type="range" 
                min="5" 
                max="90" 
                step="5"
                value={targetConversion}
                onChange={e => setTargetConversion(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--border-light)',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  cursor: 'pointer',
                  accentColor: 'var(--primary)',
                  margin: '10px 0'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-light)', fontWeight: 600 }}>
                <span>Conservative (5%)</span>
                <span>Optimistic (90%)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, uppercase: 'true' }}>Projected Close Revenue</span>
                <h4 style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
                  ${projectedRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </h4>
              </div>
              <div style={{
                padding: '12px 20px',
                backgroundColor: 'rgba(65, 212, 48, 0.1)',
                color: 'var(--success)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 700
              }}>
                Simulation Active
              </div>
            </div>

          </div>

          {/* Historical Area Line Chart */}
          <div className="card">
            <div className="card-title">Lead Acquisition Pipeline Trend</div>
            <MonthlyTrendsChart />
          </div>
        </div>

        {/* Right column: Regional distribution & Win/Loss analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Regional statistics */}
          <div className="card">
            <div className="card-title">Regional Client Analytics</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {regionData.map((reg, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-title)' }}>{reg.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>${reg.sales.toLocaleString()}</span>
                  </div>
                  
                  {/* Progress bar container */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${reg.pct}%`, 
                      height: '100%', 
                      backgroundColor: idx === 0 ? 'var(--primary)' : idx === 1 ? 'var(--info)' : 'var(--warning)', 
                      borderRadius: 'var(--radius-full)' 
                    }}></div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>
                    <span>{reg.leads} Active leads</span>
                    <span>{reg.pct}% contribution</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forecast details list card */}
          <div className="card" style={{ flexGrow: 1 }}>
            <div className="card-title">Key Performance Indicators</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Lead Response SLA Time</span>
                  <h5 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-title)' }}>18.4 Minutes</h5>
                </div>
                <span className="badge badge-success">excellent</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Average Lead Sales Cycle</span>
                  <h5 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-title)' }}>14.2 Days</h5>
                </div>
                <span className="badge badge-success">under-target</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Client Retention (SaaS LTV)</span>
                  <h5 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-title)' }}>98.4%</h5>
                </div>
                <span className="badge badge-info">very high</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
