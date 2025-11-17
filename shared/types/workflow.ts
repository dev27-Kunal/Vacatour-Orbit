/**
 * Workflow Automation Types
 *
 * Type definitions for the Workflow Automation Engine (Phase 3).
 * These types match the database schema from migration:
 * - 20250131_001_workflow_automation_engine.sql
 */

import { z } from "zod";

// ============================================================================
// ENUMS - Workflow Specific Enumerations
// ============================================================================

/**
 * Workflow Categories
 */
export const WorkflowCategoryEnum = z.enum([
  'JOB_DISTRIBUTION',
  'CANDIDATE_SCREENING',
  'BUREAU_SELECTION',
  'COMMUNICATION',
  'REMINDER',
  'FEE_CALCULATION',
  'PERFORMANCE_TRACKING'
]);
export type WorkflowCategory = z.infer<typeof WorkflowCategoryEnum>;

/**
 * Workflow Trigger Types
 */
export const WorkflowTriggerTypeEnum = z.enum([
  'JOB_CREATED',
  'JOB_UPDATED',
  'JOB_CLOSED',
  'APPLICATION_RECEIVED',
  'APPLICATION_STATUS_CHANGED',
  'CANDIDATE_SUBMITTED',
  'BUREAU_SELECTED',
  'DEADLINE_APPROACHING',
  'SLA_BREACH',
  'SCHEDULED',
  'MANUAL'
]);
export type WorkflowTriggerType = z.infer<typeof WorkflowTriggerTypeEnum>;

/**
 * Workflow Instance Status
 */
export const WorkflowInstanceStatusEnum = z.enum([
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'PAUSED'
]);
export type WorkflowInstanceStatus = z.infer<typeof WorkflowInstanceStatusEnum>;

/**
 * Workflow Step Types
 */
export const WorkflowStepTypeEnum = z.enum([
  'ACTION',      // Execute an action
  'CONDITION',   // Evaluate a condition
  'WAIT',        // Wait for duration or event
  'PARALLEL',    // Execute multiple steps in parallel
  'LOOP'         // Repeat steps
]);
export type WorkflowStepType = z.infer<typeof WorkflowStepTypeEnum>;

/**
 * Action Types
 */
export const ActionTypeEnum = z.enum([
  'SEND_EMAIL',
  'SEND_NOTIFICATION',
  'UPDATE_STATUS',
  'SELECT_BUREAU',
  'DISTRIBUTE_JOB',
  'CALCULATE_FEE',
  'CALCULATE_MATCH_SCORE',
  'CREATE_REMINDER',
  'REJECT_APPLICATION',
  'APPROVE_APPLICATION',
  'ASSIGN_TASK',
  'UPDATE_METRICS',
  'TRIGGER_WORKFLOW',
  'CALL_API'
]);
export type ActionType = z.infer<typeof ActionTypeEnum>;

/**
 * Automation Rule Types
 */
export const AutomationRuleTypeEnum = z.enum([
  'BUREAU_SELECTION',
  'CANDIDATE_SCREENING',
  'AUTO_REJECT',
  'AUTO_APPROVE',
  'FEE_CALCULATION',
  'SLA_ENFORCEMENT',
  'SMART_DISTRIBUTION',
  'QUALITY_CHECK'
]);
export type AutomationRuleType = z.infer<typeof AutomationRuleTypeEnum>;

/**
 * Template Response Categories
 */
export const TemplateResponseCategoryEnum = z.enum([
  'REJECTION',
  'APPROVAL',
  'REMINDER',
  'REQUEST_INFO',
  'THANK_YOU',
  'WELCOME',
  'FOLLOW_UP',
  'STATUS_UPDATE',
  'SLA_WARNING'
]);
export type TemplateResponseCategory = z.infer<typeof TemplateResponseCategoryEnum>;

/**
 * Recipient Types
 */
export const RecipientTypeEnum = z.enum([
  'BUREAU',
  'CANDIDATE',
  'HIRING_MANAGER',
  'INTERNAL',
  'ADMIN'
]);
export type RecipientType = z.infer<typeof RecipientTypeEnum>;

/**
 * Reminder Types
 */
export const ReminderTypeEnum = z.enum([
  'BUREAU_NO_RESPONSE',
  'MISSING_CANDIDATES',
  'SLA_DEADLINE',
  'CONTRACT_EXPIRY',
  'INTERVIEW_SCHEDULED',
  'FEEDBACK_REQUESTED',
  'DOCUMENT_REQUIRED',
  'FOLLOW_UP'
]);
export type ReminderType = z.infer<typeof ReminderTypeEnum>;

