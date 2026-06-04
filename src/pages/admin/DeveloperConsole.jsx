import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import { 
  KeyRound, Play, Plus, Trash2, CheckCircle, HelpCircle,
  Copy, RefreshCw, Send, ShieldAlert, Cpu, Check, AlertCircle,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import './DeveloperConsole.css';

export default function DeveloperConsole() {
  // Scoped API Tokens state
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('crm_dev_tokens');
    return saved ? JSON.parse(saved) : [
      { id: 'tok-1', name: 'Zapier Lead Router', token: 'sk_live_tp_612ba8f87b8f9e61', scopes: ['crm.read', 'crm.write'], created: '2026-05-12' },
      { id: 'tok-2', name: 'Slack Announcement Webhook', token: 'sk_live_tp_88ab4d12c19a84d2', scopes: ['marketing.dispatch'], created: '2026-05-18' }
    ];
  });

  // Integrations state
  const [integrations, setIntegrations] = useState([
    { id: 'int-slack', name: 'Slack Workspace', desc: 'Sync announcements, lead creations, and critical support SLA alerts in channels.', status: 'connected', latency: '42ms', syncs: '1,280 / day' },
    { id: 'int-zapier', name: 'Zapier Hub', desc: 'Trigger complex cross-department logic across 5,000+ external business utilities.', status: 'connected', latency: '98ms', syncs: '424 / day' },
    { id: 'int-stripe', name: 'Stripe Ledger', desc: 'Handle invoice synchronization, transaction payment matching, and subscription logs.', status: 'connected', latency: '12ms', syncs: '95 / day' },
    { id: 'int-zoom', name: 'Zoom Meetings', desc: 'Auto-provision video meeting links, calendar synchronizations, and AI transcript analysis.', status: 'disconnected', latency: 'N/A', syncs: '0 / day' },
    { id: 'int-github', name: 'GitHub Developer', desc: 'Link repository pull requests, active issue commits, and project sprint ticket details.', status: 'disconnected', latency: 'N/A', syncs: '0 / day' }
  ]);

  // Webhooks state
  const [webhooks, setWebhooks] = useState([
    { id: 'wh-1', target: 'https://api.zapier.com/hooks/catch/91a2bc', trigger: 'lead.created', status: 'active', runs: 124 },
    { id: 'wh-2', target: 'https://hooks.slack.com/services/T0123/B0456', trigger: 'ticket.escalated', status: 'active', runs: 42 }
  ]);

  // Form states
  const [newTokenName, setNewTokenName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState(['crm.read']);
  const [copiedTokenId, setCopiedTokenId] = useState(null);

  // Sync token saving
  useEffect(() => {
    localStorage.setItem('crm_dev_tokens', JSON.stringify(tokens));
  }, [tokens]);

  const handleGenerateToken = (e) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;

    const randomHex = Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const createdToken = {
      id: 'tok_' + Date.now(),
      name: newTokenName,
      token: `sk_live_tp_${randomHex}`,
      scopes: [...selectedScopes],
      created: new Date().toISOString().split('T')[0]
    };

    setTokens(prev => [createdToken, ...prev]);
    setNewTokenName('');
    setSelectedScopes(['crm.read']);
    alert('🔑 [API Access Token Provisioned] - Scoped authorization key compiled successfully. Ensure to save this securely under SOC2 policies.');
  };

  const handleDeleteToken = (id) => {
    if (window.confirm("Are you sure you want to revoke this API access token? All linked external connections will immediately fail.")) {
      setTokens(prev => prev.filter(tok => tok.id !== id));
    }
  };

  const handleCopy = (id, str) => {
    navigator.clipboard.writeText(str);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 1500);
  };

  const toggleIntegration = (id) => {
    setIntegrations(prev => prev.map(int => {
      if (int.id === id) {
        const nextStatus = int.status === 'connected' ? 'disconnected' : 'connected';
        return {
          ...int,
          status: nextStatus,
          latency: nextStatus === 'connected' ? '28ms' : 'N/A',
          syncs: nextStatus === 'connected' ? '12 / day' : '0 / day'
        };
      }
      return int;
    }));
  };

  return (
    <PageContainer className="developer-console-page">
      <PageHeader 
        title="Developer API & Integrations"
        subtitle="Manage secure authorization tokens, visual webhooks subscriptions, and access pre-integrated third-party market connectors"
        icon={<KeyRound className="text-[#01FDF6]" />}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-grow min-h-0">
        
        {/* Panel 1: API Token generator & Active Keys list */}
        <div className="flex flex-col gap-6">
          
          {/* Key Generator Form */}
          <div className="card bg-gray-900/35 border border-gray-850 p-4 rounded-xl">
            <h4 className="text-white text-xs font-bold font-display uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <KeyRound size={14} className="text-[#01FDF6]" /> Scoped Access Tokens Creator
            </h4>
            
            <form onSubmit={handleGenerateToken} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 text-xs">
                <label className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Token Identifier Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. HubSpot Sync Connection"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-850 rounded-lg text-white text-xs focus:outline-none focus:border-[#01FDF6]"
                />
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Select Key Scopes</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {['crm.read', 'crm.write', 'marketing.dispatch', 'billing.elevated', 'governance.audit'].map(sc => (
                    <button
                      type="button"
                      key={sc}
                      onClick={() => {
                        setSelectedScopes(prev => 
                          prev.includes(sc) ? prev.filter(s => s !== sc) : [...prev, sc]
                        );
                      }}
                      className={`text-[9px] px-2 py-1 rounded-full border transition-all ${selectedScopes.includes(sc) ? 'bg-[#01FDF6]/15 border-[#01FDF6]/45 text-[#01FDF6] font-bold' : 'bg-gray-950 border-gray-850 text-gray-500'}`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-[#01FDF6] hover:bg-[#00e5df] text-[#0a0f1e] text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-glow mt-1"
              >
                <Plus size={12} /> Generate Access Key
              </button>
            </form>
          </div>

          {/* Tokens List */}
          <div className="card bg-gray-900/35 border border-gray-850 p-4 rounded-xl flex-grow overflow-y-auto custom-scrollbar max-h-[300px]">
            <h4 className="text-white text-xs font-bold font-display uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-[#50fa7b]" /> Scoped Active Credentials
            </h4>
            
            <div className="flex flex-col gap-3">
              {tokens.map(tok => (
                <div key={tok.id} className="bg-gray-950/60 border border-gray-900 p-3 rounded-xl flex flex-col gap-2 relative">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h5 className="text-white text-[11px] font-bold leading-tight">{tok.name}</h5>
                      <span className="text-[9px] text-gray-500 font-mono">Issued: {tok.created}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteToken(tok.id)}
                      className="text-gray-600 hover:text-[#ff5555] transition-colors"
                      title="Revoke Token"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 bg-gray-900 px-2 py-1.5 rounded-lg border border-gray-950 font-mono text-[9px] text-gray-400">
                    <span className="truncate flex-1">{tok.token}</span>
                    <button 
                      onClick={() => handleCopy(tok.id, tok.token)}
                      className="text-gray-500 hover:text-white"
                      title="Copy Key"
                    >
                      {copiedTokenId === tok.id ? <Check size={11} className="text-[#50fa7b]" /> : <Copy size={11} />}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {tok.scopes.map(s => (
                      <span key={s} className="bg-[#bd93f9]/10 text-[#bd93f9] border border-[#bd93f9]/20 text-[8px] px-1.5 py-0.5 rounded font-mono font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 2: Integration Connectors Marketplace */}
        <div className="xl:col-span-2 flex flex-col gap-4 flex-1">
          <div className="section-title text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1">Integration Connectors Marketplace</div>
          <div className="integrations-grid grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar flex-grow max-h-[calc(100vh - 280px)] pr-1">
            {integrations.map(int => (
              <div 
                key={int.id} 
                className={`integration-card premium-card border-l-4 p-4 rounded-xl flex flex-col relative overflow-hidden bg-gray-900/35 border ${int.status === 'disconnected' ? 'opacity-55 border-gray-850' : 'border-[#01FDF6]/45 bg-gray-900/60'}`}
                style={{ borderLeftColor: int.status === 'connected' ? '#01FDF6' : 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div>
                    <h4 className="text-white text-xs font-bold font-display leading-tight">{int.name}</h4>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-sans font-bold">Standard Endpoint Connection</span>
                  </div>
                  <button 
                    onClick={() => toggleIntegration(int.id)}
                    className="cursor-pointer text-gray-600 hover:text-white transition-colors"
                    style={{ color: int.status === 'connected' ? '#01FDF6' : 'var(--text-muted)' }}
                  >
                    {int.status === 'connected' ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>

                <p className="text-gray-400 text-[11px] leading-snug mb-3 flex-grow min-h-[34px]">{int.desc}</p>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-gray-950 pt-2.5 mt-2">
                  <div className="flex flex-col font-mono text-[9px] text-gray-400">
                    <span className="text-gray-600 uppercase font-semibold text-[8px]">API Sync Rate</span>
                    <span>{int.syncs}</span>
                  </div>
                  <div className="flex flex-col text-right font-mono text-[9px] text-gray-400">
                    <span className="text-gray-600 uppercase font-semibold text-[8px]">Dispatch Latency</span>
                    <span style={{ color: int.status === 'connected' ? '#50fa7b' : 'var(--text-muted)' }}>{int.latency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
