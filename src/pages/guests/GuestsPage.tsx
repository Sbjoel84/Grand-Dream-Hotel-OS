import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Eye,
  FileText,
  History,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  User,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import {
  useFinance,
  useGuests,
  useReservations,
} from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/DataTable';
import { Guest } from '../../types';

export const GuestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: guests = [], isLoading, createGuest, updateGuest } = useGuests();
  const { data: reservations = [] } = useReservations();
  const { payments } = useFinance();

  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [vipFilter, setVipFilter] = useState<'all' | 'vip' | 'regular'>('all');

  // New Guest Form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    altPhone: '',
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
    notes: '',
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGuest.mutateAsync(formData);
    setIsCreateOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      altPhone: '',
      address: '',
      city: 'Abuja',
      state: 'FCT',
      country: 'Nigeria',
      identificationType: 'National ID (NIN)',
      identificationNumber: '',
      nationality: 'Nigerian',
      isVIP: false,
      companyName: '',
      carPlateNumber: '',
      notes: '',
    });
  };

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      if (vipFilter === 'vip') return g.isVIP;
      if (vipFilter === 'regular') return !g.isVIP;
      return true;
    });
  }, [guests, vipFilter]);

  const columns = [
    {
      header: 'Guest Name',
      cell: (g: Guest) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-neutral-200 text-sm">{g.fullName}</span>
            {g.isVIP && (
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded font-semibold border border-amber-500/30">
                VIP
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
            {g.identificationType}: {g.identificationNumber}
          </p>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      cell: (g: Guest) => (
        <div className="text-xs font-mono text-neutral-300">
          <p>{g.phone}</p>
          <p className="text-neutral-400 text-[11px] truncate max-w-[180px]">{g.email}</p>
        </div>
      ),
    },
    {
      header: 'Location / Affiliation',
      cell: (g: Guest) => (
        <div className="text-xs text-neutral-300">
          <p>{g.city}, {g.state}</p>
          <p className="text-[10px] text-neutral-400">{g.companyName || 'Individual'}</p>
        </div>
      ),
    },
    {
      header: 'Visits & Stays',
      cell: (g: Guest) => (
        <div className="text-xs font-mono tabular-nums text-neutral-300">
          <span className="font-semibold text-white">{g.totalVisits}</span> visits (
          {g.totalBookings} bookings)
        </div>
      ),
    },
    {
      header: 'Lifetime Spend',
      accessorKey: 'totalSpent' as keyof Guest,
      sortable: true,
      cell: (g: Guest) => (
        <span className="font-mono font-semibold text-xs tabular-nums text-amber-400">
          {formatCurrency(g.totalSpent)}
        </span>
      ),
    },
    {
      header: 'Folio Balance',
      accessorKey: 'outstandingBalance' as keyof Guest,
      sortable: true,
      cell: (g: Guest) => (
        <span
          className={`font-mono font-bold text-xs tabular-nums ${
            g.outstandingBalance > 0 ? 'text-rose-400' : 'text-neutral-400'
          }`}
        >
          {formatCurrency(g.outstandingBalance)}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right' as const,
      cell: (g: Guest) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedGuest(g)}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Profile
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate(`/check-in?guestId=${g.id}`)}
          >
            Check-In
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Guest Directory</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Verified guest profiles, stay records, identification registry & lifetime folios
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Register New Guest
        </Button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredGuests}
        isLoading={isLoading}
        searchPlaceholder="Search guests by name, phone or identification number..."
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={vipFilter}
              onChange={(e) => setVipFilter(e.target.value as any)}
              className="h-9 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Guests</option>
              <option value="vip">VIP Guests Only</option>
              <option value="regular">Standard Regulars</option>
            </select>
          </div>
        }
      />

      {/* Modal 1: Register New Guest */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Register New Hotel Guest"
          description="Official Nigerian hospitality identification and profile registration."
          size="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="First Name"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Aminu"
              />
              <Input
                label="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Bello"
              />
              <Input
                label="Phone Number"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08031234567"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="guest@domain.com"
              />
              <Select
                label="Identification Type"
                required
                value={formData.identificationType}
                onChange={(e) => setFormData({ ...formData, identificationType: e.target.value as any })}
              >
                <option value="National ID (NIN)">National ID (NIN)</option>
                <option value="International Passport">International Passport</option>
                <option value="Driver's License">Driver's License</option>
                <option value="Voter's Card">Voter's Card</option>
              </Select>
              <Input
                label="Identification Number"
                required
                value={formData.identificationNumber}
                onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                placeholder="e.g. NIN-10293847561"
              />
              <Input
                label="Residential / Business Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Input
                label="City / District"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="Company / Ministry Affiliation"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. NNPC or Ministry of Justice"
              />
              <Input
                label="Vehicle Plate Number"
                value={formData.carPlateNumber}
                onChange={(e) => setFormData({ ...formData, carPlateNumber: e.target.value })}
                placeholder="e.g. ABJ-412-MK"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isVIP"
                checked={formData.isVIP}
                onChange={(e) => setFormData({ ...formData, isVIP: e.target.checked })}
                className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="isVIP" className="text-xs text-neutral-200 font-medium">
                Mark as VIP Guest (Eligible for priority check-in & complimentary amenities)
              </label>
            </div>

            <Input
              label="Staff Notes & Preferences"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Likes ground floor, extra pillows, requests fruit basket"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Register Profile
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Guest Profile Details Drawer with summary cards */}
      {selectedGuest && (
        <Modal
          isOpen={Boolean(selectedGuest)}
          onClose={() => setSelectedGuest(null)}
          title={`Guest Profile: ${selectedGuest.fullName}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Required Summary Cards: Total Visits, Total Bookings, Total Spent, Outstanding Balance, Last Visit */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-mono">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Total Visits
                </span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {selectedGuest.totalVisits}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-mono">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Bookings
                </span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {selectedGuest.totalBookings}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-mono">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Lifetime Spent
                </span>
                <span className="text-sm font-bold text-amber-400 tabular-nums">
                  {formatCurrency(selectedGuest.totalSpent)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-mono">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Balance Due
                </span>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    selectedGuest.outstandingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {formatCurrency(selectedGuest.outstandingBalance)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-mono">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Last Visit
                </span>
                <span className="text-xs font-semibold text-neutral-200">
                  {selectedGuest.lastVisitDate ? formatDate(selectedGuest.lastVisitDate) : 'First Visit'}
                </span>
              </div>
            </div>

            {/* Profile specifications */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Identification:</span>
                <span className="font-mono text-neutral-200">
                  {selectedGuest.identificationType} — {selectedGuest.identificationNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Phone & Email:</span>
                <span className="font-mono text-neutral-200">
                  {selectedGuest.phone} • {selectedGuest.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Address:</span>
                <span className="text-neutral-200">
                  {selectedGuest.address || '—'}, {selectedGuest.city}, {selectedGuest.state}
                </span>
              </div>
              {selectedGuest.companyName && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Affiliation:</span>
                  <span className="text-neutral-200">{selectedGuest.companyName}</span>
                </div>
              )}
              {selectedGuest.carPlateNumber && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Vehicle Plate:</span>
                  <span className="font-mono text-neutral-200">
                    {selectedGuest.carPlateNumber}
                  </span>
                </div>
              )}
              {selectedGuest.notes && (
                <div className="pt-2 border-t border-neutral-800 text-neutral-300 italic">
                  "{selectedGuest.notes}"
                </div>
              )}
            </div>

            {/* Reservation History for this guest */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Booking History
              </h4>
              <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
                <table className="w-full text-left text-xs">
                  <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                    <tr>
                      <th className="py-2.5 px-3">Res Code</th>
                      <th className="py-2.5 px-3">Room</th>
                      <th className="py-2.5 px-3">Dates</th>
                      <th className="py-2.5 px-3">Charge</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono">
                    {reservations
                      .filter((r) => r.guestId === selectedGuest.id)
                      .map((res) => (
                        <tr key={res.id}>
                          <td className="py-2.5 px-3 text-amber-400 font-bold">
                            {res.reservationCode}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-200">
                            {res.roomNumber ? `Room ${res.roomNumber}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-300 tabular-nums">
                            {formatDate(res.checkInDate, 'short')} → {formatDate(res.checkOutDate, 'short')}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-200 tabular-nums">
                            {formatCurrency(res.totalRoomCharge)}
                          </td>
                          <td className="py-2.5 px-3">
                            <StatusBadge status={res.status} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setSelectedGuest(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