/**
 * Reminder Status
 */
export const ReminderStatusEnum = z.enum([
  'SCHEDULED',
  'SENT',
  'FAILED',
  'CANCELLED',
  'ACKNOWLEDGED'
]);
export type ReminderStatus = z.infer<typeof ReminderStatusEnum>;

/**
 * Smart Match Recommendation
 */
export const MatchRecommendationEnum = z.enum([
  'STRONG_MATCH',
  'GOOD_MATCH',
  'FAIR_MATCH',
  'WEAK_MATCH',
  'NO_MATCH'
]);
export type MatchRecommendation = z.infer<typeof MatchRecommendationEnum>;

/**
 * Bulk Action Types
 */
export const BulkActionTypeEnum = z.enum([
  'BULK_APPROVE',
  'BULK_REJECT',
  'BULK_DISTRIBUTE',
  'BULK_MESSAGE',
  'BULK_UPDATE_STATUS',
  'BULK_ASSIGN',
  'BULK_TAG'
]);
export type BulkActionType = z.infer<typeof BulkActionTypeEnum>;

/**
 * Bulk Action Status
 */
export const BulkActionStatusEnum = z.enum([
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'PARTIALLY_COMPLETED'
]);
export type BulkActionStatus = z.infer<typeof BulkActionStatusEnum>;

// ============================================================================
// WORKFLOW TEMPLATES
// ============================================================================

export const WorkflowTemplateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Template Details
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: WorkflowCategoryEnum,

  // Workflow Configuration
  triggerType: WorkflowTriggerTypeEnum,
  triggerConfig: z.record(z.any()).default({}),

  // Execution Settings
  isActive: z.boolean().default(true),
  priority: z.number().min(1).max(10).default(5),
  maxParallelExecutions: z.number().default(1),
  retryOnFailure: z.boolean().default(true),
  maxRetries: z.number().default(3),

  // Metadata
  createdBy: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  version: z.number().default(1),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>;

export const CreateWorkflowTemplateSchema = WorkflowTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateWorkflowTemplate = z.infer<typeof CreateWorkflowTemplateSchema>;

// ============================================================================
// WORKFLOW INSTANCES
// ============================================================================

export const WorkflowInstanceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  templateId: z.string().uuid().optional(),

  // Execution Context
  triggeredBy: z.string(),
  triggeredByUserId: z.string().uuid().optional(),
  context: z.record(z.any()).default({}),

  // Status
  status: WorkflowInstanceStatusEnum,
  currentStepIndex: z.number().default(0),

  // Execution Details
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  errorMessage: z.string().optional(),
  retryCount: z.number().default(0),

  // Results
  executionLog: z.array(z.any()).default([]),
  outputData: z.record(z.any()).default({}),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowInstance = z.infer<typeof WorkflowInstanceSchema>;

// ============================================================================
// WORKFLOW STEPS
// ============================================================================

export const WorkflowStepSchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid(),

  // Step Details
  stepName: z.string().min(1).max(255),
  stepType: WorkflowStepTypeEnum,
  stepOrder: z.number(),

  // Step Configuration
  actionType: ActionTypeEnum.optional(),
  actionConfig: z.record(z.any()).default({}),

  // Conditional Logic
  conditionExpression: z.string().optional(),
  conditionConfig: z.record(z.any()).default({}),

  // Flow Control
  onSuccessStepId: z.string().uuid().optional(),
  onFailureStepId: z.string().uuid().optional(),
  isParallel: z.boolean().default(false),

  // Execution Settings
  timeoutSeconds: z.number().default(300),
  retryOnFailure: z.boolean().default(false),
  maxRetries: z.number().default(3),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

// ============================================================================
// WORKFLOW TRIGGERS
// ============================================================================

export const WorkflowTriggerSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  templateId: z.string().uuid(),

  // Trigger Configuration
  eventType: z.string(),
  entityType: z.enum(['JOB', 'APPLICATION', 'CANDIDATE', 'BUREAU', 'CONTRACT']),

  // Conditions
  filterConditions: z.record(z.any()).default({}),

  // Timing
  delaySeconds: z.number().default(0),
  scheduleCron: z.string().optional(),

  // Status
  isActive: z.boolean().default(true),
  lastTriggeredAt: z.date().optional(),
  triggerCount: z.number().default(0),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowTrigger = z.infer<typeof WorkflowTriggerSchema>;

