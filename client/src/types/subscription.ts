// Subscription Management Types

export interface SubscriptionPlan {
  id: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  name: string;
  price: number; // in cents
  interval: 'maand' | 'jaar';
  features: string[];
  icon: React.ComponentType<any>;
  popular: boolean;
  jobLimit: number; // -1 for unlimited
  applicantLimit: number; // -1 for unlimited
}

export interface Subscription {
  id: string;
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'UNPAID';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageStatistics {
  jobsPosted: number;
  jobsThisMonth: number;
  activeJobs: number;
  applicationsReceived: number;
  applicationsThisMonth: number;
  averageApplicationsPerJob: number;
  responseRate: number; // percentage
  hiredCandidates: number;
  viewsThisMonth: number;
  responsesThisMonth: number;
}

export interface PaymentMethod {
  id: string;
  brand: string; // 'visa', 'mastercard', 'amex', etc.
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  fingerprint?: string;
  country?: string;
  funding?: 'credit' | 'debit' | 'prepaid' | 'unknown';
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number; // in cents
  currency: string; // 'eur', 'usd', etc.
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'CANCELED';
  description: string;
  createdAt: string;
  paidAt?: string;
  paymentMethod?: {
    id: string;
    brand: string;
    last4: string;
  };
  invoiceUrl?: string;
  receiptUrl?: string;
  failureReason?: string;
  failureCode?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
}

export interface ProrationPreview {
  currentPlanRemainingValue: number; // in cents
  newPlanCost: number; // in cents
  prorationCredit: number; // in cents
  immediateCharge: number; // in cents (can be negative for credits)
  nextBillingAmount: number; // in cents
  nextBillingDate: string;
  daysRemaining: number;
}

export interface CancellationRequest {
  reason: string;
  feedback?: string;
  dataRetention: boolean;
  surveyOptIn: boolean;
  immediateCancel?: boolean;
}

export interface CancellationResponse {
  success: boolean;
  message: string;
  accessUntil?: string;
  dataRetentionUntil?: string;
  refundAmount?: number;
}

// API Response Types
export interface SubscriptionResponse {
  subscription: Subscription | null;
  paymentMethod: PaymentMethod | null;
  usage: UsageStatistics;
  upcomingInvoice?: {
    amount: number;
    dueDate: string;
    status: string;
  };
}

export interface PaymentHistoryResponse {
  payments: Payment[];
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentMethodResponse {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;
}

// Webhook Event Types
export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
}

// Form Types
export interface UpdatePaymentMethodForm {
  paymentMethodId: string;
  setAsDefault: boolean;
}

export interface ChangePlanForm {
  planId: string;
  prorationBehavior?: 'create_prorations' | 'none';
  billingCycleAnchor?: 'now' | 'unchanged';
}

export interface PauseSubscriptionForm {
  pauseUntil?: string; // ISO date string, if not provided, pauses for 3 months
  reason?: string;
}

// Error Types
export interface SubscriptionError {
  code: string;
  message: string;
  type: 'authentication_error' | 'api_error' | 'card_error' | 'idempotency_error' | 'invalid_request_error' | 'rate_limit_error';
  param?: string;
  decline_code?: string;
}

// Notification Types
export interface BillingNotification {
  id: string;
  type: 'payment_succeeded' | 'payment_failed' | 'invoice_upcoming' | 'subscription_created' | 'subscription_updated' | 'subscription_deleted';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Analytics Types
export interface SubscriptionAnalytics {
  mrr: number; // Monthly Recurring Revenue in cents
  arr: number; // Annual Recurring Revenue in cents
  churnRate: number; // percentage
  ltv: number; // Lifetime Value in cents
  conversionRate: number; // percentage from trial to paid
  planDistribution: {
    [key in SubscriptionPlan['id']]: {
      count: number;
      revenue: number;
    };
  };
  monthlyGrowth: {
    month: string;
    newSubscriptions: number;
    canceledSubscriptions: number;
    netGrowth: number;
    revenue: number;
  }[];
}

// Discount/Coupon Types
export interface Discount {
  id: string;
  couponId: string;
  name: string;
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  duration: 'forever' | 'once' | 'repeating';
  durationInMonths?: number;
  valid: boolean;
  start?: string;
  end?: string;
}

// Tax Types
export interface TaxRate {
  id: string;
  displayName: string;
  description: string;
  jurisdiction: string;
  percentage: number;
  inclusive: boolean;
  active: boolean;
}

// Invoice Types
export interface Invoice {
  id: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amount: number; // in cents
  currency: string;
  description?: string;
  dueDate: string;
  paidAt?: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  lines: InvoiceLineItem[];
  taxes?: {
    rate: TaxRate;
    amount: number;
  }[];
  discount?: Discount;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: number; // in cents
  currency: string;
  quantity: number;
  unitAmount: number; // in cents
  proration: boolean;
  period: {
    start: string;
    end: string;
  };
}

// Feature Flag Types
export interface FeatureFlags {
  enableTrials: boolean;
  enableProrations: boolean;
  enableDiscounts: boolean;
  enableTaxes: boolean;
  enableInvoices: boolean;
  maxTrialDays: number;
  allowPlanDowngrades: boolean;
  allowMidCycleChanges: boolean;
}