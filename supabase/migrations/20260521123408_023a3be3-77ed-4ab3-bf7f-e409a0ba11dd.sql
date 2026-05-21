ALTER TABLE public.attestations
  ADD COLUMN IF NOT EXISTS fee_tx_hash text,
  ADD COLUMN IF NOT EXISTS fee_amount numeric,
  ADD COLUMN IF NOT EXISTS fee_asset text,
  ADD COLUMN IF NOT EXISTS fee_signature text,
  ADD COLUMN IF NOT EXISTS fee_message text,
  ADD COLUMN IF NOT EXISTS fee_status text DEFAULT 'pending';