// ============================================================================
// AUTOMATION RULES
// ============================================================================

export const AutomationRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Rule Details
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  ruleType: AutomationRuleTypeEnum,

  // Rule Configuration
  conditions: z.record(z.any()),
  actions: z.record(z.any()),

  // Priority & Execution
  priority: z.number().min(1).max(10).default(5),
  isActive: z.boolean().default(true),

  // Scope
  appliesToJobs: z.array(z.string()).optional(),
  appliesToBureaus: z.array(z.string()).optional(),
  appliesToCategories: z.array(z.string()).optional(),

  // Statistics
  executionCount: z.number().default(0),
  lastExecutedAt: z.date().optional(),
  successCount: z.number().default(0),
  failureCount: z.number().default(0),

  createdBy: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AutomationRule = z.infer<typeof AutomationRuleSchema>;

export const CreateAutomationRuleSchema = AutomationRuleSchema.omit({
  id: true,
  executionCount: true,
  lastExecutedAt: true,
  successCount: true,
  failureCount: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateAutomationRule = z.infer<typeof CreateAutomationRuleSchema>;

// ============================================================================
// TEMPLATE RESPONSES
// ============================================================================

export const TemplateResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Template Details
  name: z.string().min(1).max(255),
  category: TemplateResponseCategoryEnum,
  subject: z.string().max(500).optional(),
  body: z.string().min(1),

  // Template Variables
  variables: z.array(z.string()).default([]),

  // Target Audience
  recipientType: RecipientTypeEnum,

  // Usage
  isDefault: z.boolean().default(false),
  usageCount: z.number().default(0),
  lastUsedAt: z.date().optional(),

  // Metadata
  tags: z.array(z.string()).default([]),
  createdBy: z.string().uuid().optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TemplateResponse = z.infer<typeof TemplateResponseSchema>;

export const CreateTemplateResponseSchema = TemplateResponseSchema.omit({
  id: true,
  usageCount: true,
  lastUsedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateTemplateResponse = z.infer<typeof CreateTemplateResponseSchema>;

// ============================================================================
// AUTOMATED REMINDERS
// ============================================================================

export const AutomatedReminderSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Reminder Context
  entityType: z.enum(['JOB', 'APPLICATION', 'CONTRACT', 'BUREAU']),
  entityId: z.string().uuid(),

  // Reminder Details
  reminderType: ReminderTypeEnum,
  message: z.string().min(1),

  // Recipients
  recipientUserIds: z.array(z.string().uuid()),
  notificationChannels: z.array(z.enum(['EMAIL', 'IN_APP', 'SMS', 'PUSH'])).default(['EMAIL', 'IN_APP']),

  // Scheduling
  remindAt: z.date(),
  recurring: z.boolean().default(false),
  recurrenceInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  recurrenceCount: z.number().default(0),

  // Status
  status: ReminderStatusEnum.default('SCHEDULED'),
  sentAt: z.date().optional(),
  errorMessage: z.string().optional(),

  // Metadata
  createdBy: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AutomatedReminder = z.infer<typeof AutomatedReminderSchema>;

export const CreateAutomatedReminderSchema = AutomatedReminderSchema.omit({
  id: true,
  status: true,
  sentAt: true,
  recurrenceCount: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateAutomatedReminder = z.infer<typeof CreateAutomatedReminderSchema>;

// ============================================================================
// SMART MATCHING SCORES
// ============================================================================

export const SmartMatchingScoreSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Matching Context
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  applicationId: z.string().uuid().optional(),

  // Matching Scores (0-100)
  overallScore: z.number().min(0).max(100),
  skillsMatchScore: z.number().min(0).max(100).default(0),
  experienceMatchScore: z.number().min(0).max(100).default(0),
  educationMatchScore: z.number().min(0).max(100).default(0),
  locationMatchScore: z.number().min(0).max(100).default(0),
  availabilityMatchScore: z.number().min(0).max(100).default(0),
  salaryMatchScore: z.number().min(0).max(100).default(0),

  // Bureau Performance Factor
  bureauId: z.string().uuid().optional(),
  bureauQualityScore: z.number().min(0).max(100).default(0),

  // Detailed Analysis
  matchingDetails: z.record(z.any()).default({}),

  // Ranking
  rankInJob: z.number().optional(),
  percentile: z.number().min(0).max(100).optional(),

  // Recommendation
  recommendation: MatchRecommendationEnum,
  recommendationReason: z.string().optional(),

  // Metadata
  calculatedAt: z.date(),
  algorithmVersion: z.string().default('1.0'),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SmartMatchingScore = z.infer<typeof SmartMatchingScoreSchema>;

export const CalculateMatchScoreInputSchema = z.object({
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  applicationId: z.string().uuid().optional(),
});

export type CalculateMatchScoreInput = z.infer<typeof CalculateMatchScoreInputSchema>;

// ============================================================================
// BULK ACTIONS
// ============================================================================

export const BulkActionLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Action Details
  actionType: BulkActionTypeEnum,
  entityType: z.enum(['APPLICATION', 'CANDIDATE', 'JOB', 'BUREAU']),
  affectedEntityIds: z.array(z.string().uuid()),

  // Execution
  executedBy: z.string().uuid(),
  executionParameters: z.record(z.any()).default({}),

  // Results
  totalCount: z.number(),
  successCount: z.number().default(0),
  failureCount: z.number().default(0),
  skippedCount: z.number().default(0),

  // Error Details
  errors: z.array(z.any()).default([]),

  // Status
  status: BulkActionStatusEnum.default('IN_PROGRESS'),
  startedAt: z.date(),
  completedAt: z.date().optional(),

  createdAt: z.date(),
});

export type BulkActionLog = z.infer<typeof BulkActionLogSchema>;

export const BulkActionInputSchema = z.object({
  actionType: BulkActionTypeEnum,
  entityType: z.enum(['APPLICATION', 'CANDIDATE', 'JOB', 'BUREAU']),
  entityIds: z.array(z.string().uuid()).min(1),
  parameters: z.record(z.any()).optional(),
});

export type BulkActionInput = z.infer<typeof BulkActionInputSchema>;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Workflow Execution Context
 */
export const WorkflowExecutionContextSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  candidateId: z.string().uuid().optional(),
  bureauId: z.string().uuid().optional(),
  metadata: z.record(z.any()).default({}),
});

export type WorkflowExecutionContext = z.infer<typeof WorkflowExecutionContextSchema>;

/**
 * Template Variable Substitution
 */
export const TemplateVariablesSchema = z.object({
  candidateName: z.string().optional(),
  jobTitle: z.string().optional(),
  bureauName: z.string().optional(),
  companyName: z.string().optional(),
  deadline: z.string().optional(),
  customFields: z.record(z.string()).optional(),
});

export type TemplateVariables = z.infer<typeof TemplateVariablesSchema>;

/**
 * Automation Rule Condition
 */
export const RuleConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['equals', 'notEquals', 'greaterThan', 'lessThan', 'contains', 'in', 'notIn']),
  value: z.any(),
});

