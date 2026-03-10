-- ============================================================
-- Melio Demo — Supabase/PostgreSQL Schema
-- Run this in the Supabase SQL Editor to create all tables.
-- ============================================================

-- Drop existing tables in reverse dependency order (for clean re-runs)
DROP TABLE IF EXISTS retry_queue CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS ledger_accounts CASCADE;
DROP TABLE IF EXISTS partner_api_metrics CASCADE;
DROP TABLE IF EXISTS partner_webhook_subscriptions CASCADE;
DROP TABLE IF EXISTS partner_api_keys CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS idempotency_keys CASCADE;
DROP TABLE IF EXISTS dev_webhook_logs CASCADE;
DROP TABLE IF EXISTS dev_api_logs CASCADE;
DROP TABLE IF EXISTS dev_api_keys CASCADE;
DROP TABLE IF EXISTS fraud_alerts CASCADE;
DROP TABLE IF EXISTS reconciliation_records CASCADE;
DROP TABLE IF EXISTS transaction_events CASCADE;
DROP TABLE IF EXISTS fx_rates CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

-- ─── Core tables ──────────────────────────────────────────────────────

CREATE TABLE fx_rates (
    id TEXT PRIMARY KEY,
    base_currency TEXT NOT NULL,
    target_currency TEXT NOT NULL,
    rate NUMERIC NOT NULL,
    rate_date TEXT NOT NULL,
    source TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS fx_rates_lookup_idx ON fx_rates (base_currency, target_currency, rate_date);

CREATE TABLE vendors (
  id                     TEXT PRIMARY KEY,
  name                   TEXT NOT NULL,
  email                  TEXT NOT NULL,
  phone                  TEXT NOT NULL,
  address                TEXT NOT NULL,
  payment_method         TEXT NOT NULL CHECK (payment_method IN ('ach', 'card')),
  bank_name              TEXT,
  account_last4          TEXT NOT NULL,
  routing_number         TEXT,
  bank_verification_status TEXT NOT NULL CHECK (bank_verification_status IN ('verified', 'pending', 'failed')),
  created_at             TEXT NOT NULL,
  total_paid             NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE invoices (
  id             TEXT PRIMARY KEY,
  vendor_id      TEXT NOT NULL REFERENCES vendors(id),
  vendor_name    TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  amount         NUMERIC NOT NULL,
  due_date       TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  description    TEXT NOT NULL,
  file_name      TEXT,
  created_at     TEXT NOT NULL
);

CREATE TABLE payments (
  id              TEXT PRIMARY KEY,
  vendor_id       TEXT NOT NULL REFERENCES vendors(id),
  vendor_name     TEXT NOT NULL,
  invoice_id      TEXT NOT NULL REFERENCES invoices(id),
  invoice_number  TEXT NOT NULL,
  amount          NUMERIC NOT NULL,
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('ach', 'card')),
  status          TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'processing', 'settled', 'failed')),
  scheduled_date  TEXT NOT NULL,
  processed_date  TEXT,
  settled_date    TEXT,
  failure_reason  TEXT,
  vendor_currency TEXT,
  usd_amount      NUMERIC,
  foreign_amount  NUMERIC,
  fx_rate         NUMERIC,
  fx_timestamp    TEXT,
  market_fx_rate  NUMERIC,
  fx_spread       NUMERIC,
  fx_fee_amount   NUMERIC,
  transfer_fee_amount NUMERIC,
  created_at      TEXT NOT NULL
);

CREATE TABLE transaction_events (
  id             TEXT PRIMARY KEY,
  payment_id     TEXT NOT NULL REFERENCES payments(id),
  type           TEXT NOT NULL CHECK (type IN ('payment.created', 'payment.processing', 'payment.settled', 'payment.failed')),
  vendor_name    TEXT NOT NULL,
  amount         NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  status         TEXT NOT NULL,
  failure_reason TEXT,
  vendor_currency TEXT,
  usd_amount      NUMERIC,
  foreign_amount  NUMERIC,
  fx_rate         NUMERIC,
  fx_timestamp    TEXT,
  timestamp      TEXT NOT NULL
);

CREATE TABLE reconciliation_records (
  id             TEXT PRIMARY KEY,
  invoice_id     TEXT NOT NULL REFERENCES invoices(id),
  invoice_number TEXT NOT NULL,
  payment_id     TEXT NOT NULL REFERENCES payments(id),
  vendor_name    TEXT NOT NULL,
  invoice_amount NUMERIC NOT NULL,
  payment_amount NUMERIC NOT NULL,
  difference     NUMERIC NOT NULL,
  matched        BOOLEAN NOT NULL DEFAULT TRUE,
  batch_id       TEXT NOT NULL,
  settled_date   TEXT NOT NULL
);

