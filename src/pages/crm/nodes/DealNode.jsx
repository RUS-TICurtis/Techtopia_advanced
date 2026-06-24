import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Calendar, Building2, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const DealNode = ({ data, selected }) => {
  const { deal, prob, onEdit, onDelete } = data;

  return (
    <div
      className={`relative bg-[#1E293B] border border-gray-800 rounded-xl p-4 shadow-lg w-[280px] transition-all hover:border-[#38BDF8]/50 ${selected ? 'ring-2 ring-[#38BDF8] border-[#38BDF8]' : ''}`}
    >
      <div className="flex justify-between items-start gap-2 mb-2 cursor-grab active:cursor-grabbing">
        <h4 className="text-white font-semibold text-sm leading-tight truncate">{deal.name}</h4>
        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit?.(deal, e); }}
            className="p-1 rounded bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete?.(deal.id, e); }}
            className="p-1 rounded bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
        <Building2 size={12} />
        <span className="truncate">{deal.company?.name || 'Independent'}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <Calendar size={11} />
          <span>{deal.closeDate || 'No date'}</span>
        </div>
        <div className="flex items-center gap-1 text-[#38BDF8]">
          <span>{prob}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
        <span className="font-bold text-white text-sm">
          ${(deal.amount || 0).toLocaleString()}
        </span>
        <Badge 
          variant={
            deal.priority === 'High' ? 'error' : 
            deal.priority === 'Medium' ? 'warning' : 'neutral'
          }
        >
          {deal.priority}
        </Badge>
      </div>

      {/* Handles are hidden but required for React Flow logic if edges are used */}
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
};

export default memo(DealNode);
