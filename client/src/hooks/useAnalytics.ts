import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';

// Types
interface DateRange {
  from: Date;
  to: Date;
}

interface EmailPerformanceData {
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
}

interface JobMetrics {
  jobId: string;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  applications: number;
  openRate: number;
  clickRate: number;
  applicationRate: number;
}

interface UserEngagement {
  userId: string;
  loginCount: number;
  jobsViewed: number;
  applicationsSubmitted: number;
  engagementScore: number;
  activityLevel: string;
}

interface ABTestResult {
  control: any;
  variants: Array<{
    variant_name: string;
    impressions: number;
    conversions: number;
    conversion_rate: number;
    p_value: number;
    isWinner: boolean;
  }>;
  hasWinner: boolean;
}

interface MatchScore {
  userId: string;
  jobId: string;
  skillScore: number;
  locationScore: number;
  salaryScore: number;
  experienceScore: number;
  jobTypeScore: number;
  totalScore: number;
  explanation: {
    skills?: string;
    location?: string;
    salary?: string;
    experience?: string;
    jobType?: string;
    overall?: string;
  };
  confidence: number;
}

// API client helper
const apiClient = async (endpoint: string, options?: RequestInit) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// ==========================================
// EMAIL ANALYTICS HOOKS
// ==========================================

export function useEmailPerformance(dateRange?: DateRange) {
  const from = dateRange?.from || subDays(new Date(), 30);
  const to = dateRange?.to || new Date();

  return useQuery<EmailPerformanceData>({
    queryKey: ['email-performance', from, to],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: from.toISOString(),
        endDate: to.toISOString(),
      });
      const result = await apiClient(`/analytics/email-performance?${params}`);
      return result.data;
    },
  });
}

export function useTrackEmailEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: {
      emailId: string;
      eventType: 'opened' | 'clicked' | 'bounced' | 'applied' | 'unsubscribed';
      userId?: string;
      jobId?: string;
      linkUrl?: string;
    }) => {
      return apiClient('/analytics/track-email-event', {
        method: 'POST',
        body: JSON.stringify(event),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-performance'] });
    },
  });
}

// ==========================================
// JOB ANALYTICS HOOKS
// ==========================================

export function useJobMetrics(jobId: string) {
  return useQuery<JobMetrics>({
    queryKey: ['job-metrics', jobId],
    queryFn: async () => {
      const result = await apiClient(`/analytics/job-metrics/${jobId}`);
      return result.data;
    },
    enabled: !!jobId,
  });
}

export function useJobsOverview(dateRange?: DateRange) {
  const from = dateRange?.from || subDays(new Date(), 30);
  const to = dateRange?.to || new Date();

  return useQuery({
    queryKey: ['jobs-overview', from, to],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: from.toISOString(),
        endDate: to.toISOString(),
      });
      const result = await apiClient(`/analytics/jobs-overview?${params}`);
      return result.data;
    },
  });
}

// ==========================================
// USER ENGAGEMENT HOOKS
// ==========================================

export function useUserEngagement(userId?: string) {
  return useQuery<UserEngagement>({
    queryKey: ['user-engagement', userId],
    queryFn: async () => {
      const endpoint = userId 
        ? `/analytics/user-engagement?userId=${userId}`
        : '/analytics/user-engagement';
      const result = await apiClient(endpoint);
      return result.data;
    },
  });
}

export function useUserEngagementOverview() {
  return useQuery({
    queryKey: ['user-engagement-overview'],
    queryFn: async () => {
      const result = await apiClient('/analytics/user-engagement-overview');
      return result.data;
    },
  });
}

// ==========================================
// A/B TESTING HOOKS
// ==========================================

export function useCreateABTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experiment: {
      name: string;
      description?: string;
      type: 'email_template' | 'feature_flag' | 'algorithm' | 'timing';
      controlVariant: any;
      testVariants: any[];
      primaryMetric: string;
    }) => {
      return apiClient('/analytics/experiments', {
        method: 'POST',
        body: JSON.stringify(experiment),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });
}

