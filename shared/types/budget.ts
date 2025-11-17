/**
 * Budget Tracking System Types
 *
 * Type definitions for VMS Phase 4 Budget Tracking.
 * These types match the database schema from migration:
 * - 20250131_002_budget_tracking.sql
 */

import { z } from "zod";

// ============================================================================
// ENUMS - Budget Specific Enumerations
// ============================================================================

/**
 * Budget Categories
 * Defines budget hierarchy levels
 */
export const BudgetCategoryEnum = z.enum([
  'ANNUAL',
  'QUARTERLY',
  'DEPARTMENT',
  'PROJECT',
  'MSA',
  'CONTRACT'
]);
export type BudgetCategory = z.infer<typeof BudgetCategoryEnum>;

/**
 * Budget Status
 * Lifecycle status of a budget
 */
export const BudgetStatusEnum = z.enum([
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'DEPLETED',
  'CLOSED'
]);
export type BudgetStatus = z.infer<typeof BudgetStatusEnum>;

/**
 * Transaction Types
 * Types of budget transactions
 */
export const BudgetTransactionTypeEnum = z.enum([
  'ALLOCATION',
  'DEDUCTION',
  'ADJUSTMENT',
  'REFUND',
  'TRANSFER'
]);
export type BudgetTransactionType = z.infer<typeof BudgetTransactionTypeEnum>;

/**
 * Alert Severity Levels
 * Severity of budget alerts
 */
export const BudgetAlertSeverityEnum = z.enum([
  'INFO',
  'WARNING',
  'CRITICAL',
  'EXCEEDED'
]);
export type BudgetAlertSeverity = z.infer<typeof BudgetAlertSeverityEnum>;

/**
 * Fee Types (from VMS)
 * How bureau fees are calculated
 */
export const FeeTypeEnum = z.enum([
  'PERCENTAGE',
  'FIXED_AMOUNT',
  'HOURLY_MARKUP'
]);
export type FeeType = z.infer<typeof FeeTypeEnum>;

/**
 * Fee Status
 * Status of placement fees
 */
export const FeeStatusEnum = z.enum([
  'CALCULATED',
  'INVOICED',
  'PAID',
  'DISPUTED',
  'WAIVED'
]);
export type FeeStatus = z.infer<typeof FeeStatusEnum>;

/**
 * Allocation Type
 * What the budget is allocated to
 */
export const AllocationTypeEnum = z.enum([
  'MSA',
  'CONTRACT',
  'DEPARTMENT',
  'PROJECT'
]);
export type AllocationType = z.infer<typeof AllocationTypeEnum>;

// ============================================================================
// BUDGET TYPES
// ============================================================================

/**
 * Budget Schema
 * Main budget entity with hierarchical structure
 */
export const BudgetSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Identity
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: BudgetCategoryEnum,

  // Hierarchy
  parentBudgetId: z.string().uuid().optional(),
  hierarchyLevel: z.number().int().min(0).default(0),
  hierarchyPath: z.string().optional(),

  // Financial
  totalAmount: z.number().min(0),
  currency: z.string().length(3).default('EUR'),
  allocatedAmount: z.number().min(0).default(0),
  spentAmount: z.number().min(0).default(0),
  remainingAmount: z.number().min(0),

  // Period
  periodStart: z.date(),
  periodEnd: z.date(),

  // Ownership
  ownerUserId: z.string().uuid(),
  financeTeamIds: z.array(z.string().uuid()).default([]),

  // Status
  status: BudgetStatusEnum.default('DRAFT'),
  isLocked: z.boolean().default(false),

  // Integration
  msaId: z.string().uuid().optional(),
  contractId: z.string().uuid().optional(),
  departmentName: z.string().optional(),
  projectCode: z.string().optional(),

  // Metadata
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid().optional(),
  updatedBy: z.string().uuid().optional(),
});

export type Budget = z.infer<typeof BudgetSchema>;

