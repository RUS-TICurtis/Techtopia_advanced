import React from 'react';

export default function PageHeader({ title, subtitle, actions, icon, className = '' }) {
  return (
    <div className={`page-header mb-6 ${className}`}>
      <div>
        <h1 className="page-title flex items-center gap-2">
          {icon && <span className="flex items-center">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
