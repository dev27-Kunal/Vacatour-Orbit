/**
 * VMS (Vendor Management System) Types
 *
 * Type definitions for the VMS Phase 1 implementation.
 * These types match the database schema from migrations:
 * - 20250122_002_vms_phase1_foundation.sql
 * - 20250122_003_vms_rls_policies.sql
 * - 20250122_004_vms_triggers_functions.sql
 */

import { z } from "zod";

// ============================================================================
// ENUMS - VMS Specific Enumerations
// ============================================================================

/**
 * Bureau Specialization Categories
 * Defines the main expertise areas for bureaus
 */
export const BureauSpecializationCategoryEnum = z.enum([
  'IT',
  'FINANCE',
  'SALES',
  'MARKETING',
  'HR',
  'OPERATIONS',
  'ENGINEERING',
  'HEALTHCARE',
  'LEGAL',
  'CREATIVE',
  'LOGISTICS',
  'GENERAL'
]);
export type BureauSpecializationCategory = z.infer<typeof BureauSpecializationCategoryEnum>;

/**
 * Seniority Levels
 * Used for candidate classification and matching
 */
export const SeniorityLevelEnum = z.enum([
  'JUNIOR',
  'MEDIOR',
  'SENIOR',
  'LEAD',
  'MANAGEMENT',
  'EXECUTIVE'
]);
export type SeniorityLevel = z.infer<typeof SeniorityLevelEnum>;

/**
 * Distribution Tiers
 * Defines priority tiers for selective job distribution
 */
export const DistributionTierEnum = z.enum([
  'PREMIUM',    // Top performers, exclusive first access
  'STANDARD',   // Regular tier
  'BASIC'       // Lower tier or new bureaus
]);
export type DistributionTier = z.infer<typeof DistributionTierEnum>;

/**
 * Distribution Status
 * Tracks the status of job distributions to bureaus
 */
export const DistributionStatusEnum = z.enum([
  'PENDING',    // Not yet distributed
  'ACTIVE',     // Currently active
  'PAUSED',     // Temporarily paused
  'COMPLETED',  // Distribution ended (job filled)
  'CANCELLED'   // Distribution cancelled
]);
export type DistributionStatus = z.infer<typeof DistributionStatusEnum>;

/**
 * Fee Calculation Types
 * Defines how bureau fees are calculated
 */
export const FeeCalculationTypeEnum = z.enum([
  'PERCENTAGE',      // % of annual salary (for permanent roles)
  'FIXED_AMOUNT',    // Fixed placement fee
  'HOURLY_MARKUP'    // % markup on hourly rate (for interim/temp)
]);
export type FeeCalculationType = z.infer<typeof FeeCalculationTypeEnum>;

/**
 * Performance Tier
 * Bureau performance classification
 */
export const PerformanceTierEnum = z.enum([
  'PLATINUM',  // Top 5%
  'GOLD',      // Top 20%
  'SILVER',    // Top 50%
  'BRONZE',    // Below 50%
  'NEW'        // New bureau, no history
]);
export type PerformanceTier = z.infer<typeof PerformanceTierEnum>;

/**
 * Job Visibility Mode
 * Controls which bureaus can see a job
 */
export const VisibilityModeEnum = z.enum([
  'PUBLIC',      // All bureaus can see
  'SELECTIVE',   // Only distributed bureaus
  'EXCLUSIVE'    // Single bureau exclusive
]);
export type VisibilityMode = z.infer<typeof VisibilityModeEnum>;

// ============================================================================
// CANDIDATE TYPES
// ============================================================================

/**
 * Candidate Schema
 * Central candidate entity - candidates are now first-class citizens
 */
export const CandidateSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phone: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  linkedinUrl: z.string().url().optional(),
  cvUrl: z.string().url().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.string().optional(),
  education: z.string().optional(),
  availability: z.string().optional(),
  preferredLocations: z.array(z.string()).default([]),
  salaryExpectation: z.number().optional(),
  hourlyRate: z.number().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Candidate = z.infer<typeof CandidateSchema>;

/**
 * Create Candidate Input
 * Used when submitting a new candidate
 */
export const CreateCandidateInputSchema = CandidateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateCandidateInput = z.infer<typeof CreateCandidateInputSchema>;

// ============================================================================
// BUREAU CANDIDATE OWNERSHIP
// ============================================================================

/**
 * Bureau Candidate Ownership
 * Tracks which bureau submitted a candidate first (1-year fee protection)
 */
