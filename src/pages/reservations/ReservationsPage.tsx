import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Filter,
  LogIn,
  LogOut,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import {
  useGuests,
  useReservations,
  useRooms,
  useRoomTypes,
} from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { calculateNights, formatDate, getTodayDateString, isDateOverlap } from '../../utils/date';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/DataTable';
import { BookingSource, Reservation, ReservationStatus } from '../../types';

export const ReservationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldOpenNew = searchParams.get('action') === 'new';

  const { data: reservations = [], isLoading, createReservation, updateReservation, cancelReservation } = useReservations();
  const { data: rooms = [] } = useRooms();
  const { data: roomTypes = [] } = useRoomTypes();
  const { data: guests = [] } = useGuests();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(shouldOpenNew);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [cancelResId, setCancelResId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  // Form states for New Reservation
  const [guestId, setGuestId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('rt-standard');
  const [roomId, setRoomId] = useState('');
  const [checkInDate, setCheckInDate] = useState(getTodayDateString());
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [depositPaid, setDepositPaid] = useState(0);
  const [bookingSource, setBookingSource] = useState<BookingSource>('Direct Phone');
  const [specialRequests, setSpecialRequests] = useState('');
  const [conflictError, setConflictError] = useState('');

  // Auto fill guest details when selected
  const handleGuestSelect = (id: string) => {
    setGuestId(id);
    const g = guests.find((guest) => guest.id === id);
    if (g) {
      setGuestName(g.fullName);
      setGuestPhone(g.phone);
      setGuestEmail(g.email);
    }
  };

  // Calculate rate and nights
  const currentRoomType = roomTypes.find((t) => t.id === roomTypeId);
  const nights = calculateNights(checkInDate, checkOutDate);
  const baseRate = currentRoomType?.baseRate || 35000;
  const grossRoomCharge = baseRate * nights;
  const netRoomCharge = Math.max(0, grossRoomCharge - discountAmount);
  const balanceDue = Math.max(0, netRoomCharge - depositPaid);

  // Available rooms for selected category & dates (with double-booking check!)
  const availableRoomsForDates = useMemo(() => {
    return rooms.filter((r) => {
      // Must match room type if selected
      if (roomTypeId && r.roomTypeId !== roomTypeId) return false;
      // Must not be maintenance or out of service
      if (r.status === 'Maintenance' || r.status === 'Out of Service') return false;

      // Double-booking check: verify no overlapping active reservation
      const hasConflict = reservations.some(
        (res) =>
          res.roomId === r.id &&
          ['Confirmed', 'Checked In'].includes(res.status) &&
          isDateOverlap(checkInDate, checkOutDate, res.checkInDate, res.checkOutDate)
      );

      return !hasConflict;
    });
  }, [rooms, reservations, roomTypeId, checkInDate, checkOutDate]);

  // Handle Form Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError('');

    // Pre-validation double-booking
    if (roomId) {
      const conflict = reservations.find(
        (r) =>
          r.roomId === roomId &&
          ['Confirmed', 'Checked In'].includes(r.status) &&
          isDateOverlap(checkInDate, checkOutDate, r.checkInDate, r.checkOutDate)
      );

      if (conflict) {
        setConflictError(
          `Double-booking Conflict: Room is already reserved by ${conflict.guestName} (${conflict.checkInDate} to ${conflict.checkOutDate}). Please choose another room.`
        );
        return;
      }
    }

    try {
      const assignedRoom = rooms.find((r) => r.id === roomId);
      await createReservation.mutateAsync({
        guestId: guestId || `guest-${Date.now()}`,
        guestName,
        guestPhone,
        guestEmail,
        roomId: roomId || undefined,
        roomNumber: assignedRoom?.roomNumber,
        roomTypeId,
        roomTypeName: currentRoomType?.name,
        checkInDate,
        checkOutDate,
        nights,
        numberOfAdults: adults,
        numberOfChildren: children,
        ratePerNight: baseRate,
        discountAmount,
        discountPercentage: grossRoomCharge > 0 ? (discountAmount / grossRoomCharge) * 100 : 0,
        totalRoomCharge: netRoomCharge,
        depositPaid,
        balanceDue,
        bookingSource,
        status: 'Confirmed',
        specialRequests,
        createdById: 'user-3',
        createdByName: 'Chioma Adeyemi',
      });

      setIsCreateOpen(false);
      resetForm();
    } catch (err: any) {
      setConflictError(err.message || 'Failed to create reservation');
    }
  };

  const resetForm = () => {
    setGuestId('');
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setRoomId('');
    setDiscountAmount(0);
    setDepositPaid(0);
    setSpecialRequests('');
    setConflictError('');
  };

  const handleConfirmCancel = async (reason?: string) => {
    if (!cancelResId) return;
    await cancelReservation.mutateAsync({ id: cancelResId, reason });
    setCancelResId(null);
  };

  // Filtered list
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchSource = sourceFilter === 'all' || r.bookingSource === sourceFilter;
      return matchStatus && matchSource;
    });
  }, [reservations, statusFilter, sourceFilter]);

  const columns = [
    {
      header: 'Code / Guest',
      cell: (r: Reservation) => (
        <div>
          <span className="font-mono font-bold text-amber-400 text-xs">
            {r.reservationCode}
          </span>
          <p className="font-semibold text-neutral-200 mt-0.5">{r.guestName}</p>
          <p className="text-[10px] text-neutral-400 font-mono">{r.guestPhone}</p>
        </div>
      ),
    },
    {
      header: 'Room Allocated',
      cell: (r: Reservation) => (
        <div>
          <span className="font-mono font-bold text-white text-xs">
            {r.roomNumber ? `Room ${r.roomNumber}` : <span className="text-amber-500">Unassigned</span>}
          </span>
          <p className="text-[10px] text-neutral-400">{r.roomTypeName}</p>
        </div>
      ),
    },
    {
      header: 'Stay Window',
      cell: (r: Reservation) => (
        <div className="text-xs font-mono tabular-nums text-neutral-300">
          <p>
            {formatDate(r.checkInDate, 'short')} → {formatDate(r.checkOutDate, 'short')}
          </p>
          <p className="text-[10px] text-neutral-400">
            {r.nights} night{r.nights > 1 ? 's' : ''} • {r.numberOfAdults} Ad
          </p>
        </div>
      ),
    },
    {
      header: 'Room Charge & Deposit',
      cell: (r: Reservation) => (
        <div className="text-xs font-mono tabular-nums">
          <p className="text-neutral-200 font-semibold">{formatCurrency(r.totalRoomCharge)}</p>
          <p className="text-[10px] text-emerald-400">
            Paid: {formatCurrency(r.depositPaid)}
          </p>
        </div>
      ),
    },
    {
      header: 'Balance Due',
      cell: (r: Reservation) => (
        <span
          className={`font-mono font-bold text-xs tabular-nums ${
            r.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}
        >
          {formatCurrency(r.balanceDue)}
        </span>
      ),
    },
    {
      header: 'Booking Source',
      cell: (r: Reservation) => (
        <span className="text-xs text-neutral-300">{r.bookingSource}</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof Reservation,
      sortable: true,
      cell: (r: Reservation) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Actions',
      align: 'right' as const,
      cell: (r: Reservation) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRes(r)}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Folio
          </Button>

          {r.status === 'Confirmed' && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => navigate(`/check-in?resId=${r.id}`)}
              icon={<LogIn className="w-3.5 h-3.5" />}
            >
              Check-In
            </Button>
          )}

          {r.status === 'Checked In' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/check-out?resId=${r.id}`)}
              icon={<LogOut className="w-3.5 h-3.5" />}
            >
              Settle
            </Button>
          )}

          {['Pending', 'Confirmed'].includes(r.status) && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setCancelResId(r.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Reservations Registry</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time bookings, double-booking validation, advance deposits & stay records
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Create Reservation
        </Button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredReservations}
        isLoading={isLoading}
        searchPlaceholder="Search reservation code, guest name or phone..."
        filterComponent={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-9 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Direct Phone">Direct Phone</option>
              <option value="Hotel Website">Hotel Website</option>
              <option value="Booking.com">Booking.com</option>
              <option value="Corporate Partner">Corporate Partner</option>
              <option value="Government/Diplomatic">Government / Diplomatic</option>
            </select>
          </div>
        }
      />

      {/* Modal: Create Reservation with Double-Booking Prevention */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create Verified Hotel Reservation"
          description="Check room availability in real-time to avoid duplicate date assignment."
          size="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {conflictError && (
              <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{conflictError}</span>
              </div>
            )}

            {/* Guest Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Existing Guest or Quick New Entry:
              </label>
              <select
                value={guestId}
                onChange={(e) => handleGuestSelect(e.target.value)}
                className="w-full h-9 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="">-- Choose Existing Guest (or type manually below) --</option>
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.fullName} ({g.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Guest Full Name"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Dr. Aminu Bello"
              />
              <Input
                label="Phone Number"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="08031234567"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="guest@example.com"
              />
            </div>

            {/* Room category and Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Room Category"
                required
                value={roomTypeId}
                onChange={(e) => {
                  setRoomTypeId(e.target.value);
                  setRoomId('');
                }}
              >
                {roomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name} ({formatCurrency(rt.baseRate)}/nt)
                  </option>
                ))}
              </Select>
              <Input
                label="Check-In Date"
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
              <Input
                label="Check-Out Date"
                type="date"
                required
                min={checkInDate}
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>

            {/* Room Assignment (verified real-time availability) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block">
                Assign Available Room (Pre-verified for {checkInDate} to {checkOutDate}):
              </label>
              <Select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Select room (or leave unassigned for later front-desk check-in)..."
              >
                <option value="">-- Unassigned (Assign at Front Desk) --</option>
                {availableRoomsForDates.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber} (Floor {r.floor}) • {r.status}
                  </option>
                ))}
              </Select>
              <p className="text-[11px] text-neutral-400">
                {availableRoomsForDates.length} rooms available for these dates without double-booking conflict.
              </p>
            </div>

            {/* Guests & Financials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 font-mono text-xs">
              <div>
                <span className="text-neutral-400">Nights:</span>
                <p className="text-white font-bold">{nights}</p>
              </div>
              <div>
                <span className="text-neutral-400">Nightly Rate:</span>
                <p className="text-white font-bold">{formatCurrency(baseRate)}</p>
              </div>
              <div>
                <span className="text-neutral-400">Total Charge:</span>
                <p className="text-amber-400 font-bold">{formatCurrency(netRoomCharge)}</p>
              </div>
              <div>
                <span className="text-neutral-400">Balance Due:</span>
                <p className="text-rose-400 font-bold">{formatCurrency(balanceDue)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Discount Amount (₦)"
                type="number"
                min={0}
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Advance Deposit (₦)"
                type="number"
                min={0}
                value={depositPaid || ''}
                onChange={(e) => setDepositPaid(parseFloat(e.target.value) || 0)}
              />
              <Select
                label="Booking Source"
                value={bookingSource}
                onChange={(e) => setBookingSource(e.target.value as any)}
              >
                <option value="Direct Phone">Direct Phone</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Hotel Website">Hotel Website</option>
                <option value="Booking.com">Booking.com</option>
                <option value="Corporate Partner">Corporate Partner</option>
                <option value="Government/Diplomatic">Government / Diplomatic</option>
              </Select>
            </div>

            <Input
              label="Special Requests / Flight Details"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Airport pickup required, extra pillows, high floor"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Confirm Reservation
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View Details */}
      {selectedRes && (
        <Modal
          isOpen={Boolean(selectedRes)}
          onClose={() => setSelectedRes(null)}
          title={`Reservation Ref: ${selectedRes.reservationCode}`}
          size="md"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Guest:</span>
                <span className="text-white font-bold">{selectedRes.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Contact:</span>
                <span className="text-neutral-200">
                  {selectedRes.guestPhone} • {selectedRes.guestEmail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Room:</span>
                <span className="text-amber-400 font-bold">
                  {selectedRes.roomNumber ? `Room ${selectedRes.roomNumber}` : 'Unassigned'} (
                  {selectedRes.roomTypeName})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Stay Period:</span>
                <span className="text-neutral-200">
                  {formatDate(selectedRes.checkInDate)} → {formatDate(selectedRes.checkOutDate)} (
                  {selectedRes.nights} nights)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Room Charge:</span>
                <span className="text-white font-bold">
                  {formatCurrency(selectedRes.totalRoomCharge)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Deposit Paid:</span>
                <span className="text-emerald-400 font-bold">
                  {formatCurrency(selectedRes.depositPaid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Folio Balance Due:</span>
                <span className="text-rose-400 font-bold">
                  {formatCurrency(selectedRes.balanceDue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Status:</span>
                <StatusBadge status={selectedRes.status} />
              </div>
            </div>

            {selectedRes.specialRequests && (
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300">
                <span className="text-neutral-400 block text-[10px] uppercase">Special Notes:</span>
                {selectedRes.specialRequests}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setSelectedRes(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog: Cancel Booking */}
      <ConfirmDialog
        isOpen={Boolean(cancelResId)}
        onClose={() => setCancelResId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Hotel Reservation"
        message="Are you sure you want to cancel this booking? The assigned room will be immediately released and returned to Available inventory."
        confirmLabel="Yes, Cancel Booking"
        requireReason={true}
        reasonPlaceholder="e.g. Guest requested cancellation via phone"
        isDestructive={true}
      />
    </div>
  );
};
