/**
 * Bureau Dashboard Page
 *
 * Main dashboard for recruitment bureaus in the VMS system.
 * Features:
 * - Bureau performance metrics overview
 * - List of distributed jobs from companies
 * - Recent fee earnings summary
 * - Quick stats and performance insights
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BureauPerformanceCard } from '@/components/vms/BureauPerformanceCard';
import { DistributedJobsList } from '@/components/vms/DistributedJobsList';
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
  Award,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { apiGet, ApiError } from '@/lib/api-client';

interface PerformanceData {
  performanceTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NEW';
  performanceScore: number;
  fillRate: number;
  acceptanceRate: number;
  responseRate: number;
  averageResponseTime?: number;
  ranking: number;
  jobsReceived: number;
  candidatesSubmitted: number;
  placementsMade: number;
}

interface FeeEarnings {
  thisMonth: number;
  lastMonth: number;
  thisQuarter: number;
  totalPending: number;
  totalPaid: number;
  recentPlacements: Array<{
    id: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    feeAmount: number;
    feeStatus: string;
    placementDate: string;
  }>;
}

interface QuickStat {
  label: string;
  value: string | number;
  change?: number;
  icon: any;
  color: string;
}

function BureauDashboard() {
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [feeEarnings, setFeeEarnings] = useState<FeeEarnings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify user is a bureau
    if (user && user.userType !== 'BUREAU') {
      toast({
        title: t('bureauRankings.accessDeniedTitle'),
        description: t('navigation.bureauPortal'),
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
      const [performanceResponse, feesResponse] = await Promise.all([
        apiGet('/api/vms/bureaus/performance'),
        apiGet('/api/vms/bureaus/fees'),
      ]);

      setPerformance(performanceResponse.data);
      setFeeEarnings(feesResponse.data);
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

  const handleViewJob = (jobId: string, distributionId: string) => {
    setLocation(`/jobs/${jobId}`);
  };

  const handleSubmitCandidate = (jobId: string, distributionId: string) => {
    setLocation(`/jobs/${jobId}/apply?distributionId=${distributionId}`);
  };

  const quickStats: QuickStat[] = performance
    ? [
      {
          label: t('bureauDashboard.quickStats.jobsReceived'),
          value: performance.jobsReceived,
          icon: Briefcase,
          color: 'text-blue-600',
        },
        {
          label: t('bureauDashboard.quickStats.candidatesSubmitted'),
          value: performance.candidatesSubmitted,
          icon: Users,
          color: 'text-purple-600',
        },
        {
          label: t('bureauDashboard.quickStats.placementsMade'),
          value: performance.placementsMade,
          icon: Award,
          color: 'text-green-600',
        },
        {
          label: t('bureauDashboard.quickStats.thisMonthEarnings'),
          value: feeEarnings ? `€${feeEarnings.thisMonth.toLocaleString()}` : '€0',
          change: feeEarnings?.lastMonth
            ? ((feeEarnings.thisMonth - feeEarnings.lastMonth) / feeEarnings.lastMonth) * 100
            : undefined,
          icon: DollarSign,
          color: 'text-emerald-600',
        },
      ]
    : [];

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Please log in to view your dashboard</p>
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
              <BreadcrumbPage>{t('navigation.bureauVMS')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('navigation.bureauDashboard')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('bureauDashboard.welcome', { name: user.name })}
            </p>
          </div>
          <Button onClick={() => setLocation('/vms/rankings')} className="mt-4 md:mt-0">
            {t('bureauDashboard.viewRankings')}
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-gray-500">{t('bureauDashboard.loading')}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold mt-2">{stat.value}</p>
                          {stat.change !== undefined && (
                            <div
                              className={`flex items-center gap-1 mt-1 text-sm ${
                                stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              <TrendingUp
                                className={`h-3 w-3 ${stat.change < 0 ? 'rotate-180' : ''}`}
                              />
          {t('bureauDashboard.quickStats.vsLastMonth', { percent: Math.abs(stat.change).toFixed(1) })}
                            </div>
                          )}
                        </div>
                        <div className={`${stat.color} opacity-80`}>
                          <Icon className="h-8 w-8" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Performance Card */}
            {performance && (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <BureauPerformanceCard performance={performance} />
                </div>

                {/* Performance Insights */}
                <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                      <CardTitle>{t('bureauDashboard.insights.title')}</CardTitle>
                      <CardDescription>
                        {t('bureauDashboard.insights.description')}
                      </CardDescription>
                      </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Fill Rate Insight */}
                      {performance.fillRate < 50 && (
                        <div className="flex gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-900">{t('bureauDashboard.insights.improveFillRate')}</p>
                            <p className="text-sm text-amber-700 mt-1">
                              {t('bureauDashboard.insights.improveFillRateDesc', { percent: performance.fillRate.toFixed(1) })}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Acceptance Rate Insight */}
                      {performance.acceptanceRate < 60 && (
                        <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900">{t('bureauDashboard.insights.enhanceQuality')}</p>
                            <p className="text-sm text-blue-700 mt-1">
                              {t('bureauDashboard.insights.enhanceQualityDesc', { percent: performance.acceptanceRate.toFixed(1) })}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Response Time Insight */}
                      {performance.averageResponseTime && performance.averageResponseTime > 24 && (
                        <div className="flex gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-purple-900">{t('bureauDashboard.insights.speedUp')}</p>
                            <p className="text-sm text-purple-700 mt-1">
                              {t('bureauDashboard.insights.speedUpDesc', { hours: performance.averageResponseTime.toFixed(1) })}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Success Message */}
                      {performance.fillRate >= 50 &&
                        performance.acceptanceRate >= 60 &&
                        (!performance.averageResponseTime ||
                          performance.averageResponseTime <= 24) && (
                          <div className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                            <Award className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-green-900">{t('bureauDashboard.insights.excellentTitle')}</p>
                              <p className="text-sm text-green-700 mt-1">{t('bureauDashboard.insights.excellentDesc')}</p>
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <Separator className="my-8" />

            {/* Recent Fee Earnings */}
            {feeEarnings && feeEarnings.recentPlacements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Fee Earnings</CardTitle>
                  <CardDescription>Your latest placements and fee status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feeEarnings.recentPlacements.slice(0, 5).map((placement) => (
                      <div
                        key={placement.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{placement.candidateName}</p>
                          <p className="text-sm text-gray-600">
                            {placement.jobTitle} at {placement.companyName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Placed on {new Date(placement.placementDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            €{placement.feeAmount.toLocaleString()}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              placement.feeStatus === 'PAID'
                                ? 'bg-green-100 text-green-800'
                                : placement.feeStatus === 'INVOICED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {placement.feeStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Pending Invoices</p>
                      <p className="text-2xl font-bold text-amber-600">
                        €{feeEarnings.totalPending.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Paid This Quarter</p>
                      <p className="text-2xl font-bold text-green-600">
                        €{feeEarnings.totalPaid.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator className="my-8" />

            {/* Distributed Jobs List */}
            <DistributedJobsList
              onViewJob={handleViewJob}
              onSubmitCandidate={handleSubmitCandidate}
            />
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default withVMSErrorBoundary(BureauDashboard, 'Failed to load Bureau Dashboard. Please try again.');
