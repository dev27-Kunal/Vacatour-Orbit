/**
 * Performance Metrics Card Component
 *
 * Detailed performance metrics display for bureau portal.
 * More comprehensive than the basic dashboard card.
 *
 * Features:
 * - Detailed metric breakdowns
 * - Trend indicators
 * - Historical comparison
 * - Visual progress bars
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Clock,
  Users,
  CheckCircle,
} from 'lucide-react';

interface MetricData {
  label: string;
  value: number;
  unit?: string;
  change?: number;
  target?: number;
  icon: any;
  color: string;
}

interface PerformanceMetricsCardProps {
  metrics: {
    performanceScore: number;
    performanceTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NEW';
    fillRate: number;
    fillRateChange?: number;
    acceptanceRate: number;
    acceptanceRateChange?: number;
    responseRate: number;
    responseRateChange?: number;
    averageResponseTime?: number;
    ranking: number;
    rankingChange?: number;
  };
  showDetails?: boolean;
}

export function PerformanceMetricsCard({ metrics, showDetails = true }: PerformanceMetricsCardProps) {
  const tierColors = {
    PLATINUM: 'bg-purple-100 text-purple-800 border-purple-300',
    GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    SILVER: 'bg-gray-100 text-gray-800 border-gray-300',
    BRONZE: 'bg-orange-100 text-orange-800 border-orange-300',
    NEW: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const tierIcons = {
    PLATINUM: '💎',
    GOLD: '🥇',
    SILVER: '🥈',
    BRONZE: '🥉',
    NEW: '🆕',
  };

  const metricsData: MetricData[] = [
    {
      label: 'Fill Rate',
      value: metrics.fillRate,
      unit: '%',
      change: metrics.fillRateChange,
      target: 50,
      icon: Target,
      color: 'text-green-600',
    },
    {
      label: 'Acceptance Rate',
      value: metrics.acceptanceRate,
      unit: '%',
      change: metrics.acceptanceRateChange,
      target: 60,
      icon: CheckCircle,
      color: 'text-blue-600',
    },
    {
      label: 'Response Rate',
      value: metrics.responseRate,
      unit: '%',
      change: metrics.responseRateChange,
      target: 80,
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  if (metrics.averageResponseTime !== undefined) {
    metricsData.push({
      label: 'Avg Response Time',
      value: metrics.averageResponseTime,
      unit: 'hrs',
      target: 24,
      icon: Clock,
      color: 'text-orange-600',
    });
  }

  const getProgressColor = (value: number, target: number, isTime: boolean = false) => {
    if (isTime) {
      // For time metrics, lower is better
      if (value <= target * 0.5) {return 'bg-green-500';}
      if (value <= target) {return 'bg-blue-500';}
      if (value <= target * 1.5) {return 'bg-yellow-500';}
      return 'bg-red-500';
    } else {
      // For percentage metrics, higher is better
      if (value >= target * 1.5) {return 'bg-green-500';}
      if (value >= target) {return 'bg-blue-500';}
      if (value >= target * 0.7) {return 'bg-yellow-500';}
      return 'bg-red-500';
    }
  };

  const getChangeIndicator = (change?: number) => {
    if (change === undefined || change === 0) {return null;}

    return (
      <div className={`flex items-center gap-1 text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription className="mt-2">
              Overall score: {metrics.performanceScore.toFixed(1)}/100
            </CardDescription>
          </div>
          <Badge className={tierColors[metrics.performanceTier]}>
            {tierIcons[metrics.performanceTier]} {metrics.performanceTier}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Performance Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Performance</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{metrics.performanceScore.toFixed(1)}</span>
              <span className="text-sm text-gray-500">/100</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${metrics.performanceScore}%` }}
            />
          </div>
          {metrics.rankingChange !== undefined && (
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">Current Ranking: #{metrics.ranking}</span>
              {getChangeIndicator(metrics.rankingChange)}
            </div>
          )}
        </div>

        {/* Detailed Metrics */}
        {showDetails && (
          <div className="space-y-4">
            {metricsData.map((metric, idx) => {
              const Icon = metric.icon;
              const isTime = metric.unit === 'hrs';
              const progressPercentage = isTime
                ? Math.min((metric.target! / metric.value) * 100, 100)
                : Math.min((metric.value / metric.target!) * 100, 100);

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                      <span className="text-sm font-medium">{metric.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">
                        {metric.value.toFixed(1)}
                        {metric.unit}
                      </span>
                      {getChangeIndicator(metric.change)}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`${getProgressColor(metric.value, metric.target!, isTime)} h-1.5 rounded-full transition-all`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  {metric.target && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Target: {metric.target}{metric.unit}</span>
                      <span>
                        {isTime
                          ? metric.value <= metric.target
                            ? 'On Target'
                            : 'Needs Improvement'
                          : metric.value >= metric.target
                            ? 'On Target'
                            : 'Needs Improvement'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
