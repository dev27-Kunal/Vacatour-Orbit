/**
 * Contract Management Types
 *
 * These types extend the core domain types for contract management functionality.
 * They follow the same patterns as shared/types.ts with:
 * - camelCase property names
 * - UPPERCASE enum values
 * - Zod schemas for validation
 */

import { z } from "zod";
import type { User, Job, Application, UserType, EmploymentType } from "../types";

// ============================================================================
// CONTRACT ENUMS
// ============================================================================

/**
 * Contract Status Enum
 * Represents the lifecycle status of a contract
 */
export const ContractStatusEnum = z.enum([
  'DRAFT',             // In voorbereiding
  'PENDING_REVIEW',    // Wacht op review
  'PENDING_APPROVAL',  // Wacht op goedkeuring
  'APPROVED',          // Goedgekeurd, klaar voor ondertekening
  'PENDING_SIGNATURE', // Wacht op handtekeningen
  'PARTIALLY_SIGNED',  // Gedeeltelijk getekend
  'FULLY_SIGNED',      // Volledig getekend
  'ACTIVE',            // Actief contract
  'COMPLETED',         // Contract afgerond
  'CANCELLED',         // Geannuleerd
  'TERMINATED'         // Voortijdig beëindigd
]);
export type ContractStatus = z.infer<typeof ContractStatusEnum>;

/**
 * Signature Type Enum
 * Methods of signing contracts
 */
export const SignatureTypeEnum = z.enum([
  'ELECTRONIC',     // E-handtekening (DocuSign)
  'DIGITAL',        // Digitaal certificaat
  'WET',            // Fysieke handtekening
  'CLICK_TO_SIGN'   // Simpele checkbox
]);
export type SignatureType = z.infer<typeof SignatureTypeEnum>;

/**
 * Fee Type Enum
 * Types of bureau fee structures
 */
export const FeeTypeEnum = z.enum([
  'PERCENTAGE',  // Percentage van salaris/tarief
  'FIXED',       // Vast bedrag
  'TIERED',      // Gestaffelde tarieven
  'CUSTOM'       // Custom berekening
]);
export type FeeType = z.infer<typeof FeeTypeEnum>;

/**
 * MSA Status Enum
 * Master Service Agreement status
 */
export const MSAStatusEnum = z.enum([
  'DRAFT',
  'PENDING_SIGNATURE',
  'ACTIVE',
  'EXPIRED',
  'TERMINATED'
]);
export type MSAStatus = z.infer<typeof MSAStatusEnum>;

/**
 * Approval Status Enum
 * Status for contract approvals
 */
export const ApprovalStatusEnum = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ESCALATED'
]);
export type ApprovalStatus = z.infer<typeof ApprovalStatusEnum>;

/**
 * Signer Type Enum
 * Types of contract signers
 */
export const SignerTypeEnum = z.enum([
  'COMPANY',    // Bedrijf
  'BUREAU',     // Bureau
  'CANDIDATE'   // Kandidaat
]);
export type SignerType = z.infer<typeof SignerTypeEnum>;

// ============================================================================
// CONTRACT TEMPLATES
// ============================================================================

/**
 * Contract Template Schema
 * Templates for generating contracts
 */
export const ContractTemplateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Template info
  name: z.string().min(1),
  description: z.string().optional(),
  contractType: z.enum(['VAST', 'INTERIM', 'UITZENDEN']),

  // Template content
  templateContent: z.string(), // HTML/Markdown with {{variables}}
  variables: z.record(z.any()).default({}), // Variable definitions

  // Settings
  requiresApproval: z.boolean().default(false),
  approvalRoles: z.array(z.string()).default([]),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),

  // Version control
  version: z.number().int().default(1),
  parentTemplateId: z.string().uuid().optional(),

  // Metadata
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ContractTemplate = z.infer<typeof ContractTemplateSchema>;

// ============================================================================
// MASTER SERVICE AGREEMENTS
// ============================================================================

/**
 * Master Service Agreement Schema
 * Framework agreements between companies and bureaus
 */
export const MSASchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Parties
  companyId: z.string().uuid(), // BEDRIJF user
  bureauId: z.string().uuid(),  // BUREAU user

  // Agreement details
  agreementNumber: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),

  // Terms
  startDate: z.date(),
  endDate: z.date().optional(),
  autoRenew: z.boolean().default(false),
  renewalPeriodMonths: z.number().int().positive().optional(),

  // Legal
  termsAndConditions: z.string(),
  paymentTermsDays: z.number().int().positive().default(30),
  noticePeroidDays: z.number().int().positive().default(90),

  // Status
  status: MSAStatusEnum,
  signedDate: z.date().optional(),

  // Metadata
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MSA = z.infer<typeof MSASchema>;

// ============================================================================
// RATE CARDS
// ============================================================================

/**
 * Rate Card Schema
 * Fee structures linked to MSAs
 */
