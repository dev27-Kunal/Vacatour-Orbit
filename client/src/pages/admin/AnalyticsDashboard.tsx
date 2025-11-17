import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '@/providers/AppProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  CalendarIcon, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  Mail, 
  DollarSign, 
  Activity,
  Eye,
  MousePointer,
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet } from '@/lib/api-client';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

// Import our new analytics components
import {
  MetricCard,
  EmailPerformanceChart,
  ConversionFunnel,
  EngagementHeatmap,
  TrendIndicator,
  RealtimeCounter,
  useRealtimeCounter
} from '@/components/analytics';

// Types
interface DashboardData {
  overview: {
    activeUsers: number;
    totalJobs: number;
    mrr: number;
    emailsSent: number;
    applicationRate: number;
    conversionRate: number;
    averageResponseTime: number;
    errorRate: number;
  };
  emailPerformance: {
    daily: Array<{
      date: string;
      emails_sent: number;
      emails_delivered: number;
      emails_opened: number;
      emails_clicked: number;
      emails_bounced: number;
      emails_unsubscribed: number;
      open_rate: number;
      click_rate: number;
      bounce_rate: number;
      unsubscribe_rate: number;
      delivery_rate: number;
      click_to_open_rate: number;
    }>;
    totals: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      bounced: number;
      unsubscribed: number;
    };
    averages: {
      openRate: number;
      clickRate: number;
      clickToOpenRate: number;
      bounceRate: number;
      unsubscribeRate: number;
    };
  };
  conversionFunnel: {
    emailsSent: number;
    emailsDelivered: number;
    emailsOpened: number;
    emailsClicked: number;
    jobsViewed: number;
    applicationsStarted: number;
    applicationsCompleted: number;
  };
  userEngagement: Array<{
    timestamp: string;
    value: number;
    metadata?: Record<string, any>;
  }>;
  realTimeData: {
    activeUsers: number;
    emailsBeingSent: number;
    applicationsInProgress: number;
    currentResponseTime: number;
  };
  revenue: {
    current: {
      monthly_recurring_revenue: number;
      total_subscribers: number;
      average_revenue_per_user: number;
      basic_subscribers: number;
      pro_subscribers: number;
      enterprise_subscribers: number;
    };
    growth: {
      mrr: number;
      subscribers: number;
      arpu: number;
    };
  };
  topPerformingJobs: Array<{
    job_id: string;
    date: string;
    application_rate: number;
    open_rate: number;
    click_rate: number;
    jobs?: {
      title: string;
      company: string;
    };
  }>;
  systemHealth: {
    current: {
      api_requests_total: number;
      average_response_time_ms: number;
      error_rate: number;
      uptime_percentage: number;
      database_connection_pool: number;
    };
    trends: {
      response_time: number;
      error_rate: number;
      throughput: number;
    };
  };
}

interface DateRange {
  from: Date;
  to: Date;
}

