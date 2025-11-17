/**
 * Distribution Status Badge Component
 *
 * Displays a colored badge for job distribution status.
 */

import { Badge } from '@/components/ui/badge';
import { DistributionStatus } from '@shared/types/vms';

interface DistributionStatusBadgeProps {
  status: DistributionStatus;
  className?: string;
}

/**
 * Status badge styling configuration
 */
const STATUS_CONFIG: Record<
  DistributionStatus,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: 'In behandeling',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-yellow-200',
  },
  ACTIVE: {
    label: 'Actief',
    className: 'bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200',
  },
  PAUSED: {
    label: 'Gepauzeerd',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80 border-gray-200',
  },
  COMPLETED: {
    label: 'Voltooid',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-blue-200',
  },
  CANCELLED: {
    label: 'Geannuleerd',
    className: 'bg-red-100 text-red-800 hover:bg-red-100/80 border-red-200',
  },
};

export function DistributionStatusBadge({
  status,
  className,
}: DistributionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${className || ''}`}
    >
      {config.label}
    </Badge>
  );
}