export const RateCardSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  msaId: z.string().uuid(),

  // Card info
  name: z.string().min(1),
  description: z.string().optional(),

  // Validity
  validFrom: z.date(),
  validUntil: z.date().optional(),
  isActive: z.boolean().default(true),

  // Bureau ownership protection
  ownershipProtectionDays: z.number().int().positive().default(365),
  exclusivityPeriodDays: z.number().int().positive().default(90),

  // Metadata
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RateCard = z.infer<typeof RateCardSchema>;

/**
 * Rate Card Line Schema
 * Individual fee entries in a rate card
 */
export const RateCardLineSchema = z.object({
  id: z.string().uuid(),
  rateCardId: z.string().uuid(),

  // Fee structure
  feeType: FeeTypeEnum,

  // For PERCENTAGE type
  placementFeePercentage: z.number().positive().optional(),
  interimFeePercentage: z.number().positive().optional(),

  // For FIXED type
  fixedFeeAmount: z.number().positive().optional(),

  // For TIERED type
  tierDefinition: z.record(z.any()).optional(),

  // Salary/rate ranges
  minMonthlySalary: z.number().positive().optional(),
  maxMonthlySalary: z.number().positive().optional(),
  minHourlyRate: z.number().positive().optional(),
  maxHourlyRate: z.number().positive().optional(),

  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RateCardLine = z.infer<typeof RateCardLineSchema>;

// ============================================================================
// CONTRACTS
// ============================================================================

/**
 * Contract Schema
 * Actual contracts between parties
 */
export const ContractSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Parties
  companyId: z.string().uuid(), // BEDRIJF
  bureauId: z.string().uuid().optional(), // BUREAU (optional for direct hires)
  candidateId: z.string().uuid().optional(),

  // References
  contractType: z.enum(['VAST', 'INTERIM', 'UITZENDEN']),
  applicationId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  msaId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),

  // Contract details
  contractNumber: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),

  // Terms
  startDate: z.date(),
  endDate: z.date().optional(),
  salary: z.number().positive().optional(),
  hourlyRate: z.number().positive().optional(),

  // Fee calculation
  feeCalculation: z.object({
    type: FeeTypeEnum,
    percentage: z.number().optional(),
    amount: z.number(),
    details: z.record(z.any()).optional(),
  }).optional(),

  // Content
  contractContent: z.string(),
  contractPdfUrl: z.string().url().optional(),

  // Status
  status: ContractStatusEnum,
  statusChangedAt: z.date().optional(),
  statusChangedBy: z.string().uuid().optional(),

  // DocuSign integration
  docusignEnvelopeId: z.string().optional(),
  docusignStatus: z.string().optional(),

  // Metadata
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  cancelledAt: z.date().optional(),
  terminatedAt: z.date().optional(),
});

export type Contract = z.infer<typeof ContractSchema>;

// ============================================================================
// CONTRACT SIGNATURES
// ============================================================================

/**
 * Contract Signature Schema
 * Tracking signatures on contracts
 */
