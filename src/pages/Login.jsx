import { useState } from 'react';


import { useAuthStore, DUMMY_USERS } from '../store/authStore';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import './Login.css';

export default function Login({ theme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);


  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate network delay
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        // navigation not needed; app will re‑render after auth state change
      } else {
        setError('Invalid credentials. Please select a demo role below.');
      }
      setIsLoading(false);
    }, 800);
  };

  const autoFill = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
  };

  return (
    <div className="login-container">
      {/* Left Branding Panel */}
      <div className="login-branding">
        <div className="login-branding-content">
          <div className="login-logo">
            <img 
              src="/src/assets/logo-dark.png" 
              alt="Techtopia CRM" 
              style={{ height: '40px' }} 
            />
          </div>
          <div className="login-hero-text">
            <h1>The Intelligent Operating System for Enterprise IT</h1>
            <p>Unify your deals, tickets, and client operations in one secure, AI-powered workspace.</p>
          </div>
          
          <div className="login-features">
            <div className="feature-item">
              <ShieldCheck className="feature-icon" size={24} />
              <span>Enterprise-grade Security & RBAC</span>
            </div>
            <div className="feature-item">
              <Sparkles className="feature-icon" size={24} />
              <span>AI-native workflows & automation</span>
            </div>
          </div>
        </div>
        {/* Abstract shapes / gradients for premium feel */}
        <div className="abstract-glow glow-1"></div>
        <div className="abstract-glow glow-2"></div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-wrapper">
        <div className="login-form-container">
          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Please enter your details to sign in.</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember for 30 days</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>



            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Dummy Data Selector */}
          <div className="demo-roles">
            <div className="demo-roles-divider">
              <span>Quick Login (Demo Roles)</span>
            </div>
            <div className="demo-roles-grid">
              {DUMMY_USERS.map(user => (
                <button 
                  key={user.id} 
                  className="demo-role-btn"
                  onClick={() => autoFill(user)}
                  type="button"
                >
                  <span className="demo-role-name">{user.name}</span>
                  <span className="demo-role-title">{user.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Logout button visible even when not logged in
      <button
        className="btn btn-secondary logout-btn"
        onClick={logout}
        style={{ position: 'fixed', bottom: '20px', right: '20px' }}
      >
        Logout
      </button> */}
    </div>
  );
}
