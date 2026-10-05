import React, { useState } from 'react';
import { Shield, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { useUsers } from '../../hooks/useHotelData';
import { formatDateTime } from '../../utils/date';
import { getRoleLabel } from '../../utils/permissions';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { UserProfile, UserRole } from '../../types';

export const UsersPage: React.FC = () => {
  const { data: users = [], isLoading, updateUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>('reception');

  const handleRoleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    await updateUser.mutateAsync({
      id: selectedUser.id,
      updates: { role: targetRole },
    });
    setSelectedUser(null);
  };

  const roles: UserRole[] = [
    'super_admin',
    'management',
    'reception',
    'housekeeping',
    'restaurant_bar',
    'inventory_officer',
    'procurement_officer',
    'finance_officer',
    'maintenance_officer',
  ];

  const columns = [
    {
      header: 'Staff Member',
      accessorKey: 'fullName' as keyof UserProfile,
      sortable: true,
      cell: (u: UserProfile) => (
        <div>
          <span className="font-semibold text-neutral-200 text-sm">{u.fullName}</span>
          <p className="text-[10px] text-neutral-400 font-mono">{u.email}</p>
        </div>
      ),
    },
    {
      header: 'Department',
      accessorKey: 'department' as keyof UserProfile,
      cell: (u: UserProfile) => (
        <span className="text-xs text-neutral-300">{u.department}</span>
      ),
    },
    {
      header: 'Assigned Role',
      cell: (u: UserProfile) => (
        <span className="text-xs font-semibold text-amber-400">
          {getRoleLabel(u.role)}
        </span>
      ),
    },
    {
      header: 'Phone',
      cell: (u: UserProfile) => (
        <span className="font-mono text-xs text-neutral-400">{u.phone || '—'}</span>
      ),
    },
    {
      header: 'Last Active',
      cell: (u: UserProfile) => (
        <span className="font-mono text-xs text-neutral-400 tabular-nums">
          {u.lastLogin ? formatDateTime(u.lastLogin).split(',')[0] : '—'}
        </span>
      ),
    },
    {
      header: 'Action',
      align: 'right' as const,
      cell: (u: UserProfile) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedUser(u);
            setTargetRole(u.role);
          }}
        >
          Change Role
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Staff & Access Control (RBAC)</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Departmental user directory, permission scopes & role assignments
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchPlaceholder="Search staff by name, email or department..."
      />

      {selectedUser && (
        <Modal
          isOpen={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          title={`Edit Role: ${selectedUser.fullName}`}
          description={`Department: ${selectedUser.department} • Current Role: ${getRoleLabel(selectedUser.role)}`}
          size="sm"
        >
          <form onSubmit={handleRoleChangeSubmit} className="space-y-4">
            <Select
              label="Assigned System Role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as any)}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {getRoleLabel(r)}
                </option>
              ))}
            </Select>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <Button variant="secondary" size="sm" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Save Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
