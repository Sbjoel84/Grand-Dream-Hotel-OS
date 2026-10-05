import React, { useMemo, useState } from 'react';
import { Clock, Filter, ShieldCheck, User } from 'lucide-react';
import { useAuditLogs } from '../../hooks/useHotelData';
import { formatDateTime } from '../../utils/date';
import { DataTable } from '../../components/ui/DataTable';
import { AuditLog } from '../../types';

export const AuditLogsPage: React.FC = () => {
  const { data: logs = [], isLoading } = useAuditLogs();

  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  const modules = [
    'Front Desk',
    'Rooms',
    'Reservations',
    'Guests',
    'Housekeeping',
    'POS',
    'Inventory',
    'Procurement',
    'Finance',
    'Maintenance',
    'Users',
    'Settings',
  ];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchMod = moduleFilter === 'all' || log.module === moduleFilter;
      const matchUser = userFilter === 'all' || log.userName === userFilter;
      return matchMod && matchUser;
    });
  }, [logs, moduleFilter, userFilter]);

  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.userName)));
  }, [logs]);

  const columns = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp' as keyof AuditLog,
      sortable: true,
      cell: (l: AuditLog) => (
        <span className="font-mono text-xs text-neutral-400 tabular-nums">
          {formatDateTime(l.timestamp)}
        </span>
      ),
    },
    {
      header: 'Staff User',
      accessorKey: 'userName' as keyof AuditLog,
      sortable: true,
      cell: (l: AuditLog) => (
        <div>
          <span className="font-semibold text-neutral-200 text-xs">{l.userName}</span>
          <p className="text-[10px] text-amber-500/80 font-mono capitalize">{l.userRole}</p>
        </div>
      ),
    },
    {
      header: 'Module',
      accessorKey: 'module' as keyof AuditLog,
      sortable: true,
      cell: (l: AuditLog) => (
        <span className="font-mono text-xs text-neutral-300 font-medium">{l.module}</span>
      ),
    },
    {
      header: 'Action Taken',
      accessorKey: 'action' as keyof AuditLog,
      cell: (l: AuditLog) => (
        <span className="font-semibold text-white text-xs">{l.action}</span>
      ),
    },
    {
      header: 'Target Record',
      cell: (l: AuditLog) => (
        <span className="font-mono text-xs text-amber-400">{l.recordIdentifier}</span>
      ),
    },
    {
      header: 'Details',
      cell: (l: AuditLog) => (
        <span className="text-xs text-neutral-300 leading-snug">{l.details}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Security & Audit Trail</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Immutable log of all reservations, payments, stock movements & operational changes
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredLogs}
        isLoading={isLoading}
        searchPlaceholder="Search audit log by action, identifier or details..."
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="h-9 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="h-9 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Staff Users</option>
              {uniqueUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        }
      />
    </div>
  );
};
