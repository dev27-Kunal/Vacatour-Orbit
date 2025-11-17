/**
 * Bureau Jobs Page
 *
 * Displays all jobs assigned to the current bureau.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { PageWrapper } from '@/components/page-wrapper';
import { AssignedJobsList, type AssignedJob } from '@/components/bureau/AssignedJobsList';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { apiGet, ApiError } from '@/lib/api-client';

export default function BureauJobsPage() {
  const { t } = useTranslation();
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [jobs, setJobs] = useState<AssignedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify user is a bureau
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
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ data: AssignedJob[] }>('/api/bureau/jobs');
      setJobs(data.data || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Failed to load jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (jobId: string) => {
    setLocation(`/jobs/${jobId}`);
  };

  const handleSubmitCandidate = (jobId: string) => {
    setLocation(`/jobs/${jobId}/apply`);
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/vms/bureau-dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('jobs.myJobs')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('bureau.assignedJobsTitle')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('bureau.assignedJobsSubtitle')}
          </p>
        </div>

        {/* Jobs List */}
        <AssignedJobsList
          jobs={jobs}
          onViewJob={handleViewJob}
          onSubmitCandidate={handleSubmitCandidate}
          loading={loading}
        />
      </div>
    </PageWrapper>
  );
}
