/**
 * Bureau Distributions API Client
 *
 * Handles API requests for jobs distributed to bureaus.
 * Includes accept/decline actions, info requests, and detail views.
 *
 * Usage:
 * ```ts
 * import { bureauDistributionApi } from '@/lib/api/bureau-distributions';
 *
 * const jobs = await bureauDistributionApi.getMyJobs();
 * await bureauDistributionApi.acceptJob(distributionId);
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export type DistributionStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type DistributionTier = 'PREMIUM' | 'STANDARD' | 'BASIC';
export type EmploymentType = 'VAST' | 'INTERIM' | 'UITZENDEN';

export interface Distribution {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyId: string;
  location: string;
  employmentType: EmploymentType;
  salaryRange?: string;

  // Distribution specific
  distributionTier: DistributionTier;
  status: DistributionStatus;
  distributedAt: string;
  isExclusive: boolean;
  exclusiveUntil?: string;

  // Candidate limits
  maxCandidates?: number;
  submittedCandidates: number;
  acceptedCandidates: number;
  rejectedCandidates: number;

  // Job details
  description?: string;
  requirements?: string[];
  skills: string[];

  // Actions taken
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  infoRequestedAt?: string;
  infoRequestMessage?: string;
}

export interface DistributionFilters {
  status?: DistributionStatus | 'ALL';
  employmentType?: EmploymentType | 'ALL';
  searchTerm?: string;
}

export interface AcceptJobResponse {
  success: boolean;
  distribution: Distribution;
  message: string;
}

export interface DeclineJobRequest {
  reason: 'NOT_MY_SPECIALIZATION' | 'AT_CAPACITY' | 'LOCATION_NOT_COVERED' | 'OTHER';
  notes?: string;
}

export interface DeclineJobResponse {
  success: boolean;
  message: string;
}

export interface RequestInfoRequest {
  message: string;
}

export interface RequestInfoResponse {
  success: boolean;
  message: string;
  sentAt: string;
}

// ============================================================================
// API Client
// ============================================================================

class BureauDistributionApiClient {
  private baseUrl = '/api/v2/distributions';

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
    return data.data !== undefined ? data.data : data;
  }

  // ========================================================================
  // Jobs Distributed to Bureau
  // ========================================================================

  /**
   * Get all jobs distributed to this bureau
   */
  async getMyJobs(filters?: DistributionFilters): Promise<Distribution[]> {
    const params = new URLSearchParams();

    if (filters?.status && filters.status !== 'ALL') {
      params.append('status', filters.status);
    }

    if (filters?.employmentType && filters.employmentType !== 'ALL') {
      params.append('employmentType', filters.employmentType);
    }

    if (filters?.searchTerm) {
      params.append('search', filters.searchTerm);
    }

    const url = `${this.baseUrl}/my-jobs${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<Distribution[]>(response);
  }

  /**
   * Get detailed view of a specific distribution
   */
  async getDistributionDetail(distributionId: string): Promise<Distribution> {
    const response = await fetch(`${this.baseUrl}/${distributionId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<Distribution>(response);
  }

  // ========================================================================
  // Actions
  // ========================================================================

  /**
   * Accept a job distribution
   */
  async acceptJob(distributionId: string): Promise<AcceptJobResponse> {
    const response = await fetch(`${this.baseUrl}/${distributionId}/accept`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse<AcceptJobResponse>(response);
  }

  /**
   * Decline a job distribution
   */
  async declineJob(
    distributionId: string,
    request: DeclineJobRequest
  ): Promise<DeclineJobResponse> {
    const response = await fetch(`${this.baseUrl}/${distributionId}/decline`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<DeclineJobResponse>(response);
  }

  /**
   * Request more information about a job
   */
  async requestInfo(
    distributionId: string,
    request: RequestInfoRequest
  ): Promise<RequestInfoResponse> {
    const response = await fetch(`${this.baseUrl}/${distributionId}/request-info`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<RequestInfoResponse>(response);
  }

  // ========================================================================
  // Stats
  // ========================================================================

  /**
   * Get summary statistics for received jobs
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    active: number;
    declined: number;
    completed: number;
  }> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const bureauDistributionApi = new BureauDistributionApiClient();

// Export type for use in components
export type { BureauDistributionApiClient };
