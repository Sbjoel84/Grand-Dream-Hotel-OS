import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Eye,
  FileCheck,
  PackageCheck,
  Plus,
  Truck,
  XCircle,
} from 'lucide-react';
import { useProcurement } from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatDateTime } from '../../utils/date';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PurchaseOrder, PurchaseStatus } from '../../types';

export const PurchaseOrdersPage: React.FC = () => {
  const { purchaseOrders, suppliers, isLoading, createPO, updatePOStatus } = useProcurement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // New PO Form
  const [supplierId, setSupplierId] = useState('');
  const [department, setDepartment] = useState('Engineering & Maintenance');
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('Litres');
  const [quantity, setQuantity] = useState(100);
  const [unitPrice, setUnitPrice] = useState(1350);
  const [notes, setNotes] = useState('');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === supplierId);
    const total = quantity * unitPrice;

    await createPO.mutateAsync({
      supplierId: supplierId || suppliers[0]?.id || 'sup-1',
      supplierName: sup?.companyName || 'TotalEnergies Kubwa',
      supplierPhone: sup?.phone,
      department,
      requestedBy: 'user-8',
      requestedByName: 'Engr. Segun Adeleke',
      items: [
        {
          itemName,
          unit,
          quantity,
          unitPrice,
          total,
        },
      ],
      totalAmount: total,
      status: 'Purchase Request',
      notes,
    });

    setIsModalOpen(false);
    setItemName('');
    setNotes('');
  };

  const handleAdvanceStatus = async (
    po: PurchaseOrder,
    nextStatus: PurchaseStatus
  ) => {
    await updatePOStatus.mutateAsync({
      id: po.id,
      status: nextStatus,
      staffName: 'Ngozi Okonkwo (Manager)',
    });
    setSelectedPO(null);
  };

  const columns = [
    {
      header: 'PO Number',
      accessorKey: 'poNumber' as keyof PurchaseOrder,
      sortable: true,
      cell: (p: PurchaseOrder) => (
        <span className="font-mono font-bold text-amber-400 text-xs">{p.poNumber}</span>
      ),
    },
    {
      header: 'Supplier',
      accessorKey: 'supplierName' as keyof PurchaseOrder,
      sortable: true,
      cell: (p: PurchaseOrder) => (
        <div>
          <span className="font-semibold text-neutral-200 text-xs">{p.supplierName}</span>
          <p className="text-[10px] text-neutral-400 font-mono">{p.supplierPhone}</p>
        </div>
      ),
    },
    {
      header: 'Items',
      cell: (p: PurchaseOrder) => (
        <div className="text-xs text-neutral-300">
          {p.items.map((i, idx) => (
            <span key={idx}>
              {i.quantity} {i.unit} {i.itemName}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Department',
      cell: (p: PurchaseOrder) => (
        <span className="text-xs text-neutral-400">{p.department}</span>
      ),
    },
    {
      header: 'Total Amount',
      accessorKey: 'totalAmount' as keyof PurchaseOrder,
      sortable: true,
      cell: (p: PurchaseOrder) => (
        <span className="font-mono font-bold text-xs text-white tabular-nums">
          {formatCurrency(p.totalAmount)}
        </span>
      ),
    },
    {
      header: 'Workflow Stage',
      cell: (p: PurchaseOrder) => <StatusBadge status={p.status} />,
    },
    {
      header: 'Actions',
      align: 'right' as const,
      cell: (p: PurchaseOrder) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPO(p)}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Review
          </Button>

          {p.status === 'Purchase Request' && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => handleAdvanceStatus(p, 'Approved')}
            >
              Approve
            </Button>
          )}

          {p.status === 'Approved' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAdvanceStatus(p, 'Purchased')}
            >
              Mark Ordered
            </Button>
          )}

          {p.status === 'Purchased' && (
            <Button
              variant="gold"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => handleAdvanceStatus(p, 'Goods Received')}
              icon={<PackageCheck className="w-3.5 h-3.5" />}
            >
              Receive Goods
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
          <h1 className="text-xl font-bold text-white tracking-tight">
            Procurement & Purchase Orders
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Modular approval workflow: Request → Approval → Purchase → Goods Received
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Raise Purchase Request
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={purchaseOrders}
        isLoading={isLoading}
        searchPlaceholder="Search by PO number, supplier, or items..."
      />

      {/* Modal: New Purchase Request */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Raise Purchase Request Voucher"
          description="Initiate procurement request for management review and sign-off."
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Registered Supplier"
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">-- Choose Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName}
                  </option>
                ))}
              </Select>
              <Select
                label="Requesting Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Engineering & Maintenance">Engineering & Maintenance</option>
                <option value="Kitchen / F&B">Kitchen / F&B</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Front Desk">Front Desk</option>
                <option value="General Admin">General Admin</option>
              </Select>
              <Input
                label="Item Description"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. AGO Diesel Fuel or Parboiled Rice"
              />
              <Input
                label="Unit of Measure"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Litres, 50kg Bags, Cartons"
              />
              <Input
                label="Quantity"
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
              <Input
                label="Expected Unit Price (₦)"
                type="number"
                min={1}
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono flex justify-between">
              <span className="text-neutral-400">Total Purchase Commitment:</span>
              <span className="text-amber-400 font-bold">
                {formatCurrency(quantity * unitPrice)}
              </span>
            </div>

            <Input
              label="Requisition Justification / Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Replenishment for 250kVA Cat generator for weekend peak occupancy"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Submit for Approval
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View PO Details */}
      {selectedPO && (
        <Modal
          isOpen={Boolean(selectedPO)}
          onClose={() => setSelectedPO(null)}
          title={`Purchase Order: ${selectedPO.poNumber}`}
          size="md"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Supplier:</span>
                <span className="text-white font-bold">{selectedPO.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Department:</span>
                <span className="text-neutral-200">{selectedPO.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Requested By:</span>
                <span className="text-neutral-200">{selectedPO.requestedByName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Current Status:</span>
                <StatusBadge status={selectedPO.status} />
              </div>

              <div className="py-2 border-y border-neutral-800 space-y-1">
                {selectedPO.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {i.quantity} {i.unit} {i.itemName} @ {formatCurrency(i.unitPrice)}
                    </span>
                    <span className="font-bold">{formatCurrency(i.total)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm font-bold text-white pt-1">
                <span>Grand Total:</span>
                <span className="text-amber-400">{formatCurrency(selectedPO.totalAmount)}</span>
              </div>
            </div>

            {selectedPO.notes && (
              <p className="text-neutral-400 italic">"{selectedPO.notes}"</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setSelectedPO(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