/**
 * Create Budget Input
 * Used when creating a new budget
 */
export const CreateBudgetInputSchema = BudgetSchema.omit({
  id: true,
  hierarchyLevel: true,
  hierarchyPath: true,
  allocatedAmount: true,
  spentAmount: true,
  remainingAmount: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
}).extend({
  // Make some fields required for creation
  periodStart: z.string().or(z.date()),
  periodEnd: z.string().or(z.date()),
});

export type CreateBudgetInput = z.infer<typeof CreateBudgetInputSchema>;

/**
 * Update Budget Input
 * Used when updating an existing budget
 */
export const UpdateBudgetInputSchema = BudgetSchema.partial().omit({
  id: true,
  tenantId: true,
  hierarchyLevel: true,
  hierarchyPath: true,
  remainingAmount: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export type UpdateBudgetInput = z.infer<typeof UpdateBudgetInputSchema>;

// ============================================================================
// BUDGET ALLOCATION TYPES
// ============================================================================

/**
 * Budget Allocation Schema
 * Links budgets to MSAs, contracts, departments, projects
 */
export const BudgetAllocationSchema = z.object({
  id: z.string().uuid(),
  budgetId: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Target
  allocationType: AllocationTypeEnum,
  targetMsaId: z.string().uuid().optional(),
  targetContractId: z.string().uuid().optional(),
  targetDepartment: z.string().optional(),
  targetProjectCode: z.string().optional(),

  // Amount
  allocatedAmount: z.number().min(0),
  spentAmount: z.number().min(0).default(0),
  remainingAmount: z.number().min(0),

  // Period
  validFrom: z.date(),
  validUntil: z.date().optional(),
  isActive: z.boolean().default(true),

  // Metadata
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid().optional(),
});

export type BudgetAllocation = z.infer<typeof BudgetAllocationSchema>;

/**
 * Create Budget Allocation Input
 */
export const CreateBudgetAllocationInputSchema = BudgetAllocationSchema.omit({
  id: true,
  spentAmount: true,
  remainingAmount: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  validFrom: z.string().or(z.date()),
  validUntil: z.string().or(z.date()).optional(),
});

export type CreateBudgetAllocationInput = z.infer<typeof CreateBudgetAllocationInputSchema>;

// ============================================================================
// BUDGET TRANSACTION TYPES
// ============================================================================

/**
 * Budget Transaction Schema
 * Tracks all budget transactions (auto and manual)
 */
export const BudgetTransactionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  budgetId: z.string().uuid(),
  budgetAllocationId: z.string().uuid().optional(),

  // Transaction
  transactionType: BudgetTransactionTypeEnum,
  amount: z.number(),
  runningBalance: z.number(),

  // Source
  sourceType: z.string().optional(),
  applicationId: z.string().uuid().optional(),
  placementFeeId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  bureauId: z.string().uuid().optional(),
  candidateId: z.string().uuid().optional(),

  // Authorization
  authorizedBy: z.string().uuid().optional(),
  authorizationNotes: z.string().optional(),

  // Metadata
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
  transactionDate: z.date(),
  createdAt: z.date(),
});

export type BudgetTransaction = z.infer<typeof BudgetTransactionSchema>;

/**
 * Create Manual Budget Transaction Input
 */
export const CreateBudgetTransactionInputSchema = z.object({
  budgetId: z.string().uuid(),
  budgetAllocationId: z.string().uuid().optional(),
  transactionType: BudgetTransactionTypeEnum,
  amount: z.number(),
  sourceType: z.string().default('MANUAL'),
  description: z.string().optional(),
  authorizationNotes: z.string().optional(),
  referenceNumber: z.string().optional(),
});

export type CreateBudgetTransactionInput = z.infer<typeof CreateBudgetTransactionInputSchema>;

// ============================================================================
// BUDGET FEE TYPES
// ============================================================================

/**
 * Budget Fee Schema
 * Placement fee tracking for budget deductions
 */
