import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Monitor, Smartphone, Globe, ArrowRight } from 'lucide-react';
import './DeviceTrust.css';

export default function DeviceTrust() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleApprove = () => {
    alert('Device marked as trusted for 30 days.');
    navigate('/');
  };

  return (
    <div className="device-trust-wrapper">
      <div className="device-trust-card bg-[#12141a] border border-gray-800 rounded-xl p-8 max-w-md w-full shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="icon-wrapper bg-[#a6e22e]/10 text-[#a6e22e] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#a6e22e]/20">
            <Monitor size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">New Device Detected</h2>
          <p className="text-gray-400 text-sm">
            For security, please verify the following details to trust this browser context.
          </p>
        </div>

        {/* Device metadata */}
        <div className="space-y-4 bg-[#0a0c10] border border-gray-800 rounded-lg p-4 mb-6 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <Globe className="text-[#00e5ff] mt-0.5" size={18} />
            <div>
              <span className="text-xs text-gray-500 block uppercase font-mono">Location & IP</span>
              <span className="font-medium text-white">Austin, TX, USA (192.168.1.12)</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Monitor className="text-[#00e5ff] mt-0.5" size={18} />
            <div>
              <span className="text-xs text-gray-500 block uppercase font-mono">Browser & OS</span>
              <span className="font-medium text-white">Vite / React Chrome Client (Windows 11)</span>
            </div>
          </div>
        </div>

        <div className="checkbox-trust flex items-start gap-3 mb-6 cursor-pointer" onClick={() => setAgreed(!agreed)}>
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={() => {}} 
            className="mt-1 h-4 w-4 rounded border-gray-800 bg-[#0a0c10] text-[#a6e22e] accent-[#a6e22e] focus:ring-0" 
          />
          <span className="text-xs text-gray-400 leading-tight">
            I trust this device and want to remember it for 30 days. MFA will not be requested during this period.
          </span>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/auth/login')} className="btn btn-secondary flex-1 py-3 text-center">
            Go Back
          </button>
          <button 
            onClick={handleApprove} 
            className="btn btn-primary flex-1 py-3 flex justify-center items-center gap-2"
          >
            <span>Confirm</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
