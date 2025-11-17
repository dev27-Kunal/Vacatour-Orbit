/**
 * Bureau Portal API Client
 *
 * Centralized API client for Bureau Portal endpoints.
 * Handles authentication, error handling, and data transformation.
 *
 * Usage:
 * ```ts
 * import { bureauPortalApi } from '@/lib/api/bureau-portal';
 *
 * const metrics = await bureauPortalApi.getDashboardMetrics();
 * const jobs = await bureauPortalApi.getAvailableJobs();
 * ```
 */

import { z } from 'zod';

// ============================================================================
// Types
// ============================================================================

export interface DashboardMetrics {
  // Today's Stats
  todayJobsReceived: number;
  todaySubmissions: number;
  todayResponses: number;

  // Week Stats
  weekJobsReceived: number;
  weekSubmissions: number;
  weekPlacements: number;

  // Month Stats
  monthEarnings: number;
  monthEarningsChange: number;
  monthFillRate: number;
  monthFillRateChange: number;

  // Performance
  currentRanking: number;
  rankingChange: number;
  performanceScore: number;
  performanceTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NEW';

  // Active Stats
  activeJobs: number;
  pendingSubmissions: number;
  upcomingDeadlines: number;
}

export interface PerformanceData {
  performanceScore: number;
  performanceTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NEW';
  ranking: number;
  rankingChange: number;
  jobsReceived: number;
  candidatesSubmitted: number;
  placementsMade: number;
  fillRate: number;
  fillRateChange: number;
  acceptanceRate: number;
  acceptanceRateChange: number;
  responseRate: number;
  responseRateChange: number;
  averageTimeToSubmit: number;
  averageTimeToFill: number;
  averageResponseTime: number;
  totalEarnings: number;
  earningsChange: number;
  averageFeePerPlacement: number;
}

export interface JobMatch {
  id: string;
  jobId: string;
  distributionId?: string;
  jobTitle: string;
  companyName: string;
  location: string;
  employmentType: string;
  salaryRange?: string;
  distributionTier?: 'PREMIUM' | 'STANDARD' | 'BASIC';
  distributionStatus?: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  matchScore: number;
  specializationMatch: boolean;
  locationMatch: boolean;
  skills: string[];
  postedAt: string;
  exclusiveUntil?: string;
  maxCandidates?: number;
  submittedCandidates: number;
  description?: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  companyId: string;
  companyName: string;
  contractType: 'MSA' | 'RATE_CARD' | 'INDIVIDUAL';
  status: 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  startDate: string;
  endDate?: string;
  autoRenewal: boolean;
  terminationNoticeDays: number;
  placementFeePercentage?: number;
  hourlyMarkupPercentage?: number;
  fixedPlacementFee?: number;
  paymentTermsDays: number;
  guaranteePeriodDays: number;
  totalPlacements: number;
  totalEarnings: number;
  averageTimeToFill: number;
}

export interface RateCard {
  id: string;
  contractId: string;
  contractNumber: string;
  companyId: string;
  companyName: string;
  roleCategory: string;
  seniorityLevel: string;
  placementFeePercentage?: number;
  hourlyMarkupPercentage?: number;
  fixedFee?: number;
  minimumSalary?: number;
  maximumSalary?: number;
  placementsMade: number;
  totalEarnings: number;
  averagePlacementFee: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
}

// ============================================================================
// API Client
// ============================================================================

class BureauPortalApiClient {
  private baseUrl = '/api/vms/bureaus';

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Create headers with authentication
   */
  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data as T;
  }

  // ========================================================================
  // Dashboard & Metrics
  // ========================================================================

  /**
   * Get enhanced dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await fetch(`${this.baseUrl}/dashboard-metrics`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<DashboardMetrics>(response);
  }

  /**
   * Get performance data for a specific period
   */
  async getPerformanceData(periodDays: number = 30): Promise<PerformanceData> {
    const response = await fetch(
      `${this.baseUrl}/performance?period=${periodDays}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<PerformanceData>(response);
  }

  /**
   * Get performance history for charting
   */
  async getPerformanceHistory(periodDays: number = 30): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/performance-history?period=${periodDays}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<any[]>(response);
  }

  /**
   * Download performance report as PDF
   */
  async downloadPerformanceReport(periodDays: number = 30): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/performance-report?period=${periodDays}`,
      {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    return response.blob();
  }

  // ========================================================================
  // Jobs
  // ========================================================================

  /**
   * Get jobs available to the bureau (distributed + matched)
   */
  async getAvailableJobs(): Promise<JobMatch[]> {
    const response = await fetch(`${this.baseUrl}/available-jobs`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<JobMatch[]>(response);
  }

  /**
   * Get distributed jobs (jobs explicitly distributed to bureau)
   */
  async getDistributedJobs(): Promise<any[]> {
    const response = await fetch('/api/vms/distributed-jobs', {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any[]>(response);
  }

  // ========================================================================
  // Contracts & Rates
  // ========================================================================

  /**
   * Get all contracts for the bureau
   */
  async getContracts(): Promise<Contract[]> {
    const response = await fetch(`${this.baseUrl}/contracts`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Contract[]>(response);
  }

  /**
   * Get rate cards for a specific contract
   */
  async getContractRateCards(contractId: string): Promise<RateCard[]> {
    const response = await fetch(`/api/vms/contracts/${contractId}/rate-cards`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<RateCard[]>(response);
  }

  /**
   * Get all rate cards for the bureau
   */
  async getRateCards(): Promise<RateCard[]> {
    const response = await fetch(`${this.baseUrl}/rate-cards`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<RateCard[]>(response);
  }

  // ========================================================================
  // Candidates
  // ========================================================================

  /**
   * Submit a candidate for a job
   */
  async submitCandidate(data: {
    jobId: string;
    distributionId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    linkedinUrl?: string;
    cvUrl?: string;
    skills?: string[];
    experience?: string;
    availability?: string;
    hourlyRate?: number;
    salaryExpectation?: number;
    notes?: string;
  }): Promise<any> {
    const response = await fetch('/api/vms/candidates', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<any>(response);
  }

  /**
   * Check for duplicate candidate
   */
  async checkDuplicateCandidate(email: string): Promise<{
    isDuplicate: boolean;
    duplicate?: any;
    ownership?: any;
  }> {
    const response = await fetch('/api/vms/candidates/check-duplicate', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });
    return this.handleResponse<any>(response);
  }

  // ========================================================================
  // Fees & Earnings
  // ========================================================================

  /**
   * Get fee earnings data
   */
  async getFeeEarnings(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/fees`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<any>(response);
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const bureauPortalApi = new BureauPortalApiClient();

// Export type for use in components
export type { BureauPortalApiClient };
