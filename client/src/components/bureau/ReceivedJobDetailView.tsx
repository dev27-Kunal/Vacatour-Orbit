/**
 * ReceivedJobDetailView Component
 *
 * Full detail view for a job distribution received by the bureau.
 * Shows complete job information, distribution details, and submission history.
 *
 * Features:
 * - Complete job details
 * - Company information
 * - Distribution tier and limits
 * - Submission history for this bureau
 * - Action buttons (Accept/Decline if pending)
 * - Submit candidate button if active
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
  MessageSquare,
  ArrowLeft,
  AlertCircle,
  Target,
  TrendingUp,
} from 'lucide-react';
import { bureauDistributionApi, type Distribution } from '@/lib/api/bureau-distributions';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// Types
// ============================================================================

interface ReceivedJobDetailViewProps {
  distributionId: string;
  onAccept?: (distributionId: string) => void;
  onDecline?: (distributionId: string) => void;
  onRequestInfo?: (distributionId: string) => void;
}

// ============================================================================
// Component
// ============================================================================

export function ReceivedJobDetailView({
  distributionId,
  onAccept,
  onDecline,
  onRequestInfo,
}: ReceivedJobDetailViewProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDistribution();
  }, [distributionId]);

  const fetchDistribution = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await bureauDistributionApi.getDistributionDetail(distributionId);
      setDistribution(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load job details';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setLocation('/bureau/jobs-received');
  };

  const handleSubmitCandidate = () => {
    if (distribution) {
      setLocation(
        `/bureau-portal/submit-candidate?jobId=${distribution.jobId}&distributionId=${distribution.id}`
      );
    }
  };

  const isExclusive = distribution?.isExclusive && distribution.exclusiveUntil
    ? new Date(distribution.exclusiveUntil) > new Date()
    : false;

  const canSubmitCandidate = distribution?.status === 'ACTIVE' &&
    (!distribution.maxCandidates ||
      distribution.submittedCandidates < distribution.maxCandidates);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !distribution) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Job</h3>
          <p className="text-gray-500 text-center mb-4">
            {error || 'Job not found'}
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Received Jobs
      </Button>

      {/* Job Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <CardTitle className="text-2xl flex items-center gap-2 flex-wrap">
                {distribution.jobTitle}
                {isExclusive && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                    <Star className="h-3 w-3 mr-1" />
                    Exclusive
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 text-base flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {distribution.companyName}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {distribution.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {distribution.employmentType}
                </span>
              </CardDescription>
            </div>

            <div className="flex flex-col gap-2">
              <Badge
                variant="outline"
                className={
                  distribution.distributionTier === 'PREMIUM'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : distribution.distributionTier === 'STANDARD'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                }
              >
                {distribution.distributionTier}
              </Badge>
              <Badge
                variant="outline"
                className={
                  distribution.status === 'PENDING'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : distribution.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : distribution.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                }
              >
                {distribution.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Received
              </div>
              <div className="text-lg font-semibold">
                {new Date(distribution.distributedAt).toLocaleDateString()}
              </div>
            </div>

            {isExclusive && distribution.exclusiveUntil && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  Exclusive Until
                </div>
                <div className="text-lg font-semibold text-amber-700">
                  {new Date(distribution.exclusiveUntil).toLocaleDateString()}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                Candidates
              </div>
              <div className="text-lg font-semibold">
                {distribution.submittedCandidates}
                {distribution.maxCandidates && ` / ${distribution.maxCandidates}`}
              </div>
            </div>

            {distribution.salaryRange && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  Salary Range
                </div>
                <div className="text-lg font-semibold">{distribution.salaryRange}</div>
              </div>
            )}
          </div>

          <Separator />

          {/* Job Description */}
          {distribution.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Job Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{distribution.description}</p>
            </div>
          )}

          {/* Requirements */}
          {distribution.requirements && distribution.requirements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Requirements</h3>
              <ul className="list-disc list-inside space-y-1">
                {distribution.requirements.map((req, idx) => (
                  <li key={idx} className="text-gray-700">{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {distribution.skills && distribution.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {distribution.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {distribution.status === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onRequestInfo?.(distribution.id)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Request More Info
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onDecline?.(distribution.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline Job
                </Button>
                <Button onClick={() => onAccept?.(distribution.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Job
                </Button>
              </>
            )}

            {distribution.status === 'ACTIVE' && (
              <Button
                onClick={handleSubmitCandidate}
                disabled={!canSubmitCandidate}
              >
                <Users className="mr-2 h-4 w-4" />
                Submit Candidate
              </Button>
            )}
          </div>

          {/* Status Messages */}
          {distribution.status === 'CANCELLED' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <XCircle className="h-4 w-4 inline mr-1" />
                This job distribution has been cancelled by the company.
              </p>
            </div>
          )}

          {distribution.status === 'ACTIVE' && !canSubmitCandidate && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Maximum candidate limit reached. No more submissions allowed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
