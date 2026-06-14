import { toast } from 'react-hot-toast';
import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const toastStyles = {
  style: {
    background: '#1E293B',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    fontFamily: "'Sora', sans-serif",
    fontSize: '14px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  },
};

export const showToast = {
  success: (message) => {
    toast.success(message, {
      ...toastStyles,
      icon: <CheckCircle size={18} className="text-[#10B981]" />,
    });
  },
  error: (message) => {
    toast.error(message, {
      ...toastStyles,
      icon: <AlertCircle size={18} className="text-[#EF4444]" />,
    });
  },
  warning: (message) => {
    toast(message, {
      ...toastStyles,
      icon: <AlertTriangle size={18} className="text-[#F59E0B]" />,
    });
  },
  info: (message) => {
    toast(message, {
      ...toastStyles,
      icon: <Info size={18} className="text-[#38BDF8]" />,
    });
  },
};
