/**
 * Custom React hooks for VMS (Vendor Management System) data fetching
 *
 * Provides reusable hooks for:
 * - Bureau performance data
 * - Distributed jobs
 * - Bureau rankings
 * - Fee calculations
 * - Candidate management
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types
interface BureauPerformance {
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
}

interface DistributedJob {
  id: string;
  title: string;
  companyName: string;
  location: string;
  distributionTier: 'EXCLUSIVE' | 'PRIORITY' | 'STANDARD';
  distributionStatus: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
  maxCandidates: number;
  candidatesSubmitted: number;
  distributedAt: string;
  expiresAt?: string;
}

interface BureauRanking {
  bureauId: string;
  bureauName: string;
  performanceTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NEW';
  performanceScore: number;
  fillRate: number;
  placementsMade: number;
  ranking: number;
}

interface FeeCalculation {
  feeAmount: number;
  feeType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'HOURLY_MARKUP';
  breakdown: {
    baseSalary?: number;
    percentage?: number;
    hourlyRate?: number;
    markup?: number;
    contractDuration?: number;
  };
}

interface CandidateOwnership {
  candidateId: string;
  email: string;
  firstName: string;
  lastName: string;
  bureauId: string;
  bureauName: string;
  submittedAt: string;
  expiresAt: string;
  isActive: boolean;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to handle API errors
const handleApiError = (error: any, toast: any) => {
  console.error('API Error:', error);
  toast({
    title: 'Error',
    description: error.message || 'Something went wrong. Please try again.',
    variant: 'destructive',
  });
};

/**
 * Hook to fetch bureau performance data
 */
export const useBureauPerformance = () => {
  const [performance, setPerformance] = useState<BureauPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPerformance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/vms/bureaus/performance', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch performance data: ${response.statusText}`);
      }

      const data = await response.json();
      setPerformance(data);
    } catch (err: any) {
      setError(err.message);
      handleApiError(err, toast);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  return { performance, loading, error, refetch: fetchPerformance };
};

/**
 * Hook to fetch distributed jobs for a bureau
 */
export const useDistributedJobs = () => {
  const [jobs, setJobs] = useState<DistributedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/vms/bureaus/my-jobs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      setJobs(data);
    } catch (err: any) {
      setError(err.message);
      handleApiError(err, toast);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
};

/**
 * Hook to fetch bureau rankings leaderboard
 */
export const useBureauRankings = () => {
  const [rankings, setRankings] = useState<BureauRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/vms/bureaus/rankings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rankings: ${response.statusText}`);
      }

      const data = await response.json();
      setRankings(data);
    } catch (err: any) {
      setError(err.message);
      handleApiError(err, toast);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return { rankings, loading, error, refetch: fetchRankings };
};

/**
 * Hook to calculate fee for a placement
 */
export const useFeeCalculation = () => {
  const [calculating, setCalculating] = useState(false);
  const { toast } = useToast();

  const calculateFee = useCallback(async (
    contractType: 'PERMANENT' | 'CONTRACT',
    salary?: number,
    hourlyRate?: number,
    contractDuration?: number
  ): Promise<FeeCalculation | null> => {
    setCalculating(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/vms/fees/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contractType,
          salary,
          hourlyRate,
          contractDuration,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate fee: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      handleApiError(err, toast);
      return null;
    } finally {
      setCalculating(false);
    }
  }, [toast]);

  return { calculateFee, calculating };
};

/**
 * Hook to submit a candidate
 */
export const useSubmitCandidate = () => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submitCandidate = useCallback(async (candidateData: {
    jobId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    linkedinUrl?: string;
    resumeUrl?: string;
    coverLetter?: string;
    expectedSalary?: number;
    availableFrom?: string;
    skills?: string[];
    yearsOfExperience?: number;
  }): Promise<boolean> => {
    setSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/vms/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(candidateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit candidate');
      }

      toast({
        title: 'Success',
        description: 'Candidate submitted successfully',
      });

      return true;
    } catch (err: any) {
      handleApiError(err, toast);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [toast]);

  return { submitCandidate, submitting };
};

/**
 * Hook to check candidate ownership
 */
export const useCandidateOwnership = (email: string, jobId?: string) => {
  const [ownership, setOwnership] = useState<CandidateOwnership | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkOwnership = useCallback(async () => {
    if (!email) {return;}

    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // First, we need to find the candidate by email
      // This is a simplified approach - in production you'd have a dedicated endpoint
      const response = await fetch(
        `/api/vms/candidates/check-ownership?email=${encodeURIComponent(email)}${jobId ? `&jobId=${jobId}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No ownership found
          setOwnership(null);
          return;
        }
        throw new Error(`Failed to check ownership: ${response.statusText}`);
      }

      const data = await response.json();
      setOwnership(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Ownership check error:', err);
    } finally {
      setLoading(false);
    }
  }, [email, jobId]);

  useEffect(() => {
    if (email) {
      checkOwnership();
    }
  }, [email, checkOwnership]);

  return { ownership, loading, error, refetch: checkOwnership };
};

/**
 * Hook to fetch bureau fee history
 */
export const useBureauFees = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/vms/bureaus/fees', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch fees: ${response.statusText}`);
      }

      const data = await response.json();
      setFees(data);
    } catch (err: any) {
      setError(err.message);
      handleApiError(err, toast);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  return { fees, loading, error, refetch: fetchFees };
};
