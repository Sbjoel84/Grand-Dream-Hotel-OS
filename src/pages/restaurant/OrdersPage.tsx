import React, { useState } from 'react';
import { Eye, Printer, UtensilsCrossed } from 'lucide-react';
import { useRestaurant } from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { RestaurantOrder } from '../../types';

export const OrdersPage: React.FC = () => {
  const { orders, isLoadingOrders } = useRestaurant();
  const [selectedOrder, setSelectedOrder] = useState<RestaurantOrder | null>(null);

  const columns = [
    {
      header: 'Ticket #',
      accessorKey: 'orderNumber' as keyof RestaurantOrder,
      sortable: true,
      cell: (o: RestaurantOrder) => (
        <span className="font-mono font-bold text-amber-400 text-xs">{o.orderNumber}</span>
      ),
    },
    {
      header: 'Table / Room',
      accessorKey: 'tableOrRoom' as keyof RestaurantOrder,
      sortable: true,
      cell: (o: RestaurantOrder) => (
        <div>
          <span className="font-semibold text-neutral-200 text-xs">{o.tableOrRoom}</span>
          {o.guestName && (
            <p className="text-[10px] text-neutral-400">{o.guestName}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Items Ordered',
      cell: (o: RestaurantOrder) => (
        <span className="text-xs text-neutral-300">
          {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
        </span>
      ),
    },
    {
      header: 'Total Amount',
      accessorKey: 'totalAmount' as keyof RestaurantOrder,
      sortable: true,
      cell: (o: RestaurantOrder) => (
        <span className="font-mono font-bold text-xs text-white tabular-nums">
          {formatCurrency(o.totalAmount)}
        </span>
      ),
    },
    {
      header: 'Tender Method',
      cell: (o: RestaurantOrder) => (
        <span className="font-mono text-xs text-neutral-300">{o.paymentMethod}</span>
      ),
    },
    {
      header: 'Status',
      cell: (o: RestaurantOrder) => <StatusBadge status={o.paymentStatus} />,
    },
    {
      header: 'Timestamp',
      cell: (o: RestaurantOrder) => (
        <span className="font-mono text-[11px] text-neutral-400 tabular-nums">
          {formatDateTime(o.createdAt)}
        </span>
      ),
    },
    {
      header: 'Action',
      align: 'right' as const,
      cell: (o: RestaurantOrder) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedOrder(o)}
          icon={<Eye className="w-3.5 h-3.5" />}
        >
          Receipt
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Restaurant & Bar Sales Ledger
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Complete transaction history for dining tables, bar lounge & room service orders
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoadingOrders}
        searchPlaceholder="Search by ticket #, table or guest..."
      />

      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order Ticket #${selectedOrder.orderNumber}`}
          size="sm"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Location:</span>
                <span className="text-white font-bold">{selectedOrder.tableOrRoom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Waiter:</span>
                <span className="text-neutral-200">{selectedOrder.waiterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Tender:</span>
                <span className="text-amber-400 font-bold">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="py-2 border-y border-neutral-800 space-y-1">
                {selectedOrder.items.map((i) => (
                  <div key={i.id} className="flex justify-between">
                    <span>{i.quantity}x {i.name}</span>
                    <span>{formatCurrency(i.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-sm text-white pt-1">
                <span>Total:</span>
                <span className="text-amber-400">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Print Receipt
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
