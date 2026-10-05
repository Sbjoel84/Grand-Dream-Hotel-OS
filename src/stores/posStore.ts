import { create } from 'zustand';
import { MenuItem, OrderItem, POSPaymentMethod } from '../types';

interface POSState {
  cart: OrderItem[];
  tableOrRoom: string;
  isRoomService: boolean;
  roomId?: string;
  roomNumber?: string;
  guestId?: string;
  guestName?: string;
  paymentMethod: POSPaymentMethod;
  notes?: string;
  addItem: (item: MenuItem, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setTableOrRoom: (value: string) => void;
  setRoomService: (isRoom: boolean, roomId?: string, roomNumber?: string, guestId?: string, guestName?: string) => void;
  setPaymentMethod: (method: POSPaymentMethod) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  tableOrRoom: 'Table 1',
  isRoomService: false,
  paymentMethod: 'POS',

  addItem: (item: MenuItem, notes?: string) => {
    set((state) => {
      const existing = state.cart.find((i) => i.menuItemId === item.id);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.menuItemId === item.id
              ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
              : i
          ),
        };
      }
      const newItem: OrderItem = {
        id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        notes,
        subtotal: item.price,
      };
      return { cart: [...state.cart, newItem] };
    });
  },

  removeItem: (itemId: string) => {
    set((state) => ({ cart: state.cart.filter((i) => i.id !== itemId) }));
  },

  updateQuantity: (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      cart: state.cart.map((i) =>
        i.id === itemId ? { ...i, quantity, subtotal: quantity * i.price } : i
      ),
    }));
  },

  setTableOrRoom: (value: string) => set({ tableOrRoom: value }),

  setRoomService: (isRoom, roomId, roomNumber, guestId, guestName) =>
    set({
      isRoomService: isRoom,
      roomId,
      roomNumber,
      guestId,
      guestName,
      tableOrRoom: isRoom && roomNumber ? `Room ${roomNumber}` : 'Table 1',
      paymentMethod: isRoom ? 'Room Charge' : 'POS',
    }),

  setPaymentMethod: (method: POSPaymentMethod) => set({ paymentMethod: method }),
  setNotes: (notes: string) => set({ notes }),

  clearCart: () =>
    set({
      cart: [],
      tableOrRoom: 'Table 1',
      isRoomService: false,
      roomId: undefined,
      roomNumber: undefined,
      guestId: undefined,
      guestName: undefined,
      paymentMethod: 'POS',
      notes: undefined,
    }),

  getSubtotal: () => get().cart.reduce((sum, item) => sum + item.subtotal, 0),
  getTax: () => Math.round(get().getSubtotal() * 0.075), // 7.5% Nigerian VAT
  getTotal: () => get().getSubtotal() + get().getTax(),
}));
