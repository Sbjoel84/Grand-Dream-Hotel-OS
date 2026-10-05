import { useAuthStore } from '../stores/authStore';
import { Permission } from '../types';
import { hasPermission } from '../utils/permissions';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  return {
    user,
    can: (permission: Permission) => hasPermission(user, permission),
    canAny: (permissions: Permission[]) => permissions.some((p) => hasPermission(user, p)),
    role: user?.role,
  };
}
