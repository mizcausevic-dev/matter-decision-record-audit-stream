// build-examples.mjs — Builds the canonical hash-chained example stream.
// Anchor & Reef LLP × VendorL MatterMind v4.x — a 7-event privilege-aware
// matter trajectory: intake → conflict check → privilege-tier assigned →
// brief draft → citation validated → work-product stamped → privilege log.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "../examples/anchor-reef-mattermind-2026q3");
const OUT_STREAM = resolve(HERE, "../examples/anchor-reef-mattermind-2026q3-stream.ndjson");
const ZERO_HASH = "0".repeat(64);

function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalize(value[k])).join(",") + "}";
}
const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");

// Canonical agent + Decision Card refs
const AGENT = {
  ai_tool_card_url:     "https://vendorl-mattermind.example/.well-known/ai-tool-cards/mattermind-4.x.json",
  ai_decision_card_url: "https://anchor-reef.example/.well-known/decisions/AR-DEC-2026-MATTER-0042.json",
  supervising_attorney_bar_id_tokenized: "tok_bar_4f9c2e",
  supervising_attorney_jurisdiction: "NY",
  session_principal_tokenized: "tok_principal_9a01"
};
const DECISION_CARD_URL = AGENT.ai_decision_card_url;
const CONFLICT_CHECK = {
  passed_at: "2026-09-12T14:00:00Z",
  engagement_letter_url: "https://anchor-reef.example/.well-known/engagement-letters/AR-ENG-2026-MATTER-0042.json",
  conflicts_cleared: ["tok_party_op_xx12", "tok_party_op_yy44"]
};

let prevHash = ZERO_HASH;

function buildEvent(partial) {
  const event = { ...partial, prev_hash: prevHash };
  const { hash: _h, ...body } = event;
  const eventHash = sha256(canonicalize(body));
  event.hash = eventHash;
  prevHash = eventHash;
  return event;
}

