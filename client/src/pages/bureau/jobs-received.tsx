/**
 * Bureau Jobs Received Page
 *
 * Main page for viewing jobs distributed to the bureau.
 * Features filtering, searching, and actions on received jobs.
 *
 * Features:
 * - Tabs: All | New | Active | Declined
 * - Filter by employment type
 * - Search by job title/company
 * - Grid of job cards
 * - Accept/Decline/Request Info actions
 * - Empty states
 * - Loading states
 * - Mobile responsive
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { ReceivedJobCard } from '@/components/bureau/ReceivedJobCard';
import { AcceptJobDialog } from '@/components/bureau/AcceptJobDialog';
import { DeclineJobDialog } from '@/components/bureau/DeclineJobDialog';
import { RequestInfoDialog } from '@/components/bureau/RequestInfoDialog';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import {
  bureauDistributionApi,
  type Distribution,
  type DistributionStatus,
  type EmploymentType,
  type DeclineJobRequest,
  type RequestInfoRequest,
} from '@/lib/api/bureau-distributions';
import {
  Briefcase,
  Search,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type TabValue = 'all' | 'new' | 'active' | 'declined';

// ============================================================================
// Component
// ============================================================================

export default function BureauJobsReceivedPage() {
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Data state
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<
    EmploymentType | 'ALL'
  >('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog state
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [requestInfoDialogOpen, setRequestInfoDialogOpen] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(
    null
  );

  // Check user access
  useEffect(() => {
    if (user && user.userType !== 'BUREAU') {
      toast({
        title: 'Access Denied',
        description: 'This page is only accessible to bureaus',
        variant: 'destructive',
      });
      setLocation('/dashboard');
    }
  }, [user]);

  // Fetch jobs on mount
  useEffect(() => {
    if (user && user.userType === 'BUREAU') {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await bureauDistributionApi.getMyJobs();
      setDistributions(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to load received jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter distributions based on tab and filters
  const getFilteredDistributions = (): Distribution[] => {
    return distributions.filter((dist) => {
      // Tab filter
      if (activeTab === 'new' && dist.status !== 'PENDING') return false;
      if (activeTab === 'active' && dist.status !== 'ACTIVE') return false;
      if (
        activeTab === 'declined' &&
        dist.status !== 'CANCELLED' &&
        !dist.declinedAt
      )
        return false;

      // Employment type filter
      if (
        employmentTypeFilter !== 'ALL' &&
        dist.employmentType !== employmentTypeFilter
      )
        return false;

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesTitle = dist.jobTitle.toLowerCase().includes(search);
        const matchesCompany = dist.companyName.toLowerCase().includes(search);
        if (!matchesTitle && !matchesCompany) return false;
      }

      return true;
    });
  };

  const filteredDistributions = getFilteredDistributions();

  // Get counts for tabs
  const getCounts = () => {
    return {
      all: distributions.length,
      new: distributions.filter((d) => d.status === 'PENDING').length,
      active: distributions.filter((d) => d.status === 'ACTIVE').length,
      declined: distributions.filter(
        (d) => d.status === 'CANCELLED' || d.declinedAt
      ).length,
    };
  };

  const counts = getCounts();

  // Dialog handlers
  const handleAcceptClick = (distributionId: string) => {
    const dist = distributions.find((d) => d.id === distributionId);
    if (dist) {
      setSelectedDistribution(dist);
      setAcceptDialogOpen(true);
    }
  };

  const handleDeclineClick = (distributionId: string) => {
    const dist = distributions.find((d) => d.id === distributionId);
    if (dist) {
      setSelectedDistribution(dist);
      setDeclineDialogOpen(true);
    }
  };

  const handleRequestInfoClick = (distributionId: string) => {
    const dist = distributions.find((d) => d.id === distributionId);
    if (dist) {
      setSelectedDistribution(dist);
      setRequestInfoDialogOpen(true);
    }
  };

  // Action handlers
  const handleAcceptJob = async (notes?: string) => {
    if (!selectedDistribution) return;

    try {
      await bureauDistributionApi.acceptJob(selectedDistribution.id);

      toast({
        title: 'Job Accepted',
        description: `You can now submit candidates for ${selectedDistribution.jobTitle}`,
      });

      setAcceptDialogOpen(false);
      setSelectedDistribution(null);
      fetchJobs(); // Refresh list
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to accept job',
        variant: 'destructive',
      });
    }
  };

  const handleDeclineJob = async (request: DeclineJobRequest) => {
    if (!selectedDistribution) return;

    try {
      await bureauDistributionApi.declineJob(selectedDistribution.id, request);

      toast({
        title: 'Job Declined',
        description: 'The job has been removed from your active list',
      });

      setDeclineDialogOpen(false);
      setSelectedDistribution(null);
      fetchJobs(); // Refresh list
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to decline job',
        variant: 'destructive',
      });
    }
  };

  const handleRequestInfo = async (request: RequestInfoRequest) => {
    if (!selectedDistribution) return;

    try {
      await bureauDistributionApi.requestInfo(selectedDistribution.id, request);

      toast({
        title: 'Request Sent',
        description: 'The company will be notified and respond via messaging',
      });

      setRequestInfoDialogOpen(false);
      setSelectedDistribution(null);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to send request',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Please log in to view received jobs</p>
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
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/bureau-portal">Bureau Portal</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Jobs Received</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Jobs Received</h1>
            <p className="text-muted-foreground mt-2">
              Manage jobs distributed to your bureau
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={employmentTypeFilter}
            onValueChange={(value) =>
              setEmploymentTypeFilter(value as EmploymentType | 'ALL')
            }
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Employment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="VAST">Vast</SelectItem>
              <SelectItem value="INTERIM">Interim</SelectItem>
              <SelectItem value="UITZENDEN">Uitzenden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All
              {counts.all > 0 && (
                <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs">
                  {counts.all}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="new">
              New
              {counts.new > 0 && (
                <span className="ml-2 rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">
                  {counts.new}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">
              Active
              {counts.active > 0 && (
                <span className="ml-2 rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs">
                  {counts.active}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="declined">
              Declined
              {counts.declined > 0 && (
                <span className="ml-2 rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs">
                  {counts.declined}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredDistributions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {activeTab === 'new'
                      ? 'No New Jobs'
                      : activeTab === 'active'
                      ? 'No Active Jobs'
                      : activeTab === 'declined'
                      ? 'No Declined Jobs'
                      : 'No Jobs Received'}
                  </h3>
                  <p className="text-gray-500 text-center">
                    {searchTerm || employmentTypeFilter !== 'ALL'
                      ? 'Try adjusting your filters'
                      : activeTab === 'new'
                      ? 'New job opportunities will appear here'
                      : activeTab === 'active'
                      ? 'Accept new jobs to start working on them'
                      : activeTab === 'declined'
                      ? 'Declined jobs will appear here'
                      : 'No jobs have been distributed to your bureau yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredDistributions.map((distribution) => (
                  <ReceivedJobCard
                    key={distribution.id}
                    distribution={distribution}
                    onAccept={handleAcceptClick}
                    onDecline={handleDeclineClick}
                    onRequestInfo={handleRequestInfoClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Summary */}
        {!loading && filteredDistributions.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {filteredDistributions.length} of {distributions.length} jobs
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {counts.active} active
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      {selectedDistribution && (
        <>
          <AcceptJobDialog
            isOpen={acceptDialogOpen}
            onClose={() => {
              setAcceptDialogOpen(false);
              setSelectedDistribution(null);
            }}
            onConfirm={handleAcceptJob}
            distribution={selectedDistribution}
          />

          <DeclineJobDialog
            isOpen={declineDialogOpen}
            onClose={() => {
              setDeclineDialogOpen(false);
              setSelectedDistribution(null);
            }}
            onConfirm={handleDeclineJob}
            jobTitle={selectedDistribution.jobTitle}
          />

          <RequestInfoDialog
            isOpen={requestInfoDialogOpen}
            onClose={() => {
              setRequestInfoDialogOpen(false);
              setSelectedDistribution(null);
            }}
            onSend={handleRequestInfo}
            jobTitle={selectedDistribution.jobTitle}
            companyName={selectedDistribution.companyName}
          />
        </>
      )}
    </PageWrapper>
  );
}
