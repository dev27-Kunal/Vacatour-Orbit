/**
 * ReceivedJobCard Component
 *
 * Displays a job card for jobs distributed to the bureau.
 * Shows job details, distribution tier, status, and action buttons.
 *
 * Features:
 * - Distribution tier badge (PREMIUM/STANDARD/BASIC)
 * - Status indicator with color coding
 * - Submission progress tracker
 * - Action buttons based on status (Accept/Decline/Request Info)
 * - Exclusive job indicator
 * - Mobile responsive
 */

import React from 'react';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Eye,
} from 'lucide-react';
import type { Distribution, DistributionStatus, DistributionTier } from '@/lib/api/bureau-distributions';

// ============================================================================
// Types
// ============================================================================

interface ReceivedJobCardProps {
  distribution: Distribution;
  onAccept?: (distributionId: string) => void;
  onDecline?: (distributionId: string) => void;
  onRequestInfo?: (distributionId: string) => void;
  onViewDetails?: (distributionId: string) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

const getStatusConfig = (status: DistributionStatus) => {
  const configs: Record<DistributionStatus, { color: string; icon: any; label: string }> = {
    PENDING: {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: AlertCircle,
      label: 'New',
    },
    ACTIVE: {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle,
      label: 'Active',
    },
    PAUSED: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: Clock,
      label: 'Paused',
    },
    COMPLETED: {
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: CheckCircle,
      label: 'Completed',
    },
    CANCELLED: {
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: XCircle,
      label: 'Cancelled',
    },
  };

  return configs[status];
};

const getTierConfig = (tier: DistributionTier) => {
  const configs: Record<DistributionTier, { color: string; label: string }> = {
    PREMIUM: {
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      label: 'Premium',
    },
    STANDARD: {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      label: 'Standard',
    },
    BASIC: {
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      label: 'Basic',
    },
  };

  return configs[tier];
};

const isExclusive = (distribution: Distribution): boolean => {
  if (!distribution.exclusiveUntil) return false;
  return new Date(distribution.exclusiveUntil) > new Date();
};

const canSubmitCandidate = (distribution: Distribution): boolean => {
  if (distribution.status !== 'ACTIVE') return false;
  if (!distribution.maxCandidates) return true;
  return distribution.submittedCandidates < distribution.maxCandidates;
};

// ============================================================================
// Component
// ============================================================================

export function ReceivedJobCard({
  distribution,
  onAccept,
  onDecline,
  onRequestInfo,
  onViewDetails,
}: ReceivedJobCardProps) {
  const [, setLocation] = useLocation();
  const statusConfig = getStatusConfig(distribution.status);
  const tierConfig = getTierConfig(distribution.distributionTier);
  const StatusIcon = statusConfig.icon;

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(distribution.id);
    } else {
      setLocation(`/bureau/jobs-received/${distribution.id}`);
    }
  };

  const handleSubmitCandidate = () => {
    setLocation(
      `/bureau-portal/submit-candidate?jobId=${distribution.jobId}&distributionId=${distribution.id}`
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <span className="truncate">{distribution.jobTitle}</span>
              {isExclusive(distribution) && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                  <Star className="h-3 w-3 mr-1" />
                  Exclusive
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{distribution.companyName}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {distribution.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3 flex-shrink-0" />
                {distribution.employmentType}
              </span>
            </CardDescription>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge className={`border ${tierConfig.color}`} variant="outline">
              {tierConfig.label}
            </Badge>
            <Badge className={`border ${statusConfig.color}`} variant="outline">
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Skills */}
        {distribution.skills && distribution.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-1">
              {distribution.skills.slice(0, 6).map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {distribution.skills.length > 6 && (
                <Badge variant="secondary" className="text-xs">
                  +{distribution.skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Received</span>
            </div>
            <div className="font-medium">
              {new Date(distribution.distributedAt).toLocaleDateString()}
            </div>
          </div>

          {isExclusive(distribution) && distribution.exclusiveUntil && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Exclusive Until</span>
              </div>
              <div className="font-medium text-amber-700">
                {new Date(distribution.exclusiveUntil).toLocaleDateString()}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="h-3 w-3" />
              <span>Candidates</span>
            </div>
            <div className="font-medium">
              {distribution.submittedCandidates}
              {distribution.maxCandidates && ` / ${distribution.maxCandidates}`}
            </div>
          </div>

          {distribution.salaryRange && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-gray-500">
                <Briefcase className="h-3 w-3" />
                <span>Salary</span>
              </div>
              <div className="font-medium">{distribution.salaryRange}</div>
            </div>
          )}
        </div>

        {/* Status-specific messages */}
        {distribution.status === 'PENDING' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Action required: Accept or decline this job opportunity
            </p>
          </div>
        )}

        {distribution.status === 'ACTIVE' && !canSubmitCandidate(distribution) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Maximum candidates reached
            </p>
          </div>
        )}

        {distribution.status === 'CANCELLED' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <XCircle className="h-4 w-4 inline mr-1" />
              This job distribution has been cancelled
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </Button>

        <div className="flex gap-2">
          {distribution.status === 'PENDING' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRequestInfo?.(distribution.id)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Request Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDecline?.(distribution.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => onAccept?.(distribution.id)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept
              </Button>
            </>
          )}

          {distribution.status === 'ACTIVE' && (
            <Button
              size="sm"
              onClick={handleSubmitCandidate}
              disabled={!canSubmitCandidate(distribution)}
            >
              <Users className="mr-2 h-4 w-4" />
              Submit Candidate
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
