import { z } from 'zod';

export const reservationFormSchema = z.object({
  guestName: z.string().min(2, 'Guest full name is required'),
  guestPhone: z.string().min(8, 'Valid phone number is required (e.g. 08031234567)'),
  guestEmail: z.string().email('Valid email address is required'),
  roomTypeId: z.string().min(1, 'Please select a room category'),
  roomId: z.string().optional(),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  numberOfAdults: z.coerce.number().min(1, 'At least 1 adult is required'),
  numberOfChildren: z.coerce.number().min(0).default(0),
  ratePerNight: z.coerce.number().min(1, 'Rate per night is required'),
  discountAmount: z.coerce.number().min(0).default(0),
  depositPaid: z.coerce.number().min(0).default(0),
  bookingSource: z.enum([
    'Walk-in',
    'Direct Phone',
    'Hotel Website',
    'Booking.com',
    'Corporate Partner',
    'Travel Agent',
    'Government/Diplomatic',
  ]),
  specialRequests: z.string().optional(),
  flightDetails: z.string().optional(),
}).refine(
  (data) => {
    if (!data.checkInDate || !data.checkOutDate) return true;
    return new Date(data.checkOutDate) > new Date(data.checkInDate);
  },
  {
    message: 'Check-out date must be strictly after check-in date',
    path: ['checkOutDate'],
  }
);

export type ReservationFormData = z.infer<typeof reservationFormSchema>;

export const guestFormSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(8, 'Phone number is required (e.g. 080...)'),
  altPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(2, 'City is required').default('Abuja'),
  state: z.string().min(2, 'State is required').default('FCT'),
  country: z.string().default('Nigeria'),
  identificationType: z.enum([
    'National ID (NIN)',
    'International Passport',
    "Driver's License",
    "Voter's Card",
  ]),
  identificationNumber: z.string().min(4, 'ID number is required'),
  nationality: z.string().default('Nigerian'),
  isVIP: z.boolean().default(false),
  companyName: z.string().optional(),
  carPlateNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type GuestFormData = z.infer<typeof guestFormSchema>;

export const roomFormSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required (e.g. 101, 204)'),
  roomTypeId: z.string().min(1, 'Room type is required'),
  floor: z.coerce.number().min(0, 'Floor number is required'),
  ratePerNight: z.coerce.number().min(1000, 'Valid nightly rate in ₦ is required'),
  isSmoking: z.boolean().default(false),
  notes: z.string().optional(),
});

export type RoomFormData = z.infer<typeof roomFormSchema>;

export const inventoryItemSchema = z.object({
  name: z.string().min(2, 'Item name is required'),
  code: z.string().min(2, 'SKU/Code is required'),
  category: z.enum([
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
  ]),
  unit: z.string().min(1, 'Unit of measurement (Bottle, Pack, Kg, etc.) is required'),
  currentStock: z.coerce.number().min(0, 'Current stock must be 0 or more'),
  minimumStock: z.coerce.number().min(0, 'Minimum stock threshold is required'),
  reorderPoint: z.coerce.number().min(0, 'Reorder point is required'),
  unitCost: z.coerce.number().min(0, 'Unit cost in ₦ is required'),
  location: z.string().min(2, 'Storage location is required'),
  supplierId: z.string().optional(),
});

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

export const expenseFormSchema = z.object({
  category: z.enum([
    'Utilities & Diesel (Power Generator)',
    'Food & Beverage Procurement',
    'Housekeeping & Laundry Supplies',
    'Maintenance & Repairs',
    'Salaries & Staff Welfare',
    'Internet & Subscriptions',
    'Government Rates & Licenses (AMAC/Abuja)',
    'Marketing & Guest Relations',
    'Petty Cash & Miscellaneous',
  ]),
  amount: z.coerce.number().min(100, 'Amount must be at least ₦100'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(3, 'Detailed description is required'),
  paymentMethod: z.enum(['Cash', 'Transfer', 'Bank Cheque']),
  reference: z.string().min(1, 'Payment reference / receipt trace number is required'),
  beneficiary: z.string().min(2, 'Payee / Beneficiary name is required'),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

export const maintenanceRequestSchema = z.object({
  roomOrFacility: z.string().min(2, 'Room or facility location is required (e.g. Room 205)'),
  category: z.enum(['Plumbing', 'Electrical', 'HVAC / AC', 'Carpentry & Furniture', 'Electronics', 'Civil Works']),
  issue: z.string().min(3, 'Short summary of the issue is required'),
  description: z.string().min(5, 'Detailed description is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  estimatedCost: z.coerce.number().min(0).optional(),
});

export type MaintenanceRequestFormData = z.infer<typeof maintenanceRequestSchema>;
