import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, DollarSign, Award,
  Calendar, Filter, Download, RefreshCw
} from 'lucide-react';
import BureauPerformanceChart from '@/components/analytics/BureauPerformanceChart';
import SpendAnalysisWidget from '@/components/analytics/SpendAnalysisWidget';
import DiversityMetricsCard from '@/components/analytics/DiversityMetricsCard';
import MarketBenchmarkChart from '@/components/analytics/MarketBenchmarkChart';
import ForecastingWidget from '@/components/analytics/ForecastingWidget';
import { apiGet } from '@/lib/api-client';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface AnalyticsSummary {
  totalBureaus: number;
  activePlacements: number;
  totalSpend: number;
  avgTimeToFill: number;
  fillRate: number;
}

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dateRange, setDateRange] = useState({ start: '2025-01-01', end: '2025-12-31' });
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'bureaus' | 'spend' | 'diversity' | 'forecast'>('overview');
  const { t } = useTranslation();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await apiGet<AnalyticsSummary>('/api/vms/analytics/summary', {
        start: dateRange.start,
        end: dateRange.end
      });
      if (response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAnalytics();
  };

  const exportData = () => {
    window.location.href = `/api/vms/analytics/export?start=${dateRange.start}&end=${dateRange.end}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('vms.analytics.title', { defaultValue: 'VMS Analytics Dashboard' })}
        </h1>
        <p className="text-gray-600">
          {t('vms.analytics.subtitle', { defaultValue: 'Comprehensive insights into your vendor management system performance' })}
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border rounded-md"
              />
              <span className="text-gray-500">{t('vms.analytics.to', { defaultValue: 'to' })}</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>{t('vms.analytics.refresh', { defaultValue: 'Refresh' })}</span>
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{t('vms.analytics.export', { defaultValue: 'Export' })}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-500" />
              <span className="text-sm text-gray-500">Bureaus</span>
            </div>
            <p className="text-2xl font-bold">{summary.totalBureaus}</p>
            <p className="text-sm text-green-500">+12% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-8 w-8 text-green-500" />
              <span className="text-sm text-gray-500">Placements</span>
            </div>
            <p className="text-2xl font-bold">{summary.activePlacements}</p>
            <p className="text-sm text-green-500">+8% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <span className="text-sm text-gray-500">Total Spend</span>
            </div>
            <p className="text-2xl font-bold">€{(summary.totalSpend / 1000).toFixed(0)}K</p>
            <p className="text-sm text-red-500">+5% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <span className="text-sm text-gray-500">Fill Rate</span>
            </div>
            <p className="text-2xl font-bold">{summary.fillRate}%</p>
            <p className="text-sm text-green-500">+3% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 text-indigo-500" />
              <span className="text-sm text-gray-500">Avg Time to Fill</span>
            </div>
            <p className="text-2xl font-bold">{summary.avgTimeToFill} days</p>
            <p className="text-sm text-green-500">-2 days from last month</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-6 py-3 text-sm font-medium ${
                selectedView === 'overview'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('vms.analytics.tabs.overview', { defaultValue: 'Overview' })}
            </button>
            <button
              onClick={() => setSelectedView('bureaus')}
              className={`px-6 py-3 text-sm font-medium ${
                selectedView === 'bureaus'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('vms.analytics.tabs.bureaus', { defaultValue: 'Bureau Performance' })}
            </button>
            <button
              onClick={() => setSelectedView('spend')}
              className={`px-6 py-3 text-sm font-medium ${
                selectedView === 'spend'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('vms.analytics.tabs.spend', { defaultValue: 'Spend Analysis' })}
            </button>
            <button
              onClick={() => setSelectedView('diversity')}
              className={`px-6 py-3 text-sm font-medium ${
                selectedView === 'diversity'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('vms.analytics.tabs.diversity', { defaultValue: 'Diversity Metrics' })}
            </button>
            <button
              onClick={() => setSelectedView('forecast')}
              className={`px-6 py-3 text-sm font-medium ${
                selectedView === 'forecast'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('vms.analytics.tabs.forecast', { defaultValue: 'Forecasting' })}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedView === 'overview' && (
          <>
            <BureauPerformanceChart dateRange={dateRange} />
            <SpendAnalysisWidget dateRange={dateRange} />
            <MarketBenchmarkChart />
            <DiversityMetricsCard compact={true} />
          </>
        )}

        {selectedView === 'bureaus' && (
          <div className="lg:col-span-2">
            <BureauPerformanceChart dateRange={dateRange} detailed={true} />
          </div>
        )}

        {selectedView === 'spend' && (
          <div className="lg:col-span-2">
            <SpendAnalysisWidget dateRange={dateRange} detailed={true} />
          </div>
        )}

        {selectedView === 'diversity' && (
          <div className="lg:col-span-2">
            <DiversityMetricsCard compact={false} />
          </div>
        )}

        {selectedView === 'forecast' && (
          <div className="lg:col-span-2">
            <ForecastingWidget />
          </div>
        )}
      </div>
    </div>
  );
}
