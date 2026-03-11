// ─── Core Types ────────────────────────────────────────────────────

export type PaymentMethod = 'ach' | 'card';
export type BankVerificationStatus = 'verified' | 'pending' | 'failed';
export type PaymentStatus = 'draft' | 'scheduled' | 'processing' | 'settled' | 'failed';
export type InvoiceStatus = 'pending' | 'approved' | 'rejected' | 'paid';
export type TransactionEventType = 'payment.created' | 'payment.processing' | 'payment.settled' | 'payment.failed';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  bankName?: string;
  accountLast4: string;
  routingNumber?: string;
  bankVerificationStatus: BankVerificationStatus;
  createdAt: string;
  totalPaid: number;
}

export interface Invoice {
  id: string;
  vendorId: string;
  vendorName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  description: string;
  fileName?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  vendorId: string;
  vendorName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  scheduledDate: string;
  processedDate?: string;
  settledDate?: string;
  failureReason?: string;
  vendorCurrency?: string;
  usdAmount?: number;
  foreignAmount?: number;
  fxRate?: number;
  fxTimestamp?: string;
  marketFxRate?: number;
  fxSpread?: number;
  fxFeeAmount?: number;
  transferFeeAmount?: number;
  createdAt: string;
}

export interface TransactionEvent {
  id: string;
  paymentId: string;
  type: TransactionEventType;
  data: {
    vendorName: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    failureReason?: string;
    vendorCurrency?: string;
    usdAmount?: number;
    foreignAmount?: number;
    fxRate?: number;
    fxTimestamp?: string;
    marketFxRate?: number;
    fxSpread?: number;
    fxFeeAmount?: number;
    transferFeeAmount?: number;
  };
  timestamp: string;
}

export interface ReconciliationRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  paymentId: string;
  vendorName: string;
  invoiceAmount: number;
  paymentAmount: number;
  difference: number;
  matched: boolean;
  batchId: string;
  settledDate: string;
}

export interface DashboardSummary {
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  totalVolume: number;
  pendingVolume: number;
}

// ─── Fraud Monitoring Types ────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';
export type FraudAlertStatus = 'pending' | 'investigating' | 'cleared' | 'confirmed';

export interface FraudAlert {
  id: string;
  paymentId: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  triggeredRules: string[];
  status: FraudAlertStatus;
  flaggedAt: string;
}

export interface FraudDashboardSummary {
  totalFlagged: number;
  highRiskCount: number;
  pendingReview: number;
  clearedToday: number;
  riskTrend: { date: string; count: number; avgScore: number }[];
  ruleStats: { rule: string; triggerCount: number }[];
}

export interface VendorRiskData {
  id: string;
  name: string;
  totalVolume: number;
  paymentCount: number;
  metrics: {
    paymentFailures: number;
    highValueCount: number;
    fraudAlerts: number;
  };
  score: number;
  riskLevel: RiskLevel;
  anomalies: string[];
  vendorAge: string;
}

export interface VendorRiskSummary {
  vendors: VendorRiskData[];
  riskHistory: { date: string; avgScore: number }[];
  velocityData: { name: string; volume: number; count: number }[];
}

// ─── Partner Portal Types ──────────────────────────────────────────

export type PartnerStatus = 'active' | 'inactive' | 'suspended';
export type IntegrationStatus = 'healthy' | 'degraded' | 'offline';
export type ApiKeyStatus = 'active' | 'revoked';

export interface Partner {
  id: string;
  name: string;
  status: PartnerStatus;
  integrationStatus: IntegrationStatus;
  apiUsage: number;
  webhookUrl?: string;
  createdAt: string;
}

export interface PartnerApiKey {
  id: string;
  partnerId: string;
  keyValue: string;
  status: ApiKeyStatus;
  createdAt: string;
  lastUsedAt?: string;
}

export interface WebhookSubscription {
  id: string;
  partnerId: string;
  eventType: string;
  createdAt: string;
}

export interface ApiUsageMetric {
  id: string;
  partnerId: string;
  date: string;
  requests: number;
  errors: number;
  latencyMs: number;
}
