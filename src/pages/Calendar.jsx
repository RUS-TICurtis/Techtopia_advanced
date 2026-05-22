import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Users, Video, X } from 'lucide-react';
import { mockDb } from '../utils/mockDb';
import './Calendar.css';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date("2026-05-21")); // Mocking current date for consistent UI
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '2026-05-21', time: '10:00 AM - 11:00 AM', type: 'Meeting', attendees: '' });

  useEffect(() => {
    setEvents(mockDb.getEvents());
  }, []);

  const handleAddEvent = (e) => {
    e.preventDefault();
    const event = {
      id: "e_" + Date.now(),
      attendees: newEvent.attendees.split(',').map(s => s.trim()).filter(s => s),
      ...newEvent
    };
    const updated = [...events, event];
    mockDb.saveEvents(updated);
    setEvents(updated);
    setShowAddModal(false);
    setNewEvent({ title: '', date: '2026-05-21', time: '10:00 AM - 11:00 AM', type: 'Meeting', attendees: '' });
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

      <div className="calendar-layout">
        <div className="card p-0" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="calendar-grid-header">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="calendar-grid">
            {/* Generating mock days */}
            {Array.from({length: 31}).map((_, i) => {
              const day = i + 1;
              const hasEvents = day === 22 || day === 23 || day === 24;
              return (
                <div key={i} className={`calendar-day ${day === 21 ? 'today' : ''}`}>
                  <div className="calendar-date-number">
                    {day}
                  </div>
                  {hasEvents && (
                    <div className="calendar-event-pill">
                      {day === 22 ? '10:00 AM Product Demo...' : day === 23 ? '2:00 PM Discovery Call' : '1:00 PM Contract Revi...'}
                    </div>
                  )}
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
              Upcoming Schedule
            </h3>
            <div className="upcoming-schedule">
              {events.map(event => (
                <div key={event.id} className="schedule-card">
                  <div className="schedule-card-title">{event.title}</div>
                  <div className="schedule-card-meta">
                    <Clock size={14} /> {event.date} • {event.time}
                  </div>
                  <div className="schedule-card-type">
                    {event.type === 'Meeting' ? <Video size={14} /> : <CalendarIcon size={14} />}
                    {event.type}
                  </div>
                  <div className="schedule-card-attendees">
                    {event.attendees.map((att, i) => (
                      <div key={i} className="attendee-avatar" title={att}>
                        {att.charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
