import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;
let _client: AnySupabase | null = null;

// Server-side client using service role key (bypasses RLS — for API routes only)
export function getDb(): AnySupabase {
  if ( !_client ) {
    _client = createClient( supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    } ) as AnySupabase;
  }
  return _client;
}

// ─── Row → camelCase mappers ───────────────────────────────────────

export function mapVendor( row: Record<string, unknown> ) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    paymentMethod: row.payment_method,
    bankName: row.bank_name,
    accountLast4: row.account_last4,
    routingNumber: row.routing_number,
    bankVerificationStatus: row.bank_verification_status,
    createdAt: row.created_at,
    totalPaid: row.total_paid,
  };
}

export function mapInvoice( row: Record<string, unknown> ) {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    invoiceNumber: row.invoice_number,
    amount: row.amount,
    dueDate: row.due_date,
    status: row.status,
    description: row.description,
    fileName: row.file_name,
    createdAt: row.created_at,
  };
}

export function mapPayment( row: Record<string, unknown> ) {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    invoiceId: row.invoice_id,
    invoiceNumber: row.invoice_number,
    amount: row.amount,
    paymentMethod: row.payment_method,
    status: row.status,
    scheduledDate: row.scheduled_date,
    processedDate: row.processed_date,
    settledDate: row.settled_date,
    failureReason: row.failure_reason,
    vendorCurrency: row.vendor_currency,
    usdAmount: row.usd_amount,
    foreignAmount: row.foreign_amount,
    fxRate: row.fx_rate,
    fxTimestamp: row.fx_timestamp,
    createdAt: row.created_at,
  };
}

export function mapTransactionEvent( row: Record<string, unknown> ) {
  return {
    id: row.id,
    paymentId: row.payment_id,
    type: row.type,
    data: {
      vendorName: row.vendor_name,
      amount: row.amount,
      paymentMethod: row.payment_method,
      status: row.status,
      failureReason: row.failure_reason || undefined,
      vendorCurrency: row.vendor_currency || undefined,
      usdAmount: row.usd_amount || undefined,
      foreignAmount: row.foreign_amount || undefined,
      fxRate: row.fx_rate || undefined,
      fxTimestamp: row.fx_timestamp || undefined,
    },
    timestamp: row.timestamp,
  };
}

export function mapReconciliation( row: Record<string, unknown> ) {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    invoiceNumber: row.invoice_number,
    paymentId: row.payment_id,
    vendorName: row.vendor_name,
    invoiceAmount: row.invoice_amount,
    paymentAmount: row.payment_amount,
    difference: row.difference,
    matched: Boolean( row.matched ),
    batchId: row.batch_id,
    settledDate: row.settled_date,
  };
}

export function mapFraudAlert( row: Record<string, unknown> ) {
  return {
    id: row.id,
    paymentId: row.payment_id,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    amount: row.amount,
    riskScore: row.risk_score,
    riskLevel: row.risk_level,
    triggeredRules: typeof row.triggered_rules === 'string'
      ? JSON.parse( row.triggered_rules )
      : row.triggered_rules,
    status: row.status,
    flaggedAt: row.flagged_at,
  };
}

export function mapDevApiKey( row: Record<string, unknown> ) {
  return {
    id: row.id,
    publishableKey: row.publishable_key,
    secretKey: row.secret_key,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  };
}

export function mapDevApiLog( row: Record<string, unknown> ) {
  return {
    id: row.id,
    endpoint: row.endpoint,
    method: row.method,
    statusCode: row.status_code,
    latencyMs: row.latency_ms,
    requestPayload: row.request_payload ? JSON.parse( row.request_payload as string ) : null,
    responsePayload: row.response_payload ? JSON.parse( row.response_payload as string ) : null,
    createdAt: row.created_at,
  };
}

export function mapDevWebhookLog( row: Record<string, unknown> ) {
  return {
    id: row.id,
    eventType: row.event_type,
    payload: typeof row.payload === 'string' ? JSON.parse( row.payload ) : row.payload,
    status: row.status,
    deliveryAttempts: row.delivery_attempts,
    lastAttemptAt: row.last_attempt_at,
    nextRetryAt: row.next_retry_at,
    createdAt: row.created_at,
  };
}

// ─── Partner Portal Mappers ────────────────────────────────────────

export function mapPartner( row: Record<string, unknown> ) {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    integrationStatus: row.integration_status,
    apiUsage: row.api_usage,
    webhookUrl: row.webhook_url,
    createdAt: row.created_at,
  };
}

export function mapPartnerApiKey( row: Record<string, unknown> ) {
  return {
    id: row.id,
    partnerId: row.partner_id,
    keyValue: row.key_value,
    status: row.status,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  };
}

export function mapPartnerWebhookSubscription( row: Record<string, unknown> ) {
  return {
    id: row.id,
    partnerId: row.partner_id,
    eventType: row.event_type,
    createdAt: row.created_at,
  };
}

export function mapPartnerApiMetric( row: Record<string, unknown> ) {
  return {
    id: row.id,
    partnerId: row.partner_id,
    date: row.date,
    requests: row.requests,
    errors: row.errors,
    latencyMs: row.latency_ms,
  };
}

// ─── Ledger Mappers ────────────────────────────────────────────────

export function mapLedgerAccount( row: Record<string, unknown> ) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    balance: row.balance,
    createdAt: row.created_at,
  };
}

export function mapLedgerEntry( row: Record<string, unknown> ) {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    accountId: row.account_id,
    accountName: row.account_name,
    debit: row.debit,
    credit: row.credit,
    description: row.description,
    createdAt: row.created_at,
  };
}

// ─── Retry Queue Mappers ───────────────────────────────────────────

export function mapRetryQueueEntry( row: Record<string, unknown> ) {
  return {
    id: row.id,
    paymentId: row.payment_id,
    errorMessage: row.error_message,
    retryAttempts: row.retry_attempts,
    nextRetryAt: row.next_retry_at,
    backoffPolicy: row.backoff_policy,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
