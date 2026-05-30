#!/usr/bin/env node
// verify.mjs — Matter Decision Record Audit Stream verifier.
//
// Verifies:
//   1. Schema validation against schema/matter-decision-event.schema.json
//   2. Hash chain integrity (canonical-JSON SHA-256, prev_hash chained)
//   3. **Privilege-tier consistency invariant**: every event has resource.privilege_tier,
//      AND any kind=brief-draft / citation-validated / work-product-stamped event MUST
//      be tagged 'work-product' or 'privileged' (never 'public-record' or 'opposing-party-quarantine').
//   4. **Engagement-letter binding invariant**: any kind that touches matter data MUST
//      include conflict_check.passed_at AND conflict_check.engagement_letter_url.
//      (ABA Rule 1.7/1.9 — no work on a matter without a passed conflict check.)
//   5. **Citation-validation-before-production-ready invariant**: a work-product-stamped
//      event with outcome.recommendation='production-ready' MUST be preceded in the
//      same stream by at least one citation-validated event on the same resource.
//      (ABA Rule 3.3 candor-toward-tribunal — anti-hallucination guardrail.)
//
// Exit codes:
//   0 — all events valid
//   1 — schema failed
//   2 — chain failed
//   3 — privilege-tier consistency invariant violated
//   4 — engagement-letter binding invariant violated
//   5 — citation-validation invariant violated
//   6 — usage / IO error

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ZERO_HASH = "0".repeat(64);

// Kinds that require an engagement-letter-bound conflict check
const MATTER_DATA_KINDS = new Set([
  "legaltech.matter.intake-document-read",
  "legaltech.matter.recommendation-produced",
  "legaltech.matter.brief-draft-generated",
  "legaltech.matter.citation-validated",
  "legaltech.matter.opposing-party-data-quarantined",
  "legaltech.matter.privilege-log-entry-created",
  "legaltech.matter.work-product-stamped",
  "legaltech.matter.cross-matter-search-issued",
  "legaltech.matter.disclosure-to-tribunal-recommended"
]);

const WORK_PRODUCT_AWARE_KINDS = new Set([
  "legaltech.matter.brief-draft-generated",
  "legaltech.matter.citation-validated",
  "legaltech.matter.work-product-stamped"
]);

const ALLOWED_WP_TIERS = new Set(["privileged", "work-product", "joint-defense", "common-interest", "pre-litigation-investigative-privilege"]);

function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalize(value[k])).join(",") + "}";
}
const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");

function loadStream(path) {
  return readFileSync(path, "utf8").trim().split("\n").map((line, i) => {
    try { return JSON.parse(line); } catch (e) {
      throw new Error(`line ${i + 1}: invalid JSON — ${e.message}`);
    }
  });
}

function main() {
  const path = process.argv[2];
  if (!path) { console.error("usage: verify.mjs <stream.ndjson>"); process.exit(6); }

  let events;
  try { events = loadStream(path); }
  catch (e) { console.error(`load error: ${e.message}`); process.exit(6); }

  // Schema
  const schemaPath = new URL("../schema/matter-decision-event.schema.json", import.meta.url);
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  for (const [i, event] of events.entries()) {
    if (!validate(event)) {
      console.error(`event[${i}] (${event.event_id}) schema fail:`);
      for (const e of validate.errors || []) console.error(`  ${e.instancePath} ${e.message}`);
      process.exit(1);
    }
  }

  // Chain
  let prev = ZERO_HASH;
  for (const [i, event] of events.entries()) {
    if (event.prev_hash !== prev) {
      console.error(`event[${i}] (${event.event_id}) chain: prev_hash=${event.prev_hash} expected=${prev}`);
      process.exit(2);
    }
    const { hash, ...body } = event;
    const expected = sha256(canonicalize(body));
    if (hash !== expected) {
      console.error(`event[${i}] (${event.event_id}) chain: hash=${hash} recomputed=${expected}`);
      process.exit(2);
    }
    prev = event.hash;
  }

  // Invariant 3: privilege-tier consistency on work-product-aware kinds
  for (const [i, event] of events.entries()) {
    if (WORK_PRODUCT_AWARE_KINDS.has(event.kind)) {
      if (!ALLOWED_WP_TIERS.has(event.resource.privilege_tier)) {
        console.error(`event[${i}] (${event.event_id}) privilege-tier: kind=${event.kind} requires tier in {${[...ALLOWED_WP_TIERS].join(", ")}}, got "${event.resource.privilege_tier}"`);
        process.exit(3);
      }
    }
  }

  // Invariant 4: engagement-letter binding
  for (const [i, event] of events.entries()) {
    if (MATTER_DATA_KINDS.has(event.kind)) {
      if (!event.conflict_check?.passed_at || !event.conflict_check?.engagement_letter_url) {
        console.error(`event[${i}] (${event.event_id}) engagement-letter: kind=${event.kind} requires conflict_check.passed_at + conflict_check.engagement_letter_url`);
        process.exit(4);
      }
    }
  }

  // Invariant 5: citation-validation precedes production-ready work-product stamp
  for (const [i, event] of events.entries()) {
    if (event.kind === "legaltech.matter.work-product-stamped" && event.outcome?.recommendation === "production-ready") {
      const resourceId = event.resource.id_tokenized;
      const priorValidations = events.slice(0, i).filter((e) =>
        e.kind === "legaltech.matter.citation-validated" &&
        e.resource?.id_tokenized === resourceId
      );
      if (priorValidations.length === 0) {
        console.error(`event[${i}] (${event.event_id}) citation-validation: production-ready work-product-stamped on resource ${resourceId} requires a prior citation-validated event on the same resource`);
        process.exit(5);
      }
    }
  }

  console.log(`OK · ${events.length} events · schema ✓ · chain ✓ · privilege-tier ✓ · engagement-letter ✓ · citation-validation ✓`);
}

main();
