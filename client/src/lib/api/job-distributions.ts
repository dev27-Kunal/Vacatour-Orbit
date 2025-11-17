/**
 * Job Distribution API Client
 *
 * Handles all API calls for job distribution management.
 * Used by company portal to distribute jobs to bureaus and manage distributions.
 */

import { DistributedJob, DistributionStatus } from '@shared/types/vms';

// ============================================================================
// Types
// ============================================================================

export interface DistributionWithBureau extends DistributedJob {
  bureau: {
    id: string;
    name: string;
    performanceTier: string;
    email: string;
  };
}

export interface DistributeJobResponse {
  success: boolean;
  message: string;
  distributedCount: number;
  distributions: DistributionWithBureau[];
}

export interface DistributionFilters {
  status?: DistributionStatus;
  tier?: string;
  sortBy?: 'name' | 'status' | 'submissions' | 'accepted';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// API Client
// ============================================================================

class JobDistributionApiClient {
  private baseUrl = '/api/v2/jobs';

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('token') || localStorage.getItem('auth_token');
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
    return data.data || data;
  }

  // ========================================================================
  // Distribution Management
  // ========================================================================

  /**
   * Distribute job to all matching bureaus
   * Automatically finds and distributes to bureaus based on specialization/location
   */
  async distributeJob(jobId: string): Promise<DistributeJobResponse> {
    const response = await fetch(`${this.baseUrl}/${jobId}/distribute`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<DistributeJobResponse>(response);
  }

  /**
   * Get all distributions for a job
   */
  async getDistributions(
    jobId: string,
    filters?: DistributionFilters
  ): Promise<DistributionWithBureau[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.tier) params.append('tier', filters.tier);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = `${this.baseUrl}/${jobId}/distributions${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<DistributionWithBureau[]>(response);
  }

  /**
   * Remove distribution (exclude bureau from this job)
   */
  async removeDistribution(jobId: string, bureauId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/${jobId}/distributions/${bureauId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<void>(response);
  }

  /**
   * Update distribution status
   */
  async updateDistribution(
    jobId: string,
    bureauId: string,
    data: { status?: DistributionStatus; notes?: string }
  ): Promise<DistributionWithBureau> {
    const response = await fetch(
      `${this.baseUrl}/${jobId}/distributions/${bureauId}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<DistributionWithBureau>(response);
  }

  /**
   * Get distribution statistics for a job
   */
  async getDistributionStats(jobId: string): Promise<{
    totalDistributed: number;
    byStatus: Record<DistributionStatus, number>;
    byTier: Record<string, number>;
    totalSubmissions: number;
    totalAccepted: number;
  }> {
    const response = await fetch(`${this.baseUrl}/${jobId}/distributions/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const jobDistributionApi = new JobDistributionApiClient();

// Export type for use in components
export type { JobDistributionApiClient };
