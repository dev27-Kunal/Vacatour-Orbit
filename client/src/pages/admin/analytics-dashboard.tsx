import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '@/providers/AppProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, RefreshCw, TrendingUp, Users, Mail, DollarSign, Activity } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api-client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// Types
interface DashboardData {
  overview: {
    activeUsers: number;
    totalJobs: number;
    mrr: number;
    emailsSent: number;
  };
  emailPerformance: {
    daily: Array<{
      date: string;
      emails_sent: number;
      emails_opened: number;
      emails_clicked: number;
      open_rate: number;
      click_rate: number;
    }>;
    totals: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    };
    averages: {
      openRate: number;
      clickRate: number;
      clickToOpenRate: number;
    };
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
    };
  };
}

// Date range presets
const dateRangePresets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

// Chart colors
const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
};

export default function AnalyticsDashboard() {
  const { user } = useApp();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState({ from: subDays(new Date(), 30), to: new Date() });
  const [selectedPreset, setSelectedPreset] = useState('30');

  // Check admin access
  useEffect(() => {
    if (!user || !user.isAdmin) {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['analytics-dashboard', dateRange],
    queryFn: async () => {
      const response = await apiGet<DashboardData>('/api/analytics/dashboard-summary');
      return response.data!;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Export dashboard data
  const handleExport = () => {
    if (!dashboardData) {return;}
    
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analytics-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Error loading analytics dashboard</p>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.analytics')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.analytics.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('admin.analytics.selectRange')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t('admin.analytics.lastDays', { count: 7 })}</SelectItem>
              <SelectItem value="30">{t('admin.analytics.lastDays', { count: 30 })}</SelectItem>
              <SelectItem value="90">{t('admin.analytics.lastDays', { count: 90 })}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('vmsAnalytics.actions.refresh')}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {t('vmsAnalytics.actions.export')}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Users active in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              Active job postings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{dashboardData.revenue?.current?.monthly_recurring_revenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.revenue?.growth?.mrr > 0 ? '+' : ''}{dashboardData.revenue?.growth?.mrr?.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.emailsSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="email">Email Performance</TabsTrigger>
          <TabsTrigger value="jobs">Job Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        {/* Email Performance Tab */}
        <TabsContent value="email" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Email Metrics Over Time</CardTitle>
                <CardDescription>Daily email performance trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.emailPerformance?.daily || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="emails_sent" 
                      stackId="1"
                      stroke={COLORS.primary} 
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                      name="Sent"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="emails_opened" 
                      stackId="2"
                      stroke={COLORS.success} 
                      fill={COLORS.success}
                      fillOpacity={0.6}
                      name="Opened"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="emails_clicked" 
                      stackId="3"
                      stroke={COLORS.info} 
                      fill={COLORS.info}
                      fillOpacity={0.6}
                      name="Clicked"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Rates</CardTitle>
                <CardDescription>Open and click rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.emailPerformance?.daily || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                      formatter={(value: any) => `${value}%`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="open_rate" 
                      stroke={COLORS.success} 
                      name="Open Rate"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="click_rate" 
                      stroke={COLORS.info} 
                      name="Click Rate"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Email Performance Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.emailPerformance?.totals?.sent?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.emailPerformance?.averages?.openRate || 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.emailPerformance?.averages?.clickRate || 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Click-to-Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.emailPerformance?.averages?.clickToOpenRate || 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Job Analytics Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Jobs</CardTitle>
              <CardDescription>Jobs with highest engagement rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.topPerformingJobs?.slice(0, 10).map((job, index) => (
                  <div key={job.job_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{job.jobs?.title || 'Unknown Job'}</p>
                      <p className="text-sm text-muted-foreground">{job.jobs?.company}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-right">
                      <div>
                        <p className="text-sm text-muted-foreground">Application Rate</p>
                        <p className="font-medium">{job.application_rate?.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Open Rate</p>
                        <p className="font-medium">{job.open_rate?.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Click Rate</p>
                        <p className="font-medium">{job.click_rate?.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>Breakdown by plan type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Basic', value: dashboardData.revenue?.current?.basic_subscribers || 0 },
                        { name: 'Pro', value: dashboardData.revenue?.current?.pro_subscribers || 0 },
                        { name: 'Enterprise', value: dashboardData.revenue?.current?.enterprise_subscribers || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS.info} />
                      <Cell fill={COLORS.success} />
                      <Cell fill={COLORS.purple} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
                <CardDescription>Key financial indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monthly Recurring Revenue</span>
                  <span className="text-xl font-bold">
                    €{dashboardData.revenue?.current?.monthly_recurring_revenue?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Subscribers</span>
                  <span className="text-xl font-bold">
                    {dashboardData.revenue?.current?.total_subscribers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Revenue Per User</span>
                  <span className="text-xl font-bold">
                    €{dashboardData.revenue?.current?.average_revenue_per_user?.toFixed(2) || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">MRR Growth</span>
                  <span className={cn(
                    "text-xl font-bold",
                    dashboardData.revenue?.growth?.mrr > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {dashboardData.revenue?.growth?.mrr > 0 ? '+' : ''}{dashboardData.revenue?.growth?.mrr?.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New Subscribers</span>
                  <span className="text-xl font-bold">
                    {dashboardData.revenue?.growth?.subscribers > 0 ? '+' : ''}{dashboardData.revenue?.growth?.subscribers || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Trends</CardTitle>
              <CardDescription>Platform engagement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                User engagement analytics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">
                      {dashboardData.systemHealth?.current?.api_requests_total?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">
                      {dashboardData.systemHealth?.current?.average_response_time_ms?.toFixed(0) || 0}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Error Rate</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      (dashboardData.systemHealth?.current?.error_rate || 0) > 1 ? "text-red-600" : "text-green-600"
                    )}>
                      {dashboardData.systemHealth?.current?.error_rate?.toFixed(2) || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Database</span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Service</span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage</span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Available
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={async () => {
                    await apiPost('/api/analytics/refresh-views');
                    refetch();
                  }}
                >
                  Refresh Analytics Views
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    apiPost('/api/analytics/cleanup');
                  }}
                >
                  Clean Old Data
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setLocation('/admin/experiments')}
                >
                  Manage A/B Tests
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