CREATE TABLE fraud_alerts (
  id              TEXT PRIMARY KEY,
  payment_id      TEXT NOT NULL REFERENCES payments(id),
  vendor_id       TEXT NOT NULL REFERENCES vendors(id),
  vendor_name     TEXT NOT NULL,
  amount          NUMERIC NOT NULL,
  risk_score      INTEGER NOT NULL,
  risk_level      TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  triggered_rules JSONB NOT NULL DEFAULT '[]',
  status          TEXT NOT NULL CHECK (status IN ('pending', 'investigating', 'cleared', 'confirmed')),
  flagged_at      TEXT NOT NULL
);

-- ─── Dev console tables ───────────────────────────────────────────────

CREATE TABLE dev_api_keys (
  id               TEXT PRIMARY KEY,
  publishable_key  TEXT NOT NULL UNIQUE,
  secret_key       TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('active', 'revoked')),
  created_at       TEXT NOT NULL,
  last_used_at     TEXT
);

CREATE TABLE dev_api_logs (
  id               TEXT PRIMARY KEY,
  endpoint         TEXT NOT NULL,
  method           TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  status_code      INTEGER NOT NULL,
  latency_ms       INTEGER NOT NULL,
  request_payload  TEXT,
  response_payload TEXT,
  created_at       TEXT NOT NULL
);

CREATE TABLE dev_webhook_logs (
  id                TEXT PRIMARY KEY,
  event_type        TEXT NOT NULL,
  payload           TEXT NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('pending', 'delivered', 'failed')),
  delivery_attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at   TEXT,
  next_retry_at     TEXT,
  created_at        TEXT NOT NULL
);

CREATE TABLE idempotency_keys (
  key              TEXT PRIMARY KEY,
  endpoint         TEXT NOT NULL,
  response_payload TEXT NOT NULL,
  created_at       TEXT NOT NULL
);

-- ─── Partner portal tables ────────────────────────────────────────────

CREATE TABLE partners (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
  integration_status  TEXT NOT NULL CHECK (integration_status IN ('healthy', 'degraded', 'offline')),
  api_usage           INTEGER NOT NULL DEFAULT 0,
  webhook_url         TEXT,
  created_at          TEXT NOT NULL
);

CREATE TABLE partner_api_keys (
  id           TEXT PRIMARY KEY,
  partner_id   TEXT NOT NULL REFERENCES partners(id),
  key_value    TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL CHECK (status IN ('active', 'revoked')),
  created_at   TEXT NOT NULL,
  last_used_at TEXT
);

CREATE TABLE partner_webhook_subscriptions (
  id          TEXT PRIMARY KEY,
  partner_id  TEXT NOT NULL REFERENCES partners(id),
  event_type  TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

CREATE TABLE partner_api_metrics (
  id          TEXT PRIMARY KEY,
  partner_id  TEXT NOT NULL REFERENCES partners(id),
  date        TEXT NOT NULL,
  requests    INTEGER NOT NULL DEFAULT 0,
  errors      INTEGER NOT NULL DEFAULT 0,
  latency_ms  INTEGER NOT NULL DEFAULT 0
);

-- ─── Ledger tables ────────────────────────────────────────────────────

CREATE TABLE ledger_accounts (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  type       TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  balance    NUMERIC NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE ledger_entries (
  id             TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  account_id     TEXT NOT NULL REFERENCES ledger_accounts(id),
  account_name   TEXT NOT NULL,
  debit          NUMERIC,
  credit         NUMERIC,
  description    TEXT NOT NULL,
  created_at     TEXT NOT NULL
);

-- ─── Retry queue ──────────────────────────────────────────────────────

CREATE TABLE retry_queue (
  id              TEXT PRIMARY KEY,
  payment_id      TEXT NOT NULL,
  error_message   TEXT NOT NULL,
  retry_attempts  INTEGER NOT NULL DEFAULT 0,
  next_retry_at   TEXT NOT NULL,
  backoff_policy  TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'resolved', 'failed')),
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

-- ─── Seed ledger accounts ─────────────────────────────────────────────

INSERT INTO ledger_accounts (id, name, type, balance, created_at) VALUES
  ('acc_buyer',   'buyer_wallet',    'asset',    0.00, NOW()::TEXT),
  ('acc_vendor',  'vendor_payable',  'liability', 0.00, NOW()::TEXT),
  ('acc_capital', 'external_capital','equity',  0.00, NOW()::TEXT),
  ('acc_expense', 'operating_expenses', 'expense', 0.00, NOW()::TEXT);
