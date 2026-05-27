import React, { useState, useEffect } from 'react';
import { mockApi } from '../lib/mockApi';
import { ToggleLeft, ToggleRight, Sparkles, Plus, Zap } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import './Automations.css';

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('Lead Created');
  const [newCondition, setNewCondition] = useState('');
  const [newAction, setNewAction] = useState('');

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const res = await mockApi.getAutomations();
      setAutomations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleToggle = async (id) => {
    try {
      const updated = await mockApi.toggleAutomation(id);
      if (updated) {
        setAutomations(prev => prev.map(a => a.id === id ? updated : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName || !newAction) return;
    try {
      const added = await mockApi.addAutomation({
        name: newName,
        trigger: newTrigger,
        condition: newCondition || 'None (Always run)',
        action: newAction,
      });
      if (added) {
        setAutomations(prev => [...prev, added]);
        setShowAddModal(false);
        // Reset form
        setNewName('');
        setNewTrigger('Lead Created');
        setNewCondition('');
        setNewAction('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container automations-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Sparkles className="text-[#01FDF6]" />
            Workflow Automations
          </h1>
          <p className="page-subtitle">
            Build AI-triggered workflows, auto-assign rules, and notification handlers.
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Automation
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-xl" style={{ borderRadius: 'var(--radius-xl)' }}></div>
          ))}
        </div>
      ) : automations.length === 0 ? (
        <div className="empty-state card">
          <Zap size={48} className="empty-icon" />
          <h3>No active workflow automations</h3>
          <p>Create your first custom trigger workflow to initialize rules.</p>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> Create Automation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map((a) => (
            <div key={a.id} className={`card automation-card ${a.active ? 'active' : ''}`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="automation-icon-wrapper" style={{ color: 'var(--brand-cyan)', background: 'rgba(1, 253, 246, 0.1)' }}>
                    <Zap size={20} />
                  </div>
                  <button onClick={() => handleToggle(a.id)} className="btn-icon" style={{ padding: 0 }}>
                    {a.active ? (
                      <ToggleRight size={32} className="text-[#21FA90]" style={{ color: 'var(--brand-green)' }} />
                    ) : (
                      <ToggleLeft size={32} style={{ color: 'var(--text-light)' }} />
                    )}
                  </button>
                </div>
                <h3 className="automation-title mb-2">{a.name}</h3>
                
                <div className="automation-fields-stack mt-4">
                  <div className="automation-field-box">
                    <span className="automation-field-label">Trigger</span>
                    <span className="automation-field-val font-semibold">{a.trigger}</span>
                  </div>
                  <div className="automation-field-box">
                    <span className="automation-field-label">Condition</span>
                    <span className="automation-field-val italic" style={{ color: 'var(--text-muted)' }}>{a.condition}</span>
                  </div>
                  <div className="automation-field-box">
                    <span className="automation-field-label">Action</span>
                    <span className="automation-field-val" style={{ color: 'var(--brand-cyan)', fontWeight: 700 }}>{a.action}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Automation Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Automation"
        size="md"
      >
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Automation Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Assign Inbound Tech Leads"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trigger Event</label>
            <select
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              className="form-input"
            >
              <option value="Lead Created">Lead Created</option>
              <option value="Deal Closed (Won)">Deal Closed (Won)</option>
              <option value="Ticket Open">Support Ticket Opened</option>
              <option value="Invoice Overdue">Invoice Overdue</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Condition Rule (optional)</label>
            <input
              type="text"
              placeholder="e.g. Value > 50000"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Action to Execute *</label>
            <input
              type="text"
              required
              placeholder="e.g. Email Curtis Miller & Ping Slack"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="modal-footer mt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Automation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
