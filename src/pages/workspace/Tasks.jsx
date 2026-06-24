import { useState } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  User, 
  Trash2,
  X
} from 'lucide-react';
import { useTasks, useContacts } from '../../hooks/useCrmData';
import './Tasks.css';

export default function Tasks({ searchValue }) {
  const { tasks = [], isLoading: isLoadingTasks, createTask, updateTask, deleteTask } = useTasks();
  const { contacts = [], isLoading: isLoadingContacts } = useContacts();
  const [activeFilter, setActiveFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  const handleToggleTaskStatus = async (task) => {
    const isCompleted = task.status === 'Completed' || task.status === 'Done';
    await updateTask({
      id: task.id,
      data: { status: isCompleted ? 'Todo' : 'Done' }
    });
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Delete this task?")) {
      await deleteTask(id);
    }
  };

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    let contactName = "";
    if (selectedContactId) {
      const c = contacts.find(contact => String(contact.id) === String(selectedContactId));
      if (c) contactName = `${c.firstName} ${c.lastName}`;
    }

    await createTask({
      title,
      contactId: selectedContactId ? Number(selectedContactId) : null,
      contactName,
      date: date || new Date().toISOString().split('T')[0],
      priority
    });

    setTitle('');
    setSelectedContactId('');
    setDate('');
    setPriority('Medium');
    setIsAddModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const isCompleted = t.status === 'Completed' || t.status === 'Done';
    if (activeFilter === 'Pending') return !isCompleted;
    if (activeFilter === 'Completed') return isCompleted;
    return true; // All
  });

  // Calendar logic (Current Month - May 2026)
  const currentYear = 2026;
  const monthName = "May 2026";
  const daysInMonth = 31;
  const startDayOffset = 5; // May 1, 2026 is a Friday (Sunday=0, Friday=5)

  // Generate days array
  const calendarDays = [];
  // Fill offsets
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push(null);
  }
  // Fill dates
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Check if a day has tasks
  const getTasksForDay = (dayNum) => {
    if (!dayNum) return [];
    const dateString = `${currentYear}-05-${dayNum.toString().padStart(2, '0')}`;
    return tasks.filter(t => (t.date || t.dueDate) === dateString);
  };

  return (
    <div className="page-container">
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Pending', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: activeFilter === tab ? 'var(--primary)' : 'var(--bg-card)',
                color: activeFilter === tab ? '#FFFFFF' : 'var(--text-muted)',
                boxShadow: activeFilter === tab ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)',
                border: activeFilter === tab ? 'none' : '1px solid var(--border-light)'
              }}
            >
              {tab} Tasks
            </button>
          ))}
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Schedule Task
        </button>
      </div>

      {/* Main Grid: Tasks List & Mini Calendar */}
      <div className="dashboard-main-grid">
        
        {/* Left Side: Tasks List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="card-title" style={{ margin: 0 }}>Action Plan</h3>
          
          <div className="tasks-list">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => {
                const isCompleted = task.status === 'Completed' || task.status === 'Done';
                return (
                  <div key={task.id} className={`task-item ${isCompleted ? 'completed' : ''}`}>
                    <div className="task-item-left">
                      <div className="task-checkbox-wrapper">
                        <input 
                          type="checkbox" 
                          className="task-checkbox" 
                          checked={isCompleted}
                          onChange={() => handleToggleTaskStatus(task)}
                        />
                      </div>

                      <div className="task-details">
                        <span className="task-title">{task.title || task.name}</span>
                        <div className="task-meta">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CalendarIcon size={12} /> {task.date || task.dueDate}
                          </span>
                          {task.contactName && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <User size={12} /> {task.contactName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="task-item-right">
                      <span className={`kanban-card-priority priority-${task.priority.toLowerCase()}`} style={{ fontSize: '11px' }}>
                        {task.priority}
                      </span>
                      <button 
                        className="nav-icon-btn" 
                        style={{ width: '32px', height: '32px', color: 'var(--text-light)', borderRadius: 'var(--radius-sm)' }}
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No tasks to display. All caught up!
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Mini Calendar Widget */}
        <div className="card">
          <h3 className="card-title">{monthName}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Days Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              textAlign: 'center', 
              fontWeight: 700, 
              color: 'var(--text-muted)',
              fontSize: '12px'
            }}>
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>

            {/* Calendar Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              rowGap: '10px',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {calendarDays.map((day, idx) => {
                const dayTasks = getTasksForDay(day);
                const hasPending = dayTasks.some(t => t.status === 'Pending');
                const hasCompleted = dayTasks.length > 0 && dayTasks.every(t => t.status === 'Completed');

                let dayBg = 'transparent';
                let dayColor = 'var(--text-main)';
                let dayBorder = 'none';

                if (dayTasks.length > 0) {
                  if (hasPending) {
                    dayBg = 'var(--warning-bg)';
                    dayColor = 'var(--warning)';
                    dayBorder = '1px solid var(--warning)';
                  } else if (hasCompleted) {
                    dayBg = 'var(--success-bg)';
                    dayColor = 'var(--success)';
                    dayBorder = '1px solid var(--success)';
                  }
                }

                if (day === null) {
                  return <div key={`empty-${idx}`}></div>;
                }

                return (
                  <div 
                    key={`day-${day}`}
                    style={{
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      backgroundColor: dayBg,
                      color: dayColor,
                      border: dayBorder,
                      position: 'relative',
                      cursor: dayTasks.length > 0 ? 'pointer' : 'default'
                    }}
                    title={dayTasks.map(t => `${t.status === 'Completed' ? 'âœ“' : 'â€¢'} ${t.title}`).join('\n')}
                  >
                    {day}
                    {dayTasks.length > 0 && (
                      <span style={{
                        position: 'absolute',
                        bottom: '2px',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: hasPending ? 'var(--warning)' : 'var(--success)'
                      }}></span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ 
              borderTop: '1px solid var(--border-light)', 
              paddingTop: '15px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontWeight: 500
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span>
                <span>Active pending tasks scheduled</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                <span>Completed schedules</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ==========================================================================
         ADD NEW TASK MODAL
         ========================================================================== */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Schedule New CRM Task</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit}>
              <div className="form-group">
                <label className="form-label">Task Objective</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Schedule SOC2 documentation check"
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link Client Dossier</label>
                <select 
                  className="form-select" 
                  value={selectedContactId}
                  onChange={e => setSelectedContactId(e.target.value)}
                >
                  <option value="">-- Direct Lead Attachment --</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Task Priority</label>
                  <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
