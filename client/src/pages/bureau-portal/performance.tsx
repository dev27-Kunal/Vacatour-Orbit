/**
 * Bureau Portal - Performance Analytics
 *
 * Detailed performance analytics and insights for bureaus.
 * Goes beyond the basic dashboard metrics with trends and historical data.
 *
 * Features:
 * - Historical performance trends
 * - Detailed metrics breakdown
 * - Comparative analysis
 * - Performance improvement recommendations
 * - Downloadable reports
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Users,
  Clock,
  DollarSign,
  Download,
  AlertCircle,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { apiGet, ApiError } from '@/lib/api-client';
import { useTranslation } from 'react-i18next';

interface PerformanceData {
  // Current Period
  performanceScore: number;
  performanceTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NEW';
  ranking: number;
  rankingChange: number;

  // Volume Metrics
  jobsReceived: number;
  candidatesSubmitted: number;
  placementsMade: number;

  // Quality Metrics
  fillRate: number;
  fillRateChange: number;
  acceptanceRate: number;
  acceptanceRateChange: number;
  responseRate: number;
  responseRateChange: number;

  // Speed Metrics
  averageTimeToSubmit: number;
  averageTimeToFill: number;
  averageResponseTime: number;

  // Financial
  totalEarnings: number;
  earningsChange: number;
  averageFeePerPlacement: number;
}

interface HistoricalData {
  period: string;
  performanceScore: number;
  placements: number;
  earnings: number;
  fillRate: number;
}

interface Recommendation {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  icon: any;
}

function BureauPortalPerformance() {
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('30'); // days

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
      fetchPerformanceData();
    }
  }, [user, period]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const [currentData, historicalData] = await Promise.all([
        apiGet<{ data: PerformanceData }>(`/api/vms/bureaus/performance?period=${period}`),
        apiGet<{ data: HistoricalData[] }>(`/api/vms/bureaus/performance-history?period=${period}`),
      ]);

      setPerformance(currentData.data);
      setHistoricalData(historicalData.data || []);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Failed to load performance analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const blob = await apiGet<Blob>(`/api/vms/bureaus/performance-report?period=${period}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${period}days.pdf`;
      a.click();

      toast({
        title: 'Success',
        description: 'Performance report downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Failed to download report',
        variant: 'destructive',
      });
    }
  };

  const getRecommendations = (): Recommendation[] => {
    if (!performance) {return [];}

    const recommendations: Recommendation[] = [];

    if (performance.fillRate < 50) {
      recommendations.push({
        title: 'Improve Fill Rate',
        description:
          'Your fill rate is below 50%. Focus on submitting more qualified candidates that match job requirements closely.',
        priority: 'HIGH',
        impact: 'High - Directly affects performance tier',
        icon: Target,
      });
    }

    if (performance.acceptanceRate < 60) {
      recommendations.push({
        title: 'Enhance Candidate Quality',
        description:
          'Improve candidate acceptance rate by better screening and matching candidates to job requirements.',
        priority: 'HIGH',
        impact: 'High - Improves reputation and ranking',
        icon: Award,
      });
    }

    if (performance.averageResponseTime > 24) {
      recommendations.push({
        title: 'Faster Response Time',
        description:
          'Reduce your response time to under 24 hours. Quick responses lead to better rankings and more opportunities.',
        priority: 'MEDIUM',
        impact: 'Medium - Affects distribution tier',
        icon: Clock,
      });
    }

    if (performance.responseRate < 80) {
      recommendations.push({
        title: 'Increase Response Rate',
        description:
          'Respond to more job distributions. Higher response rates show commitment and improve your standing.',
        priority: 'MEDIUM',
        impact: 'Medium - Shows reliability',
        icon: Users,
      });
    }

    return recommendations;
  };

  const tierColors = {
    PLATINUM: 'bg-purple-100 text-purple-800 border-purple-300',
    GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    SILVER: 'bg-gray-100 text-gray-800 border-gray-300',
    BRONZE: 'bg-orange-100 text-orange-800 border-orange-300',
    NEW: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const priorityColors = {
    HIGH: 'bg-red-50 border-red-200 text-red-800',
    MEDIUM: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    LOW: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Please log in to view performance analytics</p>
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
              <BreadcrumbPage>{t('navigation.performanceAnalytics')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('navigation.performanceAnalytics')}</h1>
            <p className="text-muted-foreground mt-2">
              Detailed insights into your bureau's performance
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleDownloadReport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-gray-500">Loading analytics...</p>
            </div>
          </div>
        ) : performance ? (
          <>
            {/* Performance Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Performance Score */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Performance Score
                      </p>
                      <p className="text-3xl font-bold mt-2">
                        {performance.performanceScore.toFixed(1)}
                      </p>
                      <Badge className={`mt-2 ${tierColors[performance.performanceTier]}`}>
                        {performance.performanceTier}
                      </Badge>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              {/* Ranking */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Ranking</p>
                      <p className="text-3xl font-bold mt-2">#{performance.ranking}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {performance.rankingChange !== 0 && (
                          <>
                            {performance.rankingChange > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span
                              className={`text-sm ${
                                performance.rankingChange > 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {Math.abs(performance.rankingChange)} spots
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Award className="h-8 w-8 text-yellow-600 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              {/* Placements */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Placements Made</p>
                      <p className="text-3xl font-bold mt-2">{performance.placementsMade}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {performance.candidatesSubmitted} submitted
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-600 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              {/* Earnings */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                      <p className="text-3xl font-bold mt-2">
                        €{performance.totalEarnings.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {performance.earningsChange !== 0 && (
                          <>
                            <TrendingUp
                              className={`h-4 w-4 ${
                                performance.earningsChange >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600 rotate-180'
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                performance.earningsChange >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {Math.abs(performance.earningsChange).toFixed(1)}%
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

            {/* Detailed Metrics */}
            <Tabs defaultValue="quality" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
                <TabsTrigger value="speed">Speed Metrics</TabsTrigger>
                <TabsTrigger value="volume">Volume Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="quality" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Fill Rate */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Fill Rate</CardTitle>
                      <CardDescription>Jobs successfully filled</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{performance.fillRate.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${performance.fillRate}%` }}
                        />
                      </div>
                      {performance.fillRateChange !== 0 && (
                        <p
                          className={`text-sm mt-2 ${
                            performance.fillRateChange >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {performance.fillRateChange >= 0 ? '+' : ''}
                          {performance.fillRateChange.toFixed(1)}% from previous period
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Acceptance Rate */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Acceptance Rate</CardTitle>
                      <CardDescription>Candidates accepted by clients</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {performance.acceptanceRate.toFixed(1)}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${performance.acceptanceRate}%` }}
                        />
                      </div>
                      {performance.acceptanceRateChange !== 0 && (
                        <p
                          className={`text-sm mt-2 ${
                            performance.acceptanceRateChange >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {performance.acceptanceRateChange >= 0 ? '+' : ''}
                          {performance.acceptanceRateChange.toFixed(1)}% from previous period
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Response Rate */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Response Rate</CardTitle>
                      <CardDescription>Jobs responded to</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {performance.responseRate.toFixed(1)}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${performance.responseRate}%` }}
                        />
                      </div>
                      {performance.responseRateChange !== 0 && (
                        <p
                          className={`text-sm mt-2 ${
                            performance.responseRateChange >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {performance.responseRateChange >= 0 ? '+' : ''}
                          {performance.responseRateChange.toFixed(1)}% from previous period
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="speed" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Time to Submit */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Avg. Time to Submit</CardTitle>
                      <CardDescription>Time to first candidate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {performance.averageTimeToSubmit.toFixed(1)}
                        <span className="text-lg text-gray-500 ml-1">hrs</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Target: Under 24 hours</p>
                    </CardContent>
                  </Card>

                  {/* Time to Fill */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Avg. Time to Fill</CardTitle>
                      <CardDescription>Days to successful placement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {performance.averageTimeToFill.toFixed(1)}
                        <span className="text-lg text-gray-500 ml-1">days</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Target: Under 14 days</p>
                    </CardContent>
                  </Card>

                  {/* Response Time */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Avg. Response Time</CardTitle>
                      <CardDescription>Time to acknowledge job</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {performance.averageResponseTime.toFixed(1)}
                        <span className="text-lg text-gray-500 ml-1">hrs</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Target: Under 12 hours</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="volume" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Jobs Received */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Jobs Received</CardTitle>
                      <CardDescription>Total opportunities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{performance.jobsReceived}</div>
                      <p className="text-sm text-gray-500 mt-2">In selected period</p>
                    </CardContent>
                  </Card>

                  {/* Candidates Submitted */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Candidates Submitted</CardTitle>
                      <CardDescription>Total submissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{performance.candidatesSubmitted}</div>
                      <p className="text-sm text-gray-500 mt-2">
                        {(performance.candidatesSubmitted / performance.jobsReceived).toFixed(1)}{' '}
                        per job
                      </p>
                    </CardContent>
                  </Card>

                  {/* Placements Made */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Successful Placements</CardTitle>
                      <CardDescription>Conversion rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{performance.placementsMade}</div>
                      <p className="text-sm text-gray-500 mt-2">
                        {((performance.placementsMade / performance.candidatesSubmitted) * 100).toFixed(1)}%
                        conversion
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Recommendations */}
            {getRecommendations().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Performance Recommendations
                  </CardTitle>
                  <CardDescription>
                    Actionable insights to improve your bureau performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getRecommendations().map((rec, idx) => {
                      const Icon = rec.icon;
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border ${priorityColors[rec.priority]}`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{rec.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {rec.priority}
                                </Badge>
                              </div>
                              <p className="text-sm mt-1">{rec.description}</p>
                              <p className="text-xs mt-2 opacity-80">Impact: {rec.impact}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No performance data available</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default withVMSErrorBoundary(
  BureauPortalPerformance,
  'Failed to load performance analytics. Please try again.'
);
