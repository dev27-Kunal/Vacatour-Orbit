/**
 * Bureau Portal - Submit Candidate
 *
 * Enhanced candidate submission page with job selection and better UX.
 * Reuses existing CandidateSubmissionForm component but adds job selection.
 *
 * Features:
 * - Job selection dropdown (if not pre-selected)
 * - Enhanced candidate form with validation
 * - Duplicate detection
 * - Ownership tracking display
 * - Success metrics and feedback
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CandidateSubmissionForm } from '@/components/vms/CandidateSubmissionForm';
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
  AlertCircle,
  CheckCircle,
  Users,
  Briefcase,
  Building2,
  MapPin,
  Info,
} from 'lucide-react';
import { useLocation, useSearch } from 'wouter';
import { apiGet, ApiError } from '@/lib/api-client';

interface JobOption {
  jobId: string;
  distributionId?: string;
  jobTitle: string;
  companyName: string;
  location: string;
  employmentType: string;
  submittedCandidates: number;
  maxCandidates?: number;
  matchScore: number;
}

function BureauPortalSubmitCandidate() {
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const searchParams = new URLSearchParams(useSearch());

  const [availableJobs, setAvailableJobs] = useState<JobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedDistributionId, setSelectedDistributionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Get pre-selected job from URL params if available
  const preSelectedJobId = searchParams.get('jobId');
  const preSelectedDistributionId = searchParams.get('distributionId');

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

  useEffect(() => {
    if (preSelectedJobId) {
      setSelectedJobId(preSelectedJobId);
    }
    if (preSelectedDistributionId) {
      setSelectedDistributionId(preSelectedDistributionId);
    }
  }, [preSelectedJobId, preSelectedDistributionId]);

  const fetchAvailableJobs = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ data: JobOption[] }>('/api/vms/bureaus/available-jobs');
      setAvailableJobs(data.data || []);
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

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = availableJobs.find((j) => j.jobId === jobId);
    if (job?.distributionId) {
      setSelectedDistributionId(job.distributionId);
    }
  };

  const handleSubmissionSuccess = () => {
    setSubmissionSuccess(true);
    toast({
      title: 'Success!',
      description: 'Candidate submitted successfully',
    });

    // Reset after 3 seconds
    setTimeout(() => {
      setSubmissionSuccess(false);
      setSelectedJobId('');
      setSelectedDistributionId('');
    }, 3000);
  };

  const selectedJob = availableJobs.find((j) => j.jobId === selectedJobId);
  const canSubmit = selectedJob && (!selectedJob.maxCandidates || selectedJob.submittedCandidates < selectedJob.maxCandidates);

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Please log in to submit candidates</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/bureau-portal">Bureau Portal</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('navigation.submitCandidate')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('navigation.submitCandidate')}</h1>
          <p className="text-muted-foreground mt-2">
            Submit a qualified candidate for an available position
          </p>
        </div>

        {/* Success Message */}
        {submissionSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Submission Successful!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your candidate has been submitted and the company has been notified.
            </AlertDescription>
          </Alert>
        )}

        {/* Job Selection */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">Loading jobs...</p>
          </div>
        ) : availableJobs.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Jobs Available</AlertTitle>
            <AlertDescription>
              There are currently no jobs available for candidate submission. Check back later or
              contact your account manager.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Job Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Select Position
                </CardTitle>
                <CardDescription>
                  Choose the job position you want to submit a candidate for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedJobId} onValueChange={handleJobSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a job position..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableJobs.map((job) => (
                      <SelectItem key={job.jobId} value={job.jobId}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{job.jobTitle}</span>
                          <span className="text-xs text-gray-500 ml-4">
                            {job.companyName} - {job.location}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected Job Details */}
                {selectedJob && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-blue-900">{selectedJob.jobTitle}</h4>
                        <div className="flex items-center gap-4 text-sm text-blue-700">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {selectedJob.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {selectedJob.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {selectedJob.employmentType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-blue-600">
                            Submitted: {selectedJob.submittedCandidates}
                            {selectedJob.maxCandidates && ` / ${selectedJob.maxCandidates}`}
                          </span>
                          <span className="text-blue-600">
                            Match Score: {selectedJob.matchScore}%
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/jobs/${selectedJob.jobId}`)}
                      >
                        View Job
                      </Button>
                    </div>

                    {!canSubmit && (
                      <Alert className="mt-4 bg-orange-50 border-orange-200">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertTitle className="text-orange-800">Submission Limit Reached</AlertTitle>
                        <AlertDescription className="text-orange-700">
                          This job has reached the maximum number of candidate submissions.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Candidate Submission Form */}
            {selectedJobId && selectedDistributionId && canSubmit && (
              <CandidateSubmissionForm
                jobId={selectedJobId}
                distributionId={selectedDistributionId}
                onSuccess={handleSubmissionSuccess}
                onCancel={() => {
                  setSelectedJobId('');
                  setSelectedDistributionId('');
                }}
              />
            )}

            {/* Help Card */}
            {!selectedJobId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Candidate Submission Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>
                        Ensure the candidate matches the job requirements and your bureau's
                        specialization
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>
                        Complete all required fields including skills, experience, and availability
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>
                        The system will check for duplicate candidates to protect ownership rights
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>
                        Submitting a candidate establishes 1-year fee protection for your bureau
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default withVMSErrorBoundary(
  BureauPortalSubmitCandidate,
  'Failed to load candidate submission page. Please try again.'
);
