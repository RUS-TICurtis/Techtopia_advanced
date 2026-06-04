import { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Award, 
  Sliders,
  Download,
  Calendar,
  Layers,
  Globe,
  PieChart as PieIcon,
  BarChart2,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { useOpportunities } from '../hooks/useCrmData';
import Badge from '../components/ui/Badge';
import './Analytics.css';

export default function Analytics() {
  const { opportunities: deals = [], isLoading } = useOpportunities();
  const [targetConversion, setTargetConversion] = useState(35); // target win rate slider

  // Dynamic calculations based on live database
  const totalDealsCount = deals.length;
  const wonDeals = deals.filter(d => d.stage === 'Won' || d.stage === 'Closed Won');
  const lostDeals = deals.filter(d => d.stage === 'Lost' || d.stage === 'Closed Lost');
  const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Closed Won' && d.stage !== 'Lost' && d.stage !== 'Closed Lost');
  
  const activePipelineValue = activeDeals.reduce((acc, curr) => acc + (curr.value || curr.amount || 0), 0);
  const totalWonValue = wonDeals.reduce((acc, curr) => acc + (curr.value || curr.amount || 0), 0);
  const avgDealSize = totalDealsCount > 0 
    ? (deals.reduce((acc, curr) => acc + (curr.value || curr.amount || 0), 0) / totalDealsCount) 
    : 0;
  
  // Conversion win rate: won / (won + lost)
  const totalClosed = wonDeals.length + lostDeals.length;
  const conversionRate = totalClosed > 0 ? ((wonDeals.length / totalClosed) * 100) : 0;

  // Projected revenue slider calc
  const projectedRevenue = activePipelineValue * (targetConversion / 100);

  // 1. Funnel data calculated dynamically
  const funnelStages = ['Qualification', 'Proposal', 'Negotiation', 'Closed Won'];
  const stageColors = {
    'Qualification': '#8A4FFF',  // Purple
    'Proposal': '#FF47DA',       // Magenta
    'Negotiation': '#3772FF',    // Blue
    'Closed Won': '#21FA90'      // Green
  };

  const funnelData = funnelStages.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage);
    return {
      name: stage,
      deals: stageDeals.length,
      value: stageDeals.reduce((acc, curr) => acc + (curr.value || curr.amount || 0), 0),
      color: stageColors[stage]
    };
  });

  // 2. Trend data (Historical ARR simulation)
  const monthlyTrendsData = [
    { name: 'Jan', target: 50000, value: 45000, leads: 12 },
    { name: 'Feb', target: 60000, value: 58000, leads: 15 },
    { name: 'Mar', target: 70000, value: 78000, leads: 22 },
    { name: 'Apr', target: 80000, value: 72000, leads: 18 },
    { name: 'May', target: 95000, value: 110000, leads: 29 },
    { name: 'Jun', target: 120000, value: 135000, leads: 35 },
  ];

  // 3. Regional contribution data
  const regionData = [
    { name: "North America (AMER)", value: 85000, count: 14, pct: 45, color: '#3772FF' },
    { name: "Europe & UK (EMEA)", value: 42000, count: 8, pct: 28, color: '#8A4FFF' },
    { name: "Asia Pacific (APAC)", value: 25000, count: 6, pct: 17, color: '#01FDF6' },
    { name: "Latin America (LATAM)", value: 15000, count: 3, pct: 10, color: '#FF47DA' }
  ];

  // Report Exporter
  const handleExportData = () => {
    const reportSummary = {
      timestamp: new Date().toISOString(),
      executiveKPIs: {
        activePipelineValue,
        totalWonValue,
        avgDealSize,
        conversionRate: conversionRate.toFixed(1) + '%'
      },
      stageBreakdown: funnelData,
      regionalBreakdown: regionData
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportSummary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `techtopia_crm_analytics_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="page-container analytics-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <span className="text-[#01FDF6]">⚡</span> Intelligent Analytics
          </h1>
          <p className="page-subtitle">Real-time revenue attribution, projection simulations, and funnel insights</p>
        </div>
        <button 
          onClick={handleExportData}
          className="btn btn-secondary flex items-center gap-2 shadow-sm border-gray-800 text-gray-300 hover:text-white"
        >
          <Download size={16} /> Export Intelligence Report
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px] bg-[#0f1629]/20 border border-gray-800 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01FDF6]"></div>
        </div>
      ) : (
        <>
          {/* Executive KPIs Grid */}
          <div className="metrics-grid mb-6">
            <div className="card metric-card premium-metric border-l-4 border-l-[#21FA90]">
              <div className="metric-icon-wrapper bg-[#21FA90]/10 text-[#21FA90]">
                <Award />
              </div>
              <div className="metric-info">
                <span className="metric-label">Sales Conversion Rate</span>
                <span className="metric-value font-display font-black">{conversionRate.toFixed(1)}%</span>
                <span className="metric-change up text-[#21FA90] flex items-center gap-1 mt-1 text-xs">
                  <TrendingUp size={12} /> Live Closed Deals Ratio
                </span>
              </div>
              <div className="metric-glow-dot bg-[#21FA90]"></div>
            </div>

            <div className="card metric-card premium-metric border-l-4 border-l-[#01FDF6]">
              <div className="metric-icon-wrapper bg-[#01FDF6]/10 text-[#01FDF6]">
                <DollarSign />
              </div>
              <div className="metric-info">
                <span className="metric-label">Active Sales Pipeline</span>
                <span className="metric-value font-display font-black">${activePipelineValue.toLocaleString()}</span>
                <span className="metric-change up text-[#01FDF6] flex items-center gap-1 mt-1 text-xs">
                  <TrendingUp size={12} /> {activeDeals.length} opportunities in play
                </span>
              </div>
              <div className="metric-glow-dot bg-[#01FDF6]"></div>
            </div>

            <div className="card metric-card premium-metric border-l-4 border-l-[#8A4FFF]">
              <div className="metric-icon-wrapper bg-[#8A4FFF]/10 text-[#8A4FFF]">
                <Percent />
              </div>
              <div className="metric-info">
                <span className="metric-label">Average Contract Value</span>
                <span className="metric-value font-display font-black">${avgDealSize.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                <span className="metric-change up text-[#8A4FFF] flex items-center gap-1 mt-1 text-xs">
                  <TrendingUp size={12} /> High-yield account ratio
                </span>
              </div>
              <div className="metric-glow-dot bg-[#8A4FFF]"></div>
            </div>
          </div>

          {/* Main Grid Section */}
          <div className="analytics-main-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Charts & Simulators */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Trend Chart (Historical ARR & Lead Growth) */}
              <div className="card premium-panel">
                <div className="card-header flex justify-between items-center mb-4 border-b border-light pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <h3 className="card-title font-bold flex items-center gap-2 m-0 text-sm" style={{ color: 'var(--text-title)' }}>
                    <TrendingUp size={16} className="text-[#01FDF6]" /> Revenue & Pipeline Growth Trend
                  </h3>
                  <Badge variant="info">Historical Overview</Badge>
                </div>
                
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monthlyTrendsData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#01FDF6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#01FDF6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8A4FFF" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#8A4FFF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" stroke="#627496" fontSize={11} tickLine={false} />
                      <YAxis stroke="#627496" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f1629', 
                          borderColor: '#1d283f', 
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#C8D6EF' }} />
                      <Area type="monotone" name="Closed Revenue ($)" dataKey="value" stroke="#01FDF6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      <Area type="monotone" name="Monthly Target ($)" dataKey="target" stroke="#8A4FFF" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorTarget)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Interactive Revenue Simulator */}
              <div className="card premium-panel">
                <div className="card-header flex justify-between items-center mb-4 border-b border-light pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <h3 className="card-title font-bold flex items-center gap-2 m-0 text-sm" style={{ color: 'var(--text-title)' }}>
                    <Sliders size={16} className="text-[#8A4FFF]" /> Interactive Win-Rate Forecaster
                  </h3>
                  <Badge variant="purple">AI Forecast</Badge>
                </div>

                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Adjust the simulated win rate slider to compute projected pipeline conversions against the active funnel (<strong>${activePipelineValue.toLocaleString()}</strong>).
                </p>

                <div className="p-4 bg-[#0a0f1e]/80 border border-gray-850 rounded-xl mb-4">
                  <div className="flex justify-between items-center mb-2 text-xs font-bold">
                    <span className="text-gray-300">Simulated Target Win Rate:</span>
                    <span className="text-[#01FDF6] font-display font-black text-lg">
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
                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#01FDF6] my-3 focus:outline-none"
                  />

                  <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                    <span>Conservative (5%)</span>
                    <span>Optimistic (90%)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Projected Inflow Forecast</span>
                    <h4 className="text-3xl font-display font-black text-[#21FA90] mt-1">
                      ${projectedRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#21FA90]/5 border border-[#21FA90]/20 text-[#21FA90] rounded-lg text-xs font-bold font-mono">
                    <Sparkles size={14} className="animate-pulse" />
                    <span>Simulation Active</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Funnel & Regions */}
            <div className="flex flex-col gap-6">
              
              {/* Funnel Stage distribution */}
              <div className="card premium-panel">
                <div className="card-header flex justify-between items-center mb-3 border-b border-light pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <h3 className="card-title font-bold flex items-center gap-2 m-0 text-sm" style={{ color: 'var(--text-title)' }}>
                    <Layers size={16} className="text-[#FF47DA]" /> Funnel Conversion
                  </h3>
                  <Badge variant="error">Stage Velocity</Badge>
                </div>

                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" stroke="#627496" fontSize={10} tickLine={false} />
                      <YAxis stroke="#627496" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f1629', 
                          borderColor: '#1d283f', 
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '11px'
                        }} 
                      />
                      <Bar dataKey="value" name="Value ($)">
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Regional Client Analytics (Pie Chart) */}
              <div className="card premium-panel">
                <div className="card-header flex justify-between items-center mb-3 border-b border-light pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <h3 className="card-title font-bold flex items-center gap-2 m-0 text-sm" style={{ color: 'var(--text-title)' }}>
                    <Globe size={16} className="text-[#01FDF6]" /> Region Share
                  </h3>
                  <Badge variant="info">Global Reach</Badge>
                </div>

                <div className="w-full h-[200px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={regionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {regionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `$${value.toLocaleString()}`}
                        contentStyle={{ 
                          backgroundColor: '#0f1629', 
                          borderColor: '#1d283f', 
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '11px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-1 mt-2">
                  {regionData.map((reg, idx) => (
                    <div key={idx} className="analytics-region-row justify-between flex items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: reg.color }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{reg.name}</span>
                      </div>
                      <span className="font-mono text-xs" style={{ color: 'var(--text-title)', fontWeight: 700 }}>${reg.value.toLocaleString()} ({reg.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </>
      )}
    </div>
  );
}
