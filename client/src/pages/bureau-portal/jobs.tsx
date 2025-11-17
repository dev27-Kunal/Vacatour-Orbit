/**
 * Bureau Portal - Available Jobs
 *
 * Shows jobs available to the bureau based on distribution and specialization matching.
 * Features intelligent filtering and matching scores.
 *
 * Features:
 * - Jobs distributed to the bureau
 * - Smart matching based on specialization
 * - Filter by tier, location, skills
 * - Match score indicators
 * - Quick candidate submission
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { withVMSErrorBoundary } from '@/components/vms/VMSErrorBoundary';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  Star,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { apiGet, ApiError } from '@/lib/api-client';

interface JobMatch {
  id: string;
  jobId: string;
  distributionId?: string;
  jobTitle: string;
  companyName: string;
  location: string;
  employmentType: string;
  salaryRange?: string;
  distributionTier?: 'PREMIUM' | 'STANDARD' | 'BASIC';
  distributionStatus?: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  matchScore: number;
  specializationMatch: boolean;
  locationMatch: boolean;
  skills: string[];
  postedAt: string;
  exclusiveUntil?: string;
  maxCandidates?: number;
  submittedCandidates: number;
  description?: string;
}

function BureauPortalJobs() {
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [matchFilter, setMatchFilter] = useState<string>('ALL');

  useEffect(() => {
    if (user && user.userType !== 'BUREAU') {
      toast({
        title: 'Access Denied',
        description: 'This page is only accessible to bureaus',
        variant: 'destructive',
      });
      setLocation('/dashboard');
      return;
    }

    if (user) {
      fetchAvailableJobs();
    }
  }, [user]);

  const fetchAvailableJobs = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ data: JobMatch[] }>('/api/vms/bureaus/available-jobs');
      setJobs(data.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Failed to load available jobs',
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

    const matchesTier =
      tierFilter === 'ALL' || job.distributionTier === tierFilter;

    const matchesScore =
      matchFilter === 'ALL' ||
      (matchFilter === 'HIGH' && job.matchScore >= 75) ||
      (matchFilter === 'MEDIUM' && job.matchScore >= 50 && job.matchScore < 75) ||
      (matchFilter === 'LOW' && job.matchScore < 50);

    return matchesSearch && matchesTier && matchesScore;
  });

  const tierColors = {
    PREMIUM: 'bg-purple-100 text-purple-800 border-purple-300',
    STANDARD: 'bg-blue-100 text-blue-800 border-blue-300',
    BASIC: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 75) {return 'text-green-600 bg-green-50 border-green-200';}
    if (score >= 50) {return 'text-yellow-600 bg-yellow-50 border-yellow-200';}
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 75) {return 'Excellent Match';}
    if (score >= 50) {return 'Good Match';}
    return 'Fair Match';
  };

  const isExclusive = (job: JobMatch) => {
    if (!job.exclusiveUntil) {return false;}
    return new Date(job.exclusiveUntil) > new Date();
  };

  const canSubmitCandidate = (job: JobMatch) => {
    if (job.distributionStatus && job.distributionStatus !== 'ACTIVE') {return false;}
    if (!job.maxCandidates) {return true;}
    return job.submittedCandidates < job.maxCandidates;
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Please log in to view available jobs</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">{t('navigation.dashboard')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/bureau-portal">{t('navigation.bureauPortal')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('navigation.availableJobs')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('bureauPortal.jobs.heading')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('bureauPortal.jobs.description')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('bureauPortal.jobs.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('bureauPortal.jobs.filterTier')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('bureauPortal.jobs.allTiers')}</SelectItem>
              <SelectItem value="PREMIUM">{t('bureauPortal.jobs.premium')}</SelectItem>
              <SelectItem value="STANDARD">{t('bureauPortal.jobs.standard')}</SelectItem>
              <SelectItem value="BASIC">{t('bureauPortal.jobs.basic')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={matchFilter} onValueChange={setMatchFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('bureauPortal.jobs.filterMatch')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('bureauPortal.jobs.allMatches')}</SelectItem>
              <SelectItem value="HIGH">{t('bureauPortal.jobs.highMatch')}</SelectItem>
              <SelectItem value="MEDIUM">{t('bureauPortal.jobs.mediumMatch')}</SelectItem>
              <SelectItem value="LOW">{t('bureauPortal.jobs.lowMatch')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">{t('bureauPortal.jobs.loading')}</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('bureauPortal.jobs.noJobsTitle')}</h3>
              <p className="text-gray-500 text-center">
                {searchTerm || tierFilter !== 'ALL' || matchFilter !== 'ALL'
                  ? t('bureauPortal.jobs.noJobsAdjustFilters')
                  : t('bureauPortal.jobs.noJobsBureau')}
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
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        {job.jobTitle}
                        {isExclusive(job) && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            <Star className="h-3 w-3 mr-1" />
                            {t('bureauPortal.jobs.exclusive')}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm flex-wrap">
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
                      {job.distributionTier && (
                        <Badge className={tierColors[job.distributionTier]}>
                          {job.distributionTier}
                        </Badge>
                      )}
                      <Badge className={`border ${getMatchScoreColor(job.matchScore)}`} variant="outline">
                        <Target className="h-3 w-3 mr-1" />
                        {job.matchScore}% {t('bureauPortal.jobs.filterMatch').split(' ')[0]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Match Indicators */}
                  <div className="flex gap-2 mb-4">
                    {job.specializationMatch && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {t('bureauPortal.jobs.specializationMatch')}
                      </Badge>
                    )}
                    {job.locationMatch && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {t('bureauPortal.jobs.locationMatch')}
                      </Badge>
                    )}
                  </div>

                  {/* Skills */}
                  {job.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">{t('bureauPortal.jobs.requiredSkills')}</p>
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 8).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 8 && (
                          <Badge variant="secondary" className="text-xs">
                            {t('bureauPortal.jobs.more', { count: job.skills.length - 8 })}
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
                        <span>{t('bureauPortal.jobs.posted')}</span>
                      </div>
                      <div className="font-medium">
                        {new Date(job.postedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {job.exclusiveUntil && isExclusive(job) && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{t('bureauPortal.jobs.exclusiveUntil')}</span>
                        </div>
                        <div className="font-medium text-amber-700">
                          {new Date(job.exclusiveUntil).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users className="h-3 w-3" />
                        <span>{t('bureauPortal.jobs.submitted')}</span>
                      </div>
                      <div className="font-medium">
                        {job.submittedCandidates}
                        {job.maxCandidates && ` / ${job.maxCandidates}`}
                      </div>
                    </div>

                    {job.salaryRange && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-500">
                          <TrendingUp className="h-3 w-3" />
                          <span>{t('bureauPortal.jobs.salary')}</span>
                        </div>
                        <div className="font-medium">{job.salaryRange}</div>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation(`/jobs/${job.jobId}`)}
                  >
                    {t('bureauPortal.jobs.viewDetails')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setLocation(`/bureau-portal/submit-candidate?jobId=${job.jobId}${job.distributionId ? `&distributionId=${job.distributionId}` : ''}`)}
                    disabled={!canSubmitCandidate(job)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {t('bureauPortal.jobs.submitCandidate')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && filteredJobs.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{t('bureauPortal.jobs.summary', { shown: filteredJobs.length, total: jobs.length })}</span>
                <span>{t('bureauPortal.jobs.avgMatch', { score: (filteredJobs.reduce((acc, job) => acc + job.matchScore, 0) / filteredJobs.length).toFixed(1) })}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}

export default withVMSErrorBoundary(
  BureauPortalJobs,
  'Failed to load available jobs. Please try again.'
);
