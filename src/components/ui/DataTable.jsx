import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import ContextMenu from './ContextMenu';
import './DataTable.css';

export default function DataTable({ 
  columns, 
  data, 
  loading = false, 
  pageSize = 10,
  onRowClick,
  getRowContextMenuItems
}) {
  const [sorting, setSorting] = useState([]);
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  return (
    <div className="enterprise-data-table-container">
      <div className="table-wrapper">
        <table className="enterprise-table">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center gap-1.5'
                            : 'flex items-center gap-1.5',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown size={14} className="text-gray-500 hover:text-white" />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              [...Array(pageSize)].map((_, rIdx) => (
                <tr key={`loading-${rIdx}`}>
                  {columns.map((_, cIdx) => (
                    <td key={`loading-${rIdx}-${cIdx}`} className="p-4">
                      <div className="skeleton h-4 w-full"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center p-12 text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => {
                const trElement = (
                  <tr 
                    key={row.id} 
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={onRowClick ? 'clickable-row' : ''}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );

                if (getRowContextMenuItems) {
                  return (
                    <ContextMenu
                      key={row.id}
                      trigger={trElement}
                      items={getRowContextMenuItems(row.original)}
                    />
                  );
                }

                return trElement;
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data.length > 0 && !loading && (
        <div className="table-pagination">
          <div className="pagination-info text-sm text-gray-400">
            Showing Page <span className="font-semibold text-white">{table.getState().pagination.pageIndex + 1}</span> of{' '}
            <span className="font-semibold text-white">{table.getPageCount()}</span> ({data.length} records)
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="btn btn-secondary px-2 py-1"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="btn btn-secondary px-2 py-1"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="btn btn-secondary px-2 py-1"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="btn btn-secondary px-2 py-1"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
