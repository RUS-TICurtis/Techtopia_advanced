import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Sparkles, DollarSign } from 'lucide-react';

// The StageGroupNode acts as a swimlane / column container.
const StageGroupNode = ({ data, selected }) => {
  const { title, count, value, color } = data;

  return (
    <div
      className={`relative w-full h-full rounded-2xl border-2 transition-colors duration-300 ${selected ? 'border-[#38BDF8] bg-[#0F172A]/80' : 'border-gray-800/80 bg-[#0F172A]/40'}`}
      style={{ minWidth: 320, minHeight: 600 }}
    >
      <div 
        className="flex items-center justify-between px-4 py-3 border-b border-gray-800/80 rounded-t-xl"
        style={{ backgroundColor: `${color}1A` }} // very light tint of the stage color
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
          <span className="font-semibold text-white font-display uppercase tracking-wider text-sm">{title}</span>
          <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full">{count}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 block">Total Value</span>
          <span className="text-sm font-bold text-white flex items-center justify-end">
            ${(value || 0).toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* 
        This is a group node, so child nodes will be rendered on top of it by React Flow automatically.
        We don't need handles since Deals will be dragged *into* this area, but we can add invisible ones 
        if we want to connect stages via edges. 
      */}
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
};

export default memo(StageGroupNode);
