import { apiRequest } from '@/lib/api';

// Analytics API endpoints
export const analyticsApi = {
  // Dashboard Stats
  async getDashboardStats() {
    return apiRequest('/api/vms/analytics/dashboard');
  },

  // Bureau Performance
  async getBureauPerformance(params?: {
    period?: string;
    bureauId?: string;
    category?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/vms/analytics/bureau-performance${queryParams ? `?${queryParams}` : ''}`);
  },

  // Spend Analysis
  async getSpendAnalysis(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'bureau' | 'category' | 'month';
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/vms/analytics/spend-analysis${queryParams ? `?${queryParams}` : ''}`);
  },

  // Diversity Metrics
  async getDiversityMetrics(params?: {
    period?: string;
    bureauId?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/vms/analytics/diversity-metrics${queryParams ? `?${queryParams}` : ''}`);
  },

  // Market Benchmarks
  async getMarketBenchmarks(category: string) {
    return apiRequest(`/api/vms/analytics/market-benchmarks?category=${category}`);
  },

  // Forecasting
  async getForecasts(params: {
    type: 'placements' | 'spend' | 'timeToFill';
    confidence?: number;
    horizon?: number;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/vms/analytics/forecasts?${queryParams}`);
  },

  // Custom Reports
  async generateReport(params: {
    type: string;
    startDate: string;
    endDate: string;
    filters?: Record<string, any>;
  }) {
    return apiRequest('/api/vms/analytics/reports', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // Export Analytics
  async exportAnalytics(params: {
    type: 'csv' | 'pdf' | 'excel';
    reportType: string;
    filters?: Record<string, any>;
  }) {
    const response = await fetch('/api/vms/analytics/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${params.reportType}-${Date.now()}.${params.type}`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Real-time Metrics
  async getRealtimeMetrics() {
    return apiRequest('/api/vms/analytics/realtime');
  },

  // Historical Trends
  async getHistoricalTrends(params: {
    metric: string;
    period: 'daily' | 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/vms/analytics/trends?${queryParams}`);
  }
};

// Analytics utility functions
export const analyticsUtils = {
  // Calculate growth percentage
  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) {return current > 0 ? 100 : 0;}
    return Math.round(((current - previous) / previous) * 100);
  },

  // Format large numbers
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  },

  // Calculate averages
  calculateAverage(values: number[]): number {
    if (values.length === 0) {return 0;}
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  },

  // Get date ranges
  getDateRange(period: 'today' | 'week' | 'month' | 'quarter' | 'year') {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }
};