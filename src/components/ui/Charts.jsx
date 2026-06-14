import { useState } from 'react';

// ==========================================================================
// 1. Weekly Activity Chart (Bar Chart)
// ==========================================================================
export const WeeklyActivityChart = ({ data: propData }) => {
  // Let's summarize the deals value by stage or mock weekly values for visual beauty
  const defaultData = [
    { day: "Mon", leads: 4, revenue: 15000 },
    { day: "Tue", leads: 8, revenue: 32000 },
    { day: "Wed", leads: 5, revenue: 18000 },
    { day: "Thu", leads: 12, revenue: 45000 },
    { day: "Fri", leads: 9, revenue: 38000 },
    { day: "Sat", leads: 2, revenue: 12000 },
    { day: "Sun", leads: 3, revenue: 9000 },
  ];

  const data = propData || defaultData;
  const maxLeads = Math.max(1, ...data.map(d => d.leads || 0));
  const maxRevenue = Math.max(1, ...data.map(d => d.revenue || 0));
  const chartHeight = 180;
  const chartWidth = 500;
  const [hoveredBar, setHoveredBar] = useState(null);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '15px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--brand-blue, var(--primary))', display: 'inline-block' }}></span>
          <span>Sales Revenue ($)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--brand-cyan, #F59E0B)', display: 'inline-block' }}></span>
          <span>New Leads</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${chartWidth} 240`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feOffset dy="4" in="SourceAlpha" result="off" />
            <feGaussianBlur in="off" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0" result="shadow" />
            <feBlend in="SourceGraphic" in2="shadow" mode="normal" />
          </filter>

          <filter id="tooltipDrop" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="tb" />
            <feColorMatrix in="tb" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.12 0" />
            <feBlend in="SourceGraphic" />
          </filter>
        </defs>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = 30 + ratio * chartHeight;
          const revValue = Math.round(maxRevenue * (1 - ratio));
          return (
            <g key={idx}>
              <line x1="45" y1={y} x2={chartWidth - 10} y2={y} stroke="var(--border-light)" strokeDasharray="4 4" />
              <text x="35" y={y + 4} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--text-light)" fontFamily="var(--font-main)">
                {revValue >= 1000 ? `${revValue / 1000}k` : revValue}
              </text>
            </g>
          );
        })}

        {/* Render Bars */}
        {data.map((item, idx) => {
          const sectionWidth = (chartWidth - 60) / data.length;
          const x = 55 + idx * sectionWidth;
          
          // Calculate heights
          const revenueHeight = (item.revenue / maxRevenue) * chartHeight;
          const leadsHeight = (item.leads / maxLeads) * chartHeight;
          
          const revY = 30 + chartHeight - revenueHeight;
          const leadsY = 30 + chartHeight - leadsHeight;
          const barWidth = 14;

          const isHovered = hoveredBar === idx;

          return (
            <g 
              key={idx} 
              onMouseEnter={() => setHoveredBar(idx)} 
              onMouseLeave={() => setHoveredBar(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Revenue Bar */}
              <rect
                x={x + sectionWidth / 2 - barWidth - 2}
                y={revY}
                width={barWidth}
                height={revenueHeight}
                rx="6"
                fill="var(--brand-blue, var(--primary))"
                opacity={hoveredBar === null || isHovered ? 1 : 0.6}
                style={{ transition: 'all 0.22s cubic-bezier(.2,.9,.3,1)' }}
                filter="url(#dropShadow)"
              />

              {/* Leads Bar */}
              <rect
                x={x + sectionWidth / 2 + 2}
                y={leadsY}
                width={barWidth}
                height={leadsHeight}
                rx="6"
                fill="var(--brand-cyan, var(--accent-orange, #F59E0B))"
                opacity={hoveredBar === null || isHovered ? 1 : 0.6}
                style={{ transition: 'all 0.22s cubic-bezier(.2,.9,.3,1)' }}
                filter="url(#dropShadow)"
              />

              {/* Day Label */}
              <text
                x={x + sectionWidth / 2}
                y={30 + chartHeight + 22}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="var(--text-muted)"
                fontFamily="var(--font-display)"
              >
                {item.day}
              </text>

              {/* Hover Tooltip Details */}
              {isHovered && (
                <g>
                  <rect
                    x={x + sectionWidth / 2 - 60}
                    y={Math.min(revY, leadsY) - 50}
                    width="120"
                    height="40"
                    rx="6"
                    fill="var(--text-title)"
                    filter="url(#tooltipDrop)"
                  />
                  <text
                    x={x + sectionWidth / 2}
                    y={Math.min(revY, leadsY) - 34}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="var(--font-main)"
                  >
                    Rev: ${item.revenue.toLocaleString()}
                  </text>
                  <text
                    x={x + sectionWidth / 2}
                    y={Math.min(revY, leadsY) - 20}
                    textAnchor="middle"
                    fill="var(--accent-orange, #F59E0B)"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="var(--font-main)"
                  >
                    Leads: {item.leads}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};


// ==========================================================================
// 2. Deal Pipeline Donut Chart (Deals by Stage)
// ==========================================================================
export const DealPipelineChart = ({ deals = [] }) => {
  // Extract real deal counts by stage
  const stages = {
    "Lead": { count: 0, color: "var(--text-light)" },
    "In Progress": { count: 0, color: "var(--info, #1814F3)" },
    "Proposal": { count: 0, color: "var(--accent-orange, #F59E0B)" },
    "Won": { count: 0, color: "var(--success, #10B981)" }
  };

  deals.forEach(deal => {
    const stage = deal.stage;
    if (stages[stage]) {
      stages[stage].count += 1;
    } else if (stage === "Qualified" || stage === "Negotiation") {
      stages["In Progress"].count += 1;
    }
  });

  // Default values if no deals loaded yet
  const chartData = Object.entries(stages).map(([name, config]) => ({
    name,
    value: config.count || 1, // Avoid divide by zero
    color: config.color
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  // SVG calculations for a simple donut chart
  let accumulatedAngle = 0;
  const radius = 65;
  const cx = 100;
  const cy = 100;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <defs>
            <filter id="donutShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feOffset dy="3" in="SourceAlpha" result="off" />
              <feGaussianBlur in="off" stdDeviation="5" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.12 0" />
              <feBlend in="SourceGraphic" in2="blur" mode="normal" />
            </filter>
            <radialGradient id="donutCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>
          {chartData.map((item, idx) => {
            const percentage = item.value / total;
            const strokeDashoffset = circumference - percentage * circumference;
            const rotation = (accumulatedAngle / total) * 360;
            accumulatedAngle += item.value;

            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotation - 90} ${cx} ${cy})`}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.28s',
                  transformOrigin: `${cx}px ${cy}px`,
                }}
                filter="url(#donutShadow)"
              />
            );
          })}
        </svg>

        {/* Text overlay in the middle of donut */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontFamily: 'var(--font-display)'
        }}>
          <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-title)' }}>
            {deals.length}
          </span>
          <br />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Deals
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', width: '100%', fontSize: '13px' }}>
        {chartData.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }}></span>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{item.name}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--text-title)' }}>
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


