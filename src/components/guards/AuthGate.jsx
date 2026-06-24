import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AuthGate({ children }) {
  const { authStatus } = useAuth();

  if (authStatus === 'INITIALIZING') {
    return (
      <div 
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F172A]"
        style={{
          fontFamily: "'Sora', sans-serif",
          background: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)'
        }}
      >
        {/* Glow elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#38BDF8]/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[250px] h-[250px] bg-[#6366F1]/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col items-center gap-6 relative z-10 px-6 text-center">
          {/* Neon Pulse Loader Logo */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-[#1E293B] border border-white/5 shadow-2xl">
            <span className="select-none animate-pulse"><img className='refresh_icon' style ={{width: "50px", height: "50px"}} src="favicon.png" alt="" /></span>
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-2xl border border-[#38BDF8]/30 animate-ping opacity-45"></div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide font-display">Techtopia CRM Hub</h2>
            <p className="text-xs text-[#64748B] font-mono uppercase tracking-[0.2em] animate-pulse">
              IRONCLAD SECURITY VERIFICATION...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
