import { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon,
  Lock, 
  Camera, 
  Check, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { mockDb } from '../utils/mockDb';

export default function Settings({ theme, toggleTheme, onProfileUpdate }) {
  const [activeSubTab, setActiveSubTab] = useState('profile');
  
  // Profile form states
  const user = mockDb.getProfile() || {};
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [role, setRole] = useState(user.role || '');
  const [location, setLocation] = useState(user.location || '');
  const profilePic = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback states
  const [profileSuccess, setProfileSuccess] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Preferences states
  const [notifications, setNotifications] = useState('daily');
  const [leadAlerts, setLeadAlerts] = useState(true);
  const [dealThresholdAlert, setDealThresholdAlert] = useState(true);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    const updated = {
      name,
      username,
      email,
      phone,
      role,
      location
    };
    
    mockDb.updateUserProfile(updated);
    if (onProfileUpdate) {
      onProfileUpdate(updated);
    }

    setProfileSuccess('Profile successfully updated!');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    // Simulate password change
    setSecuritySuccess('Credentials successfully updated!');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setSecuritySuccess(''), 3000);
  };

  return (
    <div className="page-container">
      {/* Sub Tabs Container */}
      <div className="card" style={{ padding: '0 24px', borderBottom: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
        <div style={{ display: 'flex', gap: '30px' }}>
          {[
            { id: 'profile', label: 'Edit Profile', icon: User },
            { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
            { id: 'security', label: 'Security', icon: Lock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '20px 0',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tab Body */}
      <div className="card" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', marginTop: '-1px', borderTop: 'none' }}>
        
        {/* ==========================================================================
           EDIT PROFILE SUB-TAB
           ========================================================================== */}
        {activeSubTab === 'profile' && (
          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '40px', alignItems: 'start' }}>
              
              {/* Profile Avatar Editor Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '10px 0' }}>
                <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                  <img 
                    src={profilePic} 
                    alt="Edit Profile Avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid var(--border-light)'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '5px',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)'
                  }} title="Upload Avatar Picture">
                    <Camera size={16} />
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-light)', textAlign: 'center' }}>
                  Recommended size: 200x200px PNG or JPG.
                </span>
              </div>

              {/* Form Input Fields Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">User Name</label>
                    <input type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Corporate Title</label>
                    <input type="text" className="form-input" value={role} onChange={e => setRole(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Geographic Location</label>
                    <input type="text" className="form-input" value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                </div>

                {profileSuccess && (
                  <div style={{
                    color: 'var(--success)',
                    backgroundColor: 'var(--success-bg)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    {profileSuccess}
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', minWidth: '150px' }}>
                  <Check size={18} /> Save Settings
                </button>
              </div>

            </div>
          </form>
        )}

        {/* ==========================================================================
           PREFERENCES SUB-TAB (Theme Switching & Notification Digests)
           ========================================================================== */}
        {activeSubTab === 'preferences' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '700px' }}>
            
            {/* Visual theme selection cards */}
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-title)', marginBottom: '14px' }}>Appearance Mode</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div 
                  onClick={() => theme === 'dark' && toggleTheme()}
                  style={{
                    border: theme === 'light' ? '2.5px solid var(--primary)' : '2.5px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '100%', height: '50px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px' }}></div>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>Clean Light Mode</span>
                </div>

                <div 
                  onClick={() => theme === 'light' && toggleTheme()}
                  style={{
                    border: theme === 'dark' ? '2.5px solid var(--primary)' : '2.5px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    backgroundColor: '#1E293B',
                    color: '#F8FAFC',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '100%', height: '50px', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '6px' }}></div>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>Sleek Dark Mode</span>
                </div>
              </div>
            </div>

            {/* Notification frequency selection list */}
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-title)', marginBottom: '14px' }}>Notification Preferences</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { id: 'instant', title: 'Instant Feed Alerts', desc: 'Dispatched immediately when deal status transitions occur.' },
                  { id: 'daily', title: 'Daily Digest Summary', desc: 'Dispatched at 8:00 AM user-time mapping scheduled items.' },
                  { id: 'none', title: 'Mute Notifications', desc: 'No system notifications are sent. Display badges only.' }
                ].map(opt => (
                  <label 
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-light)',
                      cursor: 'pointer'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="notify-freq" 
                      value={opt.id}
                      checked={notifications === opt.id}
                      onChange={e => setNotifications(e.target.value)}
                      style={{ marginTop: '3px', accentColor: 'var(--primary)' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)' }}>{opt.title}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* General checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-title)' }}>Digest Configurations</h4>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={leadAlerts} 
                  onChange={e => setLeadAlerts(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span>Alert on new incoming leads from registration portals</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={dealThresholdAlert} 
                  onChange={e => setDealThresholdAlert(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span>Alert if active deal value crosses $50,000 threshold</span>
              </label>
            </div>

          </div>
        )}

        {/* ==========================================================================
           SECURITY SUB-TAB
           ========================================================================== */}
        {activeSubTab === 'security' && (
          <form onSubmit={handleSecuritySubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px' }}>
              
              <div className="form-group">
                <label className="form-label">Current Account Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-input" 
                    placeholder="••••••••••••"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Credentials Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ 
                padding: '16px', 
                backgroundColor: 'rgba(24, 20, 243, 0.04)', 
                borderLeft: '4px solid var(--info)',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                fontSize: '13px',
                color: 'var(--text-muted)',
                lineHeight: 1.5
              }}>
                Passwords must meet administrative complexities (Minimum 12 characters, including 
                alphabetic characters, numbers, and symbols).
              </div>

              {securitySuccess && (
                <div style={{
                  color: 'var(--success)',
                  backgroundColor: 'var(--success-bg)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  {securitySuccess}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                Change Credentials
              </button>

            </div>
          </form>
        )}

      </div>
    </div>
  );
}