// ==========================================================================
// 3. Monthly Trends Area Line Chart (Balance History replacement)
// ==========================================================================
export const MonthlyTrendsChart = ({ data: propData }) => {
  const defaultPoints = [
    { label: "Jan", val: 12000 },
    { label: "Feb", val: 18000 },
    { label: "Mar", val: 15000 },
    { label: "Apr", val: 28000 },
    { label: "May", val: 34000 },
    { label: "Jun", val: 42000 },
  ];

  const points = propData || defaultPoints;
  const maxVal = Math.max(1, ...points.map(p => p.val || 0));
  const chartHeight = 120;
  const chartWidth = 520;
  const paddingX = 40;
  const paddingY = 20;

  // Calculate SVG coordinates
  const coordinates = points.map((p, idx) => {
    const x = paddingX + (idx * (chartWidth - paddingX * 2)) / (points.length - 1);
    const y = paddingY + chartHeight - (p.val / maxVal) * chartHeight;
    return { x, y, label: p.label, val: p.val };
  });

  // Create path strings
  const linePath = coordinates.reduce((path, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, "");

  const areaPath = `
    ${linePath} 
    L ${coordinates[coordinates.length - 1].x} ${paddingY + chartHeight} 
    L ${coordinates[0].x} ${paddingY + chartHeight} 
    Z
  `;

  const [hoveredPoint, setHoveredPoint] = useState(null);

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${chartWidth} 175`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* Gradients */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00" />
          </linearGradient>
          <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="lg" />
            <feColorMatrix in="lg" type="matrix" values="0 0 0 0 0  0 0 0 0 0.22  0 0 0 0 1  0 0 0 0.12 0" />
            <feBlend in="SourceGraphic" in2="lg" mode="normal" />
          </filter>
          <filter id="tooltipDrop" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="tb" />
            <feColorMatrix in="tb" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.14 0" />
            <feBlend in="SourceGraphic" />
          </filter>
        </defs>

        {/* Render horizontal lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingY + ratio * chartHeight;
          const gridVal = Math.round(maxVal * (1 - ratio));
          return (
            <g key={idx}>
              <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="var(--border-light)" strokeDasharray="3 3" />
              <text x={paddingX - 10} y={y + 4} textAnchor="end" fontSize="10" fontWeight="600" fill="var(--text-light)" fontFamily="var(--font-main)">
                ${gridVal >= 1000 ? `${gridVal / 1000}k` : gridVal}
              </text>
            </g>
          );
        })}

        {/* Render Area Fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Render Stroke Line */}
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)" />

        {/* Render Interactive Nodes */}
        {coordinates.map((p, idx) => {
          const isHovered = hoveredPoint === idx;

          return (
            <g key={idx} onMouseEnter={() => setHoveredPoint(idx)} onMouseLeave={() => setHoveredPoint(null)} style={{ cursor: 'pointer' }}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 7 : 4}
                fill="var(--bg-card)"
                stroke="var(--primary)"
                strokeWidth={isHovered ? 4 : 2.5}
                style={{ transition: 'r 0.2s, stroke-width 0.2s' }}
              />

              <text
                x={p.x}
                y={paddingY + chartHeight + 18}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="var(--text-muted)"
                fontFamily="var(--font-display)"
              >
                {p.label}
              </text>

              {isHovered && (
                <g>
                  {/* Tooltip Card */}
                  <rect
                    x={p.x - 55}
                    y={p.y - 38}
                    width="110"
                    height="28"
                    rx="5"
                    fill="var(--text-title)"
                    filter="url(#tooltipDrop)"
                  />
                  <text
                    x={p.x}
                    y={p.y - 20}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="var(--font-main)"
                  >
                    ${p.val.toLocaleString()}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
