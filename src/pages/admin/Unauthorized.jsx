import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Sparkles } from 'lucide-react';
import './Unauthorized.css';

export default function Unauthorized() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="unauthorized-page-wrapper">
      <div className="unauthorized-card glassmorphism animate-fade-in">
        {/* Glowing Shield Icon */}
        <div className="shield-icon-glow bg-[#EF4444]/10 border border-[#EF4444]/35 text-[#EF4444]">
          <ShieldAlert size={36} className="animate-pulse" />
        </div>

        {/* Title Header */}
        <h1 className="unauthorized-title font-display font-black text-2xl text-white mt-4">
          Access Gate Restricted
        </h1>
        <p className="unauthorized-desc text-xs text-gray-400 max-w-[340px] mx-auto mt-2 leading-relaxed">
          Your current account role does not hold the active RBAC/ABAC clearance scopes required to enter this platform sector.
        </p>

        {/* Dynamic Countdown Info */}
        <div className="countdown-container mt-4 px-4 py-2.5 bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-xl max-w-[280px] mx-auto">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles size={11} className="text-[#EF4444]" />
            Relocating to Hub Sector
          </span>
          <div className="font-mono text-xl font-black text-[#EF4444] mt-1">
            0:0{countdown}
          </div>
        </div>

        {/* User Manual Actions */}
        <div className="actions-row mt-6 flex flex-col gap-2.5 max-w-[280px] mx-auto">
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 bg-[#38BDF8] hover:bg-[#2563EB] text-[#0F172A] font-bold shadow-glow"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Home size={14} />
            Return to Dashboard
          </button>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2 border border-gray-800 text-gray-400 hover:text-white"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
