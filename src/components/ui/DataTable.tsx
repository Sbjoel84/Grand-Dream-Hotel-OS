import React, { useMemo, useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './Skeleton';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchField?: (item: T) => string;
  filterComponent?: React.ReactNode;
  actionsComponent?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  pageSize?: number;
  mobileCardRender?: (item: T) => React.ReactNode;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchField,
  filterComponent,
  actionsComponent,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no entries matching your current filters.',
  emptyActionLabel,
  onEmptyAction,
  pageSize = 10,
  mobileCardRender,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((item) => {
      if (searchField) {
        return searchField(item).toLowerCase().includes(term);
      }
      return Object.values(item as any).some((val) =>
        String(val).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchField]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="w-full space-y-3.5">
      {/* Search, Filters, and Table Actions bar */}
      {(searchable || filterComponent || actionsComponent) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            {searchable && (
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 h-9 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            )}
            {filterComponent}
          </div>
          {actionsComponent && (
            <div className="flex items-center gap-2 shrink-0">{actionsComponent}</div>
          )}
        </div>
      )}

      {/* Main Table Container */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-xs">
        {isLoading ? (
          <TableSkeleton rows={pageSize} columns={columns.length} />
        ) : paginatedData.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              actionLabel={emptyActionLabel}
              onAction={onEmptyAction}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm divide-y divide-neutral-800">
                <thead className="bg-neutral-900/90 text-neutral-400 font-medium text-xs">
                  <tr>
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        onClick={() => col.sortable && handleSort(col.accessorKey)}
                        className={`py-3 px-4 select-none ${col.className || ''} ${
                          col.sortable ? 'cursor-pointer hover:text-neutral-200' : ''
                        } ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-flex items-center gap-1.5 ${
                            col.align === 'right'
                              ? 'justify-end'
                              : col.align === 'center'
                              ? 'justify-center'
                              : 'justify-start'
                          }`}
                        >
                          <span>{col.header}</span>
                          {col.sortable && (
                            <ArrowUpDown className="w-3 h-3 text-neutral-500 shrink-0" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {paginatedData.map((item, rowIdx) => (
                    <tr
                      key={item.id || rowIdx}
                      className="hover:bg-neutral-800/40 transition-colors"
                    >
                      {columns.map((col, colIdx) => (
                        <td
                          key={colIdx}
                          className={`py-3 px-4 text-neutral-200 ${col.className || ''} ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          }`}
                        >
                          {col.cell
                            ? col.cell(item)
                            : col.accessorKey
                            ? String(item[col.accessorKey] ?? '—')
                            : null}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-neutral-800">
              {paginatedData.map((item, idx) =>
                mobileCardRender ? (
                  <div key={item.id || idx} className="p-4">
                    {mobileCardRender(item)}
                  </div>
                ) : (
                  <div key={item.id || idx} className="p-4 space-y-2">
                    {columns.map((col, colIdx) => (
                      <div key={colIdx} className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400 font-medium">{col.header}:</span>
                        <span className="text-neutral-200">
                          {col.cell
                            ? col.cell(item)
                            : col.accessorKey
                            ? String(item[col.accessorKey] ?? '—')
                            : null}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Pagination footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-neutral-800 text-xs text-neutral-400">
              <div>
                Showing{' '}
                <span className="font-semibold text-neutral-200 tabular-nums">
                  {(currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-neutral-200 tabular-nums">
                  {Math.min(currentPage * pageSize, sortedData.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-neutral-200 tabular-nums">
                  {sortedData.length}
                </span>{' '}
                entries
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 py-0.5 font-medium tabular-nums text-neutral-200">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
