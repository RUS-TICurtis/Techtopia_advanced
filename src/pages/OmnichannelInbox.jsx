import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import { 
  Mail, MessageSquare, Send, Sparkles, AlertCircle, 
  Smile, Frown, CheckCircle, RefreshCw, Smartphone, 
  Search, ExternalLink, HelpCircle
} from 'lucide-react';
import './OmnichannelInbox.css';

export default function OmnichannelInbox() {
  const [channels, setChannels] = useState([
    { id: 'ch-all', label: 'All Messages', icon: MessageSquare, count: 3 },
    { id: 'ch-gmail', label: 'Gmail / Google Workspace', icon: Mail, count: 1 },
    { id: 'ch-whatsapp', label: 'WhatsApp Business', icon: Smartphone, count: 1 },
    { id: 'ch-outlook', label: 'Microsoft Outlook', icon: Mail, count: 1 }
  ]);

  const [activeChannel, setActiveChannel] = useState('ch-all');
  const [threads, setThreads] = useState([
    {
      id: 'th-1',
      name: 'Bob Miller',
      source: 'whatsapp',
      avatar: 'B',
      lastMessage: 'Urgent: Can we reschedule the demo? The system is freezing on load.',
      time: '12 mins ago',
      unread: true,
      sentiment: 'urgent', // urgent (red), positive (green), neutral (blue)
      history: [
        { sender: 'user', text: "Hello Curtis, we have run into some deployment challenges. The dashboard is stalling.", time: "10:15 AM" },
        { sender: 'ai', text: "Automated triage: Identifying active session logs. Please specify if you see a 401 token exception.", time: "10:16 AM" },
        { sender: 'user', text: "Urgent: Can we reschedule the demo? The system is freezing on load.", time: "10:20 AM" }
      ],
      aiDraft: "Dear Bob,\n\nI apologize for the delay. Our engineering team has checked the core logs and resolved the caching latency you encountered. I have rescheduled our technical discovery session for tomorrow at 2 PM CST. Please let me know if that works.\n\nBest,\nCurtis (AI Assisted)"
    },
    {
      id: 'th-2',
      name: 'Alice Vance',
      source: 'gmail',
      avatar: 'A',
      lastMessage: 'Yes, the SOC2 details look good. Send the contract.',
      time: '1 hour ago',
      unread: false,
      sentiment: 'positive',
      history: [
        { sender: 'user', text: "Hi Curtis, did you send the updated SOC2 compliance blueprints?", time: "09:00 AM" },
        { sender: 'staff', text: "Yes Alice, sent it over. Let me know if you need our security logs.", time: "09:12 AM" },
        { sender: 'user', text: "Yes, the SOC2 details look good. Send the contract.", time: "09:42 AM" }
      ],
      aiDraft: "Hi Alice,\n\nFantastic to hear! I have prepared the Enterprise OS Agreement via DocuSign and queued it for signature in your Client Portal under 'Signatures'. Please let me know if you have any questions.\n\nBest,\nCurtis"
    },
    {
      id: 'th-3',
      name: 'Catherine Song',
      source: 'outlook',
      avatar: 'C',
      lastMessage: 'SLA Proposal received. We will review it in our executive sync next week.',
      time: '4 hours ago',
      unread: false,
      sentiment: 'neutral',
      history: [
        { sender: 'staff', text: "SLA Draft proposal sent for our AI sorting genomics sorting API.", time: "Yesterday" },
        { sender: 'user', text: "SLA Proposal received. We will review it in our executive sync next week.", time: "14:15 PM" }
      ],
      aiDraft: "Hi Catherine,\n\nUnderstood. Please let us know if your executive team needs any technical summaries of the API limits or custom throughput rates. Looking forward to syncing next week.\n\nBest,\nCurtis"
    }
  ]);

  const [activeThread, setActiveThread] = useState(threads[0]);
  const [replyInput, setReplyInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectThread = (thread) => {
    setActiveThread(thread);
    // Mark as read
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: false } : t));
  };

  const handleApplyDraft = () => {
    if (activeThread?.aiDraft) {
      setReplyInput(activeThread.aiDraft);
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    const newMsg = {
      sender: 'staff',
      text: replyInput,
      time: 'Just now'
    };

    // Update thread history
    const updatedThreads = threads.map(t => {
      if (t.id === activeThread.id) {
        const nextHist = [...t.history, newMsg];
        const nextThread = {
          ...t,
          lastMessage: replyInput,
          time: 'Just now',
          history: nextHist
        };
        // Also update the active selected thread view
        if (activeThread.id === t.id) {
          setTimeout(() => setActiveThread(nextThread), 0);
        }
        return nextThread;
      }
      return t;
    });

    setThreads(updatedThreads);
    setReplyInput('');
  };

  const handleSyncChannels = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Filter threads based on active channel
  const filteredThreads = threads.filter(t => {
    if (activeChannel === 'ch-all') return true;
    if (activeChannel === 'ch-gmail' && t.source === 'gmail') return true;
    if (activeChannel === 'ch-whatsapp' && t.source === 'whatsapp') return true;
    if (activeChannel === 'ch-outlook' && t.source === 'outlook') return true;
    return false;
  });

  return (
    <PageContainer className="omnichannel-inbox-page">
      <PageHeader 
        title="Shared Omnichannel Inbox"
        subtitle="Consolidate Gmail, Microsoft Outlook, WhatsApp, and SMS discussions under a unified AI-monitored dashboard"
        icon={<MessageSquare className="text-[#a6e22e]" />}
        actions={
          <button 
            onClick={handleSyncChannels}
            className={`btn btn-secondary flex items-center gap-1.5 ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={14} /> Refresh Streams
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow min-h-0">
        
        {/* Panel 1: Channels sidebar */}
        <div className="flex flex-col gap-3">
          <div className="section-title text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1">Channels & Integrations</div>
          <div className="channels-group flex flex-col gap-2">
            {channels.map(ch => {
              const Icon = ch.icon;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl border flex items-center justify-between transition-all ${activeChannel === ch.id ? 'bg-[#a6e22e]/10 border-[#a6e22e]/45 text-[#a6e22e]' : 'bg-gray-900/35 border-gray-850 hover:border-gray-800 text-gray-400 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Icon size={14} />
                    <span>{ch.label}</span>
                  </div>
                  <Badge variant={activeChannel === ch.id ? 'success' : 'neutral'}>{ch.count}</Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Threads list */}
        <div className="flex flex-col gap-3 lg:col-span-1">
          <div className="section-title text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1">Incoming Message Streams</div>
          <div className="threads-list flex flex-col gap-2.5 overflow-y-auto custom-scrollbar max-h-[calc(100vh - 280px)] pr-1">
            {filteredThreads.map(th => (
              <div
                key={th.id}
                onClick={() => selectThread(th)}
                className={`thread-card bg-gray-900/35 border p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${activeThread?.id === th.id ? 'active-thread border-[#a6e22e]/65 bg-gray-900/60' : 'border-gray-850 hover:border-gray-800'}`}
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="thread-avatar text-xs bg-gray-800/80 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center border border-gray-700">
                      {th.avatar}
                    </span>
                    <h4 className="text-white text-xs font-bold font-display truncate max-w-[100px]">{th.name}</h4>
                  </div>
                  
                  {/* Sentiment dot indicator indicator indicator */}
                  <span className={`inline-block w-2 h-2 rounded-full ${th.sentiment === 'urgent' ? 'bg-[#ff5555] shadow-red' : th.sentiment === 'positive' ? 'bg-[#50fa7b] shadow-green' : 'bg-[#8be9fd] shadow-cyan'}`} title={`Sentiment: ${th.sentiment}`} />
                </div>
                
                <p className="text-gray-500 text-[11px] leading-snug truncate">{th.lastMessage}</p>
                <div className="text-[9px] text-gray-600 font-mono mt-2 text-right">{th.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: Chat Timeline & AI Co-Drafter Panel */}
        <div className="lg:col-span-2 flex flex-col md:flex-row gap-4 min-h-[400px]">
          
          {/* Chat Timeline (center) */}
          <div className="flex-grow flex flex-col bg-gray-950/40 border border-gray-850 rounded-xl overflow-hidden min-w-0">
            {activeThread ? (
              <>
                <div className="p-3.5 border-b border-gray-850 bg-gray-950/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#a6e22e] font-bold text-xs uppercase tracking-widest">{activeThread.source} Stream</span>
                    <span className="text-gray-500 text-[10px]">/</span>
                    <span className="text-white font-semibold text-xs">{activeThread.name}</span>
                  </div>
                  
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${activeThread.sentiment === 'urgent' ? 'bg-[#ff5555]/15 text-[#ff5555]' : activeThread.sentiment === 'positive' ? 'bg-[#50fa7b]/15 text-[#50fa7b]' : 'bg-[#8be9fd]/15 text-[#8be9fd]'}`}>
                    {activeThread.sentiment} Sentiment
                  </span>
                </div>

                {/* Timeline */}
                <div className="chat-history-panel flex-grow overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3">
                  {activeThread.history.map((msg, idx) => (
                    <div key={idx} className={`message-bubble ${msg.sender === 'user' ? 'ai-bubble' : 'user-bubble'}`}>
                      <div className="bubble-content text-xs leading-relaxed font-sans">
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-600 block mt-1 font-mono">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Send Input */}
                <form onSubmit={handleSendReply} className="p-3.5 border-t border-gray-900 bg-gray-950/20 flex gap-2">
                  <input 
                    type="text" 
                    placeholder={`Reply to ${activeThread.name}...`}
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-950 border border-gray-850 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#a6e22e]/50 transition-all font-sans"
                  />
                  <button 
                    type="submit"
                    className="p-2 bg-[#a6e22e] hover:bg-[#92d020] text-[#0a0f1e] rounded-lg transition-all flex items-center justify-center"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-20 flex-grow gap-2">
                <MessageSquare size={30} className="text-gray-700" />
                <h4 className="text-white text-xs font-bold">Select a conversation thread</h4>
              </div>
            )}
          </div>

          {/* Embedded AI Co-Drafter Panel (right sidebar) */}
          {activeThread && (
            <div className="co-drafter-panel w-full md:w-60 bg-gray-900/35 border border-gray-850 p-4 rounded-xl flex flex-col gap-3">
              <h4 className="text-white text-xs font-bold font-display uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#01FDF6]" /> AI Co-Drafter
              </h4>
              
              <p className="text-gray-500 text-[10px] leading-relaxed">
                The personnel neural agent drafted an immediate solution response based on thread parameters:
              </p>

              <div className="draft-preview bg-gray-950/60 border border-gray-900 p-2.5 rounded-lg font-mono text-[9px] text-gray-400 whitespace-pre-line leading-relaxed flex-grow overflow-y-auto custom-scrollbar">
                {activeThread.aiDraft}
              </div>

              <button 
                onClick={handleApplyDraft}
                className="w-full py-2 bg-[#01FDF6] hover:bg-[#00e5df] text-[#0a0f1e] text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-glow"
              >
                Apply AI Draft
              </button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
