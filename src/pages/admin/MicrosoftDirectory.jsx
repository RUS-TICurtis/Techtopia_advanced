import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Shield, Search, RefreshCw, Wifi, WifiOff, Clock, ChevronRight,
  Building2, Phone, MapPin, Mail, ExternalLink, AlertCircle, Loader2,
  Calendar, Network
} from 'lucide-react';
import microsoftIntegrationService from '../../services/microsoftIntegrationService';
import toast from 'react-hot-toast';

// ─── Presence Badge ──────────────────────────────────────────────────────────
const PRESENCE_CONFIG = {
  Available:        { color: '#22c55e', bg: 'rgba(34,197,94,0.15)',  label: 'Available' },
  Busy:             { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  label: 'Busy' },
  DoNotDisturb:     { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  label: 'Do Not Disturb' },
  BeRightBack:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Be Right Back' },
  Away:             { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Away' },
  Offline:          { color: '#6b7280', bg: 'rgba(107,114,128,0.15)',label: 'Offline' },
  PresenceUnknown:  { color: '#6b7280', bg: 'rgba(107,114,128,0.15)',label: 'Unknown' },
  Oof:              { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: 'Out of Office' },
};

function PresenceBadge({ status, showLabel = false }) {
  const cfg = PRESENCE_CONFIG[status] || PRESENCE_CONFIG.PresenceUnknown;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: showLabel ? '3px 8px' : '0', borderRadius: '12px', background: showLabel ? cfg.bg : 'transparent' }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: cfg.color, flexShrink: 0, boxShadow: `0 0 0 2px ${cfg.color}30` }} />
      {showLabel && <span style={{ fontSize: 12, fontWeight: 500, color: cfg.color }}>{cfg.label}</span>}
    </span>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
function UserAvatar({ user, size = 38 }) {
  const [imgError, setImgError] = useState(false);
  const initials = `${(user.user?.firstName || '?')[0]}${(user.user?.lastName || '')[0] || ''}`.toUpperCase();
  const colors = ['#6366f1', '#0ea5e9', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
  const colorIdx = (user.user?.firstName?.charCodeAt(0) || 0) % colors.length;

  if (user.profilePhotoUrl && !imgError) {
    return (
      <img
        src={user.profilePhotoUrl}
        alt={`${user.user?.firstName} ${user.user?.lastName}`}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', background: colors[colorIdx],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0
    }}>{initials}</span>
  );
}

