import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function EmptyState({ 
  title = 'No records found', 
  description = 'Try clearing your filters or adding a new record to get started.',
  icon: Icon = AlertCircle,
  action
}) {
  return (
    <div className="card flex flex-col items-center justify-center text-center p-12 max-w-lg mx-auto my-8 shadow-none bg-opacity-50">
      <div className="p-4 rounded-2xl mb-4" style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', border: '1px solid var(--border-light)' }}>
        <Icon size={32} />
      </div>
      <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-title)' }}>{title}</h3>
      <p className="text-sm max-w-sm mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}
