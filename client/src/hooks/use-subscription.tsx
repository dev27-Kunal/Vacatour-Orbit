import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";
import { apiRequest } from "@/lib/queryClient";

interface SubscriptionStatus {
  hasSubscription: boolean;
  isActive: boolean;
  subscription?: {
    id: string;
    plan: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  error?: string;
}

/**
 * Hook to check user's subscription status
 * Only applies to BEDRIJF and BUREAU user types
 */
export function useSubscription() {
  const { user } = useApp();
  const queryClient = useQueryClient();

  const needsSubscription = user?.userType === 'BEDRIJF' || user?.userType === 'BUREAU';

  const { data: subscriptionStatus, isLoading, error, refetch } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
    queryFn: async () => {
      const response = await fetch("/api/subscription/status", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check subscription status");
      }

      return response.json();
    },
    enabled: !!user && needsSubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/create-subscription", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    },
  });

  // For non-subscription users (ZZP, SOLLICITANT), return active status
  if (!needsSubscription) {
    return {
      subscriptionStatus: {
        hasSubscription: false,
        isActive: true, // Free for these user types
        subscription: null
      },
      isLoading: false,
      error: null,
      needsSubscription: false,
      refetch: () => Promise.resolve(),
      createSubscription: createSubscriptionMutation.mutate,
      isCreatingSubscription: createSubscriptionMutation.isPending
    };
  }

  return {
    subscriptionStatus: subscriptionStatus ?? {
      hasSubscription: false,
      isActive: false,
      subscription: null
    },
    isLoading,
    error,
    needsSubscription,
    refetch,
    createSubscription: createSubscriptionMutation.mutate,
    isCreatingSubscription: createSubscriptionMutation.isPending
  };
}

/**
 * Hook to check if user can perform job posting actions
 */
export function useCanPostJobs() {
  const { user } = useApp();
  const { subscriptionStatus, isLoading, needsSubscription } = useSubscription();

  if (!user) {
    return {
      canPost: false,
      reason: 'NOT_AUTHENTICATED',
      isLoading: false
    };
  }

  // ZZP and SOLLICITANT cannot post jobs at all
  if (user.userType === 'ZZP' || user.userType === 'SOLLICITANT') {
    return {
      canPost: false,
      reason: 'USER_TYPE_NOT_ALLOWED',
      isLoading: false
    };
  }

  // Admin users can always post
  if (user.isAdmin) {
    return {
      canPost: true,
      reason: 'ADMIN_USER',
      isLoading: false
    };
  }

  // Loading subscription status
  if (needsSubscription && isLoading) {
    return {
      canPost: false,
      reason: 'LOADING',
      isLoading: true
    };
  }

  // BEDRIJF and BUREAU can post jobs without subscription for now
  // TODO: Re-enable subscription requirement when payment system is ready
  if (needsSubscription) {
    // Temporarily allow posting without subscription
    return {
      canPost: true,
      reason: 'ACTIVE_SUBSCRIPTION',
      isLoading: false,
      subscriptionStatus: {
        hasSubscription: true,
        isActive: true,
        subscription: null
      }
    };
  }

  return {
    canPost: false,
    reason: 'UNKNOWN',
    isLoading: false
  };
}