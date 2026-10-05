import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bed,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Hotel,
  LogIn,
  LogOut,
  PlusCircle,
  Printer,
  Search,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  useFinance,
  useGuests,
  useHousekeeping,
  useReservations,
  useRooms,
} from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDate, getTodayDateString } from '../../utils/date';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Reservation, Room } from '../../types';

export const FrontDeskPage: React.FC = () => {
  const navigate = useNavigate();
  const today = getTodayDateString();

  const { data: reservations = [], isLoading: loadingRes, updateReservation } = useReservations();
  const { data: rooms = [], isLoading: loadingRooms, updateRoom } = useRooms();
  const { data: guests = [] } = useGuests();
  const { createPayment } = useFinance();

  // Modals state
  const [extendModalRes, setExtendModalRes] = useState<Reservation | null>(null);
  const [newCheckOutDate, setNewCheckOutDate] = useState<string>('');
  const [changeRoomRes, setChangeRoomRes] = useState<Reservation | null>(null);
  const [targetRoomId, setTargetRoomId] = useState<string>('');
  const [paymentModalRes, setPaymentModalRes] = useState<Reservation | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'POS' | 'Cash' | 'Transfer'>('POS');
  const [paymentRef, setPaymentRef] = useState<string>('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'arrivals' | 'departures' | 'inhouse' | 'available' | 'cleaning' | 'balances'>('arrivals');

  // Today's Arrivals
  const arrivalsToday = useMemo(() => {
    return reservations.filter(
      (r) => r.checkInDate === today && (r.status === 'Confirmed' || r.status === 'Pending')
    );
  }, [reservations, today]);

  // Today's Departures
  const departuresToday = useMemo(() => {
    return reservations.filter((r) => r.checkOutDate === today && r.status === 'Checked In');
  }, [reservations, today]);

  // Currently In-House Guests
  const inHouseGuests = useMemo(() => {
    return reservations.filter((r) => r.status === 'Checked In');
  }, [reservations]);

  // Available Rooms
  const availableRoomsList = useMemo(() => {
    return rooms.filter((r) => r.status === 'Available');
  }, [rooms]);

  // Rooms Requiring Cleaning
  const cleaningRoomsList = useMemo(() => {
    return rooms.filter((r) => r.status === 'Cleaning');
  }, [rooms]);

  // Outstanding Balances
  const outstandingList = useMemo(() => {
    return reservations.filter((r) => r.status === 'Checked In' && r.balanceDue > 0);
  }, [reservations]);

  // Handle Extend Stay
  const handleExtendStaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendModalRes || !newCheckOutDate) return;

    const start = new Date(extendModalRes.checkInDate);
    const end = new Date(newCheckOutDate);
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    const totalCharge = nights * extendModalRes.ratePerNight;
    const balanceDiff = totalCharge - extendModalRes.totalRoomCharge;

    await updateReservation.mutateAsync({
      id: extendModalRes.id,
      updates: {
        checkOutDate: newCheckOutDate,
        nights,
        totalRoomCharge: totalCharge,
        balanceDue: extendModalRes.balanceDue + balanceDiff,
      },
    });

    setExtendModalRes(null);
  };

  // Handle Room Change
  const handleChangeRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeRoomRes || !targetRoomId) return;

    const newRoom = rooms.find((r) => r.id === targetRoomId);
    if (!newRoom) return;

    // Release old room
    if (changeRoomRes.roomId) {
      await updateRoom.mutateAsync({
        id: changeRoomRes.roomId,
        updates: {
          status: 'Cleaning',
          currentReservationId: undefined,
          currentGuestName: undefined,
          currentGuestId: undefined,
          notes: 'Guest moved to another room. Housekeeping freshening required.',
        },
      });
    }

    // Assign new room
    await updateRoom.mutateAsync({
      id: newRoom.id,
      updates: {
        status: 'Occupied',
        currentReservationId: changeRoomRes.id,
        currentGuestName: changeRoomRes.guestName,
        currentGuestId: changeRoomRes.guestId,
      },
    });

    // Update reservation
    await updateReservation.mutateAsync({
      id: changeRoomRes.id,
      updates: {
        roomId: newRoom.id,
        roomNumber: newRoom.roomNumber,
      },
    });

    setChangeRoomRes(null);
  };

  // Handle Payment Recording
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalRes || paymentAmount <= 0) return;

    await createPayment.mutateAsync({
      reservationId: paymentModalRes.id,
      guestId: paymentModalRes.guestId,
      guestName: paymentModalRes.guestName,
      roomNumber: paymentModalRes.roomNumber,
      department: 'Rooms',
      amount: paymentAmount,
      method: paymentMethod,
      reference: paymentRef || `MAN-${Date.now()}`,
      collectedById: 'user-3',
      collectedByName: 'Chioma Adeyemi',
      date: new Date().toISOString(),
      notes: `Front desk interim payment for Room ${paymentModalRes.roomNumber}`,
    });

    await updateReservation.mutateAsync({
      id: paymentModalRes.id,
      updates: {
        depositPaid: paymentModalRes.depositPaid + paymentAmount,
        balanceDue: Math.max(0, paymentModalRes.balanceDue - paymentAmount),
      },
    });

    setPaymentModalRes(null);
  };

  return (
    <div className="space-y-6">
      {/* Front Desk Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Front Desk Command</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time lobby operations, guest movements, key assignment & quick actions
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/check-in')}
            icon={<LogIn className="w-4 h-4" />}
          >
            Check-In Workflow
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/check-out')}
            icon={<LogOut className="w-4 h-4" />}
          >
            Check-Out Settle
          </Button>
        </div>
      </div>

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveTab('arrivals')}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
            activeTab === 'arrivals'
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/50'
          }`}
        >
          <span className="text-[11px] text-neutral-400 font-medium block">Today's Arrivals</span>
          <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">
            {arrivalsToday.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('departures')}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
            activeTab === 'departures'
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/50'
          }`}
        >
          <span className="text-[11px] text-neutral-400 font-medium block">Today's Departures</span>
          <span className="text-xl font-bold text-white font-mono tabular-nums">
            {departuresToday.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inhouse')}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
            activeTab === 'inhouse'
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/50'
          }`}
        >
          <span className="text-[11px] text-neutral-400 font-medium block">Current In-House</span>
          <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
            {inHouseGuests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
            activeTab === 'available'
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/50'
          }`}
        >
          <span className="text-[11px] text-neutral-400 font-medium block">Available Rooms</span>
          <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
            {availableRoomsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cleaning')}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
            activeTab === 'cleaning'
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/50'
          }`}
        >
          <span className="text-[11px] text-neutral-400 font-medium block">Rooms to Clean</span>
          <span className="text-xl font-bold text-sky-400 font-mono tabular-nums">
            {cleaningRoomsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('balances')}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
            activeTab === 'balances'
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/50'
          }`}
        >
          <span className="text-[11px] text-neutral-400 font-medium block">Outstanding Folios</span>
          <span className="text-xl font-bold text-rose-400 font-mono tabular-nums">
            {outstandingList.length}
          </span>
        </button>
      </div>

      {/* Main Tab Content Table */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-semibold text-white">
            {activeTab === 'arrivals' && "Today's Expected Arrivals"}
            {activeTab === 'departures' && "Today's Scheduled Departures"}
            {activeTab === 'inhouse' && 'Active In-House Guests'}
            {activeTab === 'available' && 'Available Ready Rooms'}
            {activeTab === 'cleaning' && 'Rooms Requiring Housekeeping'}
            {activeTab === 'balances' && 'Active Guests with Unpaid Folio Balances'}
          </h3>
        </div>

        {/* Tab 1: Today's Arrivals */}
        {activeTab === 'arrivals' && (
          <div className="overflow-x-auto">
            {arrivalsToday.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">
                No more arrivals scheduled for today.
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                  <tr>
                    <th className="pb-3 px-3">Res Code</th>
                    <th className="pb-3 px-3">Guest</th>
                    <th className="pb-3 px-3">Category</th>
                    <th className="pb-3 px-3">Stay</th>
                    <th className="pb-3 px-3">Rate</th>
                    <th className="pb-3 px-3">Deposit</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {arrivalsToday.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-800/40">
                      <td className="py-3 px-3 font-mono font-semibold text-amber-400">
                        {r.reservationCode}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-neutral-200">{r.guestName}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{r.guestPhone}</p>
                      </td>
                      <td className="py-3 px-3 text-neutral-300">
                        {r.roomTypeName || 'Standard Room'}
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-300 tabular-nums">
                        {r.nights} nights ({formatDate(r.checkInDate, 'short')} -{' '}
                        {formatDate(r.checkOutDate, 'short')})
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-300 tabular-nums">
                        {formatCurrency(r.ratePerNight)}/nt
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-400 tabular-nums">
                        {formatCurrency(r.depositPaid)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => navigate(`/check-in?resId=${r.id}`)}
                          icon={<LogIn className="w-3.5 h-3.5" />}
                        >
                          Check-In Now
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Today's Departures */}
        {activeTab === 'departures' && (
          <div className="overflow-x-auto">
            {departuresToday.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">
                No departures due today.
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                  <tr>
                    <th className="pb-3 px-3">Room</th>
                    <th className="pb-3 px-3">Guest Name</th>
                    <th className="pb-3 px-3">Check-In</th>
                    <th className="pb-3 px-3">Total Charges</th>
                    <th className="pb-3 px-3">Outstanding Due</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {departuresToday.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                        {r.roomNumber || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-neutral-200">{r.guestName}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{r.guestPhone}</p>
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-400">
                        {formatDate(r.checkInDate)}
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-200 tabular-nums">
                        {formatCurrency(r.totalRoomCharge)}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-rose-400 tabular-nums">
                        {formatCurrency(r.balanceDue)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/check-out?resId=${r.id}`)}
                          icon={<LogOut className="w-3.5 h-3.5" />}
                        >
                          Proceed Settle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: In-House Guests */}
        {activeTab === 'inhouse' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                <tr>
                  <th className="pb-3 px-3">Room</th>
                  <th className="pb-3 px-3">Guest Details</th>
                  <th className="pb-3 px-3">Stay Dates</th>
                  <th className="pb-3 px-3">Total Charges</th>
                  <th className="pb-3 px-3">Balance Due</th>
                  <th className="pb-3 px-3 text-right">Quick Desk Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {inHouseGuests.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                      {r.roomNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-neutral-200">{r.guestName}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">{r.guestPhone}</p>
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-300 tabular-nums">
                      {formatDate(r.checkInDate, 'short')} → {formatDate(r.checkOutDate, 'short')}{' '}
                      ({r.nights}n)
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-200 tabular-nums">
                      {formatCurrency(r.totalRoomCharge)}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold tabular-nums">
                      <span className={r.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {formatCurrency(r.balanceDue)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setExtendModalRes(r);
                          setNewCheckOutDate(r.checkOutDate);
                        }}
                      >
                        Extend
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setChangeRoomRes(r);
                        }}
                      >
                        Change Room
                      </Button>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => {
                          setPaymentModalRes(r);
                          setPaymentAmount(r.balanceDue > 0 ? r.balanceDue : 0);
                        }}
                      >
                        Post Payment
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => navigate(`/check-out?resId=${r.id}`)}
                      >
                        Check-Out
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Available Ready Rooms */}
        {activeTab === 'available' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableRoomsList.map((room) => (
              <div
                key={room.id}
                className="p-4 rounded-xl bg-neutral-950/60 border border-emerald-500/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold font-mono text-emerald-400">
                    Room {room.roomNumber}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-neutral-300">{room.roomType?.name || 'Standard'}</p>
                <p className="text-xs font-mono text-neutral-400 tabular-nums">
                  Floor {room.floor} • {formatCurrency(room.ratePerNight)}/nt
                </p>
                <Button
                  variant="gold"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate(`/check-in?roomId=${room.id}`)}
                >
                  Direct Walk-In Check-In
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Cleaning Rooms */}
        {activeTab === 'cleaning' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {cleaningRoomsList.map((room) => (
              <div
                key={room.id}
                className="p-4 rounded-xl bg-neutral-950/60 border border-sky-500/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold font-mono text-sky-400">
                    Room {room.roomNumber}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-medium">
                    {room.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-300">{room.roomType?.name}</p>
                <p className="text-xs text-neutral-400 italic">
                  {room.notes || 'Awaiting housekeeping sanitization'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate('/housekeeping')}
                >
                  Open Housekeeping
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: Outstanding Balances */}
        {activeTab === 'balances' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                <tr>
                  <th className="pb-3 px-3">Room</th>
                  <th className="pb-3 px-3">Guest Name</th>
                  <th className="pb-3 px-3">Phone</th>
                  <th className="pb-3 px-3">Check-Out Date</th>
                  <th className="pb-3 px-3 text-right">Balance Due</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {outstandingList.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                      {r.roomNumber}
                    </td>
                    <td className="py-3 px-3 font-semibold text-neutral-200">{r.guestName}</td>
                    <td className="py-3 px-3 font-mono text-neutral-400">{r.guestPhone}</td>
                    <td className="py-3 px-3 font-mono text-neutral-300">
                      {formatDate(r.checkOutDate)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-400 tabular-nums">
                      {formatCurrency(r.balanceDue)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => {
                          setPaymentModalRes(r);
                          setPaymentAmount(r.balanceDue);
                        }}
                      >
                        Collect Balance
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Extend Stay */}
      {extendModalRes && (
        <Modal
          isOpen={Boolean(extendModalRes)}
          onClose={() => setExtendModalRes(null)}
          title={`Extend Stay: Room ${extendModalRes.roomNumber} (${extendModalRes.guestName})`}
          description="Adjust departure date and calculate additional room accommodation tariff."
        >
          <form onSubmit={handleExtendStaySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono">
              <div>
                <span className="text-neutral-400">Current Check-In:</span>
                <p className="text-white font-medium">{formatDate(extendModalRes.checkInDate)}</p>
              </div>
              <div>
                <span className="text-neutral-400">Current Check-Out:</span>
                <p className="text-amber-400 font-medium">
                  {formatDate(extendModalRes.checkOutDate)}
                </p>
              </div>
            </div>

            <Input
              label="New Departure Date"
              type="date"
              min={extendModalRes.checkOutDate}
              value={newCheckOutDate}
              onChange={(e) => setNewCheckOutDate(e.target.value)}
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setExtendModalRes(null)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Confirm Extension
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Change Room */}
      {changeRoomRes && (
        <Modal
          isOpen={Boolean(changeRoomRes)}
          onClose={() => setChangeRoomRes(null)}
          title={`Relocate Guest: Room ${changeRoomRes.roomNumber} (${changeRoomRes.guestName})`}
          description="Move guest to another available clean room. The old room will be sent to Housekeeping for cleaning."
        >
          <form onSubmit={handleChangeRoomSubmit} className="space-y-4">
            <Select
              label="Select Target Available Room"
              value={targetRoomId}
              onChange={(e) => setTargetRoomId(e.target.value)}
              required
              placeholder="Choose target room..."
            >
              {availableRoomsList.map((ar) => (
                <option key={ar.id} value={ar.id}>
                  Room {ar.roomNumber} - {ar.roomType?.name} (Floor {ar.floor}) -{' '}
                  {formatCurrency(ar.ratePerNight)}/nt
                </option>
              ))}
            </Select>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setChangeRoomRes(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={!targetRoomId}>
                Confirm Room Transfer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 3: Post Payment */}
      {paymentModalRes && (
        <Modal
          isOpen={Boolean(paymentModalRes)}
          onClose={() => setPaymentModalRes(null)}
          title={`Record Payment for Room ${paymentModalRes.roomNumber}`}
          description={`Guest: ${paymentModalRes.guestName} • Outstanding Folio: ${formatCurrency(
            paymentModalRes.balanceDue
          )}`}
        >
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <Input
              label="Payment Amount (₦)"
              type="number"
              min={100}
              value={paymentAmount || ''}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              required
            />

            <Select
              label="Payment Tender Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              required
            >
              <option value="POS">POS Terminal Card Payment</option>
              <option value="Transfer">Bank Direct Transfer</option>
              <option value="Cash">Cash at Reception</option>
            </Select>

            <Input
              label="Terminal Trace / Bank Ref"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. STANBIC-POS-9812 or TRF-REF-1092"
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setPaymentModalRes(null)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Print & Record Receipt
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
