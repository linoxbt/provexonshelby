module provex::registry {
    use std::signer;
    use std::string::String;
    use std::vector;
    use std::error;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    /// Mapping BlobID -> attestation record. Stored under the module account.
    struct Attestation has store, drop, copy {
        blob_id: vector<u8>,           // 32-byte sha256
        uploader: address,
        timestamp_secs: u64,
        license: String,
        parents: vector<vector<u8>>,   // parent BlobIDs (lineage)
    }

    struct Registry has key {
        attestations: vector<Attestation>,
    }

    struct VerifiedModel has store, drop, copy {
        developer: address,
        name: String,
        weights_blob_id: vector<u8>,
        training_corpus_blob_id: vector<u8>,
    }

    struct ModelRegistry has key {
        models: vector<VerifiedModel>,
    }

    #[event]
    struct AttestationCreated has drop, store {
        blob_id: vector<u8>,
        uploader: address,
        timestamp_secs: u64,
    }

    #[event]
    struct ModelRegistered has drop, store {
        developer: address,
        name: String,
        weights_blob_id: vector<u8>,
    }

    const E_ALREADY_INITIALIZED: u64 = 1;
    const E_NOT_INITIALIZED: u64 = 2;
    const E_INVALID_BLOB_ID: u64 = 3;

    public entry fun init(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<Registry>(addr), error::already_exists(E_ALREADY_INITIALIZED));
        move_to(account, Registry { attestations: vector::empty() });
        move_to(account, ModelRegistry { models: vector::empty() });
    }

    /// Anchor an attestation on chain.
    /// `blob_id` MUST be the 32-byte sha256 of the Shelby blob bytes.
    public entry fun attest(
        account: &signer,
        blob_id: vector<u8>,
        license: String,
        parents: vector<vector<u8>>,
    ) acquires Registry {
        assert!(vector::length(&blob_id) == 32, error::invalid_argument(E_INVALID_BLOB_ID));
        let module_addr = @provex;
        assert!(exists<Registry>(module_addr), error::not_found(E_NOT_INITIALIZED));

        let registry = borrow_global_mut<Registry>(module_addr);
        let now = timestamp::now_seconds();
        let uploader = signer::address_of(account);

        vector::push_back(&mut registry.attestations, Attestation {
            blob_id,
            uploader,
            timestamp_secs: now,
            license,
            parents,
        });

        event::emit(AttestationCreated { blob_id, uploader, timestamp_secs: now });
    }

    /// Register a verified AI model linking weights + training corpus.
    public entry fun register_model(
        account: &signer,
        name: String,
        weights_blob_id: vector<u8>,
        training_corpus_blob_id: vector<u8>,
    ) acquires ModelRegistry {
        let module_addr = @provex;
        assert!(exists<ModelRegistry>(module_addr), error::not_found(E_NOT_INITIALIZED));
        let reg = borrow_global_mut<ModelRegistry>(module_addr);
        let dev = signer::address_of(account);

        vector::push_back(&mut reg.models, VerifiedModel {
            developer: dev,
            name,
            weights_blob_id,
            training_corpus_blob_id,
        });

        event::emit(ModelRegistered { developer: dev, name, weights_blob_id });
    }

    #[view]
    public fun attestations_count(): u64 acquires Registry {
        if (!exists<Registry>(@provex)) return 0;
        vector::length(&borrow_global<Registry>(@provex).attestations)
    }
}