export const BudgetFeeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Application Context
  applicationId: z.string().uuid(),
  jobId: z.string().uuid(),
  bureauId: z.string().uuid(),
  candidateId: z.string().uuid().optional(),

  // Fee Calculation
  feeType: FeeTypeEnum,

  // Candidate Compensation
  candidateHourlyRate: z.number().optional(),
  candidateMonthlySalary: z.number().optional(),
  candidateAnnualSalary: z.number().optional(),

  // Bureau Fees
  feePercentage: z.number().optional(),
  feeAmount: z.number().min(0),

  // Hourly Markup
  bureauHourlyRate: z.number().optional(),
  bureauMarkup: z.number().optional(),

  // Budget Linkage
  budgetId: z.string().uuid().optional(),
  budgetAllocationId: z.string().uuid().optional(),
  budgetTransactionId: z.string().uuid().optional(),

  // Invoice
  invoiceNumber: z.string().optional(),
  invoiceDate: z.date().optional(),
  dueDate: z.date().optional(),
  paidDate: z.date().optional(),

  // Status
  feeStatus: FeeStatusEnum.default('CALCULATED'),

  // Metadata
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BudgetFee = z.infer<typeof BudgetFeeSchema>;

/**
 * Create Budget Fee Input
 */
export const CreateBudgetFeeInputSchema = BudgetFeeSchema.omit({
  id: true,
  budgetTransactionId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  invoiceDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  paidDate: z.string().or(z.date()).optional(),
});

export type CreateBudgetFeeInput = z.infer<typeof CreateBudgetFeeInputSchema>;

// ============================================================================
// BUDGET ALERT TYPES
// ============================================================================

/**
 * Budget Alert Schema
 * Configurable threshold-based alerts
 */
export const BudgetAlertSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  budgetId: z.string().uuid(),

  // Threshold
  thresholdPercentage: z.number().int().min(1).max(200),
  thresholdAmount: z.number().optional(),

  // Alert
  severity: BudgetAlertSeverityEnum,
  isTriggered: z.boolean().default(false),
  triggeredAt: z.date().optional(),

  // Recipients
  recipientUserIds: z.array(z.string().uuid()).default([]),
  recipientRoles: z.array(z.string()).default([]),

  // Notifications
  sendEmail: z.boolean().default(true),
  sendInApp: z.boolean().default(true),
  emailSent: z.boolean().default(false),
  emailSentAt: z.date().optional(),

  // Metadata
  alertMessage: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BudgetAlert = z.infer<typeof BudgetAlertSchema>;

/**
 * Create Budget Alert Input
 */
export const CreateBudgetAlertInputSchema = BudgetAlertSchema.omit({
  id: true,
  tenantId: true,
  thresholdAmount: true,
  isTriggered: true,
  triggeredAt: true,
  emailSent: true,
  emailSentAt: true,
  alertMessage: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateBudgetAlertInput = z.infer<typeof CreateBudgetAlertInputSchema>;

/**
 * Update Budget Alert Input
 */
export const UpdateBudgetAlertInputSchema = BudgetAlertSchema.partial().omit({
  id: true,
  tenantId: true,
  budgetId: true,
  thresholdAmount: true,
  createdAt: true,
  updatedAt: true,
});

export type UpdateBudgetAlertInput = z.infer<typeof UpdateBudgetAlertInputSchema>;

// ============================================================================
// BUDGET FORECAST TYPES
// ============================================================================

/**
 * Budget Forecast Schema
 * 90-day budget forecasting with confidence intervals
 */
export const BudgetForecastSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  budgetId: z.string().uuid(),

  // Forecast Period
  forecastDate: z.date(),
  forecastDaysAhead: z.number().int().min(1).max(90),

  // Predicted Values
  predictedSpend: z.number(),
  confidenceLower: z.number(),
  confidenceUpper: z.number(),

  // Calculation
  calculationMethod: z.string().default('MOVING_AVERAGE_60D'),
  seasonalAdjustmentFactor: z.number().default(1.0),
  dataPointsUsed: z.number().int().optional(),

  // Depletion
  estimatedDepletionDate: z.date().optional(),
  daysUntilDepletion: z.number().int().optional(),

  // Metadata
  calculatedAt: z.date(),
  isActive: z.boolean().default(true),
});

