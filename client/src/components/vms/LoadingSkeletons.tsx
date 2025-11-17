/**
 * Loading Skeleton Components for VMS
 *
 * Provides loading state skeletons for all VMS components
 * to improve perceived performance and user experience.
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for Bureau Performance Card
 */
export function BureauPerformanceCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-5 w-12 ml-auto" />
              <Skeleton className="h-3 w-20 ml-auto" />
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
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="border-t pt-4 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-4 w-4 mx-auto" />
              <Skeleton className="h-5 w-8 mx-auto" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for Distributed Jobs List
 */
export function DistributedJobsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between text-sm">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for Bureau Rankings Leaderboard
 */
export function BureauRankingsLeaderboardSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 pb-2 border-b">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Table Rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 py-3 border-b">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for Fee Calculator Widget
 */
export function FeeCalculatorWidgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Contract Type */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Input Fields */}
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}

          {/* Calculate Button */}
          <Skeleton className="h-10 w-full" />

          {/* Result */}
          <div className="border-t pt-4 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for Candidate Submission Form
 */
export function CandidateSubmissionFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Form Fields */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}

          {/* Textarea */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for Bureau Selection Modal content
 */
export function BureauSelectionModalSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search */}
      <Skeleton className="h-10 w-full" />

      {/* Bureau Cards */}
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Loading skeleton for Quick Stats Cards
 */
export function QuickStatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for Dashboard Header
 */
export function DashboardHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="flex items-center gap-2 mt-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
