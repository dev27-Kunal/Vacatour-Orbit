/**
 * Assigned Jobs List Component
 *
 * Displays jobs assigned to a bureau with:
 * - Job details
 * - Distribution tier badge
 * - Submission progress
 * - Exclusive period indicator
 * - Actions (View, Submit Candidate)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MapPin,
  Building,
  Calendar,
  Users,
  ExternalLink,
  Star,
  Clock,
} from 'lucide-react';

export interface AssignedJob {
  id: string;
  jobId: string;
  jobTitle: string;
  jobLocation: string;
  companyName: string;
  distributionTier: string;
  status: string;
  isExclusive: boolean;
  exclusiveUntil?: string;
  maxCandidates: number;
  candidatesSubmitted: number;
  distributedAt: string;
}

interface AssignedJobsListProps {
  jobs: AssignedJob[];
  onViewJob: (jobId: string) => void;
  onSubmitCandidate: (jobId: string) => void;
  loading?: boolean;
}

const tierColors = {
  EXCLUSIVE: 'bg-purple-100 text-purple-800 border-purple-300',
  PRIORITY: 'bg-blue-100 text-blue-800 border-blue-300',
  STANDARD: 'bg-gray-100 text-gray-800 border-gray-300',
};

const tierIcons = {
  EXCLUSIVE: '💎',
  PRIORITY: '⭐',
  STANDARD: '📋',
};

export function AssignedJobsList({
  jobs,
  onViewJob,
  onSubmitCandidate,
  loading = false,
}: AssignedJobsListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assigned Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assigned Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No jobs assigned yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Jobs will appear here when companies distribute them to you
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assigned Jobs</CardTitle>
          <Badge variant="secondary">{jobs.length} Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => {
            const progress = (job.candidatesSubmitted / job.maxCandidates) * 100;
            const isExclusiveActive =
              job.isExclusive &&
              job.exclusiveUntil &&
              new Date(job.exclusiveUntil) > new Date();
            const canSubmit = job.candidatesSubmitted < job.maxCandidates;

            return (
              <div
                key={job.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{job.jobTitle}</h3>
                      <Badge className={tierColors[job.distributionTier as keyof typeof tierColors]}>
                        {tierIcons[job.distributionTier as keyof typeof tierIcons]}{' '}
                        {job.distributionTier}
                      </Badge>
                      {isExclusiveActive && (
                        <Badge variant="default" className="bg-purple-600">
                          <Star className="h-3 w-3 mr-1" />
                          Exclusive
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.companyName}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.jobLocation}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(job.distributedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exclusive period warning */}
                {isExclusiveActive && (
                  <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded text-sm">
                    <div className="flex items-center gap-2 text-purple-900">
                      <Clock className="h-4 w-4" />
                      <span>
                        Exclusive until{' '}
                        {new Date(job.exclusiveUntil!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Candidates Submitted</span>
                    <span className="font-medium">
                      {job.candidatesSubmitted} / {job.maxCandidates}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewJob(job.jobId)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onSubmitCandidate(job.jobId)}
                    disabled={!canSubmit}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {canSubmit ? 'Submit Candidate' : 'Limit Reached'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
