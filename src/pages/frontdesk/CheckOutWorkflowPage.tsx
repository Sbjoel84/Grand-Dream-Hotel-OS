import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  CreditCard,
  DollarSign,
  FileText,
  LogOut,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useGuestFolio, useReservations, useRooms } from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatDateTime, getTodayDateString } from '../../utils/date';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { GuestFolio, Reservation } from '../../types';

export const CheckOutWorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedResId = searchParams.get('resId');

  const { data: reservations = [], checkOut } = useReservations();
  const [selectedResId, setSelectedResId] = useState<string>(preselectedResId || '');

  const { data: folio, isLoading: loadingFolio } = useGuestFolio(selectedResId || null);

  const [paymentMethod, setPaymentMethod] = useState<'POS' | 'Cash' | 'Transfer'>('POS');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [checkoutResult, setCheckoutResult] = useState<{
    reservation: Reservation;
    folio: GuestFolio;
  } | null>(null);

  // Sync preselected
  useEffect(() => {
    if (preselectedResId) {
      setSelectedResId(preselectedResId);
    }
  }, [preselectedResId]);

  // When folio loads, default the payment amount to the balance due
  useEffect(() => {
    if (folio) {
      setPaidAmount(folio.balanceDue);
    }
  }, [folio]);

  // Active in-house reservations for dropdown
  const inHouseReservations = reservations.filter((r) => r.status === 'Checked In');

  const handleExecuteCheckOut = async () => {
    if (!selectedResId) return;

    const result = await checkOut.mutateAsync({
      reservationId: selectedResId,
      paymentMethod,
      paidAmount,
    });

    setCheckoutResult({
      reservation: result.reservation,
      folio: result.folio,
    });
    setIsCompleted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Guest Check-Out & Folio Settlement</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Complete account reconciliation, bill settlement, and automated room turnover release
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/frontdesk')}>
          Exit to Front Desk
        </Button>
      </div>

      {!isCompleted ? (
        <div className="space-y-6">
          {/* Guest Selection */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <label className="text-xs font-semibold text-neutral-200 block">
              Select In-House Guest for Settlement:
            </label>
            <Select
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              placeholder="Choose active room..."
            >
              {inHouseReservations.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber} — {r.guestName} ({r.reservationCode}) • Balance:{' '}
                  {formatCurrency(r.balanceDue)}
                </option>
              ))}
            </Select>
          </div>

          {/* Folio Breakdown */}
          {folio && (
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
              <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Master Guest Folio: Room {folio.roomNumber}
                  </h2>
                  <p className="text-xs text-amber-500 font-medium mt-0.5">{folio.guestName}</p>
                </div>
                <div className="text-right text-xs font-mono text-neutral-400">
                  <p>
                    Stay: {formatDate(folio.checkInDate)} → {formatDate(folio.checkOutDate)}
                  </p>
                </div>
              </div>

              {/* Folio Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-neutral-400 border-b border-neutral-800 font-medium">
                    <tr>
                      <th className="pb-2.5">Date</th>
                      <th className="pb-2.5">Department</th>
                      <th className="pb-2.5">Description</th>
                      <th className="pb-2.5 text-right">Amount (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono">
                    {folio.items.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-800/30">
                        <td className="py-2.5 text-neutral-400">{formatDate(item.date, 'short')}</td>
                        <td className="py-2.5 text-neutral-300">{item.department}</td>
                        <td className="py-2.5 text-neutral-200 font-sans">{item.description}</td>
                        <td
                          className={`py-2.5 text-right tabular-nums ${
                            item.amount < 0 ? 'text-emerald-400' : 'text-neutral-200'
                          }`}
                        >
                          {item.amount < 0
                            ? `(${formatCurrency(Math.abs(item.amount))})`
                            : formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Box */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Room Accommodation Total:</span>
                  <span>{formatCurrency(folio.totalRoomCharges)}</span>
                </div>
                {folio.totalRestaurantCharges > 0 && (
                  <div className="flex justify-between text-neutral-300">
                    <span>Restaurant / Bar Orders:</span>
                    <span>{formatCurrency(folio.totalRestaurantCharges)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-300 pt-1 border-t border-neutral-800">
                  <span>Gross Folio Charges:</span>
                  <span className="font-bold text-white">{formatCurrency(folio.totalCharges)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Less Prior Payments / Deposits:</span>
                  <span className="font-bold">-{formatCurrency(folio.totalPayments)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-neutral-700">
                  <span className="font-bold text-white font-sans">Net Balance Due for Check-Out:</span>
                  <span
                    className={`font-bold tabular-nums ${
                      folio.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatCurrency(folio.balanceDue)}
                  </span>
                </div>
              </div>

              {/* Settlement Form */}
              <div className="pt-3 border-t border-neutral-800 space-y-4">
                <h3 className="text-xs font-semibold text-neutral-200">
                  Final Settlement Payment Tender:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Amount Being Settled (₦)"
                    type="number"
                    min={0}
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  />
                  <Select
                    label="Settlement Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  >
                    <option value="POS">POS Terminal Card Payment</option>
                    <option value="Transfer">Bank Transfer</option>
                    <option value="Cash">Cash Tender</option>
                  </Select>
                </div>

                {/* Important notice on room turnover */}
                <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Automated Workflow Policy:</strong> Confirming checkout will
                    automatically change Room {folio.roomNumber} status to <strong>Cleaning</strong>,
                    assign a task to Housekeeping, and generate a final zero-balance receipt.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="secondary" size="sm" onClick={() => navigate('/frontdesk')}>
                    Cancel
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={handleExecuteCheckOut}
                    icon={<LogOut className="w-4 h-4" />}
                  >
                    Confirm Settlement & Release Room
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Check-Out Complete Summary & Print View */
        checkoutResult && (
          <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Check-Out Successfully Settled!</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Room {checkoutResult.folio.roomNumber} has been released and is queued for Housekeeping Sanitization.
              </p>
            </div>

            <div className="max-w-md mx-auto text-left p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Guest:</span>
                <span className="font-bold text-white">{checkoutResult.folio.guestName}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Room Number:</span>
                <span className="text-white">Room {checkoutResult.folio.roomNumber}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Total Charges:</span>
                <span className="text-white font-bold">
                  {formatCurrency(checkoutResult.folio.totalCharges)}
                </span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Total Payments Recorded:</span>
                <span className="text-emerald-400 font-bold">
                  {formatCurrency(checkoutResult.folio.totalPayments)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Final Folio Balance:</span>
                <span className="text-white font-bold">
                  {formatCurrency(checkoutResult.folio.balanceDue)}
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
                Print Guest Folio Receipt (A4 / Thermal)
              </Button>
              <Button variant="gold" size="sm" onClick={() => navigate('/frontdesk')}>
                Return to Front Desk
              </Button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
