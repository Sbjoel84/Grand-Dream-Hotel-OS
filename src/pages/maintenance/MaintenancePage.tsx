import React, { useState } from 'react';
import { CheckCircle2, Clock, Eye, Plus, Wrench } from 'lucide-react';
import { useMaintenance, useRooms } from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MaintenancePriority, MaintenanceRequest, MaintenanceStatus } from '../../types';

export const MaintenancePage: React.FC = () => {
  const { data: requests = [], isLoading, createRequest, updateStatus } = useMaintenance();
  const { data: rooms = [] } = useRooms();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<MaintenanceRequest | null>(null);

  // Status Change State
  const [statusChangeReq, setStatusChangeReq] = useState<MaintenanceRequest | null>(null);
  const [targetStatus, setTargetStatus] = useState<MaintenanceStatus>('In Progress');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Form states
  const [roomOrFacility, setRoomOrFacility] = useState('Room 101');
  const [category, setCategory] = useState<MaintenanceRequest['category']>('HVAC / AC');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MaintenancePriority>('Medium');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRequest.mutateAsync({
      roomOrFacility,
      category,
      issue,
      description,
      priority,
      status: 'Open',
      reportedById: 'user-3',
      reportedByName: 'Chioma Adeyemi',
      estimatedCost,
    });
    setIsModalOpen(false);
    setIssue('');
    setDescription('');
  };

  const handleStatusChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusChangeReq) return;
    await updateStatus.mutateAsync({
      id: statusChangeReq.id,
      status: targetStatus,
      notes: resolutionNotes || undefined,
    });
    setStatusChangeReq(null);
    setResolutionNotes('');
  };

  const columns = [
    {
      header: 'Ticket #',
      accessorKey: 'ticketNumber' as keyof MaintenanceRequest,
      sortable: true,
      cell: (m: MaintenanceRequest) => (
        <span className="font-mono font-bold text-amber-400 text-xs">{m.ticketNumber}</span>
      ),
    },
    {
      header: 'Location / Facility',
      accessorKey: 'roomOrFacility' as keyof MaintenanceRequest,
      sortable: true,
      cell: (m: MaintenanceRequest) => (
        <div>
          <span className="font-semibold text-neutral-200 text-xs">{m.roomOrFacility}</span>
          <p className="text-[10px] text-neutral-400">{m.category}</p>
        </div>
      ),
    },
    {
      header: 'Fault / Issue',
      cell: (m: MaintenanceRequest) => (
        <div className="text-xs text-neutral-300">
          <p className="font-medium text-white">{m.issue}</p>
          <p className="text-[11px] text-neutral-400 line-clamp-1">{m.description}</p>
        </div>
      ),
    },
    {
      header: 'Priority',
      cell: (m: MaintenanceRequest) => (
        <span
          className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
            m.priority === 'Critical' || m.priority === 'High'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              : m.priority === 'Medium'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'bg-neutral-800 text-neutral-400'
          }`}
        >
          {m.priority}
        </span>
      ),
    },
    {
      header: 'Engineer Assigned',
      cell: (m: MaintenanceRequest) => (
        <span className="text-xs text-neutral-300">
          {m.assignedToName || <span className="text-neutral-500">Unassigned</span>}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof MaintenanceRequest,
      sortable: true,
      cell: (m: MaintenanceRequest) => <StatusBadge status={m.status} />,
    },
    {
      header: 'Reported',
      cell: (m: MaintenanceRequest) => (
        <span className="font-mono text-xs text-neutral-400 tabular-nums">
          {formatDateTime(m.reportedAt).split(',')[0]}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right' as const,
      cell: (m: MaintenanceRequest) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedReq(m)}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusChangeReq(m);
              setTargetStatus(m.status);
            }}
          >
            Status
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Facilities & Maintenance Engineering
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Work order tracking for guest rooms, generator plant, central chillers & plumbing
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Log Maintenance Ticket
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        isLoading={isLoading}
        searchPlaceholder="Search maintenance requests by ticket, room or issue..."
      />

      {/* Modal: New Maintenance Request */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Maintenance Work Order"
          description="Log facility or guest room repairs. High-priority room issues will automatically take the room out of service."
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Room / Facility Location"
                required
                value={roomOrFacility}
                onChange={(e) => setRoomOrFacility(e.target.value)}
              >
                <optgroup label="Guest Rooms">
                  {rooms.map((r) => (
                    <option key={r.id} value={`Room ${r.roomNumber}`}>
                      Room {r.roomNumber} ({r.roomType?.name})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Hotel Facilities & Plant">
                  <option value="Main 250kVA CAT Generator House">Main 250kVA CAT Generator</option>
                  <option value="Underground Diesel Storage Tank">Underground Diesel Tank</option>
                  <option value="Central Cold Room & Chiller">Central Cold Room</option>
                  <option value="Restaurant & Bar Lounge">Restaurant & Bar Lounge</option>
                  <option value="Swimming Pool & Water Treatment Plant">Swimming Pool / Water Treatment</option>
                  <option value="Reception Lobby / Elevator">Reception Lobby / Elevator</option>
                </optgroup>
              </Select>

              <Select
                label="Technical Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="HVAC / AC">HVAC / Air Conditioning</option>
                <option value="Electrical">Electrical & Power</option>
                <option value="Plumbing">Plumbing & Water</option>
                <option value="Carpentry & Furniture">Carpentry & Furniture</option>
                <option value="Electronics">Electronics & Smart TV</option>
                <option value="Civil Works">Civil Works & Masonry</option>
              </Select>

              <Select
                label="Priority Severity"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="Low">Low (Cosmetic / Non-Urgent)</option>
                <option value="Medium">Medium (Routine Service)</option>
                <option value="High">High (Affects Guest Comfort)</option>
                <option value="Critical">Critical (Immediate Out of Service)</option>
              </Select>

              <Input
                label="Estimated Repair Cost (₦)"
                type="number"
                min={0}
                value={estimatedCost || ''}
                onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
              />
            </div>

            <Input
              label="Fault Summary"
              required
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g. AC leaking water or generator filter replacement"
            />

            <Input
              label="Technical Detailed Description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Condensate pipe appears choked with dust; water dripping on writing table"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Submit Work Order
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Status Update */}
      {statusChangeReq && (
        <Modal
          isOpen={Boolean(statusChangeReq)}
          onClose={() => setStatusChangeReq(null)}
          title={`Update Work Order: ${statusChangeReq.ticketNumber}`}
          description={`Facility: ${statusChangeReq.roomOrFacility} • Issue: ${statusChangeReq.issue}`}
        >
          <form onSubmit={handleStatusChangeSubmit} className="space-y-4">
            <Select
              label="Work Order Status"
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as any)}
            >
              <option value="Open">Open</option>
              <option value="Assigned">Assigned to Engineer</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved (Sanitization released to Housekeeping)</option>
              <option value="Closed">Closed & Verified</option>
            </Select>

            <Input
              label="Resolution Work Notes"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Replaced thermocouple sensor, flushed condensate drain pipe, tested cooling"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setStatusChangeReq(null)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Save Status
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Details */}
      {selectedReq && (
        <Modal
          isOpen={Boolean(selectedReq)}
          onClose={() => setSelectedReq(null)}
          title={`Ticket #${selectedReq.ticketNumber}`}
          size="md"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Location:</span>
                <span className="text-white font-bold">{selectedReq.roomOrFacility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Category:</span>
                <span className="text-neutral-200">{selectedReq.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Issue:</span>
                <span className="text-amber-400 font-bold">{selectedReq.issue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Priority:</span>
                <span className="text-rose-400 font-semibold">{selectedReq.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Status:</span>
                <StatusBadge status={selectedReq.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Reported By:</span>
                <span className="text-neutral-300">{selectedReq.reportedByName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Assigned Engineer:</span>
                <span className="text-neutral-300">{selectedReq.assignedToName || 'Unassigned'}</span>
              </div>
              <div className="pt-2 border-t border-neutral-800 text-neutral-300 font-sans">
                {selectedReq.description}
              </div>
              {selectedReq.resolutionNotes && (
                <div className="pt-2 border-t border-neutral-800 text-emerald-400 font-sans">
                  <strong>Resolution:</strong> {selectedReq.resolutionNotes}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setSelectedReq(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
