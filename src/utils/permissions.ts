import { Permission, UserProfile, UserRole } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'dashboard.view',
    'rooms.view',
    'rooms.manage',
    'reservations.view',
    'reservations.create',
    'reservations.edit',
    'reservations.cancel',
    'frontdesk.checkin',
    'frontdesk.checkout',
    'guests.view',
    'guests.manage',
    'housekeeping.view',
    'housekeeping.manage',
    'pos.access',
    'pos.discount',
    'inventory.view',
    'inventory.manage',
    'procurement.manage',
    'finance.view',
    'finance.manage',
    'maintenance.view',
    'maintenance.manage',
    'reports.view',
    'users.manage',
    'audit.view',
    'settings.manage',
  ],

  management: [
    'dashboard.view',
    'rooms.view',
    'rooms.manage',
    'reservations.view',
    'reservations.create',
    'reservations.edit',
    'reservations.cancel',
    'frontdesk.checkin',
    'frontdesk.checkout',
    'guests.view',
    'guests.manage',
    'housekeeping.view',
    'housekeeping.manage',
    'pos.access',
    'pos.discount',
    'inventory.view',
    'procurement.manage',
    'finance.view',
    'maintenance.view',
    'maintenance.manage',
    'reports.view',
    'audit.view',
  ],

  reception: [
    'dashboard.view',
    'rooms.view',
    'reservations.view',
    'reservations.create',
    'reservations.edit',
    'reservations.cancel',
    'frontdesk.checkin',
    'frontdesk.checkout',
    'guests.view',
    'guests.manage',
    'housekeeping.view',
    'pos.access',
    'finance.view',
  ],

  housekeeping: [
    'dashboard.view',
    'rooms.view',
    'housekeeping.view',
    'housekeeping.manage',
    'maintenance.view',
  ],

  restaurant_bar: [
    'dashboard.view',
    'pos.access',
    'inventory.view',
  ],

  inventory_officer: [
    'dashboard.view',
    'inventory.view',
    'inventory.manage',
    'procurement.manage',
  ],

  procurement_officer: [
    'dashboard.view',
    'inventory.view',
    'procurement.manage',
    'finance.view',
  ],

  finance_officer: [
    'dashboard.view',
    'finance.view',
    'finance.manage',
    'reports.view',
    'audit.view',
    'reservations.view',
    'guests.view',
    'pos.access',
  ],

  maintenance_officer: [
    'dashboard.view',
    'maintenance.view',
    'maintenance.manage',
    'rooms.view',
    'inventory.view',
  ],
};

export function hasPermission(user: UserProfile | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;

  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
}

export function getRoleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    super_admin: 'Super Administrator',
    management: 'General Management',
    reception: 'Front Desk / Reception',
    housekeeping: 'Housekeeping Supervisor',
    restaurant_bar: 'Restaurant & Bar Lead',
    inventory_officer: 'Inventory Officer',
    procurement_officer: 'Procurement Officer',
    finance_officer: 'Finance / Accounts Officer',
    maintenance_officer: 'Maintenance Engineer',
  };
  return map[role] || role;
}
