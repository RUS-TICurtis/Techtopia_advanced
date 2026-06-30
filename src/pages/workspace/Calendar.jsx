import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar as CalIcon, Loader2, AlertCircle,
  Video, Clock, User, ExternalLink, X, RefreshCw
} from 'lucide-react';
import microsoftIntegrationService from '../../services/microsoftIntegrationService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SHOW_AS_CONFIG = {
  Oof:              { color: '#ef4444', bg: 'rgba(239,68,68,0.18)',  label: 'Out of Office' },
  Busy:             { color: '#f97316', bg: 'rgba(249,115,22,0.18)', label: 'Busy' },
  Tentative:        { color: '#eab308', bg: 'rgba(234,179,8,0.18)',  label: 'Tentative' },
  Free:             { color: '#22c55e', bg: 'rgba(34,197,94,0.18)',  label: 'Free' },
  WorkingElsewhere: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.18)','label': 'Working Elsewhere' },
  Unknown:          { color: '#6b7280', bg: 'rgba(107,114,128,0.18)', label: 'Unknown' },
};

function getCfg(showAs) {
  return SHOW_AS_CONFIG[showAs] || SHOW_AS_CONFIG.Unknown;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function formatTime(dt) {
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(dt) {
  return new Date(dt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ─── Event Detail Panel ───────────────────────────────────────────────────────
function EventPanel({ event, onClose }) {
  if (!event) return null;
  const cfg = getCfg(event.showAs);
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 360, background: '#0a1628', borderLeft: '1px solid #1e2a3a', zIndex: 1000, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.4)' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #1e2a3a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15 }}>Event Details</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}><X size={18} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ padding: '10px 14px', borderRadius: 8, background: cfg.bg, borderLeft: `3px solid ${cfg.color}`, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15, lineHeight: 1.4 }}>{event.subject || '(No subject)'}</div>
          <div style={{ fontSize: 12, color: cfg.color, marginTop: 4, fontWeight: 600 }}>{cfg.label}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <CalIcon size={15} color="#60a5fa" style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{formatDate(event.startDateTime)}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {formatTime(event.startDateTime)} – {formatTime(event.endDateTime)}
              </div>
            </div>
          </div>

          {event.organizer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <User size={15} color="#60a5fa" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 1 }}>Organizer</div>
                <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{event.organizer.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{event.organizer.email}</div>
              </div>
            </div>
          )}

          {event.isOnlineMeeting && event.onlineMeetingUrl && (
            <a href={event.onlineMeetingUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', textDecoration: 'none', color: '#a5b4fc' }}>
              <Video size={15} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Join Teams Meeting</span>
              <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Month Grid ───────────────────────────────────────────────────────────────
function MonthView({ currentDate, events, onSelectEvent }) {
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const today = new Date();

  // Build a 6-week grid starting on Sunday before the 1st
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - start.getDay());

  const cells = [];
  let day = new Date(gridStart);
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const eventsOnDay = (d) =>
    events.filter(e => isSameDay(new Date(e.startDateTime), d));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 1 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {cells.map((cell, idx) => {
          const isCurrentMonth = cell.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(cell, today);
          const dayEvents = eventsOnDay(cell);
          return (
            <div key={idx} style={{ minHeight: 90, background: '#0a1628', border: '1px solid #0f1825', padding: '6px 8px', opacity: isCurrentMonth ? 1 : 0.4 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: isToday ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: isToday ? '#fff' : '#94a3b8' }}>{cell.getDate()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayEvents.slice(0, 3).map(ev => {
                  const cfg = getCfg(ev.showAs);
                  return (
                    <button key={ev.id} onClick={() => onSelectEvent(ev)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '2px 5px', borderRadius: 4, background: cfg.bg, border: `1px solid ${cfg.color}30`, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10, color: cfg.color, fontWeight: 500 }}>
                      {ev.subject || '(No subject)'}
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span style={{ fontSize: 10, color: '#64748b', paddingLeft: 5 }}>+{dayEvents.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────
function WeekView({ currentDate, events, onSelectEvent }) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const today = new Date();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const eventsOnDay = (d) => events.filter(e => isSameDay(new Date(e.startDateTime), d));

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', gap: 1, minWidth: 700 }}>
        {/* Header */}
        <div />
        {days.map(d => {
          const isToday = isSameDay(d, today);
          return (
            <div key={d.toISOString()} style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #1e2a3a' }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{DAY_NAMES[d.getDay()]}</div>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: isToday ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2px auto 0' }}>
                <span style={{ fontSize: 14, fontWeight: isToday ? 700 : 400, color: isToday ? '#fff' : '#94a3b8' }}>{d.getDate()}</span>
              </div>
            </div>
          );
        })}

        {/* All-day events row (OOF, etc.) */}
        <div style={{ padding: '4px', fontSize: 10, color: '#64748b', display: 'flex', alignItems: 'center' }}>All day</div>
        {days.map(d => {
          const allDayEvs = eventsOnDay(d).filter(e => e.showAs === 'Oof' || (new Date(e.endDateTime) - new Date(e.startDateTime)) >= 86400000);
          return (
            <div key={d.toISOString()} style={{ minHeight: 28, borderBottom: '1px solid #0f1825', padding: '2px 2px' }}>
              {allDayEvs.map(ev => {
                const cfg = getCfg(ev.showAs);
                return (
                  <button key={ev.id} onClick={() => onSelectEvent(ev)}
                    style={{ width: '100%', textAlign: 'left', padding: '2px 5px', borderRadius: 4, background: cfg.bg, border: `1px solid ${cfg.color}30`, cursor: 'pointer', fontSize: 10, color: cfg.color, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', marginBottom: 1 }}>
                    {ev.subject}
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Hourly grid */}
        {hours.map(h => (
          <>
            <div key={`h${h}`} style={{ padding: '0 6px 0 0', textAlign: 'right', fontSize: 10, color: '#475569', paddingTop: 4, height: 44 }}>
              {h === 0 ? '' : `${h < 10 ? '0' : ''}${h}:00`}
            </div>
            {days.map(d => {
              const hourEvs = eventsOnDay(d).filter(e => {
                const start = new Date(e.startDateTime);
                return start.getHours() === h && e.showAs !== 'Oof';
              });
              return (
                <div key={`${d.toISOString()}-${h}`} style={{ height: 44, borderBottom: '1px solid #0f1825', borderLeft: '1px solid #0f1825', padding: '2px', position: 'relative', overflow: 'hidden' }}>
                  {hourEvs.map(ev => {
                    const cfg = getCfg(ev.showAs);
                    return (
                      <button key={ev.id} onClick={() => onSelectEvent(ev)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '2px 5px', borderRadius: 4, background: cfg.bg, border: `1px solid ${cfg.color}30`, cursor: 'pointer', fontSize: 10, color: cfg.color, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 1 }}>
                        {formatTime(ev.startDateTime)} {ev.subject}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

// ─── Main Calendar Page ───────────────────────────────────────────────────────
export default function Calendar() {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const from = startOfMonth(currentDate);
      from.setDate(from.getDate() - 7); // buffer
      const to = endOfMonth(currentDate);
      to.setDate(to.getDate() + 7); // buffer
      const data = await microsoftIntegrationService.getCalendarEvents(from, to);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load calendar events.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [currentDate]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const navigatePrev = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() - 1);
      else d.setDate(d.getDate() - 7);
      return d;
    });
  };
  const navigateNext = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() + 1);
      else d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const title = view === 'month'
    ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : `Week of ${formatDate(currentDate)}`;

  // Legend stats
  const stats = useMemo(() => ({
    total: events.length,
    oof: events.filter(e => e.showAs === 'Oof').length,
    meetings: events.filter(e => e.isOnlineMeeting).length,
  }), [events]);

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: '#060d18', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(14,165,233,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalIcon size={20} color="#0ea5e9" />
            </span>
            Microsoft Calendar
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            {stats.total} events this view · {stats.meetings} online meetings · {stats.oof} OOF
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', borderRadius: 8, border: '1px solid #1e2a3a', overflow: 'hidden' }}>
            {['month', 'week'].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '7px 14px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all 0.15s', textTransform: 'capitalize',
                  background: view === v ? '#1e3a5f' : '#0a1628',
                  color: view === v ? '#60a5fa' : '#64748b' }}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={loadEvents} disabled={isRefreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #1e2a3a', background: '#0d1829', color: '#e2e8f0', cursor: isRefreshing ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 500, opacity: isRefreshing ? 0.7 : 1 }}>
            <RefreshCw size={13} style={isRefreshing ? { animation: 'spin 1s linear infinite' } : {}} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={navigatePrev} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #1e2a3a', background: '#0a1628', color: '#e2e8f0', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
          <button onClick={() => setCurrentDate(new Date())} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #1e2a3a', background: '#0a1628', color: '#64748b', cursor: 'pointer', fontSize: 12 }}>Today</button>
          <button onClick={navigateNext} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #1e2a3a', background: '#0a1628', color: '#e2e8f0', cursor: 'pointer' }}><ChevronRight size={16} /></button>
        </div>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{title}</h2>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12 }}>
          {Object.entries(SHOW_AS_CONFIG).slice(0, 4).map(([k, v]) => (
            <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: v.color }} />
              {v.label}
            </span>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={16} color="#ef4444" />
          <span style={{ fontSize: 13, color: '#fca5a5' }}>{error}</span>
        </div>
      )}

      {/* Loading initial */}
      {loading && events.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12 }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#60a5fa' }} />
          <span style={{ fontSize: 14, color: '#94a3b8' }}>Loading calendar...</span>
        </div>
      ) : (
        <div style={{ background: '#0a1628', borderRadius: 14, border: '1px solid #1e2a3a', overflow: 'hidden' }}>
          {view === 'month'
            ? <MonthView currentDate={currentDate} events={events} onSelectEvent={setSelectedEvent} />
            : <WeekView currentDate={currentDate} events={events} onSelectEvent={setSelectedEvent} />
          }
        </div>
      )}

      {/* Event detail panel */}
      {selectedEvent && <EventPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      {events.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: 14, marginTop: 20 }}>
          No events found for this period. Calendar syncs every hour via background jobs.
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
