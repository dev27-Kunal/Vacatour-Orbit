/**
 * Job Matching Widget Component
 *
 * Shows matching jobs for bureau capabilities with intelligent matching scores.
 *
 * Features:
 * - Match score calculation
 * - Specialization alignment
 * - Location proximity
 * - Quick actions
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Building2,
  MapPin,
  Target,
  TrendingUp,
  Users,
  ArrowRight,
  Star,
} from 'lucide-react';

interface JobMatch {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  matchScore: number;
  specializationMatch: boolean;
  locationMatch: boolean;
  distributionTier?: 'PREMIUM' | 'STANDARD' | 'BASIC';
  isExclusive?: boolean;
}

interface JobMatchingWidgetProps {
  jobs: JobMatch[];
  maxDisplay?: number;
  onViewJob?: (jobId: string) => void;
  onSubmitCandidate?: (jobId: string) => void;
  onViewAll?: () => void;
}

export function JobMatchingWidget({
  jobs,
  maxDisplay = 5,
  onViewJob,
  onSubmitCandidate,
  onViewAll,
}: JobMatchingWidgetProps) {
  const displayJobs = jobs.slice(0, maxDisplay);

  const getMatchScoreColor = (score: number) => {
    if (score >= 75) {return 'text-green-600 bg-green-50 border-green-200';}
    if (score >= 50) {return 'text-yellow-600 bg-yellow-50 border-yellow-200';}
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const tierColors = {
    PREMIUM: 'bg-purple-100 text-purple-800 border-purple-300',
    STANDARD: 'bg-blue-100 text-blue-800 border-blue-300',
    BASIC: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const averageMatchScore = jobs.length > 0
    ? jobs.reduce((sum, job) => sum + job.matchScore, 0) / jobs.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Matching Jobs
            </CardTitle>
            <CardDescription>
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} match your expertise
              {averageMatchScore > 0 && ` (avg. ${averageMatchScore.toFixed(0)}% match)`}
            </CardDescription>
          </div>
          {onViewAll && jobs.length > maxDisplay && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No matching jobs available at the moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      {job.jobTitle}
                      {job.isExclusive && (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-300 text-xs"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Exclusive
                        </Badge>
                      )}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {job.companyName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {job.distributionTier && (
                      <Badge className={`${tierColors[job.distributionTier]} text-xs`}>
                        {job.distributionTier}
                      </Badge>
                    )}
                    <Badge
                      className={`border text-xs ${getMatchScoreColor(job.matchScore)}`}
                      variant="outline"
                    >
                      {job.matchScore}% Match
                    </Badge>
                  </div>
                </div>

                {/* Match Indicators */}
                <div className="flex gap-2 mb-3">
                  {job.specializationMatch && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                    >
                      Specialization Match
                    </Badge>
                  )}
                  {job.locationMatch && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 text-xs"
                    >
                      Location Match
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {onViewJob && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewJob(job.jobId)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                  )}
                  {onSubmitCandidate && (
                    <Button
                      size="sm"
                      onClick={() => onSubmitCandidate(job.jobId)}
                      className="flex-1"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Submit Candidate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {jobs.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-600">
            <span>Showing {displayJobs.length} of {jobs.length}</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Avg. {averageMatchScore.toFixed(0)}% match
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
