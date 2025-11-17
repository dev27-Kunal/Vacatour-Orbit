/**
 * Loading states for job pages
 * Extracted from my-jobs.tsx to follow CLAUDE C-4 (functions ≤20 lines)
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Loading skeleton for individual job card
 */
function JobCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading state for jobs page
 */
export function JobsLoadingState() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}