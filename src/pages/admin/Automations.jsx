import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { 
  Play, Plus, ArrowRight, Settings, Info, CheckCircle2, 
  Trash2, ShieldCheck, Zap, ToggleLeft, ToggleRight,
  TrendingUp, Clock, AlertTriangle, ShieldAlert, X
} from 'lucide-react';
import './Automations.css';

export default function Automations() {
  const [templates] = useState([
    {
      id: 'flow-1',
      name: 'Onboard New Employee Workspace',
      description: 'Automatically provisions checklists, calendars, and AI-led welcoming dispatches for new staff hires.',
      trigger: 'employee.onboarded',
      condition: 'Role == "Sales" OR Role == "Finance"',
      actions: ['Provision workspace account', 'Draft AI Welcoming Email', 'Post announcement to Slack webhook'],
      active: true,
      executions: 124,
    },
    {
      id: 'flow-2',
      name: 'SLA Breach High-Risk Escalation',
      description: 'Flags and escalates customer support tickets that violate standard response time clauses.',
      trigger: 'ticket.unresolved',
      condition: 'Time Open > 2 Hours AND Priority == "High"',
      actions: ['Elevate priority to CRITICAL', 'Generate AI incident summary', 'SMS Dispatch to Support Team Lead'],
      active: true,
      executions: 48,
    },
    {
      id: 'flow-3',
      name: 'High-Value Opportunity Alert Room',
      description: 'Instantiates custom deal spaces and alerts super administrators when enterprise contracts are created.',
      trigger: 'deal.created',
      condition: 'Deal Value > $50,000',
      actions: ['Provision dedicated Deal Room', 'Send Super Admin Pager Alert', 'Trigger AI Opportunity Risk scan'],
      active: true,
      executions: 19,
    },
    {
      id: 'flow-4',
      name: 'Unpaid Collections Automation',
      description: 'Initiates collection warnings, drafts follow-up demands, and revokes license rights for overdue entities.',
      trigger: 'invoice.overdue',
      condition: 'Days Overdue > 10 Days',
      actions: ['Append alert to Client Portal', 'Queue Finance Agent draft (Approval Required)', 'Flag subscription as Restricted'],
      active: false,
      executions: 82,
    }
  ]);

  const [activeFlow, setActiveFlow] = useState(null);
  const [simulatedExecutions, setSimulatedExecutions] = useState(0);

  const handleTestFlow = (flowName) => {
    setSimulatedExecutions(prev => prev + 1);
    alert(`âš™ï¸ [Simulation Triggered] - Simulated dry-run event for "${flowName}". Successfully evaluated conditional branches and executed action chains.`);
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBlueprint, setNewBlueprint] = useState({ name: '', trigger: '', description: '' });

  const handleCreateBlueprint = (e) => {
    e.preventDefault();
    alert(`Provisioning Blueprint: ${newBlueprint.name}`);
    setShowCreateModal(false);
  };

  return (
    <>
      <PageContainer className="automations-page">
      <PageHeader 
        title="Visual Workflow Builder"
        subtitle="Design and dispatch automated systems, conditional action branches, and multi-agent approval dispatches"
        icon={<Zap className="text-[#38BDF8]" />}
        actions={
          <button className="btn btn-primary shadow-glow flex items-center gap-1.5" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> New Workflow
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Side: Pre-seeded Templates List */}
        <div className="flex flex-col gap-4">
          <div className="section-title text-sm text-gray-500 font-bold uppercase tracking-wider px-1">Seeded Enterprise Blueprint Templates</div>
          <div className="templates-list-panel flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-grow max-h-[calc(100vh - 280px)] pr-1">
            {templates.map(flow => (
              <div 
                key={flow.id} 
                className={`flow-template-card card bg-gray-900/35 border p-4 rounded-xl cursor-pointer transition-all duration-200 ${activeFlow?.id === flow.id ? 'active-border border-[#38BDF8]/60 bg-gray-900/60' : 'border-gray-850 hover:border-[#38BDF8]/30'}`}
                onClick={() => setActiveFlow(flow)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className={flow.active ? 'text-[#38BDF8]' : 'text-gray-500'} />
                    <h4 className="text-white text-xs font-bold font-display truncate max-w-[200px]">{flow.name}</h4>
                  </div>
                  <Badge variant={flow.active ? 'success' : 'neutral'}>{flow.active ? 'Active' : 'Hibernating'}</Badge>
                </div>
                
                <p className="text-gray-400 text-[11px] leading-snug mb-3 min-h-[30px]">{flow.description}</p>
                
                <div className="flex justify-between items-center text-[10px] border-t border-gray-950 pt-2.5 mt-2">
                  <span className="text-gray-500 font-mono">Dispatches: {flow.executions} runs</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestFlow(flow.name);
                    }}
                    className="btn btn-secondary px-2.5 py-1 text-[9px] hover:text-[#38BDF8] flex items-center gap-1 border-gray-800"
                  >
                    <Play size={8} /> Dry Run
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Flow Blueprint Canvas & Details Inspector */}
        <div className="lg:col-span-2 flex flex-col gap-4 flex-1">
          <div className="section-title text-sm text-gray-500 font-bold uppercase tracking-wider px-1">Interactive Node Canvas Layout</div>
          
          <div className="blueprint-canvas-wrapper flex-grow bg-gray-950/40 border border-gray-850 rounded-xl flex flex-col relative overflow-hidden min-h-[400px]">
            {activeFlow ? (
              <div className="canvas-interactive-grid p-6 flex flex-col items-center justify-center gap-6 h-full relative overflow-y-auto">
                
                {/* Node 1: Trigger */}
                <div className="canvas-node trigger-node bg-gray-900 border border-[#38BDF8]/45 p-4 rounded-xl shadow-glow-cyan max-w-xs w-full">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] text-[#38BDF8] font-bold uppercase tracking-wider block">Trigger Block</span>
                    <Clock size={12} className="text-[#38BDF8]" />
                  </div>
                  <h4 className="text-white text-xs font-bold font-mono">{activeFlow.trigger}</h4>
                  <p className="text-gray-500 text-[10px] mt-1">Fires immediately when operational event is detected.</p>
                </div>

                <ArrowRight size={16} className="text-gray-600 rotate-90" />

                {/* Node 2: Condition */}
                <div className="canvas-node condition-node bg-gray-900 border border-[#6366F1]/45 p-4 rounded-xl shadow-glow-purple max-w-xs w-full">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] text-[#6366F1] font-bold uppercase tracking-wider block">Conditional Branch</span>
                    <Info size={12} className="text-[#6366F1]" />
                  </div>
                  <h4 className="text-white text-xs font-bold font-mono">{activeFlow.condition}</h4>
                  <p className="text-gray-500 text-[10px] mt-1">Evaluates parameters. Stops pipeline if claims return false.</p>
                </div>

                <ArrowRight size={16} className="text-gray-600 rotate-90" />

                {/* Node 3: Actions Group */}
                <div className="canvas-node actions-node bg-gray-900 border border-[#10B981]/45 p-4 rounded-xl shadow-glow-green max-w-xs w-full">
                  <span className="text-[9px] text-[#10B981] font-bold uppercase tracking-wider block mb-2">Dispatched Operations</span>
                  <div className="flex flex-col gap-2">
                    {activeFlow.actions.map((act, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-gray-950 p-2 rounded-lg border border-gray-900 text-[10px] text-gray-400 leading-snug">
                        <CheckCircle2 size={12} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dry Run / Sync Control panel inside Canvas */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => handleTestFlow(activeFlow.name)}
                    className="btn btn-primary py-1.5 px-3 text-[10px] flex items-center gap-1 shadow-glow"
                  >
                    <Play size={10} /> Dry Run
                  </button>
                  <button 
                    onClick={() => setActiveFlow(null)}
                    className="btn btn-secondary py-1.5 px-3 text-[10px] flex items-center gap-1 border-gray-800"
                  >
                    Close Canvas
                  </button>
                </div>
              </div>
            ) : (
              <div className="canvas-empty-state flex flex-col items-center justify-center text-center p-20 flex-grow gap-3">
                <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-full flex items-center justify-center">
                  <Zap size={30} className="text-gray-600" />
                </div>
                <h4 className="text-white text-xs font-bold font-display uppercase tracking-wider">Empty Automation Canvas</h4>
                <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
                  Select a workflow template folder from the sidebar blueprint panel or generate a new trigger-action node to illuminate this canvas.
                </p>
              </div>
            )}
            
            {/* Grid Background overlay in CSS */}
            <div className="grid-overlay-back"></div>
          </div>
        </div>
      </div>
    </PageContainer>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Design Workflow Blueprint</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateBlueprint} className="modal-body">
              <div className="form-group">
                <label>Blueprint Name *</label>
                <input 
                  className="form-input" 
                  required 
                  placeholder="e.g. VIP Onboarding Flow"
                  value={newBlueprint.name}
                  onChange={e => setNewBlueprint({...newBlueprint, name: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label>Operational Trigger *</label>
                <select 
                  className="form-input" 
                  required
                  value={newBlueprint.trigger}
                  onChange={e => setNewBlueprint({...newBlueprint, trigger: e.target.value})}
                >
                  <option value="">Select an event trigger...</option>
                  <option value="user.created">User Created</option>
                  <option value="deal.won">Deal Won</option>
                  <option value="ticket.high_priority">High Priority Ticket Created</option>
                  <option value="invoice.paid">Invoice Paid</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-input" 
                  rows={3}
                  placeholder="Summarize what this automation accomplishes."
                  value={newBlueprint.description}
                  onChange={e => setNewBlueprint({...newBlueprint, description: e.target.value})} 
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Initialize Node Canvas</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