export const BureauCandidateOwnershipSchema = z.object({
  id: z.string().uuid(),
  bureauId: z.string().uuid(),
  candidateId: z.string().uuid(),
  submittedAt: z.date(),
  ownershipExpiresAt: z.date(), // 1 year from submission
  jobId: z.string().uuid().optional(),
  feeProtected: z.boolean().default(true),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BureauCandidateOwnership = z.infer<typeof BureauCandidateOwnershipSchema>;

// ============================================================================
// BUREAU SPECIALIZATIONS
// ============================================================================

/**
 * Bureau Specialization
 * Defines bureau expertise areas for intelligent matching
 */
export const BureauSpecializationSchema = z.object({
  id: z.string().uuid(),
  bureauId: z.string().uuid(),
  category: BureauSpecializationCategoryEnum,
  subcategory: z.string(), // e.g., "Software Development" under IT
  matchPriority: z.number().min(1).max(10).default(5), // 1=low, 10=high
  yearsExperience: z.number().optional(),
  certifications: z.array(z.string()).default([]),
  successRate: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BureauSpecialization = z.infer<typeof BureauSpecializationSchema>;

// ============================================================================
// BUREAU GEOGRAPHIC COVERAGE
// ============================================================================

/**
 * Bureau Geographic Coverage
 * Defines which regions/cities a bureau operates in
 */
export const BureauGeographicCoverageSchema = z.object({
  id: z.string().uuid(),
  bureauId: z.string().uuid(),
  country: z.string().default('Netherlands'),
  province: z.string().optional(),
  city: z.string().optional(),
  postalCodePrefix: z.string().optional(), // e.g., "10" for Amsterdam area
  coverageRadius: z.number().optional(), // km radius from city center
  isPrimary: z.boolean().default(false), // Primary operating region
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BureauGeographicCoverage = z.infer<typeof BureauGeographicCoverageSchema>;

// ============================================================================
// DISTRIBUTED JOBS
// ============================================================================

/**
 * Distributed Job
 * Tracks selective distribution of jobs to specific bureaus
 */
export const DistributedJobSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  bureauId: z.string().uuid(),
  distributedAt: z.date(),
  distributionTier: DistributionTierEnum,
  status: DistributionStatusEnum,
  exclusiveUntil: z.date().optional(), // Exclusive access period
  maxCandidates: z.number().optional(), // Limit submissions
  submittedCandidates: z.number().default(0),
  acceptedCandidates: z.number().default(0),
  rejectedCandidates: z.number().default(0),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DistributedJob = z.infer<typeof DistributedJobSchema>;

/**
 * Create Distributed Job Input
 * Used when distributing a job to bureaus
 */
export const CreateDistributedJobInputSchema = DistributedJobSchema.omit({
  id: true,
  distributedAt: true,
  submittedCandidates: true,
  acceptedCandidates: true,
  rejectedCandidates: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateDistributedJobInput = z.infer<typeof CreateDistributedJobInputSchema>;

// ============================================================================
// BUREAU PERFORMANCE METRICS
// ============================================================================

/**
 * Bureau Performance Metrics
 * Tracks bureau performance over time for data-driven decisions
 */
export const BureauPerformanceMetricsSchema = z.object({
  id: z.string().uuid(),
  bureauId: z.string().uuid(),
  periodStart: z.date(),
  periodEnd: z.date(),

  // Volume Metrics
  jobsReceived: z.number().default(0),
  candidatesSubmitted: z.number().default(0),
  placementsMade: z.number().default(0),

  // Quality Metrics
  fillRate: z.number().min(0).max(100).default(0), // % jobs filled
  acceptanceRate: z.number().min(0).max(100).default(0), // % candidates accepted

  // Speed Metrics
  averageTimeToSubmit: z.number().optional(), // Days
  averageTimeToFill: z.number().optional(), // Days

  // Response Metrics
  responseRate: z.number().min(0).max(100).default(0), // % responded
  averageResponseTime: z.number().optional(), // Hours

  // Overall Score
  performanceScore: z.number().min(0).max(100).default(0),
  performanceTier: PerformanceTierEnum,
  ranking: z.number().optional(), // Overall ranking among bureaus

  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BureauPerformanceMetrics = z.infer<typeof BureauPerformanceMetricsSchema>;

// ============================================================================
// BUREAU FEE STRUCTURES
// ============================================================================

/**
 * Bureau Fee Structure
 * Defines how a bureau charges for placements
 */
export const BureauFeeStructureSchema = z.object({
  id: z.string().uuid(),
  bureauId: z.string().uuid(),

  // Fee Configuration
  feeType: FeeCalculationTypeEnum,

  // Percentage-based (for permanent roles)
  placementFeePercentage: z.number().min(0).max(100).optional(), // e.g., 15%

  // Fixed amount
  fixedPlacementFee: z.number().min(0).optional(),

  // Hourly markup (for interim/temp)
  hourlyMarkupPercentage: z.number().min(0).max(100).optional(), // e.g., 20%

  // Volume Discounts
  volumeTier: z.string().optional(), // e.g., "1-5", "6-10", "11+"
  discountPercentage: z.number().min(0).max(100).default(0),

  // Contract Terms
  paymentTermsDays: z.number().default(30), // Net 30, Net 60, etc.
  guaranteePeriodDays: z.number().default(90), // Replacement guarantee

  // Validity
  validFrom: z.date(),
  validUntil: z.date().optional(),
  isActive: z.boolean().default(true),

  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BureauFeeStructure = z.infer<typeof BureauFeeStructureSchema>;

// ============================================================================
// PLACEMENT FEES
// ============================================================================

/**
 * Placement Fee
 * Actual fees calculated and tracked per placement
 */
export const PlacementFeeSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  bureauId: z.string().uuid(),
  candidateId: z.string().uuid(),
  jobId: z.string().uuid(),
  feeStructureId: z.string().uuid().optional(),

  // Candidate Compensation
  candidateHourlyRate: z.number().optional(),
  candidateMonthlySalary: z.number().optional(),
  candidateAnnualSalary: z.number().optional(),

  // Bureau Fees
  feeType: FeeCalculationTypeEnum,
  feePercentage: z.number().optional(),
  feeAmount: z.number().min(0), // Calculated fee

  // Hourly Markup Details (for interim/temp)
  bureauHourlyRate: z.number().optional(), // What bureau charges
  bureauMarkup: z.number().optional(), // Difference between candidate and bureau rate

  // Invoice Tracking
  invoiceNumber: z.string().optional(),
  invoiceDate: z.date().optional(),
  dueDate: z.date().optional(),
  paidDate: z.date().optional(),

  // Status
  feeStatus: z.enum(['CALCULATED', 'INVOICED', 'PAID', 'DISPUTED', 'WAIVED']).default('CALCULATED'),

  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PlacementFee = z.infer<typeof PlacementFeeSchema>;

// ============================================================================
// EXTENDED JOB TYPE (with VMS fields)
// ============================================================================

/**
 * Job with VMS Fields
 * Extended job type including VMS-specific fields
 */
export const JobWithVMSFieldsSchema = z.object({
  // ... existing job fields would be here
  visibilityMode: VisibilityModeEnum.default('PUBLIC'),
  requiresDistribution: z.boolean().default(false),
  maxBureaus: z.number().optional(), // Limit number of bureaus
  distributionStartDate: z.date().optional(),
  distributionEndDate: z.date().optional(),
});

export type JobWithVMSFields = z.infer<typeof JobWithVMSFieldsSchema>;

// ============================================================================
// EXTENDED APPLICATION TYPE (with VMS fields)
// ============================================================================

/**
 * Application with VMS Fields
 * Extended application type including candidate and bureau references
 */
export const ApplicationWithVMSFieldsSchema = z.object({
  // ... existing application fields
  candidateId: z.string().uuid().optional(),
  bureauId: z.string().uuid().optional(),
});

export type ApplicationWithVMSFields = z.infer<typeof ApplicationWithVMSFieldsSchema>;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Bureau Match Result
 * Result from the match_bureaus_to_job() function
 */
export const BureauMatchResultSchema = z.object({
  bureauId: z.string().uuid(),
  bureauName: z.string(),
  matchScore: z.number().min(0).max(100),
  specializationMatch: z.boolean(),
  locationMatch: z.boolean(),
  performanceScore: z.number().min(0).max(100),
  performanceTier: PerformanceTierEnum,
  fillRate: z.number().min(0).max(100),
  recommendedTier: DistributionTierEnum,
});

export type BureauMatchResult = z.infer<typeof BureauMatchResultSchema>;

/**
 * Duplicate Candidate Check Result
 * Result from check_duplicate_candidate() function
 */
export const DuplicateCandidateResultSchema = z.object({
  candidateId: z.string().uuid(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  matchReason: z.enum(['EMAIL', 'PHONE', 'NAME', 'MULTIPLE']),
  existingBureauId: z.string().uuid().optional(),
  ownershipExpiresAt: z.date().optional(),
});

export type DuplicateCandidateResult = z.infer<typeof DuplicateCandidateResultSchema>;

// ============================================================================
// EXPORTS
// ============================================================================

export const VMSSchemas = {
  Candidate: CandidateSchema,
  CreateCandidateInput: CreateCandidateInputSchema,
  BureauCandidateOwnership: BureauCandidateOwnershipSchema,
  BureauSpecialization: BureauSpecializationSchema,
  BureauGeographicCoverage: BureauGeographicCoverageSchema,
  DistributedJob: DistributedJobSchema,
  CreateDistributedJobInput: CreateDistributedJobInputSchema,
  BureauPerformanceMetrics: BureauPerformanceMetricsSchema,
  BureauFeeStructure: BureauFeeStructureSchema,
  PlacementFee: PlacementFeeSchema,
  BureauMatchResult: BureauMatchResultSchema,
  DuplicateCandidateResult: DuplicateCandidateResultSchema,
};
