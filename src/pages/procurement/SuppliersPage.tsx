import React, { useState } from 'react';
import { Plus, Truck } from 'lucide-react';
import { useProcurement } from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { InventoryCategory, Supplier } from '../../types';

export const SuppliersPage: React.FC = () => {
  const { suppliers, createSupplier } = useProcurement();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Payment on Delivery');
  const [bankDetails, setBankDetails] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSupplier.mutateAsync({
      companyName,
      contactPerson,
      phone,
      email,
      address,
      categories: ['Food', 'Beverage'] as InventoryCategory[],
      paymentTerms,
      bankDetails,
      rating: 4.8,
      isActive: true,
    });
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Vendor / Company',
      accessorKey: 'companyName' as keyof Supplier,
      sortable: true,
      cell: (s: Supplier) => (
        <div>
          <span className="font-semibold text-neutral-200 text-xs">{s.companyName}</span>
          <p className="text-[10px] text-neutral-400">{s.address}</p>
        </div>
      ),
    },
    {
      header: 'Contact Person',
      cell: (s: Supplier) => (
        <div className="text-xs text-neutral-300">
          <p>{s.contactPerson}</p>
          <p className="text-[10px] text-neutral-400 font-mono">{s.phone}</p>
        </div>
      ),
    },
    {
      header: 'Payment Terms',
      cell: (s: Supplier) => (
        <span className="text-xs font-mono text-neutral-300">{s.paymentTerms}</span>
      ),
    },
    {
      header: 'Orders Fulfilled',
      cell: (s: Supplier) => (
        <span className="font-mono text-xs text-neutral-200 font-semibold tabular-nums">
          {s.totalOrders} orders
        </span>
      ),
    },
    {
      header: 'Total Spend',
      cell: (s: Supplier) => (
        <span className="font-mono text-xs text-amber-400 font-bold tabular-nums">
          {formatCurrency(s.totalSpend)}
        </span>
      ),
    },
    {
      header: 'Rating',
      cell: (s: Supplier) => (
        <span className="text-xs font-mono text-amber-400 font-semibold">★ {s.rating}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Suppliers & Vendor Registry</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Approved vendors, payment agreements, bank accounts & delivery track record
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Register Vendor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        searchPlaceholder="Search suppliers by name or contact..."
      />

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Register New Hotel Supplier"
          description="Enter vendor company and billing details."
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Company Name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. TotalEnergies Kubwa"
              />
              <Input
                label="Contact Person"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Garba Shehu"
              />
              <Input
                label="Phone Number"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 222 9900"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@domain.com"
              />
              <Input
                label="Office / Depot Address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Kubwa Expressway, Abuja"
              />
              <Input
                label="Payment Terms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. 14-Day Net or Payment on Delivery"
              />
            </div>

            <Input
              label="Bank Account Details"
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              placeholder="e.g. Zenith Bank - 1012398471"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Register Supplier
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
