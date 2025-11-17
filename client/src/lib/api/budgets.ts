/**
 * Budget API Client
 * Type-safe API client for budget tracking endpoints
 */

import {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
  ListBudgetsQuery,
  ListBudgetsResponse,
  BudgetSummary,
  CreateBudgetAllocationInput,
  BudgetAllocation,
  BudgetTransaction,
  CreateBudgetTransactionInput,
  BudgetForecastResult,
  BudgetAlert,
  CreateBudgetAlertInput,
  BudgetHierarchy,
  BudgetConsolidated,
  BudgetForJob,
} from '@shared/types/budget';

const API_BASE = '/api/v2/vms/budgets';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

/**
 * Fetch helper with error handling
 */
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
        details: data.details,
      };
    }

    return data;
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Budget API Client
 */
export const budgetApi = {
  /**
   * List budgets with filtering and pagination
   */
  async list(query?: Partial<ListBudgetsQuery>): Promise<ApiResponse<ListBudgetsResponse>> {
    const params = new URLSearchParams();

    if (query?.category) {params.append('category', query.category);}
    if (query?.status) {params.append('status', query.status);}
    if (query?.parentBudgetId) {params.append('parentBudgetId', query.parentBudgetId);}
    if (query?.msaId) {params.append('msaId', query.msaId);}
    if (query?.contractId) {params.append('contractId', query.contractId);}
    if (query?.ownerId) {params.append('ownerId', query.ownerId);}
    if (query?.page) {params.append('page', query.page.toString());}
    if (query?.limit) {params.append('limit', query.limit.toString());}

    return apiFetch<ListBudgetsResponse>(
      `${API_BASE}?${params.toString()}`
    );
  },

  /**
   * Get single budget with details
   */
  async get(budgetId: string): Promise<ApiResponse<BudgetSummary>> {
    return apiFetch<BudgetSummary>(`${API_BASE}/${budgetId}`);
  },

  /**
   * Create new budget
   */
  async create(input: CreateBudgetInput): Promise<ApiResponse<Budget>> {
    return apiFetch<Budget>(API_BASE, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Update budget
   */
  async update(
    budgetId: string,
    input: UpdateBudgetInput
  ): Promise<ApiResponse<Budget>> {
    return apiFetch<Budget>(`${API_BASE}/${budgetId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  /**
   * Delete budget
   */
  async delete(budgetId: string): Promise<ApiResponse<{ message: string }>> {
    return apiFetch<{ message: string }>(`${API_BASE}/${budgetId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Allocate budget to MSA/contract/department/project
   */
  async allocate(
    budgetId: string,
    input: CreateBudgetAllocationInput
  ): Promise<ApiResponse<BudgetAllocation>> {
    return apiFetch<BudgetAllocation>(`${API_BASE}/${budgetId}/allocate`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Get budget transactions
   */
  async getTransactions(
    budgetId: string,
    filters?: {
      transaction_type?: string;
      source_type?: string;
      start_date?: string;
      end_date?: string;
      limit?: number;
    }
  ): Promise<ApiResponse<{ transactions: BudgetTransaction[]; summary: any }>> {
    const params = new URLSearchParams();

    if (filters?.transaction_type)
      {params.append('transaction_type', filters.transaction_type);}
    if (filters?.source_type) {params.append('source_type', filters.source_type);}
    if (filters?.start_date) {params.append('start_date', filters.start_date);}
    if (filters?.end_date) {params.append('end_date', filters.end_date);}
    if (filters?.limit) {params.append('limit', filters.limit.toString());}

    return apiFetch<{ transactions: BudgetTransaction[]; summary: any }>(
      `${API_BASE}/${budgetId}/transactions?${params.toString()}`
    );
  },

  /**
   * Create manual budget transaction
   */
  async createTransaction(
    budgetId: string,
    input: CreateBudgetTransactionInput
  ): Promise<ApiResponse<BudgetTransaction>> {
    return apiFetch<BudgetTransaction>(
      `${API_BASE}/${budgetId}/transactions`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
  },

  /**
   * Get budget forecast
   */
  async getForecast(
    budgetId: string,
    days: number = 90
  ): Promise<
    ApiResponse<{
      forecast: BudgetForecastResult[];
      summary: any;
      historical: any[];
    }>
  > {
    return apiFetch(
      `${API_BASE}/${budgetId}/forecast?days=${days}`
    );
  },

  /**
   * Get budget alerts
   */
  async getAlerts(
    budgetId: string,
    triggeredOnly: boolean = false
  ): Promise<ApiResponse<{ alerts: BudgetAlert[]; triggeredCount: number }>> {
    return apiFetch(
      `${API_BASE}/${budgetId}/alerts?triggered=${triggeredOnly}`
    );
  },

  /**
   * Configure budget alert
   */
  async configureAlert(
    budgetId: string,
    input: CreateBudgetAlertInput
  ): Promise<ApiResponse<BudgetAlert>> {
    return apiFetch<BudgetAlert>(`${API_BASE}/${budgetId}/alerts`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Get budget hierarchy
   */
  async getHierarchy(
    rootBudgetId?: string
  ): Promise<ApiResponse<{ hierarchy: BudgetHierarchy[]; totalRootBudgets?: number; totalBudgets?: number }>> {
    const url = rootBudgetId
      ? `${API_BASE}/hierarchy?root_budget_id=${rootBudgetId}`
      : `${API_BASE}/hierarchy`;

    return apiFetch(url);
  },

  /**
   * Get consolidated budget view
   */
  async getConsolidated(
    filters?: { category?: string; status?: string }
  ): Promise<
    ApiResponse<{
      consolidated: BudgetConsolidated[];
      summary: any;
      byCategory: any[];
      byStatus: any[];
    }>
  > {
    const params = new URLSearchParams();
    if (filters?.category) {params.append('category', filters.category);}
    if (filters?.status) {params.append('status', filters.status);}

    return apiFetch(
      `${API_BASE}/consolidated?${params.toString()}`
    );
  },

  /**
   * Get budget for specific job (bureau-facing)
   */
  async getForJob(jobId: string): Promise<ApiResponse<BudgetForJob>> {
    return apiFetch<BudgetForJob>(
      `${API_BASE}/for-job/${jobId}`
    );
  },
};

/**
 * React Query hooks helpers
 */
export const budgetQueryKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetQueryKeys.all, 'list'] as const,
  list: (filters: Partial<ListBudgetsQuery>) =>
    [...budgetQueryKeys.lists(), filters] as const,
  details: () => [...budgetQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetQueryKeys.details(), id] as const,
  transactions: (id: string) => [...budgetQueryKeys.detail(id), 'transactions'] as const,
  forecast: (id: string) => [...budgetQueryKeys.detail(id), 'forecast'] as const,
  alerts: (id: string) => [...budgetQueryKeys.detail(id), 'alerts'] as const,
  hierarchy: (rootId?: string) =>
    [...budgetQueryKeys.all, 'hierarchy', rootId] as const,
  consolidated: (filters?: any) =>
    [...budgetQueryKeys.all, 'consolidated', filters] as const,
  forJob: (jobId: string) => [...budgetQueryKeys.all, 'for-job', jobId] as const,
};

export default budgetApi;
