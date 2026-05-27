import React from 'react';

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={`skeleton animate-pulse ${className}`}
      {...props}
    />
  );
}

export function TableRowSkeleton({ columnsCount = 5, rowsCount = 4 }) {
  return (
    <>
      {[...Array(rowsCount)].map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-gray-800 animate-pulse">
          {[...Array(columnsCount)].map((_, cIdx) => (
            <td key={cIdx} className="p-4">
              <div className="h-4 bg-gray-800 rounded w-full"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#12141a] border border-gray-800 rounded-xl p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="skeleton-avatar bg-gray-800 h-10 w-10"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-800 rounded w-1/3"></div>
          <div className="h-3 bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-gray-800 rounded w-full"></div>
        <div className="h-3 bg-gray-800 rounded w-5/6"></div>
      </div>
    </div>
  );
}
