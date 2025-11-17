/**
 * Bureau Metrics Card Component
 *
 * Displays key performance metrics for bureau dashboard.
 * Shows:
 * - Active jobs count
 * - Total applications
 * - Accepted candidates
 * - Placements made
 * - Pending actions
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, FileText, CheckCircle, Award, Bell } from 'lucide-react';

export interface BureauMetrics {
  activeJobs: number;
  totalApplications: number;
  acceptedCandidates: number;
  placementsMade: number;
  pendingActions: number;
  unreadMessages: number;
}

interface BureauMetricsCardProps {
  metrics: BureauMetrics;
  className?: string;
}

export function BureauMetricsCard({ metrics, className = '' }: BureauMetricsCardProps) {
  const stats = [
    {
      label: 'Active Jobs',
      value: metrics.activeJobs,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Applications',
      value: metrics.totalApplications,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Accepted',
      value: metrics.acceptedCandidates,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Placements',
      value: metrics.placementsMade,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Metrics</CardTitle>
          {metrics.pendingActions > 0 && (
            <Badge variant="secondary">
              {metrics.pendingActions} Pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg ${stat.bgColor} border border-gray-200`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {metrics.unreadMessages > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-900">
                You have <strong>{metrics.unreadMessages} unread message{metrics.unreadMessages !== 1 ? 's' : ''}</strong>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
