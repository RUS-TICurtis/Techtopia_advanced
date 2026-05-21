import { useState } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Trash2,
  X
} from 'lucide-react';
import { mockDb } from '../utils/mockDb';

export default function Pipeline({ searchValue = '' }) {
  const [deals, setDeals] = useState(() => mockDb.getDeals());
  const [contacts, setContacts] = useState(() => mockDb.getContacts());
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

  const refreshDeals = () => {
    setDeals(mockDb.getDeals());
  };

  // HTML5 Drag & Drop Handlers
  const handleDragStart = (e, dealId) => {
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    const allDeals = mockDb.getDeals();
    const deal = allDeals.find(d => d.id === dealId);
    if (deal && deal.stage !== targetStage) {
      deal.stage = targetStage;
      mockDb.updateDeal(deal);

      // Optionally update status of corresponding contact as well
      const allContacts = mockDb.getContacts();
      const contact = allContacts.find(c => c.id === deal.contactId);
      if (contact) {
        contact.status = targetStage === 'Lead' ? 'New' : targetStage;
        mockDb.updateContact(contact);
      }

      refreshDeals();
    }
  };

  // Manual Stage Mover (Touch Fallback)
  const moveDealManual = (deal, direction) => {
    const currentIdx = stages.indexOf(deal.stage);
    let nextIdx = currentIdx + direction;
    if (nextIdx >= 0 && nextIdx < stages.length) {
      const nextStage = stages[nextIdx];
      deal.stage = nextStage;
      mockDb.updateDeal(deal);

      // Synchronize contact status
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

    // Reset fields
    setTitle('');
    setCompany('');
    setValue('');
    setStage('Lead');
    setPriority('Medium');
    setDate('');
    setSelectedContactId('');
    setIsAddModalOpen(false);
    refreshDeals();
  };

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    return (
      deal.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  // Calculate stats for columns
  const getStageStats = (stageName) => {
    const stageDeals = filteredDeals.filter(d => d.stage === stageName);
    const sum = stageDeals.reduce((acc, curr) => acc + curr.value, 0);
    return { count: stageDeals.length, value: sum };
  };

  return (
    <div className="page-container">
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <h3 className="card-title" style={{ margin: 0, fontSize: '20px' }}>Active Sales Funnel</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Drag and drop deals to advance sales stages, or use side-navigation buttons.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Create Deal Card
        </button>
      </div>

      {/* Kanban Board Layout */}
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
                        style={{ color: 'var(--text-light)', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseOver={(e) => e.target.style.color = 'var(--error)'}
                        onMouseOut={(e) => e.target.style.color = 'var(--text-light)'}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="kanban-card-company">{deal.company}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      <Calendar size={12} />
                      <span>Est. Close: {deal.date}</span>
                    </div>

                    <div className="kanban-card-footer">
                      <span className="kanban-card-value">${deal.value.toLocaleString()}</span>
                      <span className={`kanban-card-priority priority-${deal.priority.toLowerCase()}`}>
                        {deal.priority}
                      </span>
                    </div>

                    {/* Touch / Manual Fallback Stage Movers */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginTop: '12px', 
                      paddingTop: '8px', 
                      borderTop: '1px solid var(--border-light)',
                      gap: '4px' 
                    }}>
                      <button 
                        className="nav-icon-btn" 
                        style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                        disabled={colStage === stages[0]}
                        onClick={() => moveDealManual(deal, -1)}
                      >
                        <ChevronLeft size={12} />
                      </button>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-light)', alignSelf: 'center', textTransform: 'uppercase' }}>
                        Move Stage
                      </span>
                      <button 
                        className="nav-icon-btn" 
                        style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                        disabled={colStage === stages[stages.length - 1]}
                        onClick={() => moveDealManual(deal, 1)}
                      >
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {colDeals.length === 0 && (
                  <div style={{
                    padding: '24px',
                    border: '1.5px dashed var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    color: 'var(--text-light)',
                    fontSize: '13px'
                  }}>
                    Drag deals here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==========================================================================
         ADD NEW DEAL CARD MODAL
         ========================================================================== */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Launch Deal Card</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Deal Contract Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Enterprise Cloud Ops License"
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link Customer Lead (Optional)</label>
                <select 
                  className="form-select" 
                  value={selectedContactId}
                  onChange={e => {
                    setSelectedContactId(e.target.value);
                    const contact = contacts.find(c => c.id === e.target.value);
                    if (contact) setCompany(contact.company);
                  }}
                >
                  <option value="">-- Select Contact Dossier --</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                  ))}
                </select>
              </div>

              {!selectedContactId && (
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Company Name" 
                    value={company} 
                    onChange={e => setCompany(e.target.value)} 
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Contract Value ($)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Estimated Revenue" 
                    value={value} 
                    onChange={e => setValue(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Close Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Pipeline Stage</label>
                  <select className="form-select" value={stage} onChange={e => setStage(e.target.value)}>
                    {stages.map(stg => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deal Priority</label>
                  <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
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
