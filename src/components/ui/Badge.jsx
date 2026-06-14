import React from 'react';

export default function Badge({ children, variant = 'neutral', className = '' }) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
  
  const variantClasses = {
    neutral: 'bg-gray-800/40 text-gray-300 border-gray-700/50',
    success: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/25',
    error: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/25',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/25',
    info: 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/25',
    purple: 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/25',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant] || variantClasses.neutral} ${className}`}>
      {children}
    </span>
  );
}
