import React, { useState } from 'react';
import { Download, FileText, Plus, Printer, TrendingDown } from 'lucide-react';
import { useFinance } from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDate, getTodayDateString } from '../../utils/date';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Expense, ExpenseCategory } from '../../types';

export const ExpensesPage: React.FC = () => {
  const { expenses, isLoading, createExpense } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [category, setCategory] = useState<ExpenseCategory>('Utilities & Diesel (Power Generator)');
  const [amount, setAmount] = useState<number>(50000);
  const [date, setDate] = useState<string>(getTodayDateString());
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Transfer' | 'Bank Cheque'>('Transfer');
  const [reference, setReference] = useState<string>('');
  const [beneficiary, setBeneficiary] = useState<string>('');

  const categories: ExpenseCategory[] = [
    'Utilities & Diesel (Power Generator)',
    'Food & Beverage Procurement',
    'Housekeeping & Laundry Supplies',
    'Maintenance & Repairs',
    'Salaries & Staff Welfare',
    'Internet & Subscriptions',
    'Government Rates & Licenses (AMAC/Abuja)',
    'Marketing & Guest Relations',
    'Petty Cash & Miscellaneous',
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExpense.mutateAsync({
      category,
      amount,
      date,
      description,
      paymentMethod,
      reference,
      beneficiary,
      recordedById: 'user-7',
      recordedByName: 'Amina Danjuma (Accounts)',
    });
    setIsModalOpen(false);
    setDescription('');
    setReference('');
    setBeneficiary('');
  };

  const columns = [
    {
      header: 'Voucher #',
      accessorKey: 'voucherNumber' as keyof Expense,
      sortable: true,
      cell: (e: Expense) => (
        <span className="font-mono font-bold text-amber-400 text-xs">{e.voucherNumber}</span>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category' as keyof Expense,
      sortable: true,
      cell: (e: Expense) => (
        <span className="text-xs font-semibold text-neutral-200">{e.category}</span>
      ),
    },
    {
      header: 'Description & Beneficiary',
      cell: (e: Expense) => (
        <div className="text-xs text-neutral-300">
          <p>{e.description}</p>
          <p className="text-[10px] text-neutral-400 font-mono">Payee: {e.beneficiary}</p>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'amount' as keyof Expense,
      sortable: true,
      cell: (e: Expense) => (
        <span className="font-mono font-bold text-xs text-rose-400 tabular-nums">
          {formatCurrency(e.amount)}
        </span>
      ),
    },
    {
      header: 'Method / Ref',
      cell: (e: Expense) => (
        <div className="text-xs font-mono text-neutral-300">
          <p>{e.paymentMethod}</p>
          <p className="text-[10px] text-neutral-500">{e.reference}</p>
        </div>
      ),
    },
    {
      header: 'Date',
      cell: (e: Expense) => (
        <span className="font-mono text-xs text-neutral-400 tabular-nums">
          {formatDate(e.date)}
        </span>
      ),
    },
    {
      header: 'Recorded By',
      cell: (e: Expense) => (
        <span className="text-xs text-neutral-400">{e.recordedByName}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Operating Expenses Ledger</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Audited payment vouchers for diesel, food supplies, AMAC licenses, and hotel maintenance
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Post Payment Voucher
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        isLoading={isLoading}
        searchPlaceholder="Search by voucher #, category, payee or description..."
      />

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Post Operating Expense Voucher"
          description="Record verified hotel expenditure with payment receipt reference."
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Expenditure Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Input
                label="Expense Amount (₦)"
                type="number"
                min={100}
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Transaction Date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              >
                <option value="Transfer">Bank Transfer</option>
                <option value="Cash">Cash / Petty Cash</option>
                <option value="Bank Cheque">Bank Cheque</option>
              </Select>
              <Input
                label="Payee / Beneficiary"
                required
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                placeholder="e.g. TotalEnergies Kubwa or Spectranet"
              />
              <Input
                label="Payment Reference / Trace #"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. TRF-EXP-9921 or PETTY-0410"
              />
            </div>

            <Input
              label="Expenditure Purpose & Description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Procurement of 1,500L diesel fuel for Caterpillar 250kVA generator"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Post Expense Voucher
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
