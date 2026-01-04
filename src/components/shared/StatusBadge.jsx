import React from 'react';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-900/20'
  },
  in_progress: {
    icon: Clock,
    color: 'text-blue-400',
    bg: 'bg-blue-900/20'
  },
  failure: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-900/20'
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-900/20'
  },
  queued: {
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/20'
  }
};

export function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.queued;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${className}`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
      </span>
    </div>
  );
}

export default StatusBadge;
