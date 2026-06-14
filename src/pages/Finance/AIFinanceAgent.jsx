import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, User, TrendingUp, TrendingDown, AlertTriangle,
  Lightbulb, Bot, RefreshCw, Copy, ThumbsUp, ThumbsDown,
  BarChart3, DollarSign, FileText, CreditCard, Clock, CheckCircle
} from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import { useFinanceStore } from '../../store/financeStore';
import './Finance.css';

// ── Static AI insights / snapshot ────────────────────────────────────────
const INSIGHTS = [
  {
    id: 1, type: 'warning', icon: AlertTriangle, color: '#F59E0B',
    title: 'Invoice Collection Alert',
    body: '7 invoices totaling GH₵297,000 have been outstanding for 30+ days. Clients most at risk: DataVault Inc, CyberPulse, EcoLogistics.',
    action: 'View Overdue Invoices',
    path: '/finance/invoices',
  },
  {
    id: 2, type: 'danger', icon: TrendingDown, color: '#EF4444',
    title: 'Cashflow Projection Risk',
    body: 'Based on current collection velocity, projected cashflow shortfall of GH₵180,000 is expected in 27 days. Recommend accelerating collections.',
    action: 'View Cash Flow Report',
    path: '/finance/reports',
  },
  {
    id: 3, type: 'info', icon: TrendingUp, color: '#10B981',
    title: 'Revenue Milestone',
    body: 'December revenue of GH₵341,000 sets a new monthly record — 14.4% above the FY target. Net Revenue Retention hit 122%, indicating strong expansion revenue.',
    action: 'Revenue Analytics',
    path: '/finance/revenue',
  },
  {
    id: 4, type: 'info', icon: Lightbulb, color: '#6366F1',
    title: 'Budget Optimisation Opportunity',
    body: 'Marketing budget is 93.5% utilised with 4 weeks remaining in the quarter. Consider reallocation from Operations (41% utilised) to prevent overrun.',
    action: 'View Budgets',
    path: '/finance/budgets',
  },
];

const QUICK_QUESTIONS = [
  'What is our current MRR?',
  'Which clients have overdue invoices?',
  'Show me this month\'s expense breakdown',
  'What is our net profit margin?',
  'Forecast revenue for next quarter',
  'Which budget departments are overspent?',
  'Summarize our tax obligations',
  'What is our churn rate trend?',
];

// ── Pre-canned AI responses for demo ─────────────────────────────────────
const AI_RESPONSES = {
  'what is our current mrr': `**Monthly Recurring Revenue (June 2026)**\n\nYour current MRR is **GH₵ 2,134,000**, reflecting a **+38.3% year-over-year** growth.\n\n**Breakdown by Plan:**\n- Enterprise: GH₵650,000 (30.5%)\n- Business: GH₵389,700 (18.3%)\n- Pro: GH₵124,750 (5.8%)\n- One-time / Services: ~GH₵969,550 (45.4%)\n\n**Key metric:** Net Revenue Retention is 122%, meaning existing customers are expanding faster than churning. This is a strong signal.`,
  
  'which clients have overdue invoices': `**Overdue Invoice Report**\n\nCurrently **4 invoices** are overdue:\n\n| Client | Invoice | Amount | Days Overdue |\n|--------|---------|--------|--------------|\n| DataVault Inc | INV-2026-004 | GH₵110,000 | 14 days |\n| CyberPulse | INV-2026-003 | GH₵62,000 | 3 days |\n| BioGen Labs | INV-2026-002 | GH₵14,250 | Partial |\n| EcoLogistics | INV-2026-005 | GH₵18,750 | Due today |\n\n**Recommendation:** DataVault Inc represents the highest risk. I recommend escalating to a senior account manager and offering a 2% early payment discount.`,

  'default': `I've analysed your financial data. Here's what I found:\n\n**Quick Summary:**\n- Total revenue YTD: **GH₵2,713,000**\n- Outstanding invoices: **GH₵297,000** across 34 open invoices\n- Largest expense category: Operations (32%)\n- Current cash position is healthy with 27-day collection lag\n\nI can help you with invoice follow-ups, budget reallocation, tax planning, revenue forecasting, or any other financial query. What would you like to explore?`,
};

const getAIResponse = (query) => {
  const q = query.toLowerCase().trim();
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (key !== 'default' && q.includes(key.split(' ')[2])) return response;
  }
  if (q.includes('mrr') || q.includes('recurring')) return AI_RESPONSES['what is our current mrr'];
  if (q.includes('overdue') || q.includes('invoice')) return AI_RESPONSES['which clients have overdue invoices'];
  return AI_RESPONSES['default'];
};

