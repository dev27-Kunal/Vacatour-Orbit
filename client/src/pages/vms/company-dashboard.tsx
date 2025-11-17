/**
 * Company Dashboard Page
 *
 * Main dashboard for companies using the VMS system.
 * Features:
 * - Overview of active job distributions
 * - Bureau performance comparison
 * - Total spend and fee breakdown
 * - Job distribution analytics
 * - Quick access to distribute new jobs
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BureauSelectionModal } from '@/components/vms/BureauSelectionModal';
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
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  Award,
  Clock,
  Target,
  BarChart3,
  Building2,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { apiGet, apiPost, ApiError } from '@/lib/api-client';

interface BureauPerformance {
  bureauId: string;
  bureauName: string;
  performanceTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NEW';
  fillRate: number;
  placementsMade: number;
  averageTimeToFill?: number;
  totalFeesSpent: number;
}

interface JobDistribution {
  id: string;
  jobId: string;
  jobTitle: string;
  totalBureaus: number;
  activeBureaus: number;
  candidatesReceived: number;
  placementsMade: number;
  distributedAt: string;
  status: string;
}

interface SpendAnalytics {
  thisMonth: number;
  lastMonth: number;
  thisQuarter: number;
  totalSpentThisYear: number;
  averageFeePerPlacement: number;
  totalPlacements: number;
}

interface Distribution {
  bureauId: string;
  tier: 'EXCLUSIVE' | 'PRIORITY' | 'STANDARD';
  maxCandidates?: number;
  exclusiveUntil?: Date;
  notes?: string;
}

function CompanyDashboard() {
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [topBureaus, setTopBureaus] = useState<BureauPerformance[]>([]);
  const [jobDistributions, setJobDistributions] = useState<JobDistribution[]>([]);
  const [spendAnalytics, setSpendAnalytics] = useState<SpendAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    // Verify user is a company
    if (user && user.userType !== 'BEDRIJF') {
      toast({
        title: 'Access Denied',
        description: 'This page is only accessible to companies',
        variant: 'destructive',
      });
      setLocation('/dashboard');
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bureausResponse, distributionsResponse, spendResponse] = await Promise.all([
        apiGet('/api/vms/bureaus/rankings', { limit: '5' }),
        apiGet('/api/vms/companies/job-distributions'),
        apiGet('/api/vms/companies/spend-analytics'),
      ]);

      setTopBureaus(bureausResponse.data || []);
      setJobDistributions(distributionsResponse.data || []);
      setSpendAnalytics(spendResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to load dashboard data';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async (distributions: Distribution[]) => {
    if (!selectedJobId) {return;}

    try {
      await apiPost(`/api/vms/jobs/${selectedJobId}/distribute`, { distributions });

      toast({
        title: 'Success',
        description: 'Job distributed successfully to selected bureaus',
      });

      // Refresh data
      fetchDashboardData();
      setShowDistributeModal(false);
      setSelectedJobId(null);
    } catch (error) {
      console.error('Distribution failed:', error);
      throw error;
    }
  };

  const tierColors = {
    PLATINUM: 'bg-purple-100 text-purple-800',
    GOLD: 'bg-yellow-100 text-yellow-800',
    SILVER: 'bg-gray-200 text-gray-800',
    BRONZE: 'bg-orange-100 text-orange-800',
    NEW: 'bg-blue-100 text-blue-800',
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('bureauDashboard.loginPrompt')}</p>
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
              <BreadcrumbPage>{t('navigation.companyVMS')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('navigation.companyVMS')}</h1>
            <p className="text-muted-foreground mt-2">{t('companyVms.subtitle')}</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              onClick={() => setLocation('/vms/vendors')}
              variant="outline"
              data-testid="button-vendors"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Leveranciers
            </Button>
            <Button
              onClick={() => setLocation('/vms/analytics-dashboard')}
              variant="outline"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {t('navigation.analytics')}
            </Button>
            <Button
              onClick={() => {
                setSelectedJobId('new');
                setShowDistributeModal(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('companyVms.distributeJob')}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-gray-500">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            {spendAnalytics && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                        <p className="text-2xl font-bold mt-2">
                          {jobDistributions.filter((d) => d.status === 'ACTIVE').length}
                        </p>
                      </div>
                      <Briefcase className="h-8 w-8 text-blue-600 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Active Bureaus
                        </p>
                        <p className="text-2xl font-bold mt-2">{topBureaus.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Placements
                        </p>
                        <p className="text-2xl font-bold mt-2">{spendAnalytics.totalPlacements}</p>
                      </div>
                      <Award className="h-8 w-8 text-green-600 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold mt-2">
                          €{spendAnalytics.thisMonth.toLocaleString()}
                        </p>
                        {spendAnalytics.lastMonth > 0 && (
                          <div
                            className={`flex items-center gap-1 mt-1 text-sm ${
                              spendAnalytics.thisMonth >= spendAnalytics.lastMonth
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            <TrendingUp
                              className={`h-3 w-3 ${spendAnalytics.thisMonth < spendAnalytics.lastMonth ? 'rotate-180' : ''}`}
                            />
                            {(
                              Math.abs(spendAnalytics.thisMonth - spendAnalytics.lastMonth) /
                              spendAnalytics.lastMonth *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        )}
                      </div>
                      <DollarSign className="h-8 w-8 text-emerald-600 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Top Performing Bureaus */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Top Performing Bureaus</CardTitle>
                        <CardDescription>
                          Your best recruitment partners ranked by performance
                        </CardDescription>
                      </div>
                      <Button variant="outline" onClick={() => setLocation('/vms/rankings')}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {topBureaus.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No bureaus available yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {topBureaus.map((bureau, index) => (
                          <div
                            key={bureau.bureauId}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                                #{index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">{bureau.bureauName}</p>
                                  <Badge className={tierColors[bureau.performanceTier]} variant="outline">
                                    {bureau.performanceTier}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {bureau.fillRate.toFixed(1)}% fill rate
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Award className="h-3 w-3" />
                                    {bureau.placementsMade} placements
                                  </span>
                                  {bureau.averageTimeToFill && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {bureau.averageTimeToFill.toFixed(1)} days avg
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                €{bureau.totalFeesSpent.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">total spent</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Spend Analytics */}
              <div className="lg:col-span-1">
                {spendAnalytics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Spend Analytics
                      </CardTitle>
                      <CardDescription>Your recruitment investment overview</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">This Quarter</p>
                        <p className="text-2xl font-bold text-blue-600">
                          €{spendAnalytics.thisQuarter.toLocaleString()}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <p className="text-sm text-gray-600">Year to Date</p>
                        <p className="text-2xl font-bold text-purple-600">
                          €{spendAnalytics.totalSpentThisYear.toLocaleString()}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <p className="text-sm text-gray-600">Average Fee per Placement</p>
                        <p className="text-xl font-bold text-green-600">
                          €{spendAnalytics.averageFeePerPlacement.toLocaleString()}
                        </p>
                      </div>

                      <Separator />

                      <div className="pt-2">
                        <Button variant="outline" className="w-full" onClick={() => setLocation('/analytics')}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Detailed Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Active Job Distributions */}
            <Card>
              <CardHeader>
                <CardTitle>Active Job Distributions</CardTitle>
                <CardDescription>
                  Monitor your jobs distributed to recruitment bureaus
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jobDistributions.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No job distributions yet</p>
                    <Button
                      onClick={() => {
                        setSelectedJobId('new');
                        setShowDistributeModal(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Distribute Your First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobDistributions.map((distribution) => (
                      <div
                        key={distribution.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{distribution.jobTitle}</p>
                            <Badge
                              variant={distribution.status === 'ACTIVE' ? 'default' : 'secondary'}
                            >
                              {distribution.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {distribution.activeBureaus}/{distribution.totalBureaus} bureaus
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {distribution.candidatesReceived} candidates
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {distribution.placementsMade} placements
                            </span>
                            <span className="text-xs text-gray-500">
                              Distributed {new Date(distribution.distributedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/jobs/${distribution.jobId}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Bureau Selection Modal */}
      {showDistributeModal && selectedJobId && (
        <BureauSelectionModal
          open={showDistributeModal}
          onClose={() => {
            setShowDistributeModal(false);
            setSelectedJobId(null);
          }}
          jobId={selectedJobId}
          onDistribute={handleDistribute}
        />
      )}
    </PageWrapper>
  );
}

export default withVMSErrorBoundary(CompanyDashboard, 'Failed to load Company Dashboard. Please try again.');
