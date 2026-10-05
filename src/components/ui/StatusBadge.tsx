import React from 'react';

export type StatusCategory =
  | 'Available'
  | 'Occupied'
  | 'Reserved'
  | 'Cleaning'
  | 'Inspected'
  | 'Maintenance'
  | 'Out of Service'
  | 'Pending'
  | 'Confirmed'
  | 'Checked In'
  | 'Checked Out'
  | 'Cancelled'
  | 'Paid'
  | 'Approved'
  | 'Goods Received'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Urgent'
  | 'Critical';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStyle = (s: string) => {
    switch (s) {
      case 'Available':
      case 'Confirmed':
      case 'Checked In':
      case 'Paid':
      case 'Approved':
      case 'Goods Received':
      case 'Ready':
      case 'Resolved':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

      case 'Occupied':
      case 'Reserved':
      case 'In Progress':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';

      case 'Cleaning':
      case 'Needs Cleaning':
      case 'Inspection':
      case 'Pending':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';

      case 'Maintenance':
      case 'High':
      case 'Urgent':
      case 'Cancelled':
      case 'Out of Service':
      case 'Critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';

      case 'Checked Out':
      case 'Closed':
      case 'Low':
      default:
        return 'text-neutral-400 bg-neutral-800/80 border-neutral-700/60';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border tabular-nums ${getStyle(
        status
      )} ${className}`}
    >
      {status}
    </span>
  );
};
