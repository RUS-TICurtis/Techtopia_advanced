import React from 'react';

export default function SectionCard({ title, children, actions, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-title flex justify-between items-center mb-5">
          {title && <span className="font-display font-bold text-white text-base">{title}</span>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
