import React from 'react';
import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import { useInventory } from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';
import { DataTable } from '../../components/ui/DataTable';
import { StockTransaction } from '../../types';

export const StockTransactionsPage: React.FC = () => {
  const { transactions } = useInventory();

  const columns = [
    {
      header: 'Timestamp',
      accessorKey: 'createdAt' as keyof StockTransaction,
      sortable: true,
      cell: (t: StockTransaction) => (
        <span className="font-mono text-xs text-neutral-400 tabular-nums">
          {formatDateTime(t.createdAt)}
        </span>
      ),
    },
    {
      header: 'Item Name',
      accessorKey: 'itemName' as keyof StockTransaction,
      sortable: true,
      cell: (t: StockTransaction) => (
        <span className="font-semibold text-neutral-200 text-xs">{t.itemName}</span>
      ),
    },
    {
      header: 'Operation',
      cell: (t: StockTransaction) => {
        const isPositive = t.operationType === 'Stock In';
        return (
          <span
            className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded ${
              isPositive
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
            }`}
          >
            {isPositive ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
            {t.operationType}
          </span>
        );
      },
    },
    {
      header: 'Quantity',
      cell: (t: StockTransaction) => (
        <span className="font-mono font-bold text-xs text-white tabular-nums">
          {t.quantity.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Balance After',
      cell: (t: StockTransaction) => (
        <span className="font-mono text-xs text-neutral-400 tabular-nums">
          {t.newStock.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Department / User',
      cell: (t: StockTransaction) => (
        <div className="text-xs text-neutral-300">
          <p>{t.department}</p>
          <p className="text-[10px] text-neutral-400 font-mono">By: {t.performedByName}</p>
        </div>
      ),
    },
    {
      header: 'Reason / Document',
      cell: (t: StockTransaction) => (
        <span className="text-xs text-neutral-400 italic">{t.reason || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Stock Movement Ledger</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Audited history of stock additions, kitchen requisitions, fuel burn & physical adjustments
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        searchPlaceholder="Search by item name, department or staff..."
      />
    </div>
  );
};
