import crypto from "crypto";

/**
 * Generates a new SpecSync live API key (`ss_live_<32_hex_chars>`)
 * along with its deterministic SHA-256 hash stored in `projects.api_key_hash`.
 */
export function generateProjectApiKey(): {
  rawKey: string;
  keyHash: string;
  maskedPreview: string;
} {
  const randomBytes = crypto.randomBytes(20).toString("hex");
  const rawKey = `ss_live_${randomBytes}`;
  const keyHash = hashApiKey(rawKey);
  const maskedPreview = `${rawKey.slice(0, 12)}...${rawKey.slice(-4)}`;
  return { rawKey, keyHash, maskedPreview };
}

/**
 * Computes the SHA-256 hex digest of a raw Bearer API key.
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey.trim()).digest("hex");
}

/**
 * Default demo API key for the pre-seeded `acme-payments` project so developers
 * can test `/api/v1/ingest` immediately without rotating keys first.
 */
export const DEMO_ACME_RAW_API_KEY = "ss_live_acme_payments_demo_key_2026";
export const DEMO_ACME_API_KEY_HASH = hashApiKey(DEMO_ACME_RAW_API_KEY);

export const DEMO_NEXUS_RAW_API_KEY = "ss_live_nexus_ai_demo_key_2026";
export const DEMO_NEXUS_API_KEY_HASH = hashApiKey(DEMO_NEXUS_RAW_API_KEY);
