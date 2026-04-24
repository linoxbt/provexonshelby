# Provex Move Module

The on-chain provenance registry for Provex. Anchors `BlobID → uploader` mappings
on Aptos. Shelby stores the bytes; this module is the immutable notary.

## Architecture

| Layer | Chain | Why |
|---|---|---|
| File bytes | **Shelby** | Hot, durable storage. Returns BlobID (sha256 of bytes). |
| Provenance record | **Aptos** | This module. Maps BlobID → wallet, license, lineage. |
| Verified models | **Aptos** | `register_model` links AI model weights + training corpus blobs. |

A single Aptos-keyed wallet (Petra/Martian/Pontem) signs both — Shelby
uses Ed25519 keys compatible with Aptos accounts, so users only connect once.

## Deploy

```bash
# 1. Init an Aptos account for the module (devnet)
aptos init --network devnet
aptos account fund-with-faucet --account default

# 2. Publish, substituting your address for the `provex` named address
cd move/provex
aptos move publish --named-addresses provex=default

# 3. Initialize the registry (once)
aptos move run --function-id 'default::registry::init'

# 4. Copy the deployed module address into the Lovable Cloud secret PROVEX_MODULE_ADDRESS
```

## Entry functions

- `attest(blob_id: vector<u8>, license: String, parents: vector<vector<u8>>)` — anchor a new attestation.
- `register_model(name, weights_blob_id, training_corpus_blob_id)` — register a verified AI model.
- `init(account: &signer)` — bootstrap. Call once after publish.

## Frontend wiring

The dashboard upload widget in `src/pages/Dashboard.tsx` already builds the
Aptos `InputTransactionData` for `attest` and submits it via the wallet
adapter. Set `VITE_PROVEX_MODULE_ADDRESS` to point at your deployed module.
