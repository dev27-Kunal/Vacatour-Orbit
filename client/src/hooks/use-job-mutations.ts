/**
 * Job-related mutations and queries
 * Extracted from my-jobs.tsx to follow CLAUDE C-4 (functions ≤20 lines)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPatch, apiDelete } from "@/lib/api-client";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: "VAST" | "INTERIM" | "UITZENDEN";
  hourlyRate: number | null;
  salary: number | null;
  startDate: string | null;
  endDate: string | null;
  status: "OPEN" | "PAUSED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch user's jobs
 * For BUREAU users, fetch distributed jobs from VMS endpoint
 * For other users, fetch their own jobs
 */
export function useUserJobs(enabled: boolean = true, userType?: string) {
  const endpoint = userType === 'BUREAU'
    ? '/api/vms/bureaus/available-jobs'
    : '/api/v2/jobs/my-jobs';

  return useQuery<Job[]>({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await apiGet<{ jobs: Job[] } | Job[] | { data: Job[] }>(endpoint);

      if (!response.success || !response.data) {
        return [];
      }

      // Handle multiple response formats
      // VMS endpoint returns { success: true, data: [...] }
      // My jobs endpoint returns { success: true, data: { jobs: [...] } } or { success: true, data: [...] }
      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      }

      if ('jobs' in data) {
        return data.jobs || [];
      }

      return [];
    },
    enabled,
  });
}

/**
 * Update job status mutation
 */
export function useUpdateJobMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { status: string } }) =>
      apiPatch(`/api/v2/jobs/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/jobs/my-jobs"] });
      toast({
        title: "Vacature bijgewerkt",
        description: "De status van de vacature is succesvol gewijzigd.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de vacature.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Delete job mutation
 */
export function useDeleteJobMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/v2/jobs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/jobs/my-jobs"] });
      toast({
        title: "Vacature verwijderd",
        description: "De vacature is succesvol verwijderd.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van de vacature.",
        variant: "destructive",
      });
    },
  });
}