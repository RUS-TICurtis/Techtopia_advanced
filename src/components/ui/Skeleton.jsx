import React from 'react';

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={`skeleton animate-pulse rounded ${className}`}
      style={{ backgroundColor: 'var(--border-light)' }}
      {...props}
    />
  );
}

export function TableRowSkeleton({ columnsCount = 5, rowsCount = 4 }) {
  return (
    <>
      {[...Array(rowsCount)].map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse" style={{ borderBottom: '1px solid var(--border-light)' }}>
          {[...Array(columnsCount)].map((_, cIdx) => (
            <td key={cIdx} className="p-4">
              <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--border-light)' }}></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="skeleton-avatar h-10 w-10 rounded-full" style={{ backgroundColor: 'var(--border-light)' }}></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 rounded w-1/3" style={{ backgroundColor: 'var(--border-light)' }}></div>
          <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--border-light)' }}></div>
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 rounded w-full" style={{ backgroundColor: 'var(--border-light)' }}></div>
        <div className="h-3 rounded w-5/6" style={{ backgroundColor: 'var(--border-light)' }}></div>
      </div>
    </div>
  );
}