export type RuleCondition = z.infer<typeof RuleConditionSchema>;

/**
 * Automation Rule Action
 */
export const RuleActionSchema = z.object({
  actionType: ActionTypeEnum,
  parameters: z.record(z.any()),
});

export type RuleAction = z.infer<typeof RuleActionSchema>;

// ============================================================================
// EXPORTS
// ============================================================================

export const WorkflowSchemas = {
  WorkflowTemplate: WorkflowTemplateSchema,
  CreateWorkflowTemplate: CreateWorkflowTemplateSchema,
  WorkflowInstance: WorkflowInstanceSchema,
  WorkflowStep: WorkflowStepSchema,
  WorkflowTrigger: WorkflowTriggerSchema,
  AutomationRule: AutomationRuleSchema,
  CreateAutomationRule: CreateAutomationRuleSchema,
  TemplateResponse: TemplateResponseSchema,
  CreateTemplateResponse: CreateTemplateResponseSchema,
  AutomatedReminder: AutomatedReminderSchema,
  CreateAutomatedReminder: CreateAutomatedReminderSchema,
  SmartMatchingScore: SmartMatchingScoreSchema,
  CalculateMatchScoreInput: CalculateMatchScoreInputSchema,
  BulkActionLog: BulkActionLogSchema,
  BulkActionInput: BulkActionInputSchema,
  WorkflowExecutionContext: WorkflowExecutionContextSchema,
  TemplateVariables: TemplateVariablesSchema,
  RuleCondition: RuleConditionSchema,
  RuleAction: RuleActionSchema,
};
