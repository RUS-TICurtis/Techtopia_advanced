import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ShieldCheck, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import './MFA.css';

export default function MFA() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const navigate = useNavigate();
  
  const user = useAuthStore(state => state.user);
  const verifyMfa = useAuthStore(state => state.verifyMfa);

  useEffect(() => {
    // Redirect if they got here without being partially authed
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    // Auto-focus next field
    if (value && index < 5) {
      document.getElementById(`mfa-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`mfa-input-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await verifyMfa(verificationCode);
    if (res.success) {
      if (res.user?.role === 'client') {
        navigate('/client');
      } else {
        navigate('/');
      }
    } else {
      setError(res.error || 'Invalid verification code. Use demo code 123456.');
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(59);
    setError('');
    alert('A new authentication code has been sent to your registered device.');
  };

  return (
    <div className="mfa-wrapper">
      <div className="mfa-card">
        <div className="abstract-glow glow-1"></div>
        <div className="abstract-glow glow-2"></div>
        
        <div className="mfa-header">
          <div className="mfa-icon">
            <ShieldCheck size={28} />
          </div>
          <h2 className="mfa-title">Two-Factor Authentication</h2>
          <p className="mfa-subtitle">
            Enter the 6-digit verification code sent to your authenticator app for <span className="mfa-email">{user?.email}</span>.
          </p>
        </div>

        {error && <div className="mfa-error">{error}</div>}

        <form onSubmit={handleSubmit} className="mfa-form">
          <div className="mfa-inputs-container">
            {code.map((num, idx) => (
              <input
                key={idx}
                id={`mfa-input-${idx}`}
                type="text"
                maxLength="1"
                value={num}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="mfa-input"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary mfa-submit-btn"
            disabled={loading}
          >
            <span>{loading ? 'Verifying...' : 'Verify Code'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mfa-footer">
          {timer > 0 ? (
            <p>Resend code in <span className="mfa-timer">{timer}s</span></p>
          ) : (
            <button onClick={handleResend} className="mfa-resend-btn">
              <RefreshCw size={14} /> Resend Code
            </button>
          )}

          <div className="demo-bypass">
            <div className="flex items-center gap-1">
              <KeyRound size={12} className="text-gray-500" />
              <span>Demo Bypass Code: <strong className="demo-bypass-code">123456</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
