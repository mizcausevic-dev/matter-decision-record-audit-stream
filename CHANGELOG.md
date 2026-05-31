# Changelog

## 1.0.0-prod — 2026-05-31

- Hardened to v1.0-prod per squad doctrine; member of the LegalTech vertical 6-pack.
- Spec-component repo (no Pages deploy required); AGPL-3.0-or-later, synthetic example data only.
- Pulse universe entry not applicable (no custom subdomain).



## [0.1] — 2026-05-30

### Added

- Initial schema + verifier + canonical example.
- 14-kind enum covering: intake-document-read, conflict-check-run, privilege-tier-assigned, privilege-tier-changed, recommendation-produced, brief-draft-generated, citation-validated, citation-flagged-as-hallucinated, opposing-party-data-quarantined, privilege-log-entry-created, work-product-stamped, cross-matter-search-issued, disclosure-to-tribunal-recommended, deletion-requested.
- 8-value `privilege_tier` taxonomy: privileged · work-product · joint-defense · common-interest · public-record · pre-litigation-investigative-privilege · tribunal-disclosure-required · opposing-party-quarantine.
- 15-value `regulatory_basis` enum covering ABA Rules 1.1c8 / 1.6 / 1.6(c) / 1.7 / 1.9 / 3.3 / 5.3 / 5.5, plus state-bar formal opinions, engagement-letter binding, court orders, attorney-client privilege, work-product doctrine, joint-defense privilege, common-interest privilege.
- 3 invariants enforced by `src/verify.mjs`: privilege-tier consistency on work-product-aware kinds, engagement-letter binding for matter-data-touching kinds, citation-validation-before-production-ready (anti-Mata-v-Avianca).
- Canonical example: Anchor & Reef LLP × VendorL MatterMind v4.x — 7-event hash-chained matter trajectory (intake → conflict check → privilege-tier assigned → brief draft → citation validated → work-product stamped → privilege log entry).
- CI workflow.

### Not yet

- Multi-matter trajectory examples (cross-matter-search-issued, common-interest-group events).
- Tribunal-disclosure trajectory example (Rule 3.3 candor flow).
- ed25519 `signature` field examples (signing currently optional in schema).