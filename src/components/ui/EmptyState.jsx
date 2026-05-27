import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function EmptyState({ 
  title = 'No records found', 
  description = 'Try clearing your filters or adding a new record to get started.',
  icon: Icon = AlertCircle,
  action
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-[#0f1629]/40 border border-gray-800 rounded-xl max-w-lg mx-auto my-8">
      <div className="p-4 bg-gray-900/50 text-[#00e5ff] rounded-2xl mb-4 border border-gray-850">
        <Icon size={32} />
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
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
