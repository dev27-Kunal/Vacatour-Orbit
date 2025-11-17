/**
 * VMS Analytics Dashboard Page
 *
 * Comprehensive analytics visualization dashboard for VMS data.
 * Features:
 * - Bureau performance comparison with bar charts
 * - Spend analysis with trend lines and date range filtering
 * - ROI rankings with sortable tables
 * - Market benchmarking comparisons
 * - Demand forecasting with historical + predicted data
 * - Diversity metrics visualization
 * - Export functionality for all data
 */

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { apiGet, apiPost, ApiError } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Download,
  AlertCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  Users,
  Target,
  Award,
  BarChart3,
  Activity,
  PieChart,
  Trophy,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface BureauComparisonData {
  bureauId: string;
  bureauName: string;
  jobsDistributed: number;
  activeApplications: number;
  placementsMade: number;
  fillRatePercentage: number;
  avgTimeToFillDays: number;
  avgResponseTimeHours: number;
  totalSpendEur: number;
  currentPerformanceTier: string;
  currentPerformanceScore: number;
}

interface SpendAnalysisData {
  periodStart: string;
  periodEnd: string;
  totalSpend: number;
  spendByBureau: Array<{
    bureauId: string;
    bureauName: string;
    totalSpend: number;
    placementCount: number;
    avgCostPerPlacement: number;
  }>;
  spendTrend: Array<{
    date: string;
    amount: number;
    cumulativeAmount: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

interface ROIAnalysisData {
  bureauId: string;
  bureauName: string;
  totalRevenue: number;
  totalCost: number;
  roi: number;
  roiPercentage: number;
  placementCount: number;
  avgRevenuePerPlacement: number;
  avgCostPerPlacement: number;
  timeToValueDays: number;
}

interface MarketBenchmarkData {
  category: string;
  location: string;
  marketMedianRate: number;
  marketP25Rate: number;
  marketP75Rate: number;
  marketP90Rate: number;
  yourAverageRate: number;
  comparisonStatus: 'BELOW' | 'WITHIN' | 'ABOVE';
  sampleSize: number;
}

interface ForecastData {
  period: string;
  actualDemand?: number;
  predictedDemand: number;
  confidenceLower: number;
  confidenceUpper: number;
  isHistorical: boolean;
}

interface DiversityMetrics {
  bureauId: string;
  bureauName: string;
  genderDiversity: number;
  ethnicDiversity: number;
  ageDiversity: number;
  overallDiversityScore: number;
  placementCount: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnalyticsDashboardPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedBureauFilter, setSelectedBureauFilter] = useState<string>('all');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Bureau Comparison Data
  const {
    data: bureauComparison = [],
    isLoading: bureauLoading,
    error: bureauError,
    refetch: refetchBureau,
  } = useQuery<BureauComparisonData[]>({
    queryKey: ['vms-analytics-bureau-comparison', selectedTierFilter],
    queryFn: async () => {
      const params = selectedTierFilter !== 'all' ? { performanceTiers: selectedTierFilter } : {};
      const response = await apiGet('/api/vms/analytics/bureau-comparison', params);
      return response.data || [];
    },
  });

  // Spend Analysis Data
  const {
    data: spendAnalysis,
    isLoading: spendLoading,
    error: spendError,
    refetch: refetchSpend,
  } = useQuery<SpendAnalysisData>({
    queryKey: ['vms-analytics-spend-analysis', dateRange],
    queryFn: async () => {
      const response = await apiGet('/api/vms/analytics/spend-analysis', {
        startDate: dateRange.start,
        endDate: dateRange.end,
      });
      return response.data;
    },
  });

  // ROI Analysis Data
  const {
    data: roiAnalysis = [],
    isLoading: roiLoading,
    error: roiError,
    refetch: refetchROI,
  } = useQuery<ROIAnalysisData[]>({
    queryKey: ['vms-analytics-roi-analysis'],
    queryFn: async () => {
      const response = await apiGet('/api/vms/analytics/roi-analysis');
      return response.data || [];
    },
  });

  // Market Benchmarking Data
  const {
    data: marketBenchmarks = [],
    isLoading: benchmarkLoading,
    error: benchmarkError,
    refetch: refetchBenchmark,
  } = useQuery<MarketBenchmarkData[]>({
    queryKey: ['vms-analytics-market-benchmarks'],
    queryFn: async () => {
      const response = await apiGet('/api/vms/analytics/market-benchmarks');
      return response.data || [];
    },
  });

  // Forecasting Data
  const {
    data: forecasts = [],
    isLoading: forecastLoading,
    error: forecastError,
    refetch: refetchForecast,
  } = useQuery<ForecastData[]>({
    queryKey: ['vms-analytics-forecasts'],
    queryFn: async () => {
      const response = await apiGet('/api/vms/analytics/forecasts/default');
      return response.data?.predictions || [];
    },
  });

  // Diversity Metrics Data
  const {
    data: diversityMetrics = [],
    isLoading: diversityLoading,
    error: diversityError,
    refetch: refetchDiversity,
  } = useQuery<DiversityMetrics[]>({
    queryKey: ['vms-analytics-diversity-overall'],
    queryFn: async () => {
      const response = await apiGet('/api/vms/analytics/diversity-overall');
      return response.data || [];
    },
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const handleExport = async () => {
    try {
      toast({
        title: t('vmsAnalytics.exportingTitle'),
        description: t('vmsAnalytics.exportingDesc'),
      });

      // Blob download: keep fetch but add credentials
      const response = await fetch('/api/vms/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          dateRange,
          includeCharts: true,
          format: 'excel',
        }),
      });

      if (!response.ok) {throw new Error('Export failed');}

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vms-analytics-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: t('vmsAnalytics.exportSuccessTitle'),
        description: t('vmsAnalytics.exportSuccessDesc'),
      });
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : t('vmsAnalytics.exportFailedDesc');
      toast({
        title: t('vmsAnalytics.exportFailedTitle'),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getPerformanceTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM':
        return '#9333ea';
      case 'GOLD':
        return '#eab308';
      case 'SILVER':
        return '#94a3b8';
      case 'BRONZE':
        return '#c2410c';
      default:
        return '#64748b';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const refetchAll = () => {
    refetchBureau();
    refetchSpend();
    refetchROI();
    refetchBenchmark();
    refetchForecast();
    refetchDiversity();
    toast({
      title: t('vmsAnalytics.refreshingTitle'),
      description: t('vmsAnalytics.refreshingDesc'),
    });
  };

  // Aggregate error state
  const hasError =
    bureauError || spendError || roiError || benchmarkError || forecastError || diversityError;
  const isLoading =
    bureauLoading ||
    spendLoading ||
    roiLoading ||
    benchmarkLoading ||
    forecastLoading ||
    diversityLoading;

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  if (hasError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('vmsAnalytics.errors.loadErrorTitle')}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {(bureauError as Error)?.message || (spendError as Error)?.message || t('vmsAnalytics.errors.generic')}
            </span>
            <Button onClick={refetchAll} variant="outline" size="sm" className="ml-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('vmsAnalytics.errors.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">{t('navigation.dashboard')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/vms/company">{t('navigation.companyVMS')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('navigation.analytics')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('vmsAnalytics.headerTitle')}</h1>
          <p className="text-muted-foreground">{t('vmsAnalytics.headerSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetchAll} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('vmsAnalytics.actions.refresh')}
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t('vmsAnalytics.actions.export')}
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('vmsAnalytics.filters.title')}
          </CardTitle>
          <CardDescription>{t('vmsAnalytics.filters.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('vmsAnalytics.filters.startDate')}</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('vmsAnalytics.filters.endDate')}</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Performance Tier Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('vmsAnalytics.filters.performanceTier')}</label>
              <Select value={selectedTierFilter} onValueChange={setSelectedTierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('vmsAnalytics.filters.allTiers')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('vmsAnalytics.filters.allTiers')}</SelectItem>
                  <SelectItem value="PLATINUM">{t('vmsAnalytics.filters.tier.platinum')}</SelectItem>
                  <SelectItem value="GOLD">{t('vmsAnalytics.filters.tier.gold')}</SelectItem>
                  <SelectItem value="SILVER">{t('vmsAnalytics.filters.tier.silver')}</SelectItem>
                  <SelectItem value="BRONZE">{t('vmsAnalytics.filters.tier.bronze')}</SelectItem>
                  <SelectItem value="NEW">{t('vmsAnalytics.filters.tier.new')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Different Analytics Views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">{t('vmsAnalytics.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="bureaus">{t('vmsAnalytics.tabs.bureaus')}</TabsTrigger>
          <TabsTrigger value="spend">{t('vmsAnalytics.tabs.spend')}</TabsTrigger>
          <TabsTrigger value="roi">{t('vmsAnalytics.tabs.roi')}</TabsTrigger>
          <TabsTrigger value="benchmarking">{t('vmsAnalytics.tabs.benchmarking')}</TabsTrigger>
          <TabsTrigger value="forecasting">{t('vmsAnalytics.tabs.forecasting')}</TabsTrigger>
          <TabsTrigger value="diversity">Diversity</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('vmsAnalytics.overview.totalSpend')}</p>
                    <p className="text-2xl font-bold mt-2">
                      {spendAnalysis ? formatCurrency(spendAnalysis.totalSpend) : '€0'}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('vmsAnalytics.overview.activeBureaus')}</p>
                    <p className="text-2xl font-bold mt-2">{bureauComparison.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('vmsAnalytics.overview.totalPlacements')}</p>
                    <p className="text-2xl font-bold mt-2">
                      {bureauComparison.reduce((sum, b) => sum + b.placementsMade, 0)}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('vmsAnalytics.overview.avgFillRate')}</p>
                    <p className="text-2xl font-bold mt-2">
                      {bureauComparison.length > 0
                        ? (
                            bureauComparison.reduce((sum, b) => sum + b.fillRatePercentage, 0) /
                            bureauComparison.length
                          ).toFixed(1)
                        : '0'}
                      %
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-amber-600 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Bureaus */}
            <Card>
                  <CardHeader>
                <CardTitle>{t('vmsAnalytics.overview.top5Title')}</CardTitle>
                <CardDescription>{t('vmsAnalytics.overview.top5Desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : bureauComparison.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">{t('vmsAnalytics.bureaus.noDataTitle')}</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[...bureauComparison]
                        .sort((a, b) => b.currentPerformanceScore - a.currentPerformanceScore)
                        .slice(0, 5)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bureauName" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="currentPerformanceScore" name="Performance Score">
                        {[...bureauComparison]
                          .sort((a, b) => b.currentPerformanceScore - a.currentPerformanceScore)
                          .slice(0, 5)
                          .map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getPerformanceTierColor(entry.currentPerformanceTier)}
                            />
                          ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Spend Trend */}
            <Card>
              <CardHeader>
                <CardTitle>{t('vmsAnalytics.spend.spendingOverTime')}</CardTitle>
                <CardDescription>{t('vmsAnalytics.spend.spendingOverTime')}</CardDescription>
              </CardHeader>
              <CardContent>
                {spendLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : !spendAnalysis || spendAnalysis.spendTrend.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">{t('vmsAnalytics.spend.noDataTitle')}</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={spendAnalysis.spendTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('nl-NL')}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          new Intl.NumberFormat('nl-NL', {
                            notation: 'compact',
                            compactDisplay: 'short',
                          }).format(value)
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(date) => new Date(date).toLocaleDateString('nl-NL')}
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulativeAmount"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Cumulative Spend"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* BUREAU COMPARISON TAB */}
        <TabsContent value="bureaus" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('vmsAnalytics.bureaus.title')}
              </CardTitle>
              <CardDescription>
                {t('vmsAnalytics.bureaus.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bureauLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : bureauComparison.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('vmsAnalytics.bureaus.noDataTitle')}</h3>
                  <p className="text-sm text-muted-foreground">{t('vmsAnalytics.bureaus.noDataDesc')}</p>
                </div>
              ) : (
                <>
                  {/* Fill Rate Comparison */}
                  <div className="mb-8">
                    <h4 className="font-semibold mb-4">{t('vmsAnalytics.bureaus.fillRateTitle')}</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bureauComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="bureauName" angle={-45} textAnchor="end" height={80} />
                        <YAxis label={{ value: t('vmsAnalytics.bureaus.yAxisFillRate'), angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                        <Legend />
                        <Bar dataKey="fillRatePercentage" fill="#3b82f6" name={t('vmsAnalytics.bureaus.barFillRate')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Response Time Comparison */}
                  <div className="mb-8">
                    <h4 className="font-semibold mb-4">{t('vmsAnalytics.bureaus.responseTimeTitle')}</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bureauComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="bureauName" angle={-45} textAnchor="end" height={80} />
                        <YAxis label={{ value: t('vmsAnalytics.bureaus.yAxisHours'), angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)} ${t('vmsAnalytics.bureaus.yAxisHours').toLowerCase()}`} />
                        <Legend />
                        <Bar dataKey="avgResponseTimeHours" fill="#8b5cf6" name={t('vmsAnalytics.bureaus.barResponseTime')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bureau Details Table */}
                  <div className="mt-8">
                    <h4 className="font-semibold mb-4">{t('vmsAnalytics.bureaus.detailedTitle')}</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.bureaus.headers.bureau')}</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.bureaus.headers.tier')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.bureaus.headers.jobs')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.bureaus.headers.placements')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.bureaus.headers.fillRate')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.bureaus.headers.totalSpend')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.bureaus.headers.score')}</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {bureauComparison.map((bureau) => (
                              <tr key={bureau.bureauId} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="font-medium">{bureau.bureauName}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <Badge
                                    variant="outline"
                                    style={{
                                      borderColor: getPerformanceTierColor(
                                        bureau.currentPerformanceTier
                                      ),
                                      color: getPerformanceTierColor(bureau.currentPerformanceTier),
                                    }}
                                  >
                                    {bureau.currentPerformanceTier}
                                  </Badge>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right">
                                  {bureau.jobsDistributed}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right">
                                  {bureau.placementsMade}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right">
                                  {bureau.fillRatePercentage.toFixed(1)}%
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right">
                                  {formatCurrency(bureau.totalSpendEur)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right font-semibold">
                                  {bureau.currentPerformanceScore.toFixed(0)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SPEND ANALYSIS TAB */}
        <TabsContent value="spend" className="space-y-6 mt-6">
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {t('vmsAnalytics.tabs.spend')}
                </CardTitle>
                <CardDescription>
                  {t('vmsAnalytics.spend.spendingOverTime')}
                </CardDescription>
              </CardHeader>
            <CardContent>
              {spendLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : !spendAnalysis ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('vmsAnalytics.spend.noDataTitle')}</h3>
                  <p className="text-sm text-muted-foreground">{t('vmsAnalytics.spend.noDataDesc')}</p>
                </div>
              ) : (
                <>
                  {/* Total Spend Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">{t('vmsAnalytics.spend.totalSpend')}</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                          {formatCurrency(spendAnalysis.totalSpend)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">{t('vmsAnalytics.spend.activeBureaus')}</p>
                        <p className="text-3xl font-bold mt-2">
                          {spendAnalysis.spendByBureau.length}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">{t('vmsAnalytics.spend.avgCostPerPlacement')}</p>
                        <p className="text-3xl font-bold mt-2">
                          {spendAnalysis.spendByBureau.length > 0
                            ? formatCurrency(
                                spendAnalysis.spendByBureau.reduce(
                                  (sum, b) => sum + b.avgCostPerPlacement,
                                  0
                                ) / spendAnalysis.spendByBureau.length
                              )
                            : '€0'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Spend Trend Chart */}
                  <div className="mb-8">
                    <h4 className="font-semibold mb-4">{t('vmsAnalytics.spend.spendingOverTime')}</h4>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={spendAnalysis.spendTrend}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => new Date(date).toLocaleDateString('nl-NL')}
                        />
                        <YAxis
                          tickFormatter={(value) =>
                            new Intl.NumberFormat('nl-NL', {
                              notation: 'compact',
                              compactDisplay: 'short',
                            }).format(value)
                          }
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(date) => new Date(date).toLocaleDateString('nl-NL')}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#colorAmount)"
                          name="Daily Spend"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Spend by Bureau */}
                  <div>
                    <h4 className="font-semibold mb-4">Spend by Bureau</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Bureau
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Total Spend
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Placements
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Avg Cost/Placement
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                % of Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {spendAnalysis.spendByBureau
                              .sort((a, b) => b.totalSpend - a.totalSpend)
                              .map((bureau) => (
                                <tr key={bureau.bureauId} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="font-medium">{bureau.bureauName}</div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right font-semibold">
                                    {formatCurrency(bureau.totalSpend)}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    {bureau.placementCount}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    {formatCurrency(bureau.avgCostPerPlacement)}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    {((bureau.totalSpend / spendAnalysis.totalSpend) * 100).toFixed(
                                      1
                                    )}
                                    %
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROI RANKINGS TAB */}
        <TabsContent value="roi" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('vmsAnalytics.tabs.roi')}
              </CardTitle>
              <CardDescription>{t('vmsAnalytics.tabs.roi')}</CardDescription>
            </CardHeader>
            <CardContent>
              {roiLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : roiAnalysis.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Target className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('vmsAnalytics.roi.noDataTitle')}</h3>
                  <p className="text-sm text-muted-foreground">{t('vmsAnalytics.roi.noDataDesc')}</p>
                </div>
              ) : (
                <>
                  {/* ROI Comparison Chart */}
                  <div className="mb-8">
                    <h4 className="font-semibold mb-4">{t('vmsAnalytics.tabs.roi')}</h4>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={[...roiAnalysis].sort((a, b) => b.roiPercentage - a.roiPercentage)}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="bureauName" angle={-45} textAnchor="end" height={80} />
                        <YAxis label={{ value: t('vmsAnalytics.tabs.roi') + ' %', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                        <Legend />
                        <Bar dataKey="roiPercentage" name={t('vmsAnalytics.tabs.roi') + ' %'}>
                          {[...roiAnalysis]
                            .sort((a, b) => b.roiPercentage - a.roiPercentage)
                            .map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.roiPercentage >= 0 ? '#10b981' : '#ef4444'}
                              />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* ROI Rankings Table */}
                  <div>
                    <h4 className="font-semibold mb-4">{t('vmsAnalytics.roi.detailedTitle')}</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.roi.headers.rank')}</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.bureaus.headers.bureau')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.roi.headers.totalRevenue')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.roi.headers.totalCost')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.tabs.roi') + ' %'}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.bureaus.headers.placements')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.roi.headers.timeToValue')}</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {[...roiAnalysis]
                              .sort((a, b) => b.roiPercentage - a.roiPercentage)
                              .map((bureau, index) => (
                                <tr key={bureau.bureauId} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 mr-2" />}
                                      {index === 1 && <Award className="h-4 w-4 text-gray-400 mr-2" />}
                                      {index === 2 && <Award className="h-4 w-4 text-orange-600 mr-2" />}
                                      <span className="font-semibold">#{index + 1}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="font-medium">{bureau.bureauName}</div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    {formatCurrency(bureau.totalRevenue)}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    {formatCurrency(bureau.totalCost)}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {bureau.roiPercentage >= 0 ? (
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                      )}
                                      <span
                                        className={`font-semibold ${
                                          bureau.roiPercentage >= 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                        }`}
                                      >
                                        {bureau.roiPercentage.toFixed(1)}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    {bureau.placementCount}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    {bureau.timeToValueDays.toFixed(0)} {t('analyticsPage.days')}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MARKET BENCHMARKING TAB */}
        <TabsContent value="benchmarking" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('vmsAnalytics.benchmarking.title')}
              </CardTitle>
              <CardDescription>
                {t('vmsAnalytics.benchmarking.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {benchmarkLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : marketBenchmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('vmsAnalytics.benchmarking.noDataTitle')}</h3>
                  <p className="text-sm text-muted-foreground">{t('vmsAnalytics.benchmarking.noDataDesc')}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Market Benchmark Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.benchmarking.headers.category')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.benchmarking.headers.location')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.benchmarking.headers.marketMedian')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.benchmarking.headers.p25p75Range')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.benchmarking.headers.yourRate')}</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.benchmarking.headers.status')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('vmsAnalytics.benchmarking.headers.sampleSize')}</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {marketBenchmarks.map((benchmark, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="font-medium">{benchmark.category}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {benchmark.location}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right">
                                {formatCurrency(benchmark.marketMedianRate)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-muted-foreground">
                                {formatCurrency(benchmark.marketP25Rate)} -{' '}
                                {formatCurrency(benchmark.marketP75Rate)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right font-semibold">
                                {formatCurrency(benchmark.yourAverageRate)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-center">
                                <Badge
                                  variant={
                                    benchmark.comparisonStatus === 'WITHIN'
                                      ? 'default'
                                      : benchmark.comparisonStatus === 'BELOW'
                                        ? 'secondary'
                                        : 'destructive'
                                  }
                                >
                                  {benchmark.comparisonStatus === 'BELOW'
                                    ? t('vmsAnalytics.benchmarking.status.below')
                                    : benchmark.comparisonStatus === 'WITHIN'
                                      ? t('vmsAnalytics.benchmarking.status.within')
                                      : t('vmsAnalytics.benchmarking.status.above')}
                                </Badge>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-muted-foreground">
                                {benchmark.sampleSize}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Rate Comparison Chart */}
                  <div>
                    <h4 className="font-semibold mb-4">{t('vmsAnalytics.benchmarking.rateComparisonTitle')}</h4>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={marketBenchmarks}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                        <YAxis
                          tickFormatter={(value) =>
                            new Intl.NumberFormat('nl-NL', {
                              notation: 'compact',
                              compactDisplay: 'short',
                            }).format(value)
                          }
                        />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="marketMedianRate" fill="#3b82f6" name={t('vmsAnalytics.benchmarking.headers.marketMedian')} />
                        <Bar dataKey="yourAverageRate" fill="#10b981" name={t('vmsAnalytics.benchmarking.headers.yourRate')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FORECASTING TAB */}
        <TabsContent value="forecasting" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('vmsAnalytics.forecasting.title')}
                </CardTitle>
                <CardDescription>
                  {t('vmsAnalytics.forecasting.description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
              {forecastLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : forecasts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('vmsAnalytics.forecasting.noDataTitle')}</h3>
                  <p className="text-sm text-muted-foreground">{t('vmsAnalytics.forecasting.noDataDesc')}</p>
                </div>
              ) : (
                <>
                  {/* Forecast Chart */}
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={forecasts}>
                      <defs>
                        <linearGradient id="confidenceRange" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="confidenceUpper"
                        stroke="none"
                        fill="url(#confidenceRange)"
                        name={t('vmsAnalytics.forecasting.legends.confidenceRange')}
                      />
                      <Area
                        type="monotone"
                        dataKey="confidenceLower"
                        stroke="none"
                        fill="#fff"
                        name=""
                      />
                      <Line
                        type="monotone"
                        dataKey="actualDemand"
                        stroke="#10b981"
                        strokeWidth={2}
                        name={t('vmsAnalytics.forecasting.legends.historical')}
                        connectNulls
                      />
                      <Line
                        type="monotone"
                        dataKey="predictedDemand"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name={t('vmsAnalytics.forecasting.legends.predicted')}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* Forecast Details */}
                  <div className="mt-8">
                    <h4 className="font-semibold mb-4">{t('vmsAnalytics.forecasting.details.title')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground">{t('vmsAnalytics.forecasting.details.historicalAvg')}</p>
                          <p className="text-2xl font-bold mt-2">
                            {forecasts
                              .filter((f) => f.isHistorical && f.actualDemand)
                              .reduce(
                                (sum, f, _, arr) => sum + (f.actualDemand || 0) / arr.length,
                                0
                              )
                              .toFixed(0)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground">{t('vmsAnalytics.forecasting.details.forecastedAvg')}</p>
                          <p className="text-2xl font-bold mt-2">
                            {forecasts
                              .filter((f) => !f.isHistorical)
                              .reduce(
                                (sum, f, _, arr) => sum + f.predictedDemand / arr.length,
                                0
                              )
                              .toFixed(0)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIVERSITY METRICS TAB */}
        <TabsContent value="diversity" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Diversity & Inclusion Metrics
              </CardTitle>
              <CardDescription>
                Bureau performance on diversity and inclusion across gender, ethnicity, and age demographics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {diversityLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : diversityMetrics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Diversity Data Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Diversity metrics will appear once bureaus have made placements
                  </p>
                </div>
              ) : (
                <>
                  {/* Diversity Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Average Gender Diversity</p>
                        <p className="text-3xl font-bold mt-2">
                          {(
                            diversityMetrics.reduce((sum, b) => sum + b.genderDiversity, 0) /
                            diversityMetrics.length
                          ).toFixed(1)}
                          %
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Average Ethnic Diversity</p>
                        <p className="text-3xl font-bold mt-2">
                          {(
                            diversityMetrics.reduce((sum, b) => sum + b.ethnicDiversity, 0) /
                            diversityMetrics.length
                          ).toFixed(1)}
                          %
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Average Age Diversity</p>
                        <p className="text-3xl font-bold mt-2">
                          {(
                            diversityMetrics.reduce((sum, b) => sum + b.ageDiversity, 0) /
                            diversityMetrics.length
                          ).toFixed(1)}
                          %
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Overall Diversity Score</p>
                        <p className="text-3xl font-bold mt-2">
                          {(
                            diversityMetrics.reduce((sum, b) => sum + b.overallDiversityScore, 0) /
                            diversityMetrics.length
                          ).toFixed(1)}
                          /100
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Overall Diversity Score Comparison */}
                  <div className="mb-8">
                    <h4 className="font-semibold mb-4">Overall Diversity Score by Bureau</h4>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={[...diversityMetrics].sort(
                          (a, b) => b.overallDiversityScore - a.overallDiversityScore
                        )}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="bureauName" angle={-45} textAnchor="end" height={80} />
                        <YAxis
                          label={{ value: 'Diversity Score', angle: -90, position: 'insideLeft' }}
                          domain={[0, 100]}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="overallDiversityScore" fill="#8b5cf6" name="Overall Diversity Score">
                          {[...diversityMetrics]
                            .sort((a, b) => b.overallDiversityScore - a.overallDiversityScore)
                            .map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.overallDiversityScore >= 70
                                    ? '#10b981'
                                    : entry.overallDiversityScore >= 50
                                      ? '#f59e0b'
                                      : '#ef4444'
                                }
                              />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Diversity Metrics Breakdown */}
                  <div className="mb-8">
                    <h4 className="font-semibold mb-4">Diversity Metrics Breakdown</h4>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={diversityMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="bureauName" angle={-45} textAnchor="end" height={80} />
                        <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="genderDiversity" fill="#ec4899" name="Gender Diversity %" />
                        <Bar dataKey="ethnicDiversity" fill="#3b82f6" name="Ethnic Diversity %" />
                        <Bar dataKey="ageDiversity" fill="#10b981" name="Age Diversity %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed Diversity Table */}
                  <div>
                    <h4 className="font-semibold mb-4">Detailed Diversity Metrics</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Bureau
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Overall Score
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Gender %
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Ethnic %
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Age %
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Placements
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Rating
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {[...diversityMetrics]
                              .sort((a, b) => b.overallDiversityScore - a.overallDiversityScore)
                              .map((bureau) => (
                                <tr key={bureau.bureauId} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="font-medium">{bureau.bureauName}</div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right font-semibold">
                                    {bureau.overallDiversityScore.toFixed(1)}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    {bureau.genderDiversity.toFixed(1)}%
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    {bureau.ethnicDiversity.toFixed(1)}%
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    {bureau.ageDiversity.toFixed(1)}%
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right">
                                    {bureau.placementCount}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-center">
                                    <Badge
                                      variant={
                                        bureau.overallDiversityScore >= 70
                                          ? 'default'
                                          : bureau.overallDiversityScore >= 50
                                            ? 'secondary'
                                            : 'destructive'
                                      }
                                    >
                                      {bureau.overallDiversityScore >= 70
                                        ? 'Excellent'
                                        : bureau.overallDiversityScore >= 50
                                          ? 'Good'
                                          : 'Needs Improvement'}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
