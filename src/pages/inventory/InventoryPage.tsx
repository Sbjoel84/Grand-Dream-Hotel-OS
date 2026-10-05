import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Clock,
  History,
  Package,
  PackagePlus,
  Plus,
  Search,
} from 'lucide-react';
import { useInventory } from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { InventoryCategory, InventoryItem, StockOperationType } from '../../types';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, isLoading, createItem, recordOperation } = useInventory();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockOpModalItem, setStockOpModalItem] = useState<InventoryItem | null>(null);
  const [opType, setOpType] = useState<StockOperationType>('Stock In');
  const [opQuantity, setOpQuantity] = useState<number>(1);
  const [opReason, setOpReason] = useState<string>('');
  const [opDepartment, setOpDepartment] = useState<string>('Kitchen');
  const [opError, setOpError] = useState<string>('');

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    code: '',
    category: 'Food' as InventoryCategory,
    unit: 'Units',
    currentStock: 10,
    minimumStock: 5,
    reorderPoint: 8,
    unitCost: 1000,
    location: 'Main Store',
  });

  const categories: InventoryCategory[] = [
    'Food',
    'Beverage',
    'Cleaning',
    'Toiletries',
    'Maintenance',
    'Kitchen',
    'Laundry',
    'Office',
    'Guest Amenities',
    'Other',
  ];

  // Low stock alert items
  const lowStockItems = useMemo(() => {
    return items.filter((i) => i.currentStock <= i.minimumStock);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      return categoryFilter === 'all' || i.category === categoryFilter;
    });
  }, [items, categoryFilter]);

  const handleStockOpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpError('');
    if (!stockOpModalItem) return;

    if (opType !== 'Stock In' && stockOpModalItem.currentStock < opQuantity) {
      setOpError(
        `Cannot issue ${opQuantity} ${stockOpModalItem.unit}. Available stock is only ${stockOpModalItem.currentStock}. Negative stock is prohibited.`
      );
      return;
    }

    try {
      await recordOperation.mutateAsync({
        itemId: stockOpModalItem.id,
        itemName: stockOpModalItem.name,
        operationType: opType,
        quantity: opQuantity,
        previousStock: stockOpModalItem.currentStock,
        newStock:
          opType === 'Stock In'
            ? stockOpModalItem.currentStock + opQuantity
            : stockOpModalItem.currentStock - opQuantity,
        unitCost: stockOpModalItem.unitCost,
        totalValue: opQuantity * stockOpModalItem.unitCost,
        department: opDepartment,
        performedBy: 'user-6',
        performedByName: 'Tunde Bakare',
        reason: opReason,
      });

      setStockOpModalItem(null);
      setOpQuantity(1);
      setOpReason('');
    } catch (err: any) {
      setOpError(err.message || 'Stock operation failed');
    }
  };

  const handleCreateItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createItem.mutateAsync(newItem);
    setIsAddItemOpen(false);
  };

  const columns = [
    {
      header: 'Item / Code',
      cell: (i: InventoryItem) => (
        <div>
          <span className="font-semibold text-neutral-200 text-sm">{i.name}</span>
          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
            {i.code} • {i.location}
          </p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category' as keyof InventoryItem,
      sortable: true,
      cell: (i: InventoryItem) => (
        <span className="text-xs text-neutral-300">{i.category}</span>
      ),
    },
    {
      header: 'Unit',
      accessorKey: 'unit' as keyof InventoryItem,
      cell: (i: InventoryItem) => (
        <span className="text-xs font-mono text-neutral-400">{i.unit}</span>
      ),
    },
    {
      header: 'Current Stock',
      accessorKey: 'currentStock' as keyof InventoryItem,
      sortable: true,
      cell: (i: InventoryItem) => (
        <span
          className={`font-mono font-bold text-sm tabular-nums ${
            i.currentStock <= i.minimumStock ? 'text-rose-400' : 'text-emerald-400'
          }`}
        >
          {i.currentStock.toLocaleString()} {i.unit}
        </span>
      ),
    },
    {
      header: 'Min Threshold',
      cell: (i: InventoryItem) => (
        <span className="font-mono text-xs text-neutral-400 tabular-nums">
          Min: {i.minimumStock} • Reorder: {i.reorderPoint}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (i: InventoryItem) => {
        if (i.currentStock <= i.minimumStock) {
          return (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              Low Stock Alert
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Sufficient
          </span>
        );
      },
    },
    {
      header: 'Valuation',
      cell: (i: InventoryItem) => (
        <div className="text-xs font-mono tabular-nums">
          <p className="text-white font-semibold">{formatCurrency(i.totalValue)}</p>
          <p className="text-[10px] text-neutral-400">@{formatCurrency(i.unitCost)}</p>
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right' as const,
      cell: (i: InventoryItem) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            variant="gold"
            size="sm"
            onClick={() => {
              setStockOpModalItem(i);
              setOpType('Stock In');
              setOpError('');
            }}
          >
            Stock In/Out
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
          <h1 className="text-xl font-bold text-white tracking-tight">Hotel Inventory & Stores</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Diesel fuel reserves, kitchen provisions, housekeeping linens, and stock control
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/inventory/transactions')}
            icon={<History className="w-4 h-4" />}
          >
            Stock Transactions Log
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsAddItemOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Track New Item
          </Button>
        </div>
      </div>

      {/* Low Stock Warning Banner if any items triggered */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-rose-200">
              Low Stock Alert ({lowStockItems.length} items below minimum safety threshold)
            </h4>
            <p className="text-neutral-300 mt-0.5">
              The following materials require urgent procurement:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStockItems.map((item) => (
                <span
                  key={item.id}
                  className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-700/60 font-mono text-rose-300 font-semibold"
                >
                  {item.name}: only {item.currentStock} {item.unit} left (min: {item.minimumStock})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        searchPlaceholder="Search inventory by name, code or location..."
        filterComponent={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        }
      />

      {/* Modal 1: Stock In / Stock Out Operation */}
      {stockOpModalItem && (
        <Modal
          isOpen={Boolean(stockOpModalItem)}
          onClose={() => setStockOpModalItem(null)}
          title={`Stock Operation: ${stockOpModalItem.name}`}
          description={`Current Available Stock: ${stockOpModalItem.currentStock} ${stockOpModalItem.unit} • Location: ${stockOpModalItem.location}`}
        >
          <form onSubmit={handleStockOpSubmit} className="space-y-4">
            {opError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {opError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Operation Type"
                value={opType}
                onChange={(e) => {
                  setOpType(e.target.value as any);
                  setOpError('');
                }}
              >
                <option value="Stock In">Stock In (Inbound Delivery)</option>
                <option value="Stock Out">Stock Out (Usage / Requisition)</option>
                <option value="Damaged">Damaged / Spoilage</option>
                <option value="Adjustment">Audit Count Adjustment</option>
                <option value="Expired">Expired Goods</option>
              </Select>

              <Input
                label={`Quantity (${stockOpModalItem.unit})`}
                type="number"
                min={1}
                required
                value={opQuantity}
                onChange={(e) => setOpQuantity(parseInt(e.target.value) || 1)}
              />

              <Select
                label="Recipient Department"
                value={opDepartment}
                onChange={(e) => setOpDepartment(e.target.value)}
              >
                <option value="Kitchen">Kitchen</option>
                <option value="Bar & Lounge">Bar & Lounge</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Engineering & Maintenance">Engineering & Maintenance</option>
                <option value="Front Desk">Front Desk</option>
              </Select>

              <Input
                label="Operation Reason / Ref Document"
                required
                value={opReason}
                onChange={(e) => setOpReason(e.target.value)}
                placeholder="e.g. Daily generator run or kitchen breakfast prep"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setStockOpModalItem(null)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Record Stock Operation
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Add New Item */}
      {isAddItemOpen && (
        <Modal
          isOpen={isAddItemOpen}
          onClose={() => setIsAddItemOpen(false)}
          title="Register New Inventory Item"
          description="Add tracking for supplies, food ingredients, linens or maintenance stock."
        >
          <form onSubmit={handleCreateItemSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Item Name"
                required
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g. Toilet Tissue Rolls (Pack 48)"
              />
              <Input
                label="Item SKU / Code"
                required
                value={newItem.code}
                onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                placeholder="e.g. TIS-48PK"
              />
              <Select
                label="Category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Input
                label="Unit of Measurement"
                required
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                placeholder="e.g. Cartons, Litres, Packs, Bags"
              />
              <Input
                label="Initial Quantity"
                type="number"
                min={0}
                required
                value={newItem.currentStock}
                onChange={(e) =>
                  setNewItem({ ...newItem, currentStock: parseInt(e.target.value) || 0 })
                }
              />
              <Input
                label="Minimum Stock Alert"
                type="number"
                min={1}
                required
                value={newItem.minimumStock}
                onChange={(e) =>
                  setNewItem({ ...newItem, minimumStock: parseInt(e.target.value) || 1 })
                }
              />
              <Input
                label="Unit Purchase Cost (₦)"
                type="number"
                min={0}
                required
                value={newItem.unitCost}
                onChange={(e) =>
                  setNewItem({ ...newItem, unitCost: parseFloat(e.target.value) || 0 })
                }
              />
              <Input
                label="Storage Location"
                required
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                placeholder="e.g. Housekeeping Store 2nd Floor"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setIsAddItemOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Track Inventory Item
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
