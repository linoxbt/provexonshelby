-- Provex schema: wallet-keyed (Aptos address) provenance registry mirror.
-- We use the Aptos wallet address as the canonical user id (no Lovable auth — wallet is the identity).

create table public.wallets (
  address text primary key,
  display_name text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table public.datasets (
  id uuid primary key default gen_random_uuid(),
  blob_id text not null unique,            -- sha256 hex (Shelby BlobID shape)
  uploader text not null references public.wallets(address) on delete cascade,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  storage_path text not null,              -- path in Supabase Storage (Shelby substitute)
  license text default 'CC-BY-SA-4.0',
  created_at timestamptz not null default now()
);
create index on public.datasets(uploader);
create index on public.datasets(created_at desc);

create table public.attestations (
  id uuid primary key default gen_random_uuid(),
  blob_id text not null references public.datasets(blob_id) on delete cascade,
  uploader text not null,
  signature text not null,                 -- hex signature from Aptos wallet
  public_key text not null,                -- hex pubkey
  message text not null,                   -- the signed message (BlobID + metadata digest)
  aptos_tx_hash text,                      -- on-chain anchor tx (nullable until indexed)
  status text not null default 'pending' check (status in ('pending','verified','unverified')),
  unverified_reason text,
  created_at timestamptz not null default now()
);
create index on public.attestations(blob_id);
create index on public.attestations(status);

create table public.lineage (
  id uuid primary key default gen_random_uuid(),
  child_blob_id text not null references public.datasets(blob_id) on delete cascade,
  parent_blob_id text not null references public.datasets(blob_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(child_blob_id, parent_blob_id)
);

create table public.verified_models (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  developer text not null references public.wallets(address) on delete cascade,
  weights_blob_id text not null references public.datasets(blob_id),
  training_corpus_blob_id text references public.datasets(blob_id),
  description text,
  created_at timestamptz not null default now()
);

create table public.dev_keys (
  id uuid primary key default gen_random_uuid(),
  owner text not null references public.wallets(address) on delete cascade,
  name text not null,
  key_prefix text not null,                -- pvx_live_xxxx (shown in UI)
  key_hash text not null,                  -- sha256 of full key, never store plaintext
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index on public.dev_keys(owner);

create table public.ticker_events (
  id bigserial primary key,
  blob_id text not null,
  uploader text not null,
  event_type text not null default 'attestation.created',
  created_at timestamptz not null default now()
);
create index on public.ticker_events(created_at desc);

-- Storage bucket for Shelby-substitute blob storage
insert into storage.buckets (id, name, public)
values ('shelby-blobs', 'shelby-blobs', true)
on conflict (id) do nothing;

-- RLS: wallet identity comes from a request header (X-Wallet-Address) via edge functions.
-- The edge functions use the service role key, so RLS here is for direct PostgREST reads from the browser.
-- All read policies are public (provenance is meant to be public). Writes only via edge functions.

alter table public.wallets enable row level security;
alter table public.datasets enable row level security;
alter table public.attestations enable row level security;
alter table public.lineage enable row level security;
alter table public.verified_models enable row level security;
alter table public.dev_keys enable row level security;
alter table public.ticker_events enable row level security;

create policy "public read wallets" on public.wallets for select using (true);
create policy "public read datasets" on public.datasets for select using (true);
create policy "public read attestations" on public.attestations for select using (true);
create policy "public read lineage" on public.lineage for select using (true);
create policy "public read verified_models" on public.verified_models for select using (true);
create policy "public read ticker_events" on public.ticker_events for select using (true);
-- dev_keys: NO public read. Only the owning wallet (via edge function w/ service role) reads.

-- Storage policies: public read of shelby-blobs (provenance is public), writes only via service role
create policy "public read shelby-blobs" on storage.objects for select using (bucket_id = 'shelby-blobs');