export function useABTestResults(experimentId: string) {
  return useQuery<ABTestResult>({
    queryKey: ['ab-test-results', experimentId],
    queryFn: async () => {
      const result = await apiClient(`/analytics/experiments/${experimentId}/results`);
      return result.data;
    },
    enabled: !!experimentId,
  });
}

export function useTrackABConversion(experimentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return apiClient(`/analytics/experiments/${experimentId}/track`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-test-results', experimentId] });
    },
  });
}

// ==========================================
// REVENUE ANALYTICS HOOKS
// ==========================================

export function useRevenueAnalytics(dateRange?: DateRange) {
  const from = dateRange?.from || subDays(new Date(), 30);
  const to = dateRange?.to || new Date();

  return useQuery({
    queryKey: ['revenue-analytics', from, to],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: from.toISOString(),
        endDate: to.toISOString(),
      });
      const result = await apiClient(`/analytics/revenue?${params}`);
      return result.data;
    },
  });
}

// ==========================================
// SYSTEM PERFORMANCE HOOKS
// ==========================================

export function useSystemPerformance(hours: number = 24) {
  return useQuery({
    queryKey: ['system-performance', hours],
    queryFn: async () => {
      const result = await apiClient(`/analytics/system-performance?hours=${hours}`);
      return result.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

// ==========================================
// MATCHING ANALYTICS HOOKS
// ==========================================

export function useJobRecommendations(userId?: string, limit: number = 10) {
  const endpoint = userId 
    ? `/matching/jobs/${userId}?limit=${limit}`
    : `/matching/recommendations?limit=${limit}`;

  return useQuery<{ matches: MatchScore[] }>({
    queryKey: ['job-recommendations', userId, limit],
    queryFn: async () => {
      const result = await apiClient(endpoint);
      return result.data;
    },
  });
}

export function useCandidateMatches(jobId: string, limit: number = 20) {
  return useQuery<{ matches: Array<MatchScore & { candidate: any }> }>({
    queryKey: ['candidate-matches', jobId, limit],
    queryFn: async () => {
      const result = await apiClient(`/matching/candidates/${jobId}?limit=${limit}`);
      return result.data;
    },
    enabled: !!jobId,
  });
}

export function useMatchScore(userId: string, jobId: string) {
  return useQuery<{ matchScore: MatchScore; job: any; user: any }>({
    queryKey: ['match-score', userId, jobId],
    queryFn: async () => {
      const result = await apiClient(`/matching/score/${userId}/${jobId}`);
      return result.data;
    },
    enabled: !!userId && !!jobId,
  });
}

export function useRecordMatchFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      action,
      rating,
    }: {
      jobId: string;
      action: 'viewed' | 'applied' | 'saved' | 'dismissed';
      rating?: number;
    }) => {
      return apiClient('/matching/feedback', {
        method: 'POST',
        body: JSON.stringify({ jobId, action, rating }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-recommendations'] });
    },
  });
}

// ==========================================
// DASHBOARD HOOKS
// ==========================================

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const result = await apiClient('/analytics/dashboard-summary');
      return result.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useRefreshAnalyticsViews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient('/analytics/refresh-views', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['email-performance'] });
      queryClient.invalidateQueries({ queryKey: ['user-engagement-overview'] });
    },
  });
}

export function useCleanupAnalytics() {
  return useMutation({
    mutationFn: async () => {
      return apiClient('/analytics/cleanup', {
        method: 'POST',
      });
    },
  });
}

// ==========================================
// UTILITY EXPORTS
// ==========================================

export function formatMetricValue(value: number, type: 'percentage' | 'number' | 'currency' = 'number'): string {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return `€${value.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'number':
    default:
      return value.toLocaleString('nl-NL');
  }
}

export function getMetricTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
  const threshold = 0.01; // 1% threshold for stable
  const change = (current - previous) / previous;
  
  if (Math.abs(change) < threshold) {return 'stable';}
  return change > 0 ? 'up' : 'down';
}

export function getMetricColor(value: number, thresholds: { good: number; warning: number }): string {
  if (value >= thresholds.good) {return 'text-green-600';}
  if (value >= thresholds.warning) {return 'text-yellow-600';}
  return 'text-red-600';
}