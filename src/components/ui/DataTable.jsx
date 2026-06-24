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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
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
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
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
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(pageSize)].map((_, rIdx) => (
                <TableRow key={`loading-${rIdx}`}>
                  {columns.map((_, cIdx) => (
                    <TableCell key={`loading-${rIdx}-${cIdx}`} className="p-4">
                      <div className="skeleton h-4 w-full bg-muted rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center p-12 text-gray-500">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => {
                const trElement = (
                  <TableRow 
                    key={row.id} 
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={onRowClick ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
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
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {data.length > 0 && !loading && (
        <div className="table-pagination flex items-center justify-between p-4 border-t border-border">
          <div className="pagination-info text-sm text-muted-foreground">
            Showing Page <span className="font-semibold text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{' '}
            <span className="font-semibold text-foreground">{table.getPageCount()}</span> ({data.length} records)
          </div>
          <div className="pagination-buttons flex gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded bg-muted text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded bg-muted text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded bg-muted text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded bg-muted text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