export const ContractSignatureSchema = z.object({
  id: z.string().uuid(),
  contractId: z.string().uuid(),

  // Signer info
  signerId: z.string().uuid(),
  signerName: z.string().min(1),
  signerEmail: z.string().email(),
  signerType: SignerTypeEnum,
  signerRole: z.string().optional(),

  // Signature
  signatureType: SignatureTypeEnum,
  signedAt: z.date().optional(),
  signatureData: z.string().optional(), // Base64 encoded signature image
  certificateId: z.string().optional(), // For digital certificates

  // Tracking
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  location: z.record(z.any()).optional(), // GPS coordinates if available

  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ContractSignature = z.infer<typeof ContractSignatureSchema>;

// ============================================================================
// CONTRACT APPROVALS
// ============================================================================

/**
 * Contract Approval Schema
 * Approval workflow tracking
 */
export const ContractApprovalSchema = z.object({
  id: z.string().uuid(),
  contractId: z.string().uuid(),

  // Approver
  approverId: z.string().uuid(),
  approverName: z.string().min(1),
  approverEmail: z.string().email(),
  approverRole: z.string(), // HIRING_MANAGER, HR, LEGAL, FINANCE, etc.

  // Decision
  status: ApprovalStatusEnum,
  approvedAt: z.date().optional(),
  rejectedAt: z.date().optional(),
  comments: z.string().optional(),
  rejectionReason: z.string().optional(),

  // Workflow
  sequenceOrder: z.number().int().positive(),
  isRequired: z.boolean().default(true),
  escalatedTo: z.string().uuid().optional(),

  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ContractApproval = z.infer<typeof ContractApprovalSchema>;

// ============================================================================
// BUREAU OWNERSHIP
// ============================================================================

/**
 * Bureau Ownership Schema
 * Tracks bureau ownership of candidates to prevent double fees
 */
export const BureauOwnershipSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Ownership
  bureauId: z.string().uuid(),
  candidateEmail: z.string().email(),
  candidateName: z.string().min(1),

  // Protection period
  firstSubmittedAt: z.date(),
  protectionExpiresAt: z.date(),

  // Evidence
  originalJobId: z.string().uuid().optional(),
  originalApplicationId: z.string().uuid().optional(),

  // Status
  isActive: z.boolean().default(true),
  disputedBy: z.string().uuid().optional(),
  disputeResolvedAt: z.date().optional(),

  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BureauOwnership = z.infer<typeof BureauOwnershipSchema>;

// ============================================================================
// INSERT/UPDATE TYPES
// ============================================================================

export const InsertContractTemplateSchema = ContractTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContractTemplate = z.infer<typeof InsertContractTemplateSchema>;

export const InsertMSASchema = MSASchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMSA = z.infer<typeof InsertMSASchema>;

export const InsertContractSchema = ContractSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  contractNumber: true, // Auto-generated
});
export type InsertContract = z.infer<typeof InsertContractSchema>;

export const UpdateContractSchema = ContractSchema.partial().required({ id: true });
export type UpdateContract = z.infer<typeof UpdateContractSchema>;

// ============================================================================
// EXTENDED TYPES WITH RELATIONS
// ============================================================================

/**
 * Contract with all related data
 */
export type ContractWithDetails = Contract & {
  company?: User;
  bureau?: User;
  candidate?: User;
  application?: Application;
  job?: Job;
  msa?: MSA;
  template?: ContractTemplate;
  signatures?: ContractSignature[];
  approvals?: ContractApproval[];
  feeCalculation?: {
    type: FeeType;
    percentage?: number;
    amount: number;
    details?: Record<string, any>;
  };
};

/**
 * MSA with related data
 */
export type MSAWithDetails = MSA & {
  company?: User;
  bureau?: User;
  rateCards?: RateCard[];
  activeContracts?: number;
  totalValue?: number;
};

/**
 * Rate Card with lines
 */
export type RateCardWithLines = RateCard & {
  lines: RateCardLine[];
  msa?: MSA;
};

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Create contract from application request
 */
export interface CreateContractFromApplicationRequest {
  applicationId: string;
  templateId?: string;
  customTerms?: Partial<Contract>;
}

/**
 * Send to DocuSign request
 */
export interface SendToDocuSignRequest {
  contractId: string;
  signers: Array<{
    email: string;
    name: string;
    role: SignerType;
  }>;
  returnUrl?: string;
}

/**
 * Sign contract request
 */
export interface SignContractRequest {
  signatureType: SignatureType;
  signatureData?: string; // Base64 encoded signature
  certificateId?: string;
}

/**
 * Approve contract request
 */
export interface ApproveContractRequest {
  approved: boolean;
  comments?: string;
  rejectionReason?: string;
}

/**
 * Contract list filters
 */
export interface ContractFilters {
  status?: ContractStatus | ContractStatus[];
  contractType?: EmploymentType;
  companyId?: string;
  bureauId?: string;
  candidateId?: string;
  msaId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

/**
 * Contract metrics response
 */
export interface ContractMetrics {
  totalContracts: number;
  activeContracts: number;
  pendingSignatures: number;
  totalValue: number;
  averageProcessingDays: number;
  contractsByType: Record<EmploymentType, number>;
  contractsByStatus: Record<ContractStatus, number>;
  recentActivity: Array<{
    contractId: string;
    action: string;
    timestamp: Date;
    user: string;
  }>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isContractStatus(value: unknown): value is ContractStatus {
  return ContractStatusEnum.safeParse(value).success;
}

export function isContract(value: unknown): value is Contract {
  return ContractSchema.safeParse(value).success;
}

export function isMSA(value: unknown): value is MSA {
  return MSASchema.safeParse(value).success;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateContract(data: unknown): Contract {
  return ContractSchema.parse(data);
}

export function validateMSA(data: unknown): MSA {
  return MSASchema.parse(data);
}

export function validateContractTemplate(data: unknown): ContractTemplate {
  return ContractTemplateSchema.parse(data);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ContractSchemas = {
  Contract: ContractSchema,
  ContractTemplate: ContractTemplateSchema,
  MSA: MSASchema,
  RateCard: RateCardSchema,
  RateCardLine: RateCardLineSchema,
  ContractSignature: ContractSignatureSchema,
  ContractApproval: ContractApprovalSchema,
  BureauOwnership: BureauOwnershipSchema,
} as const;

export const ContractEnums = {
  ContractStatus: ContractStatusEnum,
  SignatureType: SignatureTypeEnum,
  FeeType: FeeTypeEnum,
  MSAStatus: MSAStatusEnum,
  ApprovalStatus: ApprovalStatusEnum,
  SignerType: SignerTypeEnum,
} as const;