// Simple markdown renderer
const renderMarkdown = (text) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Table row
    if (line.startsWith('|')) {
      const cells = line.split('|').filter(c => c.trim() !== '');
      if (line.includes('---')) return null; // separator row
      return (
        <tr key={i}>
          {cells.map((cell, j) => (
            <td key={j} style={{ padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 12 }}
              dangerouslySetInnerHTML={{ __html: cell.trim() }} />
          ))}
        </tr>
      );
    }
    // Bullet
    if (line.startsWith('- ')) return <li key={i} style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: line.slice(2) }} />;
    // Heading
    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight: 700, color: 'var(--text-title)', margin: '12px 0 4px' }} dangerouslySetInnerHTML={{ __html: line }} />;
    // Normal
    return line ? <p key={i} style={{ margin: '4px 0' }} dangerouslySetInnerHTML={{ __html: line }} /> : <br key={i} />;
  }).filter(Boolean);
};

const formatMessage = (content) => {
  // Check if there are table rows
  const hasTable = content.includes('|---|');
  if (hasTable) {
    // Render table
    const lines = content.split('\n');
    const tableRows = [];
    const otherContent = [];
    let inTable = false;
    lines.forEach((line, i) => {
      if (line.startsWith('|')) {
        inTable = true;
        tableRows.push(line);
      } else {
        if (inTable) {
          otherContent.push(<table key={i} style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0' }}><tbody>{renderMarkdown(tableRows.join('\n'))}</tbody></table>);
          tableRows.length = 0;
          inTable = false;
        }
        otherContent.push(...renderMarkdown(line));
      }
    });
    return <>{otherContent}</>;
  }
  return <>{renderMarkdown(content)}</>;
};

export default function AIFinanceAgent() {
  const { agentMessages, agentLoading, addAgentMessage, setAgentLoading, clearAgentMessages } = useFinanceStore();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [agentMessages]);

  // Initialize with welcome message
  useEffect(() => {
    if (agentMessages.length === 0) {
      addAgentMessage({
        id: Date.now(),
        role: 'agent',
        content: `Hello! I'm your **AI Finance Assistant** for Techtopia CRM.\n\nI have real-time access to your financial data including invoices, payments, subscriptions, expenses, budgets, and revenue analytics. I can:\n\n- Analyse financial trends and anomalies\n- Generate executive summaries and forecasts\n- Flag overdue invoices and cashflow risks\n- Recommend budget optimisations\n- Answer any financial query in natural language\n\nHow can I help you today?`,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const sendMessage = async (query = input) => {
    if (!query.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', content: query, timestamp: new Date().toISOString() };
    addAgentMessage(userMsg);
    setInput('');
    setAgentLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = getAIResponse(query);
      addAgentMessage({
        id: Date.now() + 1,
        role: 'agent',
        content: response,
        timestamp: new Date().toISOString(),
      });
      setAgentLoading(false);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(1,253,246,0.12)', border: '2px solid #38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} style={{ color: '#38BDF8' }} />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 2 }}>AI Finance Assistant</h1>
            <p className="page-subtitle">Powered by Techtopia AI · Finance domain intelligence · GH₵</p>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={clearAgentMessages}>
            <RefreshCw size={15} /><span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="finance-tab-bar">
        {['chat', 'insights', 'forecast'].map(tab => (
          <button key={tab} className={`finance-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Chat Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          {/* Chat window */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 580 }}>
            {/* Messages */}
            <div className="finance-ai-messages" style={{ flex: 1 }}>
              {agentMessages.map((msg) => (
                <div key={msg.id} className={`finance-ai-message ${msg.role}`}>
                  <div className="finance-ai-avatar" style={{
                    background: msg.role === 'agent' ? 'rgba(1,253,246,0.15)' : 'rgba(138,79,255,0.2)',
                    color: msg.role === 'agent' ? '#38BDF8' : '#6366F1',
                  }}>
                    {msg.role === 'agent' ? <Sparkles size={16} /> : <User size={16} />}
                  </div>
                  <div style={{ maxWidth: '80%' }}>
                    <div className="finance-ai-bubble">
                      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                        {formatMessage(msg.content)}
                      </div>
                    </div>
                    {msg.role === 'agent' && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, paddingLeft: 4 }}>
                        <button className="btn-icon" title="Copy"><Copy size={11} /></button>
                        <button className="btn-icon" title="Helpful"><ThumbsUp size={11} /></button>
                        <button className="btn-icon" title="Not helpful"><ThumbsDown size={11} /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {agentLoading && (
                <div className="finance-ai-message agent">
                  <div className="finance-ai-avatar" style={{ background: 'rgba(1,253,246,0.15)', color: '#38BDF8' }}>
                    <Sparkles size={16} />
                  </div>
                  <div className="finance-ai-bubble">
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          width: 6, height: 6, borderRadius: '50%', background: '#38BDF8',
                          animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                          display: 'inline-block',
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="finance-ai-input-row">
              <textarea
                className="finance-ai-input"
                placeholder="Ask anything about your finances... (e.g. 'What is our cash position?' or 'Show overdue invoices')"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="btn btn-primary"
                style={{ padding: '12px 16px', flexShrink: 0 }}
                onClick={() => sendMessage()}
                disabled={!input.trim() || agentLoading}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Quick questions sidebar */}
          <div>
            <div className="card">
              <div className="card-title" style={{ fontSize: 12, marginBottom: 12 }}>Quick Questions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    style={{
                      padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)',
                      background: 'transparent', color: 'var(--text-muted)', fontSize: 12,
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', lineHeight: 1.4
                    }}
                    onMouseEnter={e => { e.target.style.borderColor = '#38BDF8'; e.target.style.color = 'var(--text-main)'; }}
                    onMouseLeave={e => { e.target.style.borderColor = 'var(--border-light)'; e.target.style.color = 'var(--text-muted)'; }}
                  >{q}</button>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div className="card" style={{ marginTop: 0 }}>
              <div className="card-title" style={{ fontSize: 12, marginBottom: 12 }}>Capabilities</div>
              {[
                { icon: BarChart3, label: 'Revenue Analysis', color: '#38BDF8' },
                { icon: FileText, label: 'Invoice Intelligence', color: '#10B981' },
                { icon: CreditCard, label: 'Payment Insights', color: '#6366F1' },
                { icon: DollarSign, label: 'Budget Advisory', color: '#F59E0B' },
                { icon: TrendingUp, label: 'Forecasting', color: '#EF4444' },
              ].map(cap => {
                const Icon = cap.icon;
                return (
                  <div key={cap.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 12 }}>
                    <Icon size={14} style={{ color: cap.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-muted)' }}>{cap.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Insights Tab ─────────────────────────────────────────────── */}
      {activeTab === 'insights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { label: 'AI Scans Today', value: '24', icon: Sparkles, color: '#38BDF8' },
              { label: 'Risks Flagged', value: '3', icon: AlertTriangle, color: '#F59E0B' },
              { label: 'Actions Suggested', value: '7', icon: Lightbulb, color: '#6366F1' },
              { label: 'Last Sync', value: '2 min ago', icon: Clock, color: '#10B981' },
            ].map(m => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="finance-metric-mini">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Icon size={14} style={{ color: m.color }} />
                    <span className="finance-metric-mini-label">{m.label}</span>
                  </div>
                  <span className="finance-metric-mini-value" style={{ fontSize: 20, color: m.color }}>{m.value}</span>
                </div>
              );
            })}
          </div>

          {INSIGHTS.map(insight => {
            const Icon = insight.icon;
            return (
              <div key={insight.id} className="card" style={{ borderLeft: `3px solid ${insight.color}` }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${insight.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} style={{ color: insight.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-title)', marginBottom: 6 }}>{insight.title}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>{insight.body}</p>
                    <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}
                      onClick={() => window.location.href = insight.path}>
                      {insight.action} →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Forecast Tab ─────────────────────────────────────────────── */}
      {activeTab === 'forecast' && (
        <div className="card">
          <div className="card-title">
            <span className="flex items-center gap-2"><Sparkles size={16} style={{ color: '#38BDF8' }} /> AI Revenue Forecast — Next 3 Months</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
            {[
              { month: 'July 2026', forecast: 358000, confidence: 92, trend: 'up' },
              { month: 'August 2026', forecast: 382000, confidence: 87, trend: 'up' },
              { month: 'September 2026', forecast: 410000, confidence: 79, trend: 'up' },
            ].map(f => (
              <div key={f.month} className="finance-metric-mini" style={{ border: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>{f.month}</p>
                <p style={{ fontSize: 24, fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-display)' }}>{formatCurrency(f.forecast)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)' }}>
                    <div style={{ height: '100%', width: `${f.confidence}%`, background: '#10B981', borderRadius: 'var(--radius-full)' }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.confidence}% confidence</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '16px', background: 'rgba(1,253,246,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(1,253,246,0.15)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Sparkles size={16} style={{ color: '#38BDF8', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-title)', marginBottom: 6 }}>AI Forecast Methodology</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Forecasts are generated using a time-series model trained on 12 months of historical revenue, seasonal patterns, subscription lifecycle data, pipeline probability weights from the CRM, and macroeconomic signals. Confidence intervals reflect data quality and forecast horizon uncertainty.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
