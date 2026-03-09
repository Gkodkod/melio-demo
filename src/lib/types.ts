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
