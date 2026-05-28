import { useState, useRef } from 'react';
import { 
  User, 
  Settings as SettingsIcon,
  Lock, 
  Camera, 
  Check, 
  Eye, 
  EyeOff,
  Building2,
  Palette
} from 'lucide-react';
import { mockDb } from '../utils/mockDb';
import { useAuthStore } from '../store/authStore';
import './Settings.css';

export default function Settings({ theme, toggleTheme, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form states
  const { user: authUser, updateUserAvatar } = useAuthStore();
  const user = mockDb.getProfile() || {};
  const [name, setName] = useState(user.name || authUser?.name || '');
  const [username, setUsername] = useState(user.username || authUser?.email?.split('@')[0] || '');
  const [email, setEmail] = useState(user.email || authUser?.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [role, setRole] = useState(user.role || authUser?.roleLabel || '');
  const [location, setLocation] = useState(user.location || '');

  // Avatar states
  const [avatarUrl, setAvatarUrl] = useState(authUser?.avatarUrl || user.avatarUrl || '');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    
    // Size check: max 2MB
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg('File too large. Maximum size is 2MB.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    // Mime type check: image only
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Invalid file type. Please upload an image.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setAvatarUrl(base64String);
      // Sync with Zustand and MockDb
      updateUserAvatar(base64String);
      mockDb.updateUserProfile({ avatarUrl: base64String });
      if (onProfileUpdate) onProfileUpdate({ avatarUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Company Settings
  const [companyName, setCompanyName] = useState('Techtopia Inc.');
  const [companyWebsite, setCompanyWebsite] = useState('https://techtopia.com');

  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback states
  const [profileSuccess, setProfileSuccess] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const updated = { name, username, email, phone, role, location };
    mockDb.updateUserProfile(updated);
    if (onProfileUpdate) onProfileUpdate(updated);
    setProfileSuccess('Profile successfully updated!');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setSecuritySuccess('Credentials successfully updated!');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setSecuritySuccess(''), 3000);
  };

  const TABS = [
    { id: 'profile',    label: 'My Profile',       icon: User },
    { id: 'company',    label: 'Company Settings', icon: Building2 },
    { id: 'appearance', label: 'Appearance',       icon: Palette },
    { id: 'security',   label: 'Security',         icon: Lock }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and system preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Settings Navigation */}
        <div className="card settings-nav">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`settings-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="card settings-content">
          
          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2 className="settings-section-title">My Profile</h2>
              <form onSubmit={handleProfileSubmit}>
                <div className="settings-profile-layout">
                  {/* Avatar Panel */}
                  <div className="settings-avatar-panel">
                    <div 
                      className={`settings-avatar-wrapper ${dragActive ? 'drag-active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      title="Drag and drop or click to upload avatar"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*" 
                        onChange={handleFileChange} 
                      />
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="uploaded-avatar" />
                      ) : (
                        <div className="avatar-initials-fallback">
                          {authUser?.avatar || user.avatar || 'CT'}
                        </div>
                      )}
                      <div className="settings-avatar-upload" title="Upload Avatar">
                        <Camera size={16} />
                      </div>
                    </div>
                    <span className="settings-avatar-hint">Drag & drop image or click to browse</span>
                    <span className="settings-avatar-hint text-[10px] text-gray-500" style={{ marginTop: '-4px', opacity: 0.7 }}>Max size 2MB (PNG/JPG)</span>
                    {errorMsg && <div className="settings-error-msg text-red-500 text-xs mt-1 text-center font-semibold">{errorMsg}</div>}
                  </div>

                  {/* Form */}
                  <div className="settings-form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>User Name</label>
                      <input type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Corporate Title</label>
                      <input type="text" className="form-input" value={role} onChange={e => setRole(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input type="text" className="form-input" value={location} onChange={e => setLocation(e.target.value)} />
                    </div>
                  </div>
                </div>

                {profileSuccess && <div className="settings-success-msg">{profileSuccess}</div>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary">
                    <Check size={18} /> Save Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* COMPANY SETTINGS */}
          {activeTab === 'company' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Company Settings</h2>
              <div className="settings-form-grid">
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" className="form-input" value={companyName} onChange={e=>setCompanyName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Company Website</label>
                  <input type="text" className="form-input" value={companyWebsite} onChange={e=>setCompanyWebsite(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" className="btn btn-primary"><Check size={18} /> Save Settings</button>
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Appearance Mode</h2>
              <div className="settings-theme-grid">
                <div 
                  className={`settings-theme-card ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => theme === 'dark' && toggleTheme()}
                >
                  <div className="settings-theme-preview light"></div>
                  <span>Clean Light Mode</span>
                </div>
                <div 
                  className={`settings-theme-card ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => theme === 'light' && toggleTheme()}
                >
                  <div className="settings-theme-preview dark"></div>
                  <span>Sleek Dark Mode</span>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Security Settings</h2>
              <form onSubmit={handleSecuritySubmit} style={{ maxWidth: 500 }}>
                <div className="form-group">
                  <label>Current Account Password</label>
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
                      className="settings-pw-toggle"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Credentials Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="settings-security-hint">
                  Passwords must meet administrative complexities (Minimum 12 characters, including alphabetic characters, numbers, and symbols).
                </div>

                {securitySuccess && <div className="settings-success-msg">{securitySuccess}</div>}

                <div style={{ marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary">Change Credentials</button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
