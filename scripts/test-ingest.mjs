#!/usr/bin/env node
/**
 * SpecSync End-to-End Dogfooding & Ingestion Test Script
 * Dispatches `examples/sample-oasdiff-payload.json` to `POST /api/v1/ingest`
 * using the `acme-payments` Bearer API Key.
 */

import fs from "fs";
import path from "path";

const API_URL =
  process.env.SPECSYNC_INGEST_URL || "http://localhost:3000/api/v1/ingest";
const API_KEY =
  process.env.SPECSYNC_API_KEY || "ss_live_acme_payments_demo_key_2026";

async function main() {
  const payloadPath = path.join(
    process.cwd(),
    "examples",
    "sample-oasdiff-payload.json"
  );
  const rawPayload = fs.readFileSync(payloadPath, "utf-8");

  console.log(`[SpecSync Dogfooding] POST ${API_URL}`);
  console.log(`[SpecSync Dogfooding] Authorization: Bearer ${API_KEY.slice(0, 14)}...`);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: rawPayload,
  });

  const result = await response.json();
  console.log(`[SpecSync Dogfooding] HTTP Status: ${response.status}`);
  console.log(JSON.stringify(result, null, 2));

  if (!response.ok) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("[SpecSync Dogfooding] Error:", err);
  process.exitCode = 1;
});
