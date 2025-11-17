/**
 * Bureau Performance Card Component
 * 
 * Displays key performance metrics for a bureau:
 * - Performance tier badge
 * - Fill rate percentage
 * - Acceptance rate
 * - Response time
 * - Current ranking
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Award, Target, Users } from 'lucide-react';

interface BureauPerformanceCardProps {
  performance: {
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
  };
  compact?: boolean;
}

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

export function BureauPerformanceCard({ performance, compact = false }: BureauPerformanceCardProps) {
  const getTrendIcon = (value: number, threshold: number) => {
    if (value >= threshold) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge className={tierColors[performance.performanceTier]}>
                {tierIcons[performance.performanceTier]} {performance.performanceTier}
              </Badge>
              <p className="text-2xl font-bold mt-2">{performance.performanceScore.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Performance Score</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">#{performance.ranking}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Overall Rank</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Bureau Performance</CardTitle>
          <Badge className={tierColors[performance.performanceTier]}>
            {tierIcons[performance.performanceTier]} {performance.performanceTier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Performance</span>
            <span className="text-2xl font-bold">{performance.performanceScore.toFixed(1)}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${performance.performanceScore}%` }}
            />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Fill Rate */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fill Rate</span>
              {getTrendIcon(performance.fillRate, 50)}
            </div>
            <p className="text-xl font-bold">{performance.fillRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">{performance.placementsMade} placements</p>
          </div>

          {/* Acceptance Rate */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Acceptance Rate</span>
              {getTrendIcon(performance.acceptanceRate, 60)}
            </div>
            <p className="text-xl font-bold">{performance.acceptanceRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Candidate quality</p>
          </div>

          {/* Response Rate */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Rate</span>
              {getTrendIcon(performance.responseRate, 80)}
            </div>
            <p className="text-xl font-bold">{performance.responseRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Jobs responded to</p>
          </div>

          {/* Response Time */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Avg Response</span>
            </div>
            <p className="text-xl font-bold">
              {performance.averageResponseTime 
                ? `${performance.averageResponseTime.toFixed(1)}h`
                : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">Time to first candidate</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="border-t pt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-lg font-bold">{performance.jobsReceived}</p>
            <p className="text-xs text-gray-500">Jobs Received</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-lg font-bold">{performance.candidatesSubmitted}</p>
            <p className="text-xs text-gray-500">Candidates Submitted</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-lg font-bold">#{performance.ranking}</p>
            <p className="text-xs text-gray-500">Overall Rank</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
