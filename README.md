# matter-decision-record-audit-stream

> **LegalTech audit-stream Operator (Spec #1 of the LegalTech 6-pack).** Hash-chained append-only ledger of which AI tool read which matter / privileged / work-product document, when, under which ABA Model Rule + state-bar formal-opinion + court-order + engagement-letter binding. Every event carries an explicit `privilege_tier` — the LegalTech vertical's design innovation versus sibling-vertical audit-streams.

Part of the [Kinetic Gain Protocol Suite](https://suite.kineticgain.com).

> Status: v0.1 draft. Schema at [`schema/matter-decision-event.schema.json`](./schema/matter-decision-event.schema.json), canonical 7-event chain at [`examples/anchor-reef-mattermind-2026q3-stream.ndjson`](./examples/anchor-reef-mattermind-2026q3-stream.ndjson), verifier at [`src/verify.mjs`](./src/verify.mjs).

## Regulatory floor

- **ABA Model Rule 1.1 Comment 8** — competence with technology (lawyers must understand the AI tools they delegate work to)
- **ABA Model Rule 1.6** — confidentiality of client information
- **ABA Model Rule 1.6(c)** — reasonable efforts to prevent unauthorized disclosure
- **ABA Model Rule 1.7 / 1.9** — conflict of interest (current / former clients)
- **ABA Model Rule 3.3** — candor toward the tribunal (anti-hallucination guardrail)
- **ABA Model Rule 5.3** — responsibilities regarding non-lawyer assistants (extended to AI)
- **ABA Model Rule 5.5** — unauthorized practice of law
- **Attorney-client privilege** (common-law)
- **Work-product doctrine** (Fed. R. Civ. P. 26(b)(3))
- **State bar formal opinions** — California (Nov 2023 practical guidance), New York (COSAC), Florida, DC, and others
- **Engagement letter** — the binding instrument that authorizes representation; the Decision Card is its machine-readable companion

## Canonical example

- **Buyer:** Anchor & Reef LLP
- **Vendor / AI system:** VendorL MatterMind v4.x

## Three invariants enforced by the verifier

1. **Privilege-tier consistency** — every event has `resource.privilege_tier`, and any `brief-draft-generated` / `citation-validated` / `work-product-stamped` event MUST be tagged `privileged` / `work-product` / `joint-defense` / `common-interest` / `pre-litigation-investigative-privilege`. Never `public-record` or `opposing-party-quarantine`.

2. **Engagement-letter binding** — any matter-data-touching kind MUST include `conflict_check.passed_at` + `conflict_check.engagement_letter_url`. ABA Rule 1.7/1.9: no work on a matter without a passed conflict check.

3. **Citation-validation-before-production-ready** — a `work-product-stamped` event with `outcome.recommendation = "production-ready"` MUST be preceded in the same stream by at least one `citation-validated` event on the same resource. ABA Rule 3.3 candor-toward-tribunal — designed to break the *Mata v. Avianca* failure mode where AI-hallucinated citations reach the tribunal.

## Key design innovations vs sibling-vertical audit-streams

| Innovation | Why it's LegalTech-specific |
| --- | --- |
| `resource.privilege_tier` REQUIRED on every event | No other vertical carries privilege as a first-class field; it drives reveal-roles + cross-matter-firewall rules downstream |
| `conflict_check` block bound to `engagement_letter_url` | The engagement letter (not just procurement) is the binding instrument under ABA 1.7/1.9 |
| `legaltech.matter.citation-validated` kind + invariant | Hard-codes the Mata v. Avianca lesson into the schema itself |
| Outcome status `blocked-by-privilege-tier` | Makes vault-contract-aware blocking a first-class outcome, not a side effect |

## Verify

```bash
npm install
npm run build:examples   # builds the canonical 7-event chain
npm run verify           # validates schema + chain + 3 invariants
```

## Composes with

- [`attorney-client-data-vault-contract-profile`](https://github.com/mizcausevic-dev/attorney-client-data-vault-contract-profile) — the Decision Card vault contract whose `privilege_tier` taxonomy drives `resource.privilege_tier` on this stream
- [`aba-rule-1-6-readiness-evidence-bundle`](https://github.com/mizcausevic-dev/aba-rule-1-6-readiness-evidence-bundle) — readiness evidence bundle this stream supplies events to
- [`legal-ai-incident-card-profile`](https://github.com/mizcausevic-dev/legal-ai-incident-card-profile) — where any verifier failure (`status: "blocked-by-privilege-tier"`) becomes a published Incident Card
- [`state-bar-ai-disclosure-tracker`](https://github.com/mizcausevic-dev/state-bar-ai-disclosure-tracker) — state-bar AI disclosure lifecycle context
- [`fhir-resource-access-audit`](https://github.com/mizcausevic-dev/fhir-resource-access-audit) — sibling-vertical audit-stream (HealthTech)
- [Kinetic Gain Protocol Suite](https://suite.kineticgain.com) — umbrella

## Compliance posture

Audit-stream **readiness scaffolding** for AI tools that touch privileged or work-product material. A buyer law firm signing a Decision Card for a legal-AI vendor gets a portable, privilege-aware, hash-chained record of access. This does **not** constitute ABA-compliance certification, state-bar approval, or a substitute for the firm's own ethics-program — per the standing public-language guardrail across the Suite.

## License

Spec text + JSON schemas + example documents + reference verifier: MIT.
