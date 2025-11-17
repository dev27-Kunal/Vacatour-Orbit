/**
 * Distributed Jobs List Component
 *
 * Displays jobs distributed to a bureau
 * Features:
 * - Job cards with distribution info
 * - Filter by status and tier
 * - Shows submission count vs max allowed
 * - Click to view details and submit candidates
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiGet, ApiError } from '@/lib/api-client';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface DistributedJob {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  employmentType: string;
  distributionTier: 'PREMIUM' | 'STANDARD' | 'BASIC';
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  distributedAt: string;
  exclusiveUntil?: string;
  maxCandidates?: number;
  submittedCandidates: number;
  acceptedCandidates: number;
  rejectedCandidates: number;
  notes?: string;
}

interface DistributedJobsListProps {
  onViewJob?: (jobId: string, distributionId: string) => void;
  onSubmitCandidate?: (jobId: string, distributionId: string) => void;
}

export function DistributedJobsList({ onViewJob, onSubmitCandidate }: DistributedJobsListProps) {
  const [jobs, setJobs] = useState<DistributedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const { toast } = useToast();

  useEffect(() => {
    fetchDistributedJobs();
  }, []);

  const fetchDistributedJobs = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/vms/distributed-jobs');
      setJobs(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Failed to load distributed jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    const matchesTier = tierFilter === 'ALL' || job.distributionTier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const tierColors = {
    PREMIUM: 'bg-purple-100 text-purple-800 border-purple-300',
    STANDARD: 'bg-blue-100 text-blue-800 border-blue-300',
    BASIC: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    PAUSED: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const getProgressColor = (submitted: number, max?: number) => {
    if (!max) {return 'text-gray-600';}
    const percentage = (submitted / max) * 100;
    if (percentage >= 90) {return 'text-red-600';}
    if (percentage >= 70) {return 'text-orange-600';}
    return 'text-green-600';
  };

  const isExclusive = (job: DistributedJob) => {
    if (!job.exclusiveUntil) {return false;}
    return new Date(job.exclusiveUntil) > new Date();
  };

  const canSubmitCandidate = (job: DistributedJob) => {
    if (job.status !== 'ACTIVE') {return false;}
    if (!job.maxCandidates) {return true;}
    return job.submittedCandidates < job.maxCandidates;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Distributed Jobs</h2>
        <p className="text-muted-foreground">
          Jobs that have been distributed to your bureau for candidate submissions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs, companies, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Tiers</SelectItem>
            <SelectItem value="PREMIUM">Premium</SelectItem>
            <SelectItem value="STANDARD">Standard</SelectItem>
            <SelectItem value="BASIC">Basic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-500">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-gray-500 text-center">
              {searchTerm || statusFilter !== 'ALL' || tierFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'No jobs have been distributed to you yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {job.jobTitle}
                      {isExclusive(job) && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                          Exclusive
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {job.companyName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {job.employmentType}
                      </span>
                    </CardDescription>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={tierColors[job.distributionTier]}>
                      {job.distributionTier}
                    </Badge>
                    <Badge className={statusColors[job.status]} variant="outline">
                      {job.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {/* Distributed Date */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Distributed</span>
                    </div>
                    <div className="font-medium">
                      {new Date(job.distributedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Exclusive Period */}
                  {job.exclusiveUntil && isExclusive(job) && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Exclusive Until</span>
                      </div>
                      <div className="font-medium text-amber-700">
                        {new Date(job.exclusiveUntil).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Candidates Submitted */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>Submitted</span>
                    </div>
                    <div className={`font-medium ${getProgressColor(job.submittedCandidates, job.maxCandidates)}`}>
                      {job.submittedCandidates}
                      {job.maxCandidates && ` / ${job.maxCandidates}`}
                    </div>
                  </div>

                  {/* Acceptance Rate */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-500">
                      <TrendingUp className="h-3 w-3" />
                      <span>Accepted</span>
                    </div>
                    <div className="font-medium text-green-700">
                      {job.acceptedCandidates}
                      {job.submittedCandidates > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({Math.round((job.acceptedCandidates / job.submittedCandidates) * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {job.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm">
                    <strong>Note:</strong> {job.notes}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                {onViewJob && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewJob(job.jobId, job.id)}
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {onSubmitCandidate && (
                  <Button
                    size="sm"
                    onClick={() => onSubmitCandidate(job.jobId, job.id)}
                    disabled={!canSubmitCandidate(job)}
                  >
                    Submit Candidate
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
