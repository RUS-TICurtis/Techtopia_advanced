import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Users, Video, X } from 'lucide-react';
import { useTasks } from '../../hooks/useCrmData';
import { showToast } from '../../components/ui/Toast';
import './Calendar.css';

export default function Calendar() {
  const { tasks = [], isLoading, createTask } = useTasks();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '2026-05-21', time: '10:00 AM - 11:00 AM', type: 'Meeting', attendees: '' });

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title) return;

    try {
      await createTask({
        name: newEvent.title,
        dueDate: newEvent.date,
        priority: 'Medium',
        status: 'Todo',
        description: `Scheduled ${newEvent.type} event. Time: ${newEvent.time}. Attendees: ${newEvent.attendees}`
      });

      setShowAddModal(false);
      setNewEvent({ title: '', date: '2026-05-21', time: '10:00 AM - 11:00 AM', type: 'Meeting', attendees: '' });
      showToast('Event Created', 'Calendar event has been registered as a sprint task.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to register calendar event.', 'error');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Schedule and manage your meetings</p>
        </div>
        <div className="page-actions">
          <div className="calendar-header-actions">
            <div className="calendar-header-btn"><ChevronLeft size={18} /></div>
            <span className="calendar-header-date">May 2026</span>
            <div className="calendar-header-btn"><ChevronRight size={18} /></div>
          </div>
          <button className="btn btn-secondary">Today</button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px] bg-[#1E293B]/20 border border-gray-800 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38BDF8]"></div>
        </div>
      ) : (
        <div className="calendar-layout">
          <div className="card p-0" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="calendar-grid-header">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="calendar-grid">
              {Array.from({length: 31}).map((_, i) => {
                const day = i + 1;
                const dayStr = day.toString().padStart(2, '0');
                const dateStr = `2026-05-${dayStr}`;
                const dayTasks = tasks.filter(t => (t.dueDate || t.date) === dateStr);
                
                return (
                  <div key={i} className={`calendar-day ${day === 21 ? 'today' : ''}`}>
                    <div className="calendar-date-number">
                      {day}
                    </div>
                    {dayTasks.map(t => (
                      <div key={t.id} className="calendar-event-pill" title={t.name || t.title}>
                        {t.name || t.title}
                      </div>
                    ))}
                  </div>
                );
              })}
              {/* Empty slots to fill grid */}
              {Array.from({length: 4}).map((_, i) => (
                <div key={`empty-${i}`} className="calendar-day-empty"></div>
              ))}
            </div>
          </div>

          <div className="upcoming-schedule">
            <div className="card">
              <h3 className="upcoming-schedule-title">
                <CalendarIcon size={18} />
                Upcoming Tasks & Meetings
              </h3>
              <div className="upcoming-schedule-list flex flex-col gap-3 mt-3">
                {tasks.length === 0 ? (
                  <span className="text-xs text-gray-500 italic">No scheduled activities</span>
                ) : (
                  tasks.slice(0, 5).map(task => (
                    <div key={task.id} className="schedule-card p-3 border border-gray-800/80 bg-[#1E293B]/40 rounded-xl">
                      <div className="schedule-card-title text-sm font-bold text-white">{task.name || task.title}</div>
                      <div className="schedule-card-meta text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                        <Clock size={12} className="text-[#38BDF8]" />
                        <span>Due: {task.dueDate || task.date || 'No Date'}</span>
                      </div>
                      <div className="schedule-card-type text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                        <CalendarIcon size={10} />
                        <span>{task.priority || 'Medium'} Priority</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Event</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="modal-body">
              <div className="form-group">
                <label>Event Title</label>
                <input 
                  type="text" 
                  className="form-input"
                  required
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    required
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Type</label>
                  <select 
                    className="form-input"
                    value={newEvent.type}
                    onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                  >
                    <option>Meeting</option>
                    <option>Call</option>
                    <option>Task</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Time (e.g., 10:00 AM - 11:00 AM)</label>
                <input 
                  type="text" 
                  className="form-input"
                  required
                  value={newEvent.time}
                  onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Attendees (comma separated)</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Alice, Bob"
                  value={newEvent.attendees}
                  onChange={e => setNewEvent({...newEvent, attendees: e.target.value})}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
