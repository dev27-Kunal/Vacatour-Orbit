/**
 * MSA Approval Hook
 *
 * Custom React Query hook for managing MSA approval workflows.
 * Provides methods to fetch pending MSAs and individual MSA details.
 */

import { useQuery } from '@tanstack/react-query';
import { apiGet, ApiError } from '@/lib/api-client';
import { MSADocument, MSAListResponse } from '@/types/msa';

/**
 * Fetch MSAs awaiting approval for the current user
 */
export function useMSAsAwaitingApproval() {
  return useQuery<MSADocument[], ApiError>({
    queryKey: ['msa', 'awaiting-approval'],
    queryFn: async () => {
      const response = await apiGet<MSAListResponse>('/api/msa/awaiting-approval');
      return response.data || [];
    },
    // Refetch every 5 minutes to keep approval list up-to-date
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });
}

/**
 * Fetch a specific MSA by ID
 */
export function useMSA(msaId: string | null) {
  return useQuery<MSADocument, ApiError>({
    queryKey: ['msa', msaId],
    queryFn: async () => {
      if (!msaId) {throw new Error('MSA ID is required');}
      const response = await apiGet<{ success: boolean; data: MSADocument }>(
        `/api/msa/${msaId}`
      );
      return response.data;
    },
    enabled: !!msaId, // Only run query if msaId is provided
  });
}

/**
 * Check if there are any MSAs awaiting approval
 * Useful for notification badges
 */
export function useHasPendingMSAs() {
  const { data: msas, isLoading } = useMSAsAwaitingApproval();

  return {
    hasPending: (msas?.length || 0) > 0,
    count: msas?.length || 0,
    isLoading,
  };
}
