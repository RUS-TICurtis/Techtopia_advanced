import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, Bot, Zap, BarChart3, Users, FileText } from 'lucide-react';
import './AiAssistant.css';

const QUICK_PROMPTS = [
  'Summarize my pipeline performance',
  'Which leads need follow-up this week?',
  'Draft a follow-up email for a cold lead',
  'What contracts are expiring soon?',
  'Show my top clients by revenue',
  'Generate a sales forecast summary',
];

const AI_SUMMARIES = [
  { icon: BarChart3, title: 'Pipeline Health', color: 'var(--brand-cyan)',    text: 'Your pipeline is currently empty. Add leads to get AI-powered insights.' },
  { icon: Users,     title: 'Client Activity', color: 'var(--brand-purple)',  text: 'No client activity yet. Start adding clients to track engagement.' },
  { icon: FileText,  title: 'Contract Status', color: 'var(--brand-green)',   text: 'No contracts found. Create contracts to monitor signing status.' },
];

const WELCOME = {
  role: 'assistant',
  content: "Hello! I'm your Techtopia AI Assistant. I can help you analyze your CRM data, draft emails, summarize pipeline performance, and much more. What would you like to know?"
};

export default function AiAssistant() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]       = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef               = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Simulated AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've received your query: "${userMsg}". As your CRM data grows, I'll be able to provide detailed insights and recommendations. For now, try adding some leads, clients, or deals to get started!`
      }]);
    }, 1200);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="page-container ai-assistant-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Assistant</h1>
          <p className="page-subtitle">Your intelligent CRM companion powered by AI</p>
        </div>
      </div>

      <div className="ai-layout">
        {/* Left panel */}
        <div className="ai-left-panel">
          {/* Summaries */}
          <div className="card ai-summaries-card">
            <div className="card-title" style={{ fontSize: 13, letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
              AI SUMMARIES
            </div>
            <div className="ai-summaries-list">
              {AI_SUMMARIES.map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="ai-summary-item">
                    <div className="ai-summary-icon" style={{ background: `${s.color}22`, color: s.color }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="ai-summary-title">{s.title}</div>
                      <div className="ai-summary-text">{s.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick prompts */}
          <div className="card ai-prompts-card">
            <div className="card-title" style={{ fontSize: 13, letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
              QUICK PROMPTS
            </div>
            <div className="ai-prompts-list">
              {QUICK_PROMPTS.map(p => (
                <button key={p} className="ai-prompt-btn" onClick={() => sendMessage(p)}>
                  <Zap size={13} />
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <div className="card ai-chat-card">
          <div className="ai-chat-header">
            <div className="ai-chat-avatar"><Sparkles size={18} /></div>
            <div>
              <div className="ai-chat-name">Techtopia AI</div>
              <div className="ai-chat-status"><span className="ai-online-dot" />Online</div>
            </div>
          </div>

          <div className="ai-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-message ${m.role}`}>
                <div className="ai-message-avatar">
                  {m.role === 'assistant' ? <Sparkles size={14} /> : <User size={14} />}
                </div>
                <div className="ai-message-bubble">{m.content}</div>
              </div>
            ))}
            {isTyping && (
              <div className="ai-message assistant">
                <div className="ai-message-avatar"><Sparkles size={14} /></div>
                <div className="ai-message-bubble ai-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="ai-input-row">
            <textarea
              className="ai-input"
              placeholder="Ask me anything about your CRM data..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button
              className="btn btn-primary ai-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