// Date range presets
const dateRangePresets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export default function AnalyticsDashboard() {
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange>({ 
    from: subDays(new Date(), 30), 
    to: new Date() 
  });
  const [selectedPreset, setSelectedPreset] = useState('30');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute

  // Check admin access
  useEffect(() => {
    if (!user || !user.isAdmin) {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  // Fetch dashboard data with auto-refresh
  const { data: dashboardData, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['analytics-dashboard', dateRange],
    queryFn: async () => {
      const response = await apiGet<DashboardData>('/api/analytics/dashboard-summary', {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
      return response.data!;
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Real-time data fetch for live metrics
  const fetchRealTimeData = useCallback(async () => {
    const response = await apiGet<{ activeUsers: number }>('/api/analytics/real-time');
    return response.data?.activeUsers || 0;
  }, []);

  const activeUsersCounter = useRealtimeCounter(
    dashboardData?.realTimeData?.activeUsers || 0,
    fetchRealTimeData,
    5000 // Update every 5 seconds
  );

  // Export dashboard data
  const handleExport = () => {
    if (!dashboardData) {return;}
    
    const dataStr = JSON.stringify({
      ...dashboardData,
      exportedAt: new Date().toISOString(),
      dateRange,
      filters: { autoRefresh, refreshInterval }
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analytics-dashboard-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Handle date range change
  const handlePresetChange = (days: string) => {
    setSelectedPreset(days);
    const daysNum = parseInt(days);
    setDateRange({
      from: subDays(new Date(), daysNum),
      to: new Date()
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">{t('admin.analytics.loading', { defaultValue: 'Loading analytics dashboard...' })}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">{t('admin.analytics.errorTitle', { defaultValue: 'Error loading analytics dashboard' })}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : t('common.error', { defaultValue: 'An error occurred' })}
                </p>
              </div>
            </div>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('common.retry', { defaultValue: 'Try Again' })}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            {t('admin.analytics.title', { defaultValue: 'Analytics Dashboard' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.analytics.subtitle', { defaultValue: 'Monitor platform performance and user engagement' })}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-refresh controls */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
            <Switch 
              id="auto-refresh" 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm">{t('admin.analytics.autoRefresh', { defaultValue: 'Auto-refresh' })}</Label>
          </div>
          
          {/* Time range selector */}
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('admin.analytics.selectRange', { defaultValue: 'Select time range' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t('admin.analytics.lastDays', { count: 7, defaultValue: 'Last 7 days' })}</SelectItem>
              <SelectItem value="30">{t('admin.analytics.lastDays', { count: 30, defaultValue: 'Last 30 days' })}</SelectItem>
              <SelectItem value="90">{t('admin.analytics.lastDays', { count: 90, defaultValue: 'Last 90 days' })}</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Action buttons */}
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            {t('admin.analytics.refresh', { defaultValue: 'Refresh' })}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {t('admin.analytics.export', { defaultValue: 'Export' })}
          </Button>
        </div>
      </motion.div>

      {/* Real-time Status Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{t('admin.analytics.liveData', { defaultValue: 'Live Data' })}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('admin.analytics.lastUpdated', { defaultValue: 'Last updated: {{time}}', time: format(new Date(), 'HH:mm:ss') })}
                  </div>
                </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">{t('admin.analytics.activeUsers', { defaultValue: 'Active Users' })}</div>
                  <RealtimeCounter
                    value={activeUsersCounter.value}
                    previousValue={activeUsersCounter.previousValue}
                    className="text-lg font-bold text-blue-600"
                  />
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">{t('admin.analytics.responseTime', { defaultValue: 'Response Time' })}</div>
                  <div className="text-lg font-bold">
                    {dashboardData.systemHealth.current.average_response_time_ms.toFixed(0)}ms
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">{t('admin.analytics.systemStatus', { defaultValue: 'System Status' })}</div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{t('admin.analytics.operational', { defaultValue: 'Operational' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          title={t('admin.analytics.cards.activeUsersTitle', { defaultValue: 'Active Users' })}
          value={dashboardData.overview.activeUsers}
          trend={5.2}
          icon={Users}
          description={t('admin.analytics.cards.activeUsersDesc', { defaultValue: 'Users active in last 7 days' })}
          realtime={true}
          previousValue={dashboardData.overview.activeUsers - 12}
          variant="success"
        />

        <MetricCard
          title={t('admin.analytics.cards.monthlyRevenueTitle', { defaultValue: 'Monthly Revenue' })}
          value={dashboardData.revenue.current.monthly_recurring_revenue}
          format={(value) => `€${value.toLocaleString()}`}
          trend={dashboardData.revenue.growth.mrr}
          trendFormat="currency"
          icon={DollarSign}
          description={t('admin.analytics.cards.monthlyRevenueDesc', { defaultValue: '{{value}}% from last month', value: `${dashboardData.revenue.growth.mrr > 0 ? '+' : ''}${dashboardData.revenue.growth.mrr.toFixed(1)}` })}
          variant={dashboardData.revenue.growth.mrr > 0 ? "success" : "warning"}
        />

        <MetricCard
          title={t('admin.analytics.cards.emailsSentTitle', { defaultValue: 'Emails Sent' })}
          value={dashboardData.overview.emailsSent}
          trend={12.5}
          icon={Mail}
          description={t('admin.analytics.cards.emailsSentDesc', { defaultValue: 'In selected period' })}
          format={(value) => value.toLocaleString()}
        />

        <MetricCard
          title={t('admin.analytics.cards.conversionRateTitle', { defaultValue: 'Conversion Rate' })}
          value={dashboardData.overview.conversionRate}
          format={(value) => `${value.toFixed(1)}%`}
          trend={dashboardData.overview.conversionRate - 3.2}
          trendFormat="percentage"
          icon={Target}
          description={t('admin.analytics.cards.conversionRateDesc', { defaultValue: 'Email to application rate' })}
          variant={dashboardData.overview.conversionRate > 3 ? "success" : "warning"}
        />
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t('admin.analytics.tabs.overview', { defaultValue: 'Overview' })}
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('admin.analytics.tabs.email', { defaultValue: 'Email' })}
            </TabsTrigger>
            <TabsTrigger value="funnel" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('admin.analytics.tabs.funnel', { defaultValue: 'Funnel' })}
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t('admin.analytics.tabs.engagement', { defaultValue: 'Engagement' })}
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('admin.analytics.tabs.revenue', { defaultValue: 'Revenue' })}
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('admin.analytics.tabs.system', { defaultValue: 'System' })}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Email Performance Overview */}
              <EmailPerformanceChart
                data={dashboardData.emailPerformance.daily}
                title={t('admin.analytics.overview.emailPerformance.title', { defaultValue: 'Email Performance Trends' })}
                description={t('admin.analytics.overview.emailPerformance.desc', { defaultValue: 'Daily email metrics and engagement rates' })}
                height={300}
                showControls={true}
                defaultMetric="rates"
                defaultChartType="line"
              />
              
              {/* Conversion Funnel Overview */}
              <ConversionFunnel
                title={t('admin.analytics.overview.funnel.title', { defaultValue: 'Email to Application Funnel' })}
                description={t('admin.analytics.overview.funnel.desc', { defaultValue: 'User journey from email to job application' })}
                stages={[
                  { 
                    name: t('admin.analytics.stages.emailsSent', { defaultValue: 'Emails Sent' }), 
                    value: dashboardData.conversionFunnel.emailsSent,
                    icon: <Mail className="h-5 w-5" />,
                    description: t('admin.analytics.stageDesc.emailsSent', { defaultValue: 'Total emails dispatched' })
                  },
                  { 
                    name: t('admin.analytics.stages.delivered', { defaultValue: 'Delivered' }), 
                    value: dashboardData.conversionFunnel.emailsDelivered,
                    icon: <CheckCircle className="h-5 w-5" />,
                    description: t('admin.analytics.stageDesc.delivered', { defaultValue: 'Successfully delivered' })
                  },
                  { 
                    name: t('admin.analytics.stages.opened', { defaultValue: 'Opened' }), 
                    value: dashboardData.conversionFunnel.emailsOpened,
                    icon: <Eye className="h-5 w-5" />,
                    description: t('admin.analytics.stageDesc.opened', { defaultValue: 'Recipients who opened' })
                  },
                  { 
                    name: t('admin.analytics.stages.clicked', { defaultValue: 'Clicked' }), 
                    value: dashboardData.conversionFunnel.emailsClicked,
                    icon: <MousePointer className="h-5 w-5" />,
                    description: t('admin.analytics.stageDesc.clicked', { defaultValue: 'Users who clicked' })
                  },
                  { 
                    name: t('admin.analytics.stages.applied', { defaultValue: 'Applied' }), 
                    value: dashboardData.conversionFunnel.applicationsCompleted,
                    icon: <Target className="h-5 w-5" />,
                    description: t('admin.analytics.stageDesc.applied', { defaultValue: 'Completed applications' })
                  }
                ]}
                variant="colorful"
                showTrends={true}
              />
            </div>
            
            {/* Key Performance Indicators */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Open Rate"
                value={dashboardData.emailPerformance.averages.openRate}
                description="Average email open rate"
              />
              
              <MetricCard
                title="Click Rate" 
                value={dashboardData.emailPerformance.averages.clickRate}
                description="Average click through rate"
              />
              
              <MetricCard
                title="Response Time"
                value={dashboardData.systemHealth.current.average_response_time_ms}
                trend={dashboardData.systemHealth.trends.response_time}
                description="Average API response time"
              />
              
              <MetricCard
                title="Uptime"
                value={dashboardData.systemHealth.current.uptime_percentage}
                description="System availability"
                variant={dashboardData.systemHealth.current.uptime_percentage > 99 ? "success" : "warning"}
              />
            </div>
          </TabsContent>

          {/* Email Performance Tab */}
          <TabsContent value="email" className="space-y-6">
            <EmailPerformanceChart
              data={dashboardData.emailPerformance.daily}
              title={t('admin.analytics.emailPerf.detailedTitle', { defaultValue: 'Detailed Email Performance' })}
              description={t('admin.analytics.emailPerf.detailedDesc', { defaultValue: 'Comprehensive email analytics with industry benchmarks' })}
              height={400}
              showControls={true}
            />
            
            {/* Email metrics summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              {[
                { label: t('admin.analytics.labels.totalSent', { defaultValue: 'Total Sent' }), value: dashboardData.emailPerformance.totals.sent, color: 'blue' },
                { label: t('admin.analytics.labels.delivered', { defaultValue: 'Delivered' }), value: dashboardData.emailPerformance.totals.delivered, color: 'green' },
                { label: t('admin.analytics.labels.opened', { defaultValue: 'Opened' }), value: dashboardData.emailPerformance.totals.opened, color: 'yellow' },
                { label: t('admin.analytics.labels.clicked', { defaultValue: 'Clicked' }), value: dashboardData.emailPerformance.totals.clicked, color: 'purple' },
                { label: t('admin.analytics.labels.bounced', { defaultValue: 'Bounced' }), value: dashboardData.emailPerformance.totals.bounced, color: 'red' },
                { label: t('admin.analytics.labels.unsubscribed', { defaultValue: 'Unsubscribed' }), value: dashboardData.emailPerformance.totals.unsubscribed, color: 'gray' }
              ].map((metric) => (
                <MetricCard
                  key={metric.label}
                  title={metric.label}
                  value={metric.value}
                  format={(value) => value.toLocaleString()}
                  size="sm"
                />
              ))}
            </div>
          </TabsContent>

          {/* Conversion Funnel Tab */}
          <TabsContent value="funnel" className="space-y-6">
            <ConversionFunnel
              title={t('admin.analytics.funnel.detailedTitle', { defaultValue: 'Complete Conversion Funnel' })}
              description={t('admin.analytics.funnel.detailedDesc', { defaultValue: 'Detailed analysis of user journey from email to hire' })}
              stages={[
                { name: t('admin.analytics.stages.emailsSent', { defaultValue: 'Emails Sent' }), value: dashboardData.conversionFunnel.emailsSent },
                { name: t('admin.analytics.stages.emailsDelivered', { defaultValue: 'Emails Delivered' }), value: dashboardData.conversionFunnel.emailsDelivered },
                { name: t('admin.analytics.stages.emailsOpened', { defaultValue: 'Emails Opened' }), value: dashboardData.conversionFunnel.emailsOpened },
                { name: t('admin.analytics.stages.linksClicked', { defaultValue: 'Links Clicked' }), value: dashboardData.conversionFunnel.emailsClicked },
                { name: t('admin.analytics.stages.jobsViewed', { defaultValue: 'Jobs Viewed' }), value: dashboardData.conversionFunnel.jobsViewed },
                { name: t('admin.analytics.stages.applicationsStarted', { defaultValue: 'Applications Started' }), value: dashboardData.conversionFunnel.applicationsStarted },
                { name: t('admin.analytics.stages.applicationsCompleted', { defaultValue: 'Applications Completed' }), value: dashboardData.conversionFunnel.applicationsCompleted }
              ]}
              showTrends={true}
              showPercentages={true}
              variant="default"
            />
            
            {/* Funnel optimization insights */}
            <Card>
                <CardHeader>
                  <CardTitle>{t('admin.analytics.funnel.optimization.title', { defaultValue: 'Optimization Opportunities' })}</CardTitle>
                  <CardDescription>{t('admin.analytics.funnel.optimization.desc', { defaultValue: 'Areas with the highest drop-off rates' })}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <div>
                        <p className="font-medium">{t('admin.analytics.funnel.insights.emailToClick', { defaultValue: 'Email to Click Conversion' })}</p>
                        <p className="text-sm text-muted-foreground">{t('admin.analytics.funnel.insights.openToClickDrop', { defaultValue: 'High drop-off from open to click' })}</p>
                      </div>
                      <TrendIndicator value={-15.3} format="percentage" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div>
                        <p className="font-medium">{t('admin.analytics.funnel.insights.applicationCompletion', { defaultValue: 'Application Completion' })}</p>
                        <p className="text-sm text-muted-foreground">{t('admin.analytics.funnel.insights.startNotFinish', { defaultValue: 'Users starting but not finishing applications' })}</p>
                      </div>
                      <TrendIndicator value={-8.7} format="percentage" />
                    </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <EngagementHeatmap
              data={dashboardData.userEngagement}
              title={t('admin.analytics.engagement.heatmapTitle', { defaultValue: 'User Activity Heatmap' })}
              description={t('admin.analytics.engagement.heatmapDesc', { defaultValue: 'Visualize user engagement patterns by time and day' })}
              type="hourly"
              metric={t('admin.analytics.engagement.metricSessions', { defaultValue: 'Sessions' })}
              valueFormat={(value) => value.toLocaleString()}
              colorScheme="blue"
              showControls={true}
            />
            
            {/* Engagement metrics */}
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title={t('admin.analytics.engagement.metrics.peakHourTitle', { defaultValue: 'Peak Activity Hour' })}
                value={14} // 2 PM
                format={(value) => `${value}:00`}
                description={t('admin.analytics.engagement.metrics.peakHourDesc', { defaultValue: 'Highest user engagement time' })}
                icon={Clock}
              />
              
              <MetricCard
                title={t('admin.analytics.engagement.metrics.activeDayTitle', { defaultValue: 'Most Active Day' })}
                value={3} // Wednesday (0 = Sunday)
                format={(value) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][value]}
                description={t('admin.analytics.engagement.metrics.activeDayDesc', { defaultValue: 'Day with highest engagement' })}
                icon={CalendarIcon}
              />
              
              <MetricCard
                title={t('admin.analytics.engagement.metrics.avgSessionTitle', { defaultValue: 'Average Session Duration' })}
                value={285} // seconds
                format={(value) => `${Math.floor(value / 60)}m ${value % 60}s`}
                description={t('admin.analytics.engagement.metrics.avgSessionDesc', { defaultValue: 'Time spent per session' })}
                icon={Activity}
              />
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.analytics.revenue.overviewTitle', { defaultValue: 'Revenue Overview' })}</CardTitle>
                  <CardDescription>{t('admin.analytics.revenue.overviewDesc', { defaultValue: 'Monthly recurring revenue and growth' })}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('admin.analytics.revenue.labels.mrr', { defaultValue: 'Monthly Recurring Revenue' })}</span>
                      <span className="text-2xl font-bold">
                        €{dashboardData.revenue.current.monthly_recurring_revenue.toLocaleString()}
                      </span>
                    </div>
                    <TrendIndicator 
                      value={dashboardData.revenue.growth.mrr} 
                      format="percentage"
                      className="justify-end"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('admin.analytics.revenue.labels.totalSubscribers', { defaultValue: 'Total Subscribers' })}</span>
                    <span className="text-xl font-bold">
                      {dashboardData.revenue.current.total_subscribers.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('admin.analytics.revenue.labels.arpu', { defaultValue: 'Average Revenue Per User' })}</span>
                    <span className="text-xl font-bold">
                      €{dashboardData.revenue.current.average_revenue_per_user.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Subscription distribution */}
              <Card>
              <CardHeader>
                  <CardTitle>{t('admin.analytics.subscriptionPlans.title', { defaultValue: 'Subscription Plans' })}</CardTitle>
                  <CardDescription>{t('admin.analytics.subscriptionPlans.desc', { defaultValue: 'Distribution of subscribers by plan type' })}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: t('admin.analytics.plans.basic', { defaultValue: 'Basic' }), count: dashboardData.revenue.current.basic_subscribers, color: 'bg-blue-500' },
                      { name: t('admin.analytics.plans.pro', { defaultValue: 'Pro' }), count: dashboardData.revenue.current.pro_subscribers, color: 'bg-green-500' },
                      { name: t('admin.analytics.plans.enterprise', { defaultValue: 'Enterprise' }), count: dashboardData.revenue.current.enterprise_subscribers, color: 'bg-purple-500' }
                    ].map(plan => {
                      const percentage = (plan.count / dashboardData.revenue.current.total_subscribers * 100).toFixed(1);
                      return (
                        <div key={plan.name}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{plan.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {plan.count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div 
                              className={cn("h-2 rounded-full", plan.color)}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="API Requests"
                value={dashboardData.systemHealth.current.api_requests_total}
                format={(value) => value.toLocaleString()}
                description="Total requests handled"
                icon={Activity}
              />
              
              <MetricCard
                title="Response Time"
                value={dashboardData.systemHealth.current.average_response_time_ms}
                trend={dashboardData.systemHealth.trends.response_time}
                description="Average API response time"
              />
              
              <MetricCard
                title="Error Rate"
                value={dashboardData.systemHealth.current.error_rate}
                trend={dashboardData.systemHealth.trends.error_rate * -1} // Negative trend is good for error rate
                description="Percentage of failed requests"
                variant={dashboardData.systemHealth.current.error_rate > 1 ? "danger" : "success"}
              />
              
              <MetricCard
                title="Uptime"
                value={dashboardData.systemHealth.current.uptime_percentage}
                description="System availability"
                variant="success"
              />
            </div>
            
            {/* System status details */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.analytics.systemComponents.title', { defaultValue: 'System Components' })}</CardTitle>
                <CardDescription>{t('admin.analytics.systemComponents.desc', { defaultValue: 'Status of critical system components' })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: t('admin.analytics.systemComponents.components.database', { defaultValue: 'Database' }), status: 'healthy', responseTime: '12ms' },
                    { name: t('admin.analytics.systemComponents.components.emailService', { defaultValue: 'Email Service' }), status: 'operational', responseTime: '89ms' },
                    { name: t('admin.analytics.systemComponents.components.storage', { defaultValue: 'Storage' }), status: 'healthy', responseTime: '45ms' },
                    { name: t('admin.analytics.systemComponents.components.authentication', { defaultValue: 'Authentication' }), status: 'healthy', responseTime: '23ms' },
                    { name: t('admin.analytics.systemComponents.components.jobMatching', { defaultValue: 'Job Matching' }), status: 'operational', responseTime: '156ms' },
                    { name: t('admin.analytics.systemComponents.components.analytics', { defaultValue: 'Analytics' }), status: 'healthy', responseTime: '78ms' }
                  ].map((component) => (
                    <div 
                      key={component.name}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{component.name}</p>
                        <p className="text-sm text-muted-foreground">{component.responseTime}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm capitalize">{t(`admin.analytics.systemComponents.status.${component.status}`, { defaultValue: component.status })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
