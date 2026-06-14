import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, X, Send, Play, Check, Trash2, Command, 
  HelpCircle, ChevronUp, AlertCircle, ShieldAlert, Cpu
} from 'lucide-react';
import './AICopilot.css';

export default function AICopilot() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Greetings. I am the Techtopia OS Neural Orchestrator. I monitor your active workspace viewport and can draft communications, analyze operational risk, audit security settings, or orchestrate visual automations. What shall we achieve today?",
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'approvals' | 'prompts'
  const messagesEndRef = useRef(null);

  // Approval Queue State (Persistent mock in localStorage)
  const [approvals, setApprovals] = useState(() => {
    const saved = localStorage.getItem('crm_ai_approvals');
    return saved ? JSON.parse(saved) : [];
  });

  // Save approvals
  useEffect(() => {
    localStorage.setItem('crm_ai_approvals', JSON.stringify(approvals));
  }, [approvals]);

  // Global Keyboard listener for Alt+A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate specialized agent response
    setTimeout(() => {
      let replyText = "Understood. Analyzing current workspace context and routing this request to specialized agents...";
      
      const query = textToSend.toLowerCase();
      if (query.includes('risk') || query.includes('pipeline') || query.includes('deal')) {
        replyText = "🌐 [Sales Agent Active] - I have performed a deal risk assessment on your Sales Pipeline. CloudScale Inc is flagged as High Win Probability (85%), while Roma Tech is flagged as extreme Churn Risk due to unpaid invoices. I have drafted an Overdue Collection Notice in your AI Approvals queue.";
      } else if (query.includes('onboard') || query.includes('hire') || query.includes('employee')) {
        replyText = "👥 [HR Agent Active] - I have queued the onboarding sequence standard block. An automation trigger invitation has been constructed for the incoming Sales Lead. Please approve the task list in the Approvals queue to execute.";
      } else if (query.includes('audit') || query.includes('security') || query.includes('tenant')) {
        replyText = "🛡️ [Admin Agent Active] - Performed a standard systems threat audit. System status is NOMINAL. 0 inactive users detected. MFA is fully enforced for admin/finance roles. Access compliance score stands at 98/100.";
      } else if (query.includes('automation') || query.includes('workflow')) {
        replyText = "⚙️ [Workflow Agent Active] - Webhook trigger and Conditional Branching structures mapped successfully. I can seed the Onboard New Employee and SLA Breach Escalation templates into your visual builder instantly.";
      } else if (query.includes('clear') || query.includes('reset')) {
        replyText = "🧹 [Cleanup Agent Active] - I have cleared the conversational buffer. Neural parameters synchronized.";
        setMessages([messages[0]]);
        setIsTyping(false);
        return;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const executeApproval = (id) => {
    setApprovals(prev => prev.map(app => app.id === id ? { ...app, status: 'approved' } : app));
    
    // Add success message
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'ai',
      text: `✅ [Neural Approval Dispatched] - Successfully validated claims and dispatched transaction payload to target channels. Logged under compliance token: SECURE-AUDIT-${Math.floor(Math.random()*90000+10000)}.`,
      time: 'Just now'
    }]);
  };

  const rejectApproval = (id) => {
    setApprovals(prev => prev.map(app => app.id === id ? { ...app, status: 'rejected' } : app));
  };

  // Get Page Contextual Prompts
  const getContextualPrompts = () => {
    const path = location.pathname;
    if (path === '/') {
      return [
        "Perform general system threat audit",
        "Generate operations executive summary",
        "Escalate pending support ticket anomalies"
      ];
    } else if (path === '/pipeline') {
      return [
        "Analyze high-risk deal probabilities",
        "Draft bulk proposal collection templates",
        "Trigger Sales sequences sequence for Leads"
      ];
    } else if (path === '/automations') {
      return [
        "Seed SLA Breach template block",
        "Generate SOC2 compliance automation",
        "Trigger dry-run testing on all webhooks"
      ];
    } else if (path === '/admin/oversight') {
      return [
        "Revoke suspended tenant sessions",
        "Audit storage quotas and compliance logs",
        "Trigger platform security diagnostic scan"
      ];
    } else {
      return [
        "Summarize current workspace statistics",
        "Ask specialized AI agents to suggest actions",
        "Perform automated operational cleanup"
      ];
    }
  };

  const activePrompts = getContextualPrompts();

  return (
    <>
      {/* Floating launcher launcher launcher button */}
      <button 
        className={`ai-copilot-launcher ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Neural Copilot (Alt+A)"
      >
        <div className="glow-ring"></div>
        <Sparkles size={22} className="text-[#38BDF8]" />
        <span className="tooltip-hint">Alt+A</span>
      </button>

      {/* Floating Copilot Console Sidebar Panel */}
      {isOpen && (
        <div className="ai-copilot-console">
          {/* Header */}
          <div className="copilot-header">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-[#38BDF8] animate-pulse" />
              <div>
                <h3 className="text-white text-sm font-bold font-display tracking-wide">NEURAL COPILOT</h3>
                <span className="text-[9px] text-[#38BDF8]/70 font-semibold font-mono uppercase tracking-wider block">TECHTOPIA OS v2.0</span>
              </div>
            </div>
            <button 
              className="text-gray-500 hover:text-white p-1 hover:bg-gray-800/40 rounded-lg transition-all"
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="copilot-tabs flex border-b border-gray-850 bg-gray-950/45 text-[10px] font-bold uppercase tracking-wider">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 text-center py-2.5 transition-colors ${activeTab === 'chat' ? 'text-[#38BDF8] border-b-2 border-[#38BDF8] bg-gray-900/30' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Command Chat
            </button>
            <button 
              onClick={() => setActiveTab('approvals')}
              className={`flex-1 text-center py-2.5 transition-colors relative ${activeTab === 'approvals' ? 'text-[#38BDF8] border-b-2 border-[#38BDF8] bg-gray-900/30' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Approvals Queue
              {approvals.filter(a => a.status === 'pending').length > 0 && (
                <span className="badge-dot absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444]"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('prompts')}
              className={`flex-1 text-center py-2.5 transition-colors ${activeTab === 'prompts' ? 'text-[#38BDF8] border-b-2 border-[#38BDF8] bg-gray-900/30' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Page Context
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="copilot-body flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3">
            {activeTab === 'chat' && (
              <>
                {/* Message Threads */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
                  {messages.map(msg => (
                    <div key={msg.id} className={`message-bubble ${msg.sender === 'ai' ? 'ai-bubble' : 'user-bubble'}`}>
                      <div className="bubble-content text-xs leading-relaxed font-sans">
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-600 block mt-1 font-mono">{msg.time}</span>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="message-bubble ai-bubble flex items-center gap-1 py-3 px-4">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Footer */}
                <div className="copilot-input-area mt-auto pt-2 border-t border-gray-900 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type executive command... (Ctrl+Enter)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleSend();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-gray-950/80 border border-gray-850 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#38BDF8]/50 transition-all font-sans"
                  />
                  <button 
                    onClick={() => handleSend()}
                    className="p-2 bg-[#38BDF8] hover:bg-[#2563EB] text-[#0F172A] rounded-lg transition-all flex items-center justify-center"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </>
            )}

            {activeTab === 'approvals' && (
              <div className="approvals-list-panel flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 border-b border-gray-900 pb-2">
                  <AlertCircle size={14} className="text-[#38BDF8]" />
                  <span>HR & Financial authorizations require strict supervision.</span>
                </div>

                {approvals.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 text-xs">
                    No pending approval records. Good job!
                  </div>
                ) : (
                  approvals.map(app => (
                    <div key={app.id} className={`approval-card bg-gray-900/35 border border-gray-850 p-3 rounded-xl transition-all duration-200 ${app.status !== 'pending' ? 'opacity-45' : ''}`}>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${app.type === 'finance' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' : 'bg-[#EF4444]/15 text-[#EF4444]'}`}>
                          {app.agent}
                        </span>
                        {app.status === 'approved' && <span className="text-[10px] text-[#10B981] font-semibold">DISPATCHED</span>}
                        {app.status === 'rejected' && <span className="text-[10px] text-[#EF4444] font-semibold">REJECTED</span>}
                      </div>
                      
                      <h4 className="text-white text-xs font-bold leading-tight mb-1">{app.title}</h4>
                      <p className="text-gray-500 text-[11px] leading-snug mb-2">{app.description}</p>
                      
                      {app.status === 'pending' && (
                        <>
                          <div className="details-preview bg-gray-950/70 border border-gray-900 p-2.5 rounded-lg font-mono text-[10px] text-gray-400 whitespace-pre-line mb-3 leading-relaxed">
                            {app.details}
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => rejectApproval(app.id)}
                              className="flex-1 py-1.5 bg-red-950/30 hover:bg-red-950/50 border border-red-900/40 text-red-400 hover:text-red-300 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                            >
                              <Trash2 size={10} /> REJECT
                            </button>
                            <button 
                              onClick={() => executeApproval(app.id)}
                              className="flex-1 py-1.5 bg-[#38BDF8] hover:bg-[#2563EB] text-[#0F172A] text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-glow"
                            >
                              <Check size={10} /> DISPATCH
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'prompts' && (
              <div className="contextual-prompts-panel flex flex-col gap-2">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Command size={10} className="text-[#38BDF8]" /> Path: {location.pathname}
                </div>
                {activePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    className="w-full text-left px-3 py-2.5 bg-gray-900/45 hover:bg-gray-850 border border-gray-850 hover:border-[#38BDF8]/40 text-gray-300 hover:text-[#38BDF8] text-xs font-semibold rounded-xl transition-all flex items-center justify-between"
                  >
                    <span>{p}</span>
                    <Sparkles size={11} className="text-gray-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