const events = [
  buildEvent({
    event_id: "0190lt-0001",
    timestamp: "2026-09-12T14:05:00Z",
    kind: "legaltech.matter.intake-document-read",
    source: "anchor-reef-mattermind-prod",
    matter_ref: { scheme: "matter-id-tokenized", value: "tok_matter_AR2026_0042" },
    resource: { type: "matter-intake-form", id_tokenized: "tok_resource_intake_a1", privilege_tier: "privileged" },
    action: "read",
    outcome: { status: "success", recommendation: "no-recommendation" },
    agent: AGENT,
    regulatory_basis: ["aba-rule-1-6", "engagement-letter-binding"],
    conflict_check: CONFLICT_CHECK,
    decision_card_ref: DECISION_CARD_URL,
    redaction_applied: [
      { field: "client-name", action: "tokenize" },
      { field: "opposing-party-name", action: "tokenize" }
    ]
  }),
  buildEvent({
    event_id: "0190lt-0002",
    timestamp: "2026-09-12T14:06:30Z",
    kind: "legaltech.matter.conflict-check-run",
    source: "anchor-reef-mattermind-prod",
    matter_ref: { scheme: "matter-id-tokenized", value: "tok_matter_AR2026_0042" },
    resource: { type: "conflict-check-result", id_tokenized: "tok_resource_cc_b2", privilege_tier: "work-product" },
    action: "search",
    outcome: { status: "success", recommendation: "no-recommendation" },
    agent: AGENT,
    regulatory_basis: ["aba-rule-1-7-conflict", "aba-rule-1-9-former-client"],
    conflict_check: CONFLICT_CHECK,
    decision_card_ref: DECISION_CARD_URL
  }),
  buildEvent({
    event_id: "0190lt-0003",
    timestamp: "2026-09-12T14:08:00Z",
    kind: "legaltech.matter.privilege-tier-assigned",
    source: "anchor-reef-mattermind-prod",
    matter_ref: { scheme: "matter-id-tokenized", value: "tok_matter_AR2026_0042" },
    resource: { type: "internal-research-memo", id_tokenized: "tok_resource_memo_c3", privilege_tier: "work-product" },
    action: "stamp",
    outcome: { status: "success", recommendation: "no-recommendation" },
    agent: AGENT,
    regulatory_basis: ["work-product-doctrine-fed-r-civ-p-26-b-3"],
    conflict_check: CONFLICT_CHECK,
    decision_card_ref: DECISION_CARD_URL
  }),
  buildEvent({
    event_id: "0190lt-0004",
    timestamp: "2026-09-12T15:30:00Z",
    kind: "legaltech.matter.brief-draft-generated",
    source: "anchor-reef-mattermind-prod",
    matter_ref: { scheme: "matter-id-tokenized", value: "tok_matter_AR2026_0042" },
    resource: { type: "draft-brief", id_tokenized: "tok_resource_brief_d4", privilege_tier: "work-product" },
    action: "generate",
    outcome: { status: "success", recommendation: "draft-only" },
    agent: AGENT,
    regulatory_basis: ["aba-rule-1-1-comment-8", "aba-rule-5-3-non-lawyer-supervision"],
    conflict_check: CONFLICT_CHECK,
    decision_card_ref: DECISION_CARD_URL
  }),
  buildEvent({
    event_id: "0190lt-0005",
    timestamp: "2026-09-12T15:34:00Z",
    kind: "legaltech.matter.citation-validated",
    source: "anchor-reef-mattermind-prod",
    matter_ref: { scheme: "matter-id-tokenized", value: "tok_matter_AR2026_0042" },
    resource: { type: "draft-brief", id_tokenized: "tok_resource_brief_d4", privilege_tier: "work-product" },
    action: "transform",
    outcome: { status: "success", recommendation: "supervisor-review-required" },
    agent: AGENT,
    regulatory_basis: ["aba-rule-3-3-candor-toward-tribunal"],
    conflict_check: CONFLICT_CHECK,
    decision_card_ref: DECISION_CARD_URL
  }),
  buildEvent({
    event_id: "0190lt-0006",
    timestamp: "2026-09-12T16:00:00Z",
    kind: "legaltech.matter.work-product-stamped",
    source: "anchor-reef-mattermind-prod",
    matter_ref: { scheme: "matter-id-tokenized", value: "tok_matter_AR2026_0042" },
    resource: { type: "draft-brief", id_tokenized: "tok_resource_brief_d4", privilege_tier: "work-product" },
    action: "stamp",
    outcome: { status: "success", recommendation: "production-ready" },
    agent: AGENT,
    regulatory_basis: ["work-product-doctrine-fed-r-civ-p-26-b-3", "aba-rule-5-3-non-lawyer-supervision"],
    conflict_check: CONFLICT_CHECK,
    decision_card_ref: DECISION_CARD_URL
  }),
  buildEvent({
    event_id: "0190lt-0007",
    timestamp: "2026-09-12T16:05:00Z",
    kind: "legaltech.matter.privilege-log-entry-created",
    source: "anchor-reef-mattermind-prod",
    matter_ref: { scheme: "matter-id-tokenized", value: "tok_matter_AR2026_0042" },
    resource: { type: "privilege-log", id_tokenized: "tok_resource_priv_e5", privilege_tier: "work-product" },
    action: "stamp",
    outcome: { status: "success", recommendation: "no-recommendation" },
    agent: AGENT,
    regulatory_basis: ["aba-rule-1-6", "work-product-doctrine-fed-r-civ-p-26-b-3"],
    conflict_check: CONFLICT_CHECK,
    decision_card_ref: DECISION_CARD_URL
  })
];

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(dirname(OUT_STREAM), { recursive: true });
for (const event of events) {
  writeFileSync(resolve(OUT_DIR, `${event.event_id}.json`), JSON.stringify(event, null, 2) + "\n", "utf8");
}
writeFileSync(OUT_STREAM, events.map((e) => JSON.stringify(e)).join("\n") + "\n", "utf8");
console.log(`built ${events.length} events → ${OUT_STREAM}`);
