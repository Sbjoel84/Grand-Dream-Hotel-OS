import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { useHousekeeping, useRooms } from '../../hooks/useHotelData';
import { formatDate, formatDateTime } from '../../utils/date';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { HousekeepingStatus, HousekeepingTask } from '../../types';

export const HousekeepingPage: React.FC = () => {
  const { data: tasks = [], isLoading, updateTask } = useHousekeeping();
  const { data: rooms = [] } = useRooms();

  const [activeTask, setActiveTask] = useState<HousekeepingTask | null>(null);
  const [staffName, setStaffName] = useState('Fatima Abubakar');
  const [taskNotes, setTaskNotes] = useState('');

  // Group tasks by required workflow states:
  // Needs Cleaning -> Cleaning -> Inspection -> Ready -> Maintenance
  const taskGroups = useMemo(() => {
    const groups: Record<HousekeepingStatus, HousekeepingTask[]> = {
      'Needs Cleaning': [],
      Cleaning: [],
      Inspection: [],
      Ready: [],
      Maintenance: [],
    };

    tasks.forEach((t) => {
      if (groups[t.status]) {
        groups[t.status].push(t);
      }
    });

    return groups;
  }, [tasks]);

  const handleAdvanceStatus = async (
    task: HousekeepingTask,
    nextStatus: HousekeepingStatus
  ) => {
    await updateTask.mutateAsync({
      taskId: task.id,
      status: nextStatus,
      staffName,
      notes: taskNotes || undefined,
    });
    setActiveTask(null);
    setTaskNotes('');
  };

  const columns: { status: HousekeepingStatus; label: string; color: string; border: string }[] = [
    {
      status: 'Needs Cleaning',
      label: 'Needs Cleaning',
      color: 'text-amber-400',
      border: 'border-amber-500/30 bg-amber-500/5',
    },
    {
      status: 'Cleaning',
      label: 'In Progress / Cleaning',
      color: 'text-sky-400',
      border: 'border-sky-500/30 bg-sky-500/5',
    },
    {
      status: 'Inspection',
      label: 'Awaiting Inspection',
      color: 'text-indigo-400',
      border: 'border-indigo-500/30 bg-indigo-500/5',
    },
    {
      status: 'Ready',
      label: 'Inspected & Ready',
      color: 'text-emerald-400',
      border: 'border-emerald-500/30 bg-emerald-500/5',
    },
    {
      status: 'Maintenance',
      label: 'Work Order Maintenance',
      color: 'text-rose-400',
      border: 'border-rose-500/30 bg-rose-500/5',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Housekeeping Operations & Turnover Board
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Controlled sanitization workflow: Needs Cleaning → Cleaning → Inspection → Ready
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
            <span className="text-neutral-400">Acting Attendant:</span>
            <span className="font-semibold text-amber-400">{staffName}</span>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map((col) => {
          const groupTasks = taskGroups[col.status] || [];

          return (
            <div
              key={col.status}
              className={`flex flex-col rounded-2xl border p-4 min-h-[500px] ${col.border} backdrop-blur-xs`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 mb-3">
                <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700/60 tabular-nums">
                  {groupTasks.length}
                </span>
              </div>

              {/* Tasks list in column */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {groupTasks.length === 0 ? (
                  <p className="text-[11px] text-neutral-500 italic text-center py-8">
                    No rooms in this stage
                  </p>
                ) : (
                  groupTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 shadow-sm space-y-2.5 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-sm font-bold font-mono text-white">
                            Room {t.roomNumber}
                          </span>
                          <p className="text-[10px] text-neutral-400">
                            {t.roomType} • Floor {t.floor}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            t.priority === 'Urgent'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      {t.guestOccupied ? (
                        <p className="text-[11px] text-amber-400/90 font-medium">
                          ● Stay-over Service (Guest in room)
                        </p>
                      ) : (
                        <p className="text-[11px] text-neutral-400">Checkout Turnover</p>
                      )}

                      {t.notes && (
                        <p className="text-xs text-neutral-300 leading-snug line-clamp-2 italic bg-neutral-950 p-2 rounded border border-neutral-800/80">
                          "{t.notes}"
                        </p>
                      )}

                      {/* Staff Assigned Details */}
                      {t.assignedToName && (
                        <p className="text-[10px] text-neutral-400">
                          Attendant: <span className="text-neutral-200">{t.assignedToName}</span>
                        </p>
                      )}

                      {/* Action buttons based on current state */}
                      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-1">
                        {t.status === 'Needs Cleaning' && (
                          <Button
                            variant="gold"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => handleAdvanceStatus(t, 'Cleaning')}
                            icon={<Play className="w-3 h-3" />}
                          >
                            Start Cleaning
                          </Button>
                        )}

                        {t.status === 'Cleaning' && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => handleAdvanceStatus(t, 'Inspection')}
                            icon={<CheckCircle className="w-3 h-3" />}
                          >
                            Mark Finished (Inspect)
                          </Button>
                        )}

                        {t.status === 'Inspection' && (
                          <Button
                            variant="gold"
                            size="sm"
                            className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                            onClick={() => handleAdvanceStatus(t, 'Ready')}
                            icon={<UserCheck className="w-3 h-3" />}
                          >
                            Approve Room Ready
                          </Button>
                        )}

                        {t.status === 'Ready' && (
                          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mx-auto">
                            <CheckCircle className="w-3.5 h-3.5" /> Room Available
                          </span>
                        )}

                        {t.status === 'Maintenance' && (
                          <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mx-auto">
                            <Wrench className="w-3.5 h-3.5" /> Awaiting Technician
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
