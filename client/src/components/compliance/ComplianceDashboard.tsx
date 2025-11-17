/**
 * Compliance Dashboard Component
 *
 * Main dashboard showing compliance overview and statistics
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { ComplianceScoreCard } from './ComplianceScoreCard';
import { CertificationList } from './CertificationList';
import { ExpiryAlerts } from './ExpiryAlerts';
import type { ComplianceDashboardStats } from '@/api/v2/vms/compliance/types';

interface ComplianceDashboardProps {
  stats: ComplianceDashboardStats;
  loading?: boolean;
}

export function ComplianceDashboard({ stats, loading = false }: ComplianceDashboardProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bureaus</CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalBureaus}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.overview.compliantBureaus} compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.averageComplianceScore.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600 mt-1">Overall score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certifications.verified}</div>
            <p className="text-xs text-gray-600 mt-1">
              of {stats.certifications.total} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.urgentActions.criticalExpirations + stats.urgentActions.urgentExpirations}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.urgentActions.pendingVerifications} pending verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Certification Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">{stats.certifications.verified}</p>
              <p className="text-sm text-gray-600">Verified</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
              <p className="text-2xl font-bold">{stats.certifications.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold">{stats.certifications.expiringSoon}</p>
              <p className="text-sm text-gray-600">Expiring Soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto text-red-600 mb-2 flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <p className="text-2xl font-bold">{stats.certifications.expired}</p>
              <p className="text-sm text-gray-600">Expired</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto text-red-600 mb-2 flex items-center justify-center text-2xl">
                ❌
              </div>
              <p className="text-2xl font-bold">{stats.certifications.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Issues */}
      {stats.topIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Compliance Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topIssues.map((issue, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        issue.urgencyLevel === 'EXPIRED' || issue.urgencyLevel === 'CRITICAL'
                          ? 'bg-red-500'
                          : issue.urgencyLevel === 'URGENT'
                          ? 'bg-orange-500'
                          : 'bg-yellow-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-sm">{issue.description}</p>
                      <p className="text-xs text-gray-500">
                        Bureau ID: {issue.bureauId} • {issue.issueType}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{issue.urgencyLevel}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentActivity.slice(0, 5).map((audit) => (
                <div key={audit.id} className="flex items-start gap-3 text-sm pb-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{audit.eventType.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(audit.createdAt).toLocaleString('nl-NL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
