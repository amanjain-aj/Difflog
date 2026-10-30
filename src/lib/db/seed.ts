import {
  DEMO_ACME_API_KEY_HASH,
  DEMO_ACME_RAW_API_KEY,
  DEMO_NEXUS_API_KEY_HASH,
  DEMO_NEXUS_RAW_API_KEY,
} from "@/lib/crypto/api-keys";
import { SpecSyncDatabaseSchema } from "@/lib/db/types";

export const INITIAL_SEED_DATA: SpecSyncDatabaseSchema = {
  users: [
    {
      id: "00000000-0000-4000-8000-000000000001",
      email: "founder@difflog.dev",
      full_name: "Aman Jain",
      role: "admin",
      organization_id: "11111111-1111-4111-8111-111111111111",
      avatar_initials: "AJ",
      created_at: "2026-09-01T10:00:00.000Z",
    },
    {
      id: "00000000-0000-4000-8000-000000000002",
      email: "devrel@acmepayments.dev",
      full_name: "Sarah Chen",
      role: "member",
      organization_id: "11111111-1111-4111-8111-111111111111",
      avatar_initials: "SC",
      created_at: "2026-09-12T15:20:00.000Z",
    },
  ],
  organizations: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Acme Financial Technologies",
      slug: "acme-fintech",
      stripe_customer_id: "cus_demo_acme_001",
      stripe_subscription_id: "sub_demo_founding_29",
      plan_tier: "starter",
      created_at: "2026-09-01T10:00:00.000Z",
      updated_at: "2026-10-25T14:30:00.000Z",
    },
  ],
  organization_members: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      organization_id: "11111111-1111-4111-8111-111111111111",
      user_id: "00000000-0000-4000-8000-000000000001",
      role: "admin",
      created_at: "2026-09-01T10:00:00.000Z",
    },
  ],
  projects: [
    {
      id: "33333333-3333-4333-8333-333333333301",
      organization_id: "11111111-1111-4111-8111-111111111111",
      name: "Acme Payments Core API",
      slug: "acme-payments",
      api_key_hash: DEMO_ACME_API_KEY_HASH,
      api_key_preview: DEMO_ACME_RAW_API_KEY,
      is_public: true,
      custom_domain: "changelog.acmepayments.dev",
      created_at: "2026-09-02T09:15:00.000Z",
    },
    {
      id: "33333333-3333-4333-8333-333333333302",
      organization_id: "11111111-1111-4111-8111-111111111111",
      name: "Nexus Inference & Embeddings API",
      slug: "nexus-ai",
      api_key_hash: DEMO_NEXUS_API_KEY_HASH,
      api_key_preview: DEMO_NEXUS_RAW_API_KEY,
      is_public: true,
      custom_domain: null,
      created_at: "2026-09-14T11:20:00.000Z",
    },
  ],
  changelog_entries: [
    {
      id: "44444444-4444-4444-8444-444444444401",
      project_id: "33333333-3333-4333-8333-333333333301",
      commit_hash: "9f84c21e7b03a5d1c8e2b4f6a90123456789abcd",
      commit_message:
        "feat(payments): enforce Idempotency-Key on POST /v1/payments, add /v1/payouts/instant, deprecate /v1/charges/legacy",
      title: "Mandatory Idempotency Keys, Instant RTP Payouts & Legacy Charge Deprecation",
      summary:
        "To prevent duplicate settlement mutations during network retries, `POST /v1/payments` now requires an `Idempotency-Key` header and explicit `payment_method_types`. We also launched real-time RTP/FedNow disbursements via `POST /v1/payouts/instant` and deprecated synchronous legacy charges.",
      has_breaking_changes: true,
      raw_diff: {
        diff: {
          endpoints: {
            added: [{ method: "POST", path: "/v1/payouts/instant" }],
            modified: [
              {
                method: "POST",
                path: "/v1/payments",
                requiredHeaderAdded: "Idempotency-Key",
                requiredBodyPropertyAdded: "payment_method_types",
                currenciesAdded: ["jpy", "cad", "aud"],
              },
              {
                method: "POST",
                path: "/v1/charges/legacy",
                deprecated: true,
              },
              {
                method: "GET",
                path: "/v1/customers/{customer_id}",
                queryParamAdded: "expand_risk_profile",
              },
            ],
          },
        },
        breaking: [
          {
            id: "request-parameter-became-required",
            level: "ERR",
            text: "added the new required 'header' request parameter 'Idempotency-Key'",
            operation: "POST",
            path: "/v1/payments",
          },
          {
            id: "new-required-request-property",
            level: "ERR",
            text: "added the new required property 'payment_method_types' to the request body",
            operation: "POST",
            path: "/v1/payments",
          },
        ],
      },
      structured_changes: [
        {
          tag: "BREAKING",
          endpoint: "POST /v1/payments",
          description:
            "Header `Idempotency-Key` (UUID) and body array `payment_method_types` are now strictly required on all payment creation calls.",
        },
        {
          tag: "NEW",
          endpoint: "POST /v1/payouts/instant",
          description:
            "Initiates sub-10-second merchant payouts over RTP, FedNow, and SEPA Instant rails with `202 Accepted` settlement queuing.",
        },
        {
          tag: "CHANGED",
          endpoint: "POST /v1/payments",
          description:
            "Added `settlement_currency` for automatic FX conversion and expanded `currency` enum support to `jpy`, `cad`, and `aud`.",
        },
        {
          tag: "CHANGED",
          endpoint: "GET /v1/customers/{customer_id}",
          description:
            "Added optional boolean query parameter `expand_risk_profile` to inline real-time treasury risk telemetry.",
        },
        {
          tag: "DEPRECATED",
          endpoint: "POST /v1/charges/legacy",
          description:
            "Marked synchronous card charge endpoint as deprecated; migrate integrations to `POST /v1/payments` before 2027-03-01.",
        },
      ],
      published_at: "2026-10-28T16:20:00.000Z",
      is_published: true,
      version_tag: "v2026.10.2",
    },
    {
      id: "44444444-4444-4444-8444-444444444402",
      project_id: "33333333-3333-4333-8333-333333333301",
      commit_hash: "4b21d08e31c7f92a61e80b3d4c7a918273645510",
      commit_message:
        "feat(disputes): add evidence upload endpoint and webhook signature timestamp tolerance",
      title: "Automated Dispute Evidence Submission & Webhook Replay Protection",
      summary:
        "Introduced `POST /v1/disputes/{dispute_id}/evidence` for programmatic chargeback defense attachments and expanded `GET /v1/webhook-endpoints` response schema with rotation grace-period timestamps.",
      has_breaking_changes: false,
      raw_diff: {
        diff: {
          endpoints: {
            added: [
              {
                method: "POST",
                path: "/v1/disputes/{dispute_id}/evidence",
              },
            ],
            modified: [
              {
                method: "GET",
                path: "/v1/webhook-endpoints",
                responsePropertiesAdded: ["secret_expires_at", "tolerance_seconds"],
              },
            ],
          },
        },
        breaking: [],
      },
      structured_changes: [
        {
          tag: "NEW",
          endpoint: "POST /v1/disputes/{dispute_id}/evidence",
          description:
            "Submit structured shipping receipts, customer communication logs, and refund policy PDFs directly to card network arbitration.",
        },
        {
          tag: "CHANGED",
          endpoint: "GET /v1/webhook-endpoints",
          description:
            "Response payload now includes `secret_expires_at` and `tolerance_seconds` to support zero-downtime signing secret rollovers.",
        },
      ],
      published_at: "2026-10-18T11:05:00.000Z",
      is_published: true,
      version_tag: "v2026.10.1",
    },
    {
      id: "44444444-4444-4444-8444-444444444403",
      project_id: "33333333-3333-4333-8333-333333333301",
      commit_hash: "7e19a43c92b0184d3a7f6c5e12349876543210fe",
      commit_message:
        "feat(treasury): multi-currency virtual IBAN provisioning and legacy v1/tokens removal",
      title: "Virtual Euro & GBP IBAN Provisioning API",
      summary:
        "Partners can now programmatically issue dedicated virtual IBANs per connected sub-merchant via `POST /v1/treasury/iban-accounts`. The `tax_id_verification` status object has also been added to merchant onboarding responses.",
      has_breaking_changes: false,
      raw_diff: {
        diff: {
          endpoints: {
            added: [
              {
                method: "POST",
                path: "/v1/treasury/iban-accounts",
              },
            ],
            modified: [
              {
                method: "PATCH",
                path: "/v1/accounts/{account_id}",
                responsePropertiesAdded: ["tax_id_verification"],
              },
            ],
          },
        },
        breaking: [],
      },
      structured_changes: [
        {
          tag: "NEW",
          endpoint: "POST /v1/treasury/iban-accounts",
          description:
            "Provision dedicated DE, NL, and GB virtual IBANs for automated reconciliation of incoming wire transfers.",
        },
        {
          tag: "CHANGED",
          endpoint: "PATCH /v1/accounts/{account_id}",
          description:
            "Returns `tax_id_verification` sub-object containing real-time VIES and IRS TIN matching status codes.",
        },
      ],
      published_at: "2026-10-04T09:40:00.000Z",
      is_published: true,
      version_tag: "v2026.10.0",
    },
    {
      id: "44444444-4444-4444-8444-444444444404",
      project_id: "33333333-3333-4333-8333-333333333302",
      commit_hash: "8c32f11a54e9012b7d4c6a8f1029384756abcdef",
      commit_message:
        "feat(embeddings): add dimensions quantization parameter and deprecate v1/completions",
      title: "Int8 Vector Quantization & Legacy Completions Deprecation",
      summary:
        "Added `encoding_format: int8 | binary` and custom `dimensions` truncation to `POST /v1/embeddings` to cut vector index memory by 4x. Marked `POST /v1/completions` as deprecated in favor of `POST /v1/chat/completions`.",
      has_breaking_changes: false,
      raw_diff: {
        diff: {
          endpoints: {
            modified: [
              {
                method: "POST",
                path: "/v1/embeddings",
                propertiesAdded: ["dimensions", "encoding_format"],
              },
              {
                method: "POST",
                path: "/v1/completions",
                deprecated: true,
              },
            ],
          },
        },
        breaking: [],
      },
      structured_changes: [
        {
          tag: "CHANGED",
          endpoint: "POST /v1/embeddings",
          description:
            "Added `dimensions` (256–3072) and `encoding_format` (`float`, `int8`, `binary`) request parameters for Matryoshka embeddings.",
        },
        {
          tag: "DEPRECATED",
          endpoint: "POST /v1/completions",
          description:
            "Legacy text completions endpoint is now deprecated; use `POST /v1/chat/completions` with structured JSON outputs.",
        },
      ],
      published_at: "2026-10-24T18:10:00.000Z",
      is_published: true,
      version_tag: "v2.4.0",
    },
  ],
};
