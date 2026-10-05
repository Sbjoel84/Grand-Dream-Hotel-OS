import React, { useState } from 'react';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { useRestaurant } from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { MenuItem } from '../../types';

export const MenuPage: React.FC = () => {
  const { menuItems, createMenuItem, updateMenuItem } = useRestaurant();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<MenuItem['category']>('Food');
  const [price, setPrice] = useState(5000);
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState(2500);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMenuItem.mutateAsync({
      name,
      code,
      category,
      price,
      costPrice,
      description,
      available: true,
    });
    setIsModalOpen(false);
    setName('');
    setCode('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Food & Beverage Catalog</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Menu catalog, pricing, cost of sales & kitchen inventory items
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Menu Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">
                  {item.code} • {item.category}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{item.name}</h4>
              </div>
              <span className="text-sm font-mono font-bold text-white tabular-nums">
                {formatCurrency(item.price)}
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>Cost Price: {formatCurrency(item.costPrice || 0)}</span>
              <span className="text-emerald-400">Available</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Menu Product"
          description="Create a new food, beverage or spirit item for the POS system."
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Product Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asun Peppered Goat Meat"
              />
              <Input
                label="Product Code / SKU"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. F08"
              />
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="Food">Food</option>
                <option value="Beverage">Beverage</option>
                <option value="Cocktails">Cocktails</option>
                <option value="Wine & Spirits">Wine & Spirits</option>
                <option value="Snacks">Snacks</option>
                <option value="Dessert">Dessert</option>
              </Select>
              <Input
                label="Selling Price (₦)"
                type="number"
                min={100}
                required
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Cost Price (₦)"
                type="number"
                min={0}
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
            <Input
              label="Item Description / Ingredients"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Spicy diced goat meat with habanero & onions"
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Save Product
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
