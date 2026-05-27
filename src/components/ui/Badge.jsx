import React from 'react';

export default function Badge({ children, variant = 'neutral', className = '' }) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
  
  const variantClasses = {
    neutral: 'bg-gray-800/40 text-gray-300 border-gray-700/50',
    success: 'bg-[#21FA90]/10 text-[#21FA90] border-[#21FA90]/25',
    error: 'bg-[#FF47DA]/10 text-[#FF47DA] border-[#FF47DA]/25',
    warning: 'bg-[#E4FF1A]/10 text-[#E4FF1A] border-[#E4FF1A]/25',
    info: 'bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/25',
    purple: 'bg-[#8A4FFF]/10 text-[#8A4FFF] border-[#8A4FFF]/25',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant] || variantClasses.neutral} ${className}`}>
      {children}
    </span>
  );
}
