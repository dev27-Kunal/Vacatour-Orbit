/**
 * Compliance Score Card Component
 *
 * Displays bureau compliance score with visual rating:
 * - Compliance percentage
 * - Rating badge (Excellent/Good/Fair/Poor)
 * - Certificate status breakdown
 * - Expiry warnings
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import type { ComplianceScore } from '@/api/v2/vms/compliance/types';

interface ComplianceScoreCardProps {
  score: ComplianceScore;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const ratingConfig = {
  EXCELLENT: {
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: '🌟',
    bgColor: 'bg-green-50'
  },
  GOOD: {
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '✅',
    bgColor: 'bg-blue-50'
  },
  FAIR: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: '⚠️',
    bgColor: 'bg-yellow-50'
  },
  POOR: {
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: '❌',
    bgColor: 'bg-red-50'
  }
};

export function ComplianceScoreCard({
  score,
  showDetails = true,
  compact = false,
  className = ''
}: ComplianceScoreCardProps) {
  const rating = ratingConfig[score.complianceRating];
  const percentage = score.complianceScorePercentage || 0;

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge className={rating.color}>
                {rating.icon} {score.complianceRating}
              </Badge>
              <p className="text-2xl font-bold mt-2">{percentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Compliance Score</p>
            </div>
            <div className="text-right">
              <Shield className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-xs text-gray-500">
                {score.verifiedCertifications}/{score.totalCertifications} Verified
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Compliance Score</CardTitle>
          <Badge className={rating.color}>
            {rating.icon} {score.complianceRating}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Score Display */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-4xl font-bold">{percentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-600 mt-1">
                Weighted Compliance Score
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {score.weightedScore.toFixed(2)} / {score.maxPossibleScore.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Total Weight</p>
            </div>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>

        {/* Certificate Status Breakdown */}
        {showDetails && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Verified</span>
              </div>
              <span className="font-bold text-green-700">
                {score.verifiedCertifications}
              </span>
            </div>

            {score.expiringCertifications > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium">Expiring Soon</span>
                </div>
                <span className="font-bold text-yellow-700">
                  {score.expiringCertifications}
                </span>
              </div>
            )}

            {score.expiredCertifications > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Expired</span>
                </div>
                <span className="font-bold text-red-700">
                  {score.expiredCertifications}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Total Certifications</span>
              </div>
              <span className="font-bold text-gray-700">
                {score.totalCertifications}
              </span>
            </div>
          </div>
        )}

        {/* Compliance Trend (if available) */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Status</span>
            {percentage >= 70 ? (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Compliant</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="w-4 h-4" />
                <span className="font-medium">Action Required</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
