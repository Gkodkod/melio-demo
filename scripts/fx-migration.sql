-- Create fx_rates table
CREATE TABLE IF NOT EXISTS fx_rates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_currency text NOT NULL,
    target_currency text NOT NULL,
    rate numeric NOT NULL,
    rate_date date NOT NULL,
    source text,
    created_at timestamp DEFAULT now()
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS fx_rates_lookup_idx ON fx_rates (base_currency, target_currency, rate_date);

-- Add FX fields to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS vendor_currency text,
  ADD COLUMN IF NOT EXISTS usd_amount numeric,
  ADD COLUMN IF NOT EXISTS foreign_amount numeric,
  ADD COLUMN IF NOT EXISTS fx_rate numeric,
  ADD COLUMN IF NOT EXISTS fx_timestamp timestamp,
  ADD COLUMN IF NOT EXISTS market_fx_rate numeric,
  ADD COLUMN IF NOT EXISTS fx_spread numeric,
  ADD COLUMN IF NOT EXISTS fx_fee_amount numeric,
  ADD COLUMN IF NOT EXISTS transfer_fee_amount numeric;