export type BudgetForecast = z.infer<typeof BudgetForecastSchema>;

// ============================================================================
// VIEW TYPES
// ============================================================================

/**
 * Budget Hierarchy View
 * Recursive hierarchy representation
 */
export const BudgetHierarchySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  category: BudgetCategoryEnum,
  parentBudgetId: z.string().uuid().optional(),
  totalAmount: z.number(),
  spentAmount: z.number(),
  remainingAmount: z.number(),
  status: BudgetStatusEnum,
  level: z.number().int(),
  path: z.array(z.string().uuid()),
  fullPath: z.string(),
});

export type BudgetHierarchy = z.infer<typeof BudgetHierarchySchema>;

/**
 * Budget Consolidated View
 * Tenant-level rollup
 */
export const BudgetConsolidatedSchema = z.object({
  tenantId: z.string().uuid(),
  category: BudgetCategoryEnum,
  status: BudgetStatusEnum,
  budgetCount: z.number().int(),
  totalBudget: z.number(),
  totalAllocated: z.number(),
  totalSpent: z.number(),
  totalRemaining: z.number(),
  utilizationPercentage: z.number(),
  earliestStart: z.date(),
  latestEnd: z.date(),
});

export type BudgetConsolidated = z.infer<typeof BudgetConsolidatedSchema>;

/**
 * Budget Utilization
 * Result from calculate_budget_utilization function
 */
export const BudgetUtilizationSchema = z.object({
  utilizationPercentage: z.number(),
  totalAmount: z.number(),
  spentAmount: z.number(),
  remainingAmount: z.number(),
  isOverBudget: z.boolean(),
  daysRemaining: z.number().int(),
  burnRate: z.number(),
});

export type BudgetUtilization = z.infer<typeof BudgetUtilizationSchema>;

/**
 * Budget Hierarchy Tree Node
 * Result from get_budget_hierarchy function
 */
export const BudgetHierarchyNodeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  level: z.number().int(),
  totalAmount: z.number(),
  spentAmount: z.number(),
  remainingAmount: z.number(),
  childCount: z.number().int(),
});

export type BudgetHierarchyNode = z.infer<typeof BudgetHierarchyNodeSchema>;

/**
 * Forecast Result
 * Result from forecast_budget_spend function
 */
export const BudgetForecastResultSchema = z.object({
  forecastDate: z.date(),
  daysAhead: z.number().int(),
  predictedSpend: z.number(),
  confidenceLower: z.number(),
  confidenceUpper: z.number(),
});

export type BudgetForecastResult = z.infer<typeof BudgetForecastResultSchema>;

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * List Budgets Query Parameters
 */
