/**
 * Job Distribution Manager Component
 *
 * Main component for managing job distributions to bureaus.
 * Handles distribution, status updates, and real-time refresh.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { DistributedBureausList } from './DistributedBureausList';
import {
  jobDistributionApi,
  DistributionWithBureau,
} from '@/lib/api/job-distributions';
import { Send, AlertCircle, CheckCircle2, Users } from 'lucide-react';

interface JobDistributionManagerProps {
  jobId: string;
}

export function JobDistributionManager({ jobId }: JobDistributionManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Query for fetching distributions
  const {
    data: distributions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<DistributionWithBureau[]>({
    queryKey: ['job-distributions', jobId],
    queryFn: () => jobDistributionApi.getDistributions(jobId),
    refetchInterval: autoRefresh ? 30000 : false, // Poll every 30 seconds
  });

  // Query for distribution stats
  const { data: stats } = useQuery({
    queryKey: ['job-distribution-stats', jobId],
    queryFn: () => jobDistributionApi.getDistributionStats(jobId),
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Mutation for distributing job
  const distributeMutation = useMutation({
    mutationFn: () => jobDistributionApi.distributeJob(jobId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['job-distributions', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job-distribution-stats', jobId] });

      toast({
        title: 'Distributie succesvol',
        description: `Vacature gedistribueerd naar ${data.distributedCount} bureaus.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Distributie mislukt',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for removing distribution
  const removeMutation = useMutation({
    mutationFn: (bureauId: string) =>
      jobDistributionApi.removeDistribution(jobId, bureauId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-distributions', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job-distribution-stats', jobId] });

      toast({
        title: 'Distributie verwijderd',
        description: 'Bureau heeft geen toegang meer tot deze vacature.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Verwijderen mislukt',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDistribute = () => {
    distributeMutation.mutate();
  };

  const handleRemove = async (bureauId: string) => {
    await removeMutation.mutateAsync(bureauId);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Calculate statistics
  const activeDistributions = distributions.filter(
    (d) => d.status === 'ACTIVE'
  ).length;
  const totalSubmissions = distributions.reduce(
    (sum, d) => sum + d.submittedCandidates,
    0
  );
  const totalAccepted = distributions.reduce(
    (sum, d) => sum + d.acceptedCandidates,
    0
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Fout bij laden van distributies: {error?.message || 'Onbekende fout'}
        </AlertDescription>
      </Alert>
    );
  }

  const isDistributed = distributions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with Action Button */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Bureau Distributie</CardTitle>
              <CardDescription>
                Beheer welke bureaus toegang hebben tot deze vacature
              </CardDescription>
            </div>
            <Button
              onClick={handleDistribute}
              disabled={distributeMutation.isPending}
              size="lg"
            >
              <Send className="h-4 w-4 mr-2" />
              {distributeMutation.isPending
                ? 'Distribueren...'
                : isDistributed
                ? 'Hernieuw distributie'
                : 'Distribueer naar bureaus'}
            </Button>
          </div>
        </CardHeader>

        {/* Statistics */}
        {isDistributed && (
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">
                    {distributions.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Totaal bureaus
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {activeDistributions}
                  </div>
                  <div className="text-xs text-green-700">Actieve bureaus</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Send className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {totalSubmissions}
                  </div>
                  <div className="text-xs text-blue-700">
                    Kandidaten ingediend
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {totalAccepted}
                  </div>
                  <div className="text-xs text-purple-700">Geaccepteerd</div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Success message after distribution */}
      {distributeMutation.isSuccess && distributeMutation.data && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {distributeMutation.data.message} Gedistribueerd naar{' '}
            {distributeMutation.data.distributedCount} bureaus.
          </AlertDescription>
        </Alert>
      )}

      {/* Bureaus List */}
      <Card>
        <CardHeader>
          <CardTitle>Gedistribueerde Bureaus</CardTitle>
          <CardDescription>
            Overzicht van alle bureaus die toegang hebben tot deze vacature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DistributedBureausList
            jobId={jobId}
            distributions={distributions}
            onRemove={handleRemove}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Auto-refresh toggle */}
      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <label htmlFor="auto-refresh" className="cursor-pointer">
          <input
            id="auto-refresh"
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="mr-2"
          />
          Automatisch vernieuwen (elke 30 seconden)
        </label>
      </div>
    </div>
  );
}
