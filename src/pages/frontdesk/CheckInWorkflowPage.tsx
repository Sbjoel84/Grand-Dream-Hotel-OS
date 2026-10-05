import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bed,
  CheckCircle,
  CreditCard,
  FileCheck,
  Hotel,
  Key,
  LogIn,
  Printer,
  Search,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import {
  useGuests,
  useReservations,
  useRooms,
  useRoomTypes,
} from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDate, getTodayDateString } from '../../utils/date';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Guest, Reservation, Room } from '../../types';

export const CheckInWorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedResId = searchParams.get('resId');
  const preselectedRoomId = searchParams.get('roomId');

  const { data: guests = [], createGuest } = useGuests();
  const { data: rooms = [] } = useRooms();
  const { data: roomTypes = [] } = useRoomTypes();
  const { data: reservations = [], checkIn, createReservation } = useReservations();

  // Wizard state: Steps 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states
  const [guestSearch, setGuestSearch] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isCreatingNewGuest, setIsCreatingNewGuest] = useState(false);

  // New Guest Form fields
  const [newGuestData, setNewGuestData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Abuja',
    state: 'FCT',
    country: 'Nigeria',
    identificationType: 'National ID (NIN)' as const,
    identificationNumber: '',
    nationality: 'Nigerian',
    isVIP: false,
    companyName: '',
    carPlateNumber: '',
  });

  // Selected reservation or walk-in reservation details
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInNights, setWalkInNights] = useState(1);
  const [walkInRoomType, setWalkInRoomType] = useState('rt-standard');
  const [walkInAdults, setWalkInAdults] = useState(1);

  // Assigned room
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  // Payment deposit
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'POS' | 'Cash' | 'Transfer'>('POS');
  const [paymentRef, setPaymentRef] = useState('');

  // Completed check-in state
  const [completedSummary, setCompletedSummary] = useState<{
    reservation: Reservation;
    room: Room;
    guest: Guest;
  } | null>(null);

  // Pre-selection effect if coming from arrivals table
  useEffect(() => {
    if (preselectedResId && reservations.length > 0) {
      const res = reservations.find((r) => r.id === preselectedResId);
      if (res) {
        setSelectedReservation(res);
        const guest = guests.find((g) => g.id === res.guestId);
        if (guest) setSelectedGuest(guest);
        if (res.roomId) setSelectedRoomId(res.roomId);
        setDepositAmount(res.balanceDue);
        setCurrentStep(3);
      }
    }
  }, [preselectedResId, reservations, guests]);

  useEffect(() => {
    if (preselectedRoomId && rooms.length > 0) {
      setSelectedRoomId(preselectedRoomId);
      setIsWalkIn(true);
    }
  }, [preselectedRoomId, rooms]);

  // Filtered guest list
  const filteredGuests = guests.filter((g) =>
    guestSearch.trim()
      ? g.fullName.toLowerCase().includes(guestSearch.toLowerCase()) ||
        g.phone.includes(guestSearch) ||
        g.email.toLowerCase().includes(guestSearch.toLowerCase())
      : true
  );

  // Filter available rooms
  const availableRooms = rooms.filter(
    (r) =>
      r.status === 'Available' ||
      (selectedReservation && r.id === selectedReservation.roomId) ||
      r.id === selectedRoomId
  );

  // Handle Create Guest
  const handleSaveNewGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const guest = await createGuest.mutateAsync(newGuestData);
    setSelectedGuest(guest);
    setIsCreatingNewGuest(false);
    setCurrentStep(3);
  };

  // Step 5 -> Step 6: Perform Check-In
  const handleConfirmCheckIn = async () => {
    if (!selectedGuest || !selectedRoomId) return;

    const assignedRoom = rooms.find((r) => r.id === selectedRoomId);
    if (!assignedRoom) return;

    let res = selectedReservation;

    // If walk-in, create reservation first
    if (!res) {
      const rt = roomTypes.find((t) => t.id === walkInRoomType);
      const rate = assignedRoom.ratePerNight || rt?.baseRate || 35000;
      const today = getTodayDateString();
      const endD = new Date();
      endD.setDate(endD.getDate() + walkInNights);
      const outDate = endD.toISOString().split('T')[0];

      res = await createReservation.mutateAsync({
        guestId: selectedGuest.id,
        guestName: selectedGuest.fullName,
        guestPhone: selectedGuest.phone,
        guestEmail: selectedGuest.email,
        roomId: assignedRoom.id,
        roomNumber: assignedRoom.roomNumber,
        roomTypeId: rt?.id || 'rt-standard',
        roomTypeName: rt?.name || 'Standard Deluxe Room',
        checkInDate: today,
        checkOutDate: outDate,
        nights: walkInNights,
        numberOfAdults: walkInAdults,
        numberOfChildren: 0,
        ratePerNight: rate,
        discountAmount: 0,
        discountPercentage: 0,
        totalRoomCharge: rate * walkInNights,
        depositPaid: depositAmount,
        balanceDue: Math.max(0, rate * walkInNights - depositAmount),
        bookingSource: 'Walk-in',
        status: 'Confirmed',
        createdById: 'user-3',
        createdByName: 'Chioma Adeyemi',
      });
    }

    // Now execute check-in
    const result = await checkIn.mutateAsync({
      reservationId: res.id,
      roomId: assignedRoom.id,
      deposit: depositAmount,
    });

    setCompletedSummary({
      reservation: result.reservation,
      room: result.room,
      guest: selectedGuest,
    });

    setCurrentStep(6);
  };

  const steps = [
    { num: 1, label: 'Search Guest' },
    { num: 2, label: 'Profile' },
    { num: 3, label: 'Reservation' },
    { num: 4, label: 'Room Assignment' },
    { num: 5, label: 'Payment' },
    { num: 6, label: 'Summary' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Check-In Reception Workflow</h1>
          <p className="text-xs text-neutral-400 mt-1">
            6-step verified arrival process, guest identification & room key issuance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/frontdesk')}>
          Exit to Front Desk
        </Button>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 overflow-x-auto gap-2">
        {steps.map((st) => (
          <div
            key={st.num}
            className={`flex items-center gap-2 text-xs shrink-0 ${
              currentStep === st.num
                ? 'text-amber-400 font-bold'
                : currentStep > st.num
                ? 'text-emerald-400 font-medium'
                : 'text-neutral-500'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono tabular-nums ${
                currentStep === st.num
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : currentStep > st.num
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {currentStep > st.num ? '✓' : st.num}
            </div>
            <span className="hidden sm:inline">{st.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Search Existing Guest */}
      {currentStep === 1 && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Step 1: Locate Guest Profile</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Search our guest registry by name, phone number or email
              </p>
            </div>
            <Button
              variant="gold"
              size="sm"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => {
                setIsCreatingNewGuest(true);
                setCurrentStep(2);
              }}
            >
              Register New Guest
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by guest name (e.g. Dr. Aminu, Ngozi), phone or email..."
              value={guestSearch}
              onChange={(e) => setGuestSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              autoFocus
            />
          </div>

          <div className="divide-y divide-neutral-800/80 max-h-72 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950/40">
            {filteredGuests.map((g) => (
              <div
                key={g.id}
                onClick={() => {
                  setSelectedGuest(g);
                  setCurrentStep(3);
                }}
                className={`p-3.5 flex items-center justify-between hover:bg-neutral-800/50 cursor-pointer transition-colors ${
                  selectedGuest?.id === g.id ? 'bg-amber-500/10 border-l-2 border-amber-500' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-neutral-200">{g.fullName}</span>
                    {g.isVIP && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded font-semibold">
                        VIP
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    {g.phone} • {g.email} • {g.identificationType} ({g.identificationNumber})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-amber-400 font-medium">Select Guest →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Create / Update Guest Profile */}
      {currentStep === 2 && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Step 2: Guest Registration & ID</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Mandatory Nigerian hospitality guest identification & contact record
            </p>
          </div>

          <form onSubmit={handleSaveNewGuest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                required
                value={newGuestData.firstName}
                onChange={(e) => setNewGuestData({ ...newGuestData, firstName: e.target.value })}
                placeholder="e.g. Aminu"
              />
              <Input
                label="Last Name"
                required
                value={newGuestData.lastName}
                onChange={(e) => setNewGuestData({ ...newGuestData, lastName: e.target.value })}
                placeholder="e.g. Bello"
              />
              <Input
                label="Phone Number"
                required
                value={newGuestData.phone}
                onChange={(e) => setNewGuestData({ ...newGuestData, phone: e.target.value })}
                placeholder="08031234567"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={newGuestData.email}
                onChange={(e) => setNewGuestData({ ...newGuestData, email: e.target.value })}
                placeholder="aminu.bello@example.com"
              />
              <Select
                label="Identification Type"
                required
                value={newGuestData.identificationType}
                onChange={(e) =>
                  setNewGuestData({
                    ...newGuestData,
                    identificationType: e.target.value as any,
                  })
                }
              >
                <option value="National ID (NIN)">National ID (NIN)</option>
                <option value="International Passport">International Passport</option>
                <option value="Driver's License">Driver's License</option>
                <option value="Voter's Card">Voter's Card</option>
              </Select>
              <Input
                label="Identification Number"
                required
                value={newGuestData.identificationNumber}
                onChange={(e) =>
                  setNewGuestData({ ...newGuestData, identificationNumber: e.target.value })
                }
                placeholder="e.g. NIN-10293847561"
              />
              <Input
                label="City"
                value={newGuestData.city}
                onChange={(e) => setNewGuestData({ ...newGuestData, city: e.target.value })}
              />
              <Input
                label="State"
                value={newGuestData.state}
                onChange={(e) => setNewGuestData({ ...newGuestData, state: e.target.value })}
              />
              <Input
                label="Vehicle Plate Number (Optional)"
                value={newGuestData.carPlateNumber}
                onChange={(e) =>
                  setNewGuestData({ ...newGuestData, carPlateNumber: e.target.value })
                }
                placeholder="e.g. ABJ-412-MK"
              />
              <Input
                label="Company / Ministry (Optional)"
                value={newGuestData.companyName}
                onChange={(e) => setNewGuestData({ ...newGuestData, companyName: e.target.value })}
                placeholder="e.g. NNPC or Ministry of Justice"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setCurrentStep(1)}>
                Back to Search
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Save & Continue to Reservation
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Select or Create Reservation */}
      {currentStep === 3 && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Step 3: Select Reservation Booking</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Guest: <span className="text-amber-400 font-semibold">{selectedGuest?.fullName}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedReservation(null);
                setIsWalkIn(true);
                setCurrentStep(4);
              }}
            >
              Direct Walk-In (No Prior Booking)
            </Button>
          </div>

          {/* Active reservations for this guest */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-neutral-300 block">
              Active Bookings Found:
            </label>
            {reservations.filter(
              (r) =>
                r.guestId === selectedGuest?.id &&
                (r.status === 'Confirmed' || r.status === 'Pending')
            ).length === 0 ? (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                <p className="text-xs text-neutral-400">
                  No advance booking found for this guest today. Proceed as Walk-In.
                </p>
                <Button
                  variant="gold"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setIsWalkIn(true);
                    setCurrentStep(4);
                  }}
                >
                  Create Walk-In Reservation
                </Button>
              </div>
            ) : (
              reservations
                .filter(
                  (r) =>
                    r.guestId === selectedGuest?.id &&
                    (r.status === 'Confirmed' || r.status === 'Pending')
                )
                .map((res) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      setSelectedReservation(res);
                      if (res.roomId) setSelectedRoomId(res.roomId);
                      setCurrentStep(4);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                      selectedReservation?.id === res.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        {res.reservationCode}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 tabular-nums">
                        {formatCurrency(res.totalRoomCharge)} ({res.nights} nights)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1">
                      {res.roomTypeName} • Room {res.roomNumber || 'To Be Assigned'}
                    </p>
                    <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      {formatDate(res.checkInDate)} → {formatDate(res.checkOutDate)} • Deposit Paid:{' '}
                      {formatCurrency(res.depositPaid)}
                    </p>
                  </div>
                ))
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <Button variant="secondary" size="sm" onClick={() => setCurrentStep(1)}>
              Back
            </Button>
            {selectedReservation && (
              <Button variant="gold" size="sm" onClick={() => setCurrentStep(4)}>
                Proceed to Room Assignment
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Confirm Room Assignment */}
      {currentStep === 4 && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Step 4: Select Clean, Available Room</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Rooms currently under Maintenance or Needs Cleaning are blocked for security.
            </p>
          </div>

          {isWalkIn && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <Select
                label="Room Category"
                value={walkInRoomType}
                onChange={(e) => setWalkInRoomType(e.target.value)}
              >
                {roomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name} ({formatCurrency(rt.baseRate)}/nt)
                  </option>
                ))}
              </Select>
              <Input
                label="Nights Stay"
                type="number"
                min={1}
                value={walkInNights}
                onChange={(e) => setWalkInNights(parseInt(e.target.value) || 1)}
              />
              <Input
                label="Number of Adults"
                type="number"
                min={1}
                value={walkInAdults}
                onChange={(e) => setWalkInAdults(parseInt(e.target.value) || 1)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableRooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 shadow-sm'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                  }`}
                >
                  <p className="font-mono font-bold text-base text-white">Room {room.roomNumber}</p>
                  <p className="text-xs text-neutral-300 mt-0.5">{room.roomType?.name}</p>
                  <p className="text-[11px] text-neutral-400 font-mono mt-1">
                    Floor {room.floor} • {formatCurrency(room.ratePerNight)}/nt
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <Button variant="secondary" size="sm" onClick={() => setCurrentStep(3)}>
              Back
            </Button>
            <Button
              variant="gold"
              size="sm"
              disabled={!selectedRoomId}
              onClick={() => setCurrentStep(5)}
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Record Deposit & Settlement */}
      {currentStep === 5 && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Step 5: Record Deposit or Full Payment</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Confirm initial check-in deposit or full advance tariff
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Deposit / Payment Amount (₦)"
              type="number"
              min={0}
              value={depositAmount || ''}
              onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
              required
            />
            <Select
              label="Payment Tender Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
            >
              <option value="POS">POS Terminal Card Payment</option>
              <option value="Transfer">Bank Direct Transfer</option>
              <option value="Cash">Cash at Reception</option>
            </Select>
            <div className="sm:col-span-2">
              <Input
                label="Bank Trace / POS Terminal Ref"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. STANBIC-POS-78219"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <Button variant="secondary" size="sm" onClick={() => setCurrentStep(4)}>
              Back
            </Button>
            <Button variant="gold" size="sm" onClick={handleConfirmCheckIn}>
              Complete Verified Check-In & Issue Key
            </Button>
          </div>
        </div>
      )}

      {/* Step 6: Confirmation Summary & Printable Key Card Sheet */}
      {currentStep === 6 && completedSummary && (
        <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Guest Successfully Checked In!</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Room {completedSummary.room.roomNumber} is now marked Occupied in the central PMS.
            </p>
          </div>

          <div className="max-w-md mx-auto text-left p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span className="text-neutral-400">Guest Name:</span>
              <span className="font-bold text-white">{completedSummary.guest.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span className="text-neutral-400">Assigned Room:</span>
              <span className="font-bold text-amber-400 text-sm">
                Room {completedSummary.room.roomNumber} (Floor {completedSummary.room.floor})
              </span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span className="text-neutral-400">Reservation Ref:</span>
              <span className="text-neutral-200">{completedSummary.reservation.reservationCode}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span className="text-neutral-400">Stay Period:</span>
              <span className="text-neutral-200">
                {formatDate(completedSummary.reservation.checkInDate)} →{' '}
                {formatDate(completedSummary.reservation.checkOutDate)} (
                {completedSummary.reservation.nights} nights)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Deposit Recorded:</span>
              <span className="text-emerald-400 font-bold">
                {formatCurrency(completedSummary.reservation.depositPaid)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              icon={<Printer className="w-4 h-4" />}
            >
              Print Keycard Card & Registration
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={() => navigate('/frontdesk')}
            >
              Return to Front Desk
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