export const ListBudgetsQuerySchema = z.object({
  category: BudgetCategoryEnum.optional(),
  status: BudgetStatusEnum.optional(),
  parentBudgetId: z.string().uuid().optional(),
  msaId: z.string().uuid().optional(),
  contractId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type ListBudgetsQuery = z.infer<typeof ListBudgetsQuerySchema>;

/**
 * List Budgets Response
 */
export const ListBudgetsResponseSchema = z.object({
  budgets: z.array(BudgetSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export type ListBudgetsResponse = z.infer<typeof ListBudgetsResponseSchema>;

/**
 * Get Budget for Job Response (Bureau View)
 */
export const BudgetForJobSchema = z.object({
  jobId: z.string().uuid(),
  hasBudget: z.boolean(),
  budgetRemaining: z.number().optional(), // Only show remaining, not total
  canSubmitCandidates: z.boolean(),
  message: z.string().optional(),
});

export type BudgetForJob = z.infer<typeof BudgetForJobSchema>;

/**
 * Budget Summary (for dashboards)
 */
export const BudgetSummarySchema = z.object({
  budget: BudgetSchema,
  utilization: BudgetUtilizationSchema,
  recentTransactions: z.array(BudgetTransactionSchema),
  activeAlerts: z.array(BudgetAlertSchema),
  childrenCount: z.number().int(),
  totalDescendantSpend: z.number(),
});

export type BudgetSummary = z.infer<typeof BudgetSummarySchema>;

// ============================================================================
// EXPORTS
// ============================================================================

export const BudgetSchemas = {
  // Core
  Budget: BudgetSchema,
  CreateBudgetInput: CreateBudgetInputSchema,
  UpdateBudgetInput: UpdateBudgetInputSchema,

  // Allocations
  BudgetAllocation: BudgetAllocationSchema,
  CreateBudgetAllocationInput: CreateBudgetAllocationInputSchema,

  // Transactions
  BudgetTransaction: BudgetTransactionSchema,
  CreateBudgetTransactionInput: CreateBudgetTransactionInputSchema,

  // Fees
  BudgetFee: BudgetFeeSchema,
  CreateBudgetFeeInput: CreateBudgetFeeInputSchema,

  // Alerts
  BudgetAlert: BudgetAlertSchema,
  CreateBudgetAlertInput: CreateBudgetAlertInputSchema,
  UpdateBudgetAlertInput: UpdateBudgetAlertInputSchema,

  // Forecasts
  BudgetForecast: BudgetForecastSchema,
  BudgetForecastResult: BudgetForecastResultSchema,

  // Views
  BudgetHierarchy: BudgetHierarchySchema,
  BudgetConsolidated: BudgetConsolidatedSchema,
  BudgetUtilization: BudgetUtilizationSchema,
  BudgetHierarchyNode: BudgetHierarchyNodeSchema,

  // API
  ListBudgetsQuery: ListBudgetsQuerySchema,
  ListBudgetsResponse: ListBudgetsResponseSchema,
  BudgetForJob: BudgetForJobSchema,
  BudgetSummary: BudgetSummarySchema,
};

/**
 * Helper: Map database column names to camelCase
 */
export function mapBudgetFromDb(row: any): Budget {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description,
    category: row.category,
    parentBudgetId: row.parent_budget_id,
    hierarchyLevel: row.hierarchy_level,
    hierarchyPath: row.hierarchy_path,
    totalAmount: parseFloat(row.total_amount),
    currency: row.currency,
    allocatedAmount: parseFloat(row.allocated_amount || 0),
    spentAmount: parseFloat(row.spent_amount || 0),
    remainingAmount: parseFloat(row.remaining_amount || 0),
    periodStart: new Date(row.period_start),
    periodEnd: new Date(row.period_end),
    ownerUserId: row.owner_user_id,
    financeTeamIds: row.finance_team_ids || [],
    status: row.status,
    isLocked: row.is_locked,
    msaId: row.msa_id,
    contractId: row.contract_id,
    departmentName: row.department_name,
    projectCode: row.project_code,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

/**
 * Helper: Map camelCase to database column names
 */
export function mapBudgetToDb(budget: Partial<Budget>): any {
  return {
    tenant_id: budget.tenantId,
    name: budget.name,
    description: budget.description,
    category: budget.category,
    parent_budget_id: budget.parentBudgetId,
    total_amount: budget.totalAmount,
    currency: budget.currency,
    period_start: budget.periodStart,
    period_end: budget.periodEnd,
    owner_user_id: budget.ownerUserId,
    finance_team_ids: budget.financeTeamIds,
    status: budget.status,
    is_locked: budget.isLocked,
    msa_id: budget.msaId,
    contract_id: budget.contractId,
    department_name: budget.departmentName,
    project_code: budget.projectCode,
    notes: budget.notes,
  };
}
