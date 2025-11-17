/**
 * Bureau Portal - Enhanced Dashboard
 *
 * Enhanced version of the bureau dashboard with additional analytics and insights.
 * This page supplements /vms/bureau-dashboard with more detailed performance data.
 *
 * Features:
 * - Enhanced performance overview with trend charts
 * - Real-time metrics and KPIs
 * - Quick actions and shortcuts
 * - Performance recommendations
 * - Compliance status widget
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  TrendingDown,
  AlertCircle,
  ArrowUpRight,
  Target,
  Clock,
  FileText,
  BarChart3,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { apiGet, ApiError } from '@/lib/api-client';

interface DashboardMetrics {
  // Today's Stats
  todayJobsReceived: number;
  todaySubmissions: number;
  todayResponses: number;

  // Week Stats
  weekJobsReceived: number;
  weekSubmissions: number;
  weekPlacements: number;

  // Month Stats
  monthEarnings: number;
  monthEarningsChange: number;
  monthFillRate: number;
  monthFillRateChange: number;

  // Performance
  currentRanking: number;
  rankingChange: number;
  performanceScore: number;
  performanceTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NEW';

  // Active Stats
  activeJobs: number;
  pendingSubmissions: number;
  upcomingDeadlines: number;
}

interface QuickAction {
  label: string;
  description: string;
  icon: any;
  href: string;
  color: string;
}

function BureauPortalIndex() {
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
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
      fetchDashboardMetrics();
    }
  }, [user]);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ data: DashboardMetrics }>('/api/vms/bureaus/dashboard-metrics');
      setMetrics(data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Failed to load dashboard metrics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      label: 'Available Jobs',
      description: 'Browse jobs matching your expertise',
      icon: Briefcase,
      href: '/bureau-portal/jobs',
      color: 'text-blue-600',
    },
    {
      label: 'Submit Candidate',
      description: 'Quick candidate submission',
      icon: Users,
      href: '/bureau-portal/submit-candidate',
      color: 'text-green-600',
    },
    {
      label: 'Performance Analytics',
      description: 'Detailed performance insights',
      icon: BarChart3,
      href: '/bureau-portal/performance',
      color: 'text-purple-600',
    },
    {
      label: 'My Contracts',
      description: 'View active contracts and rates',
      icon: FileText,
      href: '/bureau-portal/contracts',
      color: 'text-orange-600',
    },
  ];

  const tierColors = {
    PLATINUM: 'bg-purple-100 text-purple-800 border-purple-300',
    GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    SILVER: 'bg-gray-100 text-gray-800 border-gray-300',
    BRONZE: 'bg-orange-100 text-orange-800 border-orange-300',
    NEW: 'bg-blue-100 text-blue-800 border-blue-300',
  };

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
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('navigation.bureauPortal')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('navigation.bureauPortal')}</h1>
            <p className="text-muted-foreground mt-2">
              Enhanced dashboard with real-time analytics and insights
            </p>
          </div>
          {metrics && (
            <Badge className={`mt-4 md:mt-0 ${tierColors[metrics.performanceTier]}`}>
              {metrics.performanceTier} Tier
            </Badge>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-gray-500">Loading your dashboard...</p>
            </div>
          </div>
        ) : metrics ? (
          <>
            {/* Real-time Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Today's Jobs */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today</p>
                      <p className="text-2xl font-bold mt-2">{metrics.todayJobsReceived}</p>
                      <p className="text-xs text-gray-500 mt-1">New Jobs</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-blue-600 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              {/* Today's Submissions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today</p>
                      <p className="text-2xl font-bold mt-2">{metrics.todaySubmissions}</p>
                      <p className="text-xs text-gray-500 mt-1">Submissions</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              {/* Current Ranking */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ranking</p>
                      <p className="text-2xl font-bold mt-2">#{metrics.currentRanking}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {metrics.rankingChange !== 0 && (
                          <>
                            {metrics.rankingChange > 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span
                              className={`text-xs ${
                                metrics.rankingChange > 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {Math.abs(metrics.rankingChange)} spots
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Award className="h-8 w-8 text-purple-600 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              {/* Month Earnings */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold mt-2">
                        €{metrics.monthEarnings.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {metrics.monthEarningsChange !== 0 && (
                          <>
                            <TrendingUp
                              className={`h-3 w-3 ${
                                metrics.monthEarningsChange >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600 rotate-180'
                              }`}
                            />
                            <span
                              className={`text-xs ${
                                metrics.monthEarningsChange >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {Math.abs(metrics.monthEarningsChange).toFixed(1)}% vs last month
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-600 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Overview */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Performance Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Performance Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{metrics.performanceScore.toFixed(1)}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${metrics.performanceScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Based on fill rate, response time, and quality metrics
                  </p>
                </CardContent>
              </Card>

              {/* Active Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Active Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Jobs</span>
                      <span className="font-bold">{metrics.activeJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending Submissions</span>
                      <span className="font-bold">{metrics.pendingSubmissions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Upcoming Deadlines</span>
                      <span className="font-bold text-orange-600">
                        {metrics.upcomingDeadlines}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Jobs Received</span>
                      <span className="font-bold">{metrics.weekJobsReceived}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Submissions</span>
                      <span className="font-bold">{metrics.weekSubmissions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Placements</span>
                      <span className="font-bold text-green-600">{metrics.weekPlacements}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-8" />

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Quick Actions</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Card
                      key={index}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setLocation(action.href)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`${action.color} opacity-80`}>
                            <Icon className="h-10 w-10" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{action.label}</h3>
                            <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No metrics available</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default withVMSErrorBoundary(
  BureauPortalIndex,
  'Failed to load Bureau Portal. Please try again.'
);