// ─── Tab: Active Directory ────────────────────────────────────────────────────
function DirectoryTab({ users, loading, error, onRefresh }) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [presenceFilter, setPresenceFilter] = useState('all');

  const departments = useMemo(() => {
    const depts = [...new Set(users.map(u => u.department).filter(Boolean))].sort();
    return depts;
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const name = `${u.user?.firstName} ${u.user?.lastName} ${u.user?.email} ${u.jobTitle}`.toLowerCase();
      const matchSearch = !search || name.includes(search.toLowerCase());
      const matchDept = deptFilter === 'all' || u.department === deptFilter;
      const matchPresence = presenceFilter === 'all' || u.presenceStatus === presenceFilter;
      return matchSearch && matchDept && matchPresence;
    });
  }, [users, search, deptFilter, presenceFilter]);

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 20px', color: '#ef4444' }}>
      <AlertCircle size={40} />
      <p style={{ margin: 0, fontSize: 15 }}>{error}</p>
      <button onClick={onRefresh} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>Retry</button>
    </div>
  );

  if (loading && !users.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12, color: '#60a5fa' }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: 14, color: '#94a3b8' }}>Loading directory...</span>
    </div>
  );

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, title..."
            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px 8px 32px', borderRadius: 8, border: '1px solid #1e2a3a', background: '#0d1829', color: '#e2e8f0', fontSize: 13, outline: 'none' }}
          />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #1e2a3a', background: '#0d1829', color: '#e2e8f0', fontSize: 13, outline: 'none', flex: '0 0 auto' }}>
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={presenceFilter} onChange={e => setPresenceFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #1e2a3a', background: '#0d1829', color: '#e2e8f0', fontSize: 13, outline: 'none', flex: '0 0 auto' }}>
          <option value="all">All Statuses</option>
          {Object.entries(PRESENCE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ fontSize: 13, color: '#64748b', alignSelf: 'center', flexShrink: 0 }}>
          {filtered.length} of {users.length}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: 14 }}>
          {users.length === 0 ? 'No synced users yet. Run a Microsoft sync from System Settings.' : 'No users match your filters.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2a3a' }}>
                {['User', 'Title', 'Department', 'Presence', 'Office', 'Manager'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #0f1825', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0d1829'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ position: 'relative' }}>
                        <UserAvatar user={u} size={34} />
                        <span style={{ position: 'absolute', bottom: -1, right: -1 }}>
                          <PresenceBadge status={u.presenceStatus} />
                        </span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{u.user?.firstName} {u.user?.lastName}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{u.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{u.jobTitle || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {u.department ? (
                      <span style={{ padding: '2px 8px', borderRadius: 6, background: '#1e293b', color: '#60a5fa', fontSize: 11, fontWeight: 500 }}>{u.department}</span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <PresenceBadge status={u.presenceStatus} showLabel />
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12 }}>{u.officeLocation || '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12 }}>{u.manager?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Groups ──────────────────────────────────────────────────────────────
function GroupsTab({ groups, loading, error, onRefresh }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() =>
    groups.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase())),
    [groups, search]
  );

  if (loading && !groups.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12 }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#60a5fa' }} />
      <span style={{ fontSize: 14, color: '#94a3b8' }}>Loading groups...</span>
    </div>
  );

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 18, maxWidth: 320 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups..."
          style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px 8px 32px', borderRadius: 8, border: '1px solid #1e2a3a', background: '#0d1829', color: '#e2e8f0', fontSize: 13, outline: 'none' }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: 14 }}>
          {groups.length === 0 ? 'No synced groups yet. Run a Microsoft sync from System Settings.' : 'No groups match your search.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {filtered.map(g => (
            <div key={g.id} style={{ background: '#0d1829', borderRadius: 12, border: '1px solid #1e2a3a', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={20} color="#6366f1" />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{g.memberCount} member{g.memberCount !== 1 ? 's' : ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Org Chart ───────────────────────────────────────────────────────────
function OrgChartTab({ users, loading }) {
  // Build tree from flat list
  const tree = useMemo(() => {
    const userMap = {};
    users.forEach(u => { userMap[u.id] = { ...u, children: [] }; });
    const roots = [];
    users.forEach(u => {
      if (u.manager && userMap[u.manager.id]) {
        userMap[u.manager.id].children.push(userMap[u.id]);
      } else {
        roots.push(userMap[u.id]);
      }
    });
    return roots;
  }, [users]);

  if (loading && !users.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12 }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#60a5fa' }} />
      <span style={{ fontSize: 14, color: '#94a3b8' }}>Building org chart...</span>
    </div>
  );

  if (users.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: 14 }}>
      No synced users yet. Run a Microsoft sync from System Settings to populate the org chart.
    </div>
  );

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
      <OrgNode nodes={tree} depth={0} />
    </div>
  );
}

function OrgNode({ nodes, depth }) {
  const [expanded, setExpanded] = useState(() => new Set(nodes.map(n => n.id)));
  if (!nodes.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: depth ? 28 : 0, borderLeft: depth ? '2px solid #1e2a3a' : 'none', marginLeft: depth ? 20 : 0 }}>
      {nodes.map(node => (
        <div key={node.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: '#0d1829', border: '1px solid #1e2a3a', marginBottom: 4, width: 'fit-content', minWidth: 240 }}>
            <div style={{ position: 'relative' }}>
              <UserAvatar user={node} size={32} />
              <span style={{ position: 'absolute', bottom: -1, right: -1 }}><PresenceBadge status={node.presenceStatus} /></span>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{node.user?.firstName} {node.user?.lastName}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{node.jobTitle || node.department || '—'}</div>
            </div>
            {node.children.length > 0 && (
              <button onClick={() => setExpanded(prev => { const s = new Set(prev); s.has(node.id) ? s.delete(node.id) : s.add(node.id); return s; })}
                style={{ marginLeft: 4, padding: '2px 4px', borderRadius: 4, border: 'none', background: '#1e2a3a', color: '#94a3b8', cursor: 'pointer', fontSize: 11 }}>
                {expanded.has(node.id) ? '▲' : `▼ ${node.children.length}`}
              </button>
            )}
          </div>
          {node.children.length > 0 && expanded.has(node.id) && (
            <OrgNode nodes={node.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MicrosoftDirectory() {
  const [activeTab, setActiveTab] = useState('directory');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [groupsError, setGroupsError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    setIsRefreshing(true);
    setUsersLoading(true);
    setGroupsLoading(true);
    setUsersError(null);
    setGroupsError(null);
    try {
      const [status, usersData, groupsData] = await Promise.all([
        microsoftIntegrationService.checkConnectionStatus(),
        microsoftIntegrationService.getDirectoryUsers(),
        microsoftIntegrationService.getDirectoryGroups(),
      ]);
      setConnectionStatus(status);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setLastRefreshed(new Date());
    } catch (err) {
      setUsersError('Failed to load directory data. Check your Microsoft 365 connection.');
    } finally {
      setUsersLoading(false);
      setGroupsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const tabs = [
    { id: 'directory', label: 'Active Directory', icon: Users },
    { id: 'groups', label: 'Groups', icon: Shield },
    { id: 'orgchart', label: 'Org Chart', icon: Network },
  ];

  const connected = connectionStatus?.isConnected;

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: '#060d18', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 23 23" fill="none"><path d="M1 1h10v10H1z" fill="#f25022"/><path d="M12 1h10v10H12z" fill="#7fba00"/><path d="M1 12h10v10H1z" fill="#00a4ef"/><path d="M12 12h10v10H12z" fill="#ffb900"/></svg>
            </span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Microsoft 365 Directory</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            Synced from Microsoft Entra ID ·{' '}
            {connected ? (
              <span style={{ color: '#22c55e' }}>● Connected</span>
            ) : (
              <span style={{ color: '#ef4444' }}>● Not Connected</span>
            )}
            {lastRefreshed && (
              <span> · Last updated {lastRefreshed.toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        <button
          onClick={loadAll}
          disabled={isRefreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #1e2a3a', background: '#0d1829', color: '#e2e8f0', cursor: isRefreshing ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500, opacity: isRefreshing ? 0.7 : 1 }}>
          <RefreshCw size={14} style={isRefreshing ? { animation: 'spin 1s linear infinite' } : {}} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats row */}
      {(users.length > 0 || groups.length > 0) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Synced Users', value: users.length, color: '#6366f1', icon: Users },
            { label: 'Departments', value: groups.length, color: '#0ea5e9', icon: Building2 },
            { label: 'Available', value: users.filter(u => u.presenceStatus === 'Available').length, color: '#22c55e', icon: Wifi },
            { label: 'Busy / OOF', value: users.filter(u => ['Busy','DoNotDisturb','Oof'].includes(u.presenceStatus)).length, color: '#ef4444', icon: WifiOff },
          ].map(s => (
            <div key={s.label} style={{ flex: '1 1 140px', background: '#0a1628', border: '1px solid #1e2a3a', borderRadius: 12, padding: '14px 18px', minWidth: 140 }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Not connected banner */}
      {connected === false && (
        <div style={{ padding: '16px 20px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertCircle size={18} color="#ef4444" />
          <span style={{ fontSize: 13, color: '#fca5a5' }}>
            Microsoft 365 is not connected. Go to <strong>System Settings → Integrations</strong> to connect your organization.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1e2a3a', marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
              background: activeTab === t.id ? '#0d1829' : 'transparent',
              color: activeTab === t.id ? '#60a5fa' : '#64748b',
              borderBottom: activeTab === t.id ? '2px solid #3b82f6' : '2px solid transparent' }}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: '#0a1628', borderRadius: 14, border: '1px solid #1e2a3a', padding: '20px 24px' }}>
        {activeTab === 'directory' && <DirectoryTab users={users} loading={usersLoading} error={usersError} onRefresh={loadAll} />}
        {activeTab === 'groups' && <GroupsTab groups={groups} loading={groupsLoading} error={groupsError} onRefresh={loadAll} />}
        {activeTab === 'orgchart' && <OrgChartTab users={users} loading={usersLoading} />}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
