import { useState } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Trash2,
  X,
  TrendingUp,
  DollarSign,
  Target
} from 'lucide-react';
import { mockDb } from '../utils/mockDb';
import './Pipeline.css';

export default function Pipeline({ searchValue = '' }) {
  const [deals, setDeals] = useState(() => mockDb.getDeals());
  const [contacts] = useState(() => mockDb.getContacts());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('Lead');
  const [priority, setPriority] = useState('Medium');
  const [date, setDate] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');

  const stages = ['Lead', 'Qualified', 'In Progress', 'Proposal', 'Won'];

  const refreshDeals = () => setDeals(mockDb.getDeals());

  const handleDragStart = (e, dealId) => e.dataTransfer.setData('text/plain', dealId);
  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    const allDeals = mockDb.getDeals();
    const deal = allDeals.find(d => d.id === dealId);
    if (deal && deal.stage !== targetStage) {
      deal.stage = targetStage;
      mockDb.updateDeal(deal);
      
      const allContacts = mockDb.getContacts();
      const contact = allContacts.find(c => c.id === deal.contactId);
      if (contact) {
        contact.status = targetStage === 'Lead' ? 'New' : targetStage;
        mockDb.updateContact(contact);
      }
      refreshDeals();
    }
  };

  const moveDealManual = (deal, direction) => {
    const currentIdx = stages.indexOf(deal.stage);
    let nextIdx = currentIdx + direction;
    if (nextIdx >= 0 && nextIdx < stages.length) {
      const nextStage = stages[nextIdx];
      deal.stage = nextStage;
      mockDb.updateDeal(deal);

      const allContacts = mockDb.getContacts();
      const contact = allContacts.find(c => c.id === deal.contactId);
      if (contact) {
        contact.status = nextStage === 'Lead' ? 'New' : nextStage;
        mockDb.updateContact(contact);
      }
      refreshDeals();
    }
  };

  const handleDeleteDeal = (id) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      mockDb.deleteDeal(id);
      refreshDeals();
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    let finalCompany = company;
    if (selectedContactId) {
      const contact = contacts.find(c => c.id === selectedContactId);
      if (contact) finalCompany = contact.company;
    }

    mockDb.addDeal({
      title,
      company: finalCompany || "TechCorp Labs",
      value: parseFloat(value) || 0,
      stage,
      priority,
      contactId: selectedContactId || null,
      date: date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    setTitle(''); setCompany(''); setValue(''); setStage('Lead');
    setPriority('Medium'); setDate(''); setSelectedContactId('');
    setIsAddModalOpen(false);
    refreshDeals();
  };

  const filteredDeals = deals.filter(deal => 
    deal.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    deal.company.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getStageStats = (stageName) => {
    const stageDeals = filteredDeals.filter(d => d.stage === stageName);
    const sum = stageDeals.reduce((acc, curr) => acc + curr.value, 0);
    return { count: stageDeals.length, value: sum };
  };

  const totalPipelineValue = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').reduce((acc, curr) => acc + curr.value, 0);

  const metrics = [
    { label: 'Active Pipeline',   value: `$${totalPipelineValue.toLocaleString()}`, icon: DollarSign, color: 'var(--brand-cyan)' },
    { label: 'Active Deals',      value: deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length, icon: Target, color: 'var(--brand-purple)' },
    { label: 'Deals Won',         value: deals.filter(d => d.stage === 'Won').length, icon: TrendingUp, color: 'var(--brand-green)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pipeline</h1>
          <p className="page-subtitle">Manage your sales funnel and active deals</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> New Deal
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card metric-card">
              <div className="metric-icon-wrapper" style={{ background: `${m.color}22` }}>
                <Icon size={22} style={{ color: m.color }} />
              </div>
              <div className="metric-info">
                <span className="metric-label">{m.label}</span>
                <span className="metric-value">{m.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board Layout */}
      <div className="kanban-board-wrapper">
        <div className="kanban-board">
          {stages.map(colStage => {
            const { count, value } = getStageStats(colStage);
            const colDeals = filteredDeals.filter(d => d.stage === colStage);

            return (
              <div 
                key={colStage}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, colStage)}
              >
                <div className="kanban-column-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{colStage}</span>
                    <span className="kanban-column-count">{count}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>
                    ${value.toLocaleString()}
                  </span>
                </div>

                <div className="kanban-cards-wrapper">
                  {colDeals.map(deal => (
                    <div
                      key={deal.id}
                      className="kanban-card"
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 className="kanban-card-title">{deal.title}</h4>
                        <button 
                          onClick={() => handleDeleteDeal(deal.id)} 
                          className="btn-icon"
                          style={{ width: 24, height: 24 }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="kanban-card-company">{deal.company}</p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        <Calendar size={12} />
                        <span>Close: {deal.date}</span>
                      </div>

                      <div className="kanban-card-footer">
                        <span className="kanban-card-value">${deal.value.toLocaleString()}</span>
                        <span className={`badge ${deal.priority === 'High' ? 'badge-danger' : deal.priority === 'Medium' ? 'badge-warning' : 'badge-neutral'}`}>
                          {deal.priority}
                        </span>
                      </div>

                      {/* Manual Stage Movers */}
                      <div className="kanban-card-movers">
                        <button 
                          className="btn-icon kanban-mover-btn" 
                          disabled={colStage === stages[0]}
                          onClick={() => moveDealManual(deal, -1)}
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span>Move Stage</span>
                        <button 
                          className="btn-icon kanban-mover-btn" 
                          disabled={colStage === stages[stages.length - 1]}
                          onClick={() => moveDealManual(deal, 1)}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {colDeals.length === 0 && (
                    <div className="kanban-drop-zone">
                      Drag deals here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Deal Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Deal</h2>
              <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-body">
              <div className="form-group">
                <label>Deal Title *</label>
                <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Link Customer (Optional)</label>
                <select className="form-input" value={selectedContactId} onChange={e => {
                  setSelectedContactId(e.target.value);
                  const contact = contacts.find(c => c.id === e.target.value);
                  if (contact) setCompany(contact.company);
                }}>
                  <option value="">-- Select Contact --</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                </select>
              </div>

              {!selectedContactId && (
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" className="form-input" value={company} onChange={e => setCompany(e.target.value)} />
                </div>
              )}

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Value ($)</label>
                  <input type="number" className="form-input" value={value} onChange={e => setValue(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Target Close Date</label>
                  <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Stage</label>
                  <select className="form-input" value={stage} onChange={e => setStage(e.target.value)}>
                    {stages.map(stg => <option key={stg} value={stg}>{stg}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select className="form-input" value={priority} onChange={e => setPriority(e.target.value)}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
