/**
 * MSA Notification Badge Component
 *
 * Shows a notification badge when there are MSAs awaiting approval.
 * Can be integrated into navigation bars or notification centers.
 *
 * Usage:
 * ```tsx
 * import { MSANotificationBadge } from '@/components/msa/MSANotificationBadge';
 *
 * <MSANotificationBadge onClick={() => navigate('/msa-approvals')} />
 * ```
 */

import React from 'react';
import { useHasPendingMSAs } from '@/hooks/useMSAApproval';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MSANotificationBadgeProps {
  onClick?: () => void;
  variant?: 'icon' | 'badge' | 'button';
  className?: string;
}

export function MSANotificationBadge({
  onClick,
  variant = 'icon',
  className,
}: MSANotificationBadgeProps) {
  const { hasPending, count, isLoading } = useHasPendingMSAs();

  if (isLoading || !hasPending) {
    return null;
  }

  // Icon variant - small notification dot
  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className={cn(
                'relative p-2 hover:bg-accent rounded-md transition-colors',
                className
              )}
              aria-label={`${count} MSA${count === 1 ? '' : 's'} awaiting approval`}
            >
              <FileText className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {count} MSA{count === 1 ? '' : 's'} awaiting approval
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Badge variant - shows count
  if (variant === 'badge') {
    return (
      <Badge
        onClick={onClick}
        variant="destructive"
        className={cn(
          'cursor-pointer hover:bg-destructive/90 transition-colors',
          className
        )}
      >
        <FileText className="h-3 w-3 mr-1" />
        {count} MSA{count === 1 ? '' : 's'} pending
      </Badge>
    );
  }

  // Button variant - full button with text
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className={cn('relative', className)}
    >
      <Bell className="h-4 w-4 mr-2" />
      {count} MSA{count === 1 ? '' : 's'} to review
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
    </Button>
  );
}
