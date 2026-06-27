import { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Settings as SettingsIcon,
  Lock, 
  Camera, 
  Check, 
  Eye, 
  EyeOff,
  Building2,
  Palette,
  Server,
  Activity,
  AlertTriangle,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getApiBaseUrl, apiClient } from '../../lib/api';
import toast from 'react-hot-toast';
import microsoftIntegrationService from '../../services/microsoftIntegrationService';
import './Settings.css';

export default function Settings({ theme, toggleTheme, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState('profile');
  const routerLocation = useLocation();
  const navigate = useNavigate();

  // Integrations state
  const [msConnectionStatus, setMsConnectionStatus] = useState({ isConnected: false, email: '' });
  const [isLoadingMsStatus, setIsLoadingMsStatus] = useState(true);

  useEffect(() => {
    // Check for success redirect
    const searchParams = new URLSearchParams(routerLocation.search);
    if (searchParams.get('msIntegration') === 'success') {
      toast.success('Successfully connected to Microsoft 365!');
      setActiveTab('integrations');
      // Clean up URL
      navigate('/settings', { replace: true });
    }

    // Fetch initial status
    const fetchStatus = async () => {
      setIsLoadingMsStatus(true);
      const status = await microsoftIntegrationService.checkConnectionStatus();
      setMsConnectionStatus(status);
      setIsLoadingMsStatus(false);
    };
    fetchStatus();
  }, [routerLocation.search, navigate]);
  
  // Profile form states
  const { user: authUser, updateUserAvatar, updateProfile } = useAuthStore();
  const [name, setName] = useState(authUser?.name || '');
  const [username, setUsername] = useState(authUser?.username || authUser?.email?.split('@')[0] || '');
  const [email, setEmail] = useState(authUser?.email || '');
  const [phone, setPhone] = useState(authUser?.phone || '');
  const [role, setRole] = useState(authUser?.roleLabel || authUser?.role || '');
  const [location, setLocation] = useState(authUser?.location || '');

  // Avatar states
  const [avatarUrl, setAvatarUrl] = useState(authUser?.avatarUrl || '');
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
      // Sync with Zustand
      updateUserAvatar(base64String);
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const updated = { 
      firstName, 
      lastName, 
      phoneNumber: phone 
    };
    const res = await updateProfile(updated);
    if (res.success) {
      if (onProfileUpdate) onProfileUpdate({ 
        name: `${firstName} ${lastName}`.trim(), 
        phone 
      });
      setProfileSuccess('Profile successfully updated!');
    } else {
      setErrorMsg(res.error || 'Failed to update profile.');
    }
    setTimeout(() => {
      setProfileSuccess('');
      setErrorMsg('');
    }, 3000);
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setSecuritySuccess('Credentials successfully updated!');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setSecuritySuccess(''), 3000);
  };

  // Developer API settings states
  const [apiEnv, setApiEnv] = useState(() => {
    const saved = localStorage.getItem('crm_api_env');
    return saved || 'auto';
  });
  
  const [customApiUrl, setCustomApiUrl] = useState(() => {
    return localStorage.getItem('crm_api_url_custom') || '';
  });

  const [activeTenantId, setActiveTenantId] = useState(() => {
    return localStorage.getItem('crm_tenant_id') || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  });

  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle | testing | success | error
  const [connectionError, setConnectionError] = useState('');

  const handleSaveApiSettings = (e) => {
    e.preventDefault();
    
    // Save active API env
    localStorage.setItem('crm_api_env', apiEnv);
    
    // Calculate final API URL based on selection
    let resolvedUrl = '';
    if (apiEnv === 'production') {
      resolvedUrl = 'https://techtopiagh-crm.onrender.com/';
    } else if (apiEnv === 'local-http') {
      resolvedUrl = 'http://localhost:5102/';
    } else if (apiEnv === 'local-https') {
      resolvedUrl = 'https://localhost:7074/';
    } else if (apiEnv === 'custom') {
      resolvedUrl = customApiUrl;
      localStorage.setItem('crm_api_url_custom', customApiUrl);
    }

    if (apiEnv !== 'auto') {
      localStorage.setItem('crm_api_url', resolvedUrl);
    } else {
      localStorage.removeItem('crm_api_url');
    }
    
    // Save tenant ID
    localStorage.setItem('crm_tenant_id', activeTenantId);
    
    toast.success('Developer API settings saved successfully!');
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setConnectionError('');
    
    let urlToTest = '';
    if (apiEnv === 'production') {
      urlToTest = 'https://techtopiagh-crm.onrender.com/';
    } else if (apiEnv === 'local-http') {
      urlToTest = 'http://localhost:5102/';
    } else if (apiEnv === 'local-https') {
      urlToTest = 'https://localhost:7074/';
    } else if (apiEnv === 'custom') {
      urlToTest = customApiUrl;
    } else {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        urlToTest = 'http://localhost:5102/';
      } else {
        urlToTest = 'https://techtopiagh-crm.onrender.com/';
      }
    }

    if (urlToTest && !urlToTest.endsWith('/')) {
      urlToTest += '/';
    }

    try {
      const response = await apiClient.get(urlToTest, { 
        timeout: 5000,
        headers: { 'Tenant-Id': activeTenantId } 
      });
      if (response.status === 200 || response.data) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setConnectionError(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      setConnectionStatus('error');
      setConnectionError(err.message || 'Connection timed out or refused.');
    }
  };

  const resetTenantId = () => {
    setActiveTenantId('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    toast.success('Tenant ID reset to default Developer Tenant.');
  };

  const TABS = [
    { id: 'profile',    label: 'My Profile',       icon: User },
    { id: 'company',    label: 'Company Settings', icon: Building2 },
    { id: 'appearance', label: 'Appearance',       icon: Palette },
    { id: 'security',   label: 'Security',         icon: Lock },
    { id: 'integrations',label: 'Integrations',    icon: SettingsIcon },
    { id: 'developer',  label: 'API Settings',     icon: Server }
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
                          {authUser?.avatar || 'CT'}
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
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                      autoComplete="current-password"
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
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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

          {/* INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Integrations</h2>
              
              <div className="settings-form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Microsoft 365 Workspace Integration</label>
                  <p className="settings-security-hint" style={{ marginTop: 4, marginBottom: 16 }}>
                    Connect your Microsoft 365 account to automatically provision Microsoft Teams, SharePoint sites, and sync calendars with Techtopia projects.
                  </p>
                  
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: 20, background: 'var(--bg-app)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    {msConnectionStatus.isConnected ? (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        disabled
                        style={{ padding: '10px 20px', color: 'var(--brand-green)', borderColor: 'var(--brand-green)' }}
                      >
                        <CheckCircle size={16} style={{ marginRight: 6 }}/> Connected
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => microsoftIntegrationService.connectMicrosoftAccount()}
                        style={{ padding: '10px 20px' }}
                      >
                        Connect with Microsoft
                      </button>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-title)' }}>
                        {msConnectionStatus.isConnected ? 'Status: Connected' : 'Status: Not Connected'}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {isLoadingMsStatus ? 'Checking connection...' : (msConnectionStatus.isConnected ? `Connected as: ${msConnectionStatus.email}` : 'Click to authenticate and authorize Techtopia CRM.')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEVELOPER API SETTINGS */}
          {activeTab === 'developer' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Developer API Settings</h2>
              <p className="settings-security-hint" style={{ marginTop: -10, marginBottom: 24, borderLeftColor: 'var(--brand-cyan)' }}>
                Configure hostnames and boundary headers to switch between the local mock server, Docker environment, or the live staging API cluster.
              </p>

              <form onSubmit={handleSaveApiSettings} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="settings-form-grid">
                  
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Active Backend Target Environment</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginTop: 8 }}>
                      {[
                        { id: 'auto', name: 'Auto-Detect', desc: 'Localhost/Render' },
                        { id: 'local-http', name: 'Local Dev (HTTP)', desc: 'localhost:5102' },
                        { id: 'local-https', name: 'Local Dev (HTTPS)', desc: 'localhost:7074' },
                        { id: 'production', name: 'Production API', desc: 'onrender.com' },
                        { id: 'custom', name: 'Custom Gateway', desc: 'Configure manual IP' }
                      ].map(env => (
                        <div 
                          key={env.id}
                          className={`settings-theme-card ${apiEnv === env.id ? 'active' : ''}`}
                          style={{ padding: '12px 14px', height: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}
                          onClick={() => setApiEnv(env.id)}
                        >
                          <span style={{ fontSize: 13, fontWeight: 700, display: 'block', textAlign: 'left', color: 'var(--text-title)' }}>{env.name}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', textAlign: 'left', fontFamily: 'monospace' }}>{env.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {apiEnv === 'custom' && (
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Custom Backend Service URL</label>
                      <input 
                        type="url" 
                        className="form-input" 
                        placeholder="https://api.yourdomain.com/" 
                        value={customApiUrl}
                        onChange={e => setCustomApiUrl(e.target.value)}
                        required={apiEnv === 'custom'}
                      />
                    </div>
                  )}

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Active Boundary Tenant Identifier (Tenant-Id)</span>
                      <button 
                        type="button" 
                        className="btn-icon" 
                        style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, height: 'auto', width: 'auto', color: 'var(--brand-cyan)' }}
                        onClick={resetTenantId}
                        title="Reset to default developer tenant"
                      >
                        <RotateCcw size={11} /> Reset Default
                      </button>
                    </label>
                    <input 
                      type="text" 
                      className="form-input font-mono" 
                      placeholder="e.g. a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" 
                      value={activeTenantId}
                      onChange={e => setActiveTenantId(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                      All data transactions and analytical queries will be compartmentalized under this UUID boundary.
                    </span>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Active Endpoint Connection State</label>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 16, marginTop: 8,
                      padding: 14, background: 'var(--bg-app)', border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={handleTestConnection}
                        disabled={connectionStatus === 'testing'}
                        style={{ padding: '8px 16px', fontSize: 12 }}
                      >
                        <Activity size={14} className={connectionStatus === 'testing' ? 'animate-spin' : ''} />
                        {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                      </button>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {connectionStatus === 'idle' && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Idle. Click test to ping host service.</span>
                        )}
                        {connectionStatus === 'success' && (
                          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Check size={14} /> Connection Successful (HTTP 200 OK)
                          </span>
                        )}
                        {connectionStatus === 'error' && (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 12, color: 'var(--error)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <AlertTriangle size={14} /> Connection Failed
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{connectionError}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button type="submit" className="btn btn-primary">
                    <Check size={18} /> Save API Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
