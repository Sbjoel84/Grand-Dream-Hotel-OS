import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bed,
  CheckCircle2,
  DollarSign,
  Download,
  FileText,
  Printer,
  TrendingDown,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  Wine,
} from 'lucide-react';
import { useFinance, useReservations } from '../../hooks/useHotelData';
import { formatCurrency, formatCurrencyCompact } from '../../utils/currency';
import { Button } from '../../components/ui/Button';

export const FinancialSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { payments, expenses, isLoading } = useFinance();
  const { data: reservations = [] } = useReservations();

  const metrics = useMemo(() => {
    const validPayments = payments.filter((p) => !p.isVoided);
    const validExpenses = expenses.filter((e) => !e.isVoided);

    const roomRev = validPayments
      .filter((p) => p.department === 'Rooms')
      .reduce((sum, p) => sum + p.amount, 0);

    const restaurantRev = validPayments
      .filter((p) => p.department === 'Restaurant')
      .reduce((sum, p) => sum + p.amount, 0);

    const barRev = validPayments
      .filter((p) => p.department === 'Bar')
      .reduce((sum, p) => sum + p.amount, 0);

    const otherRev = validPayments
      .filter((p) => !['Rooms', 'Restaurant', 'Bar'].includes(p.department))
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRev = roomRev + restaurantRev + barRev + otherRev;
    const totalExp = validExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRev - totalExp;

    const outstandingFolioDue = reservations
      .filter((r) => r.status === 'Checked In' || r.status === 'Confirmed')
      .reduce((sum, r) => sum + (r.balanceDue || 0), 0);

    // Group expenses by category
    const expenseByCategory: Record<string, number> = {};
    validExpenses.forEach((e) => {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
    });

    return {
      roomRev,
      restaurantRev,
      barRev,
      otherRev,
      totalRev,
      totalExp,
      netProfit,
      outstandingFolioDue,
      expenseByCategory,
    };
  }, [payments, expenses, reservations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Financial Accounting Dashboard</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Revenue streams, verified bank settlements, operating expenses, and net operating position
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4" />}
          >
            Print Financial Summary
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/finance/payments')}
          >
            Payments Registry
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <span className="text-xs text-neutral-400 font-medium">Total Gross Revenue</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatCurrency(metrics.totalRev)}
          </p>
          <p className="text-[11px] text-neutral-400">All verified cashier settlements</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <span className="text-xs text-neutral-400 font-medium">Operating Expenses</span>
          <p className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {formatCurrency(metrics.totalExp)}
          </p>
          <p className="text-[11px] text-neutral-400">Diesel, supplies, repairs & vouchers</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <span className="text-xs text-neutral-400 font-medium">Net Operating Position</span>
          <p
            className={`text-2xl font-bold font-mono tabular-nums ${
              metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(metrics.netProfit)}
          </p>
          <p className="text-[11px] text-neutral-400">Gross collections less expenses</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <span className="text-xs text-neutral-400 font-medium">Outstanding Folios</span>
          <p className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {formatCurrency(metrics.outstandingFolioDue)}
          </p>
          <p className="text-[11px] text-neutral-400">Pending checkout settlement</p>
        </div>
      </div>

      {/* Revenue Breakdown & Expense Breakdown Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departmental Revenue Breakdown */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Revenue By Department</h3>
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-amber-500" />
                <span className="text-neutral-200 font-semibold font-sans">Room Accommodation</span>
              </div>
              <span className="text-amber-400 font-bold tabular-nums">
                {formatCurrency(metrics.roomRev)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-emerald-500" />
                <span className="text-neutral-200 font-semibold font-sans">Restaurant Dining</span>
              </div>
              <span className="text-emerald-400 font-bold tabular-nums">
                {formatCurrency(metrics.restaurantRev)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wine className="w-4 h-4 text-sky-500" />
                <span className="text-neutral-200 font-semibold font-sans">Bar & Lounge Drinks</span>
              </div>
              <span className="text-sky-400 font-bold tabular-nums">
                {formatCurrency(metrics.barRev)}
              </span>
            </div>
          </div>
        </div>

        {/* Operating Expenses Breakdown */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Expense Distribution</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/finance/expenses')}
              className="text-xs"
            >
              Voucher Ledger
            </Button>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {Object.entries(metrics.expenseByCategory).map(([cat, amt]) => (
              <div
                key={cat}
                className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex justify-between items-center"
              >
                <span className="text-neutral-300 font-sans">{cat}</span>
                <span className="text-rose-400 font-bold tabular-nums">
                  {formatCurrency(amt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
