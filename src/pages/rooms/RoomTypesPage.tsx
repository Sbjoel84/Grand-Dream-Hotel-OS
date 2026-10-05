import React from 'react';
import { Bed, Check, Users } from 'lucide-react';
import { useRoomTypes } from '../../hooks/useHotelData';
import { formatCurrency } from '../../utils/currency';
import { Button } from '../../components/ui/Button';

export const RoomTypesPage: React.FC = () => {
  const { data: roomTypes = [], isLoading } = useRoomTypes();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Room Types & Pricing Tiers</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Nightly accommodation rates, capacity configurations & guest room amenities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roomTypes.map((rt) => (
          <div
            key={rt.id}
            className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs text-amber-500 font-semibold">{rt.code}</span>
                <h3 className="text-base font-bold text-white">{rt.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  {formatCurrency(rt.baseRate)}
                </span>
                <span className="text-xs text-neutral-400 block">per night</span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">{rt.description}</p>

            <div className="flex items-center gap-4 text-xs font-mono text-neutral-300 py-2 border-y border-neutral-800">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-500" />
                <span>Up to {rt.capacityAdults} Adults, {rt.capacityChildren} Children</span>
              </div>
              <span>•</span>
              <div>
                <span>{rt.totalRooms} Rooms in Inventory</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Included Amenities:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {rt.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800/80 text-[11px] text-neutral-200 border border-neutral-700/60"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
