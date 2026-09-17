# BEDS — landing-page skill

Owner: [marc-lou-landing-page](../../../packages/beds/skills/marc-lou-landing-page/SKILL.md).
Purpose: portable SaaS landing strategy, product proof, copy hierarchy and honest
conversion paths. Not an official Marc Lou package or a conversion guarantee.

## Routing

| Work | Route |
|---|---|
| Create/rework a SaaS landing; revise hero, benefits, proof, offer presentation or CTA strategy | Automatically read and apply `marc-lou-landing-page` and its relevant reference sections |
| BEDS landing UI implementation/review | Also follow mandatory [Better routing](INTERFACE-QUALITY.md); visual values remain in [Foundations](FOUNDATIONS.md) |
| Motion in the landing | Relevant motion skill and approved DS motion contract; no ornamental animation requirement |
| Pure primitive maintenance, dashboard, account settings, post-signup onboarding | Not this skill's automatic scope; use the relevant surface guidance |
| Pricing/business-model change | Product-owner decision; this skill only presents the approved offer |
| Brief/copy-only advice | Evidence-backed recommendations; no fictional rendered review or measured conversion result |

This skill complements, not replaces, onboarding guidance. It ends at the agreed
CTA destination; it does not implicitly redesign signup or activation.

## Packaging and consumption

Canonical source: `packages/beds/skills/marc-lou-landing-page/`. The archive
includes that complete directory as `skills/marc-lou-landing-page/`; no build-time
mirror, runtime JavaScript import, global installation or external doc dependency.
Its reference and invocation metadata travel with `SKILL.md`.

Release boundary: added in source after RC16. Published `0.1.7-rc.16` does not
contain this skill. Until an authorized newer release exists, use the source
checkout or an explicitly selected local candidate; never replace the RC16 asset.

Consumers can read the installed package directory directly by adding this to
their applicable UI `AGENTS.md` (resolve the package location in the actual project):

```text
For SaaS landing-page creation or review of positioning, hero, benefits, proof,
offer presentation or CTAs, automatically read and apply the complete installed
beds/skills/marc-lou-landing-page/SKILL.md and its relevant references.
This is the marc-lou-landing-page skill; use the package directory as its source.
Keep BEDS Better routing and approved visual contracts in force. Do not apply
this landing lens automatically to dashboards, post-signup onboarding or
cosmetic-only primitive maintenance. It does not authorize changing business
policy or claiming conversion uplift without evidence.
```

For native skill discovery, optionally install the **whole** directory into the
agent's project skill directory (for example `.agents/skills/marc-lou-landing-page/`).
Prefer direct package routing to avoid a second copy. If a copy already exists,
compare it before replacing it; preserve local adaptations and record its BEDS
version. Package updates do not refresh copied skills. No personal absolute paths
belong in shared instructions; no automatic postinstall script changes agent config.

## Ownership and validation

- Skill: self-contained workflow, product-neutral safeguards and source attribution.
- [Landing principles](../../../packages/beds/skills/marc-lou-landing-page/references/landing-principles.md): selective lenses; no fixed section count or forced SaaS template.
- [UI metadata](../../../packages/beds/skills/marc-lou-landing-page/agents/openai.yaml): implicit invocation enabled; discovery still depends on the host agent.
- Product: language, audience, proof, price, promises and real destinations.
- DS: components, tokens, responsive behavior and accessibility.
- Validation: frontmatter plus local links and packaged-file integrity; independent
  scenario review for meaningful instruction changes. These do not certify
  conversion, agent compliance or visual quality of a future landing.

Keep this document indexed in both README maps. Rebuild portable docs and run
documentation/artifact gates after updates. No automatic publication or consumer
upgrade is implied.

## September 16, 2026 — source addition check

| Check | Result / limit |
|---|---|
| Skill metadata | `skill-creator` quick validator passed; isolated PyYAML runner, no project dependency added |
| Build and contracts | `npm run verify` passed: build/typecheck; library 113 components/92 tokens, no violations; consumer 28 roots/31 files, no violations |
| Documentation | 80 Markdown files/734 local targets, no violations; skill-local references included |
| Regression gates | 33 package/tooling tests + 4 existing Better-routing tests passed; no skips |
| Artifact | Fresh build/pack/extract and public consumer import passed; all skill files required; local candidate only |
| Independent instruction trial | Fictional pre-launch SaaS, no customers or price, real waitlist + tester login: reviewer used labeled synthetic proof, retained login, offered waitlist CTA and did not invent pricing/social proof; no external project docs required |
| Not assessed | No UI changed; no browser/aesthetic audit or measured conversion result claimed. Original-post fidelity remains unverified |
| Delivery | Local source only; version unchanged, no commit/push/release/consumer upgrade. Published RC16 remains immutable |

The scenario trial supports that narrow behavior only; it cannot guarantee future
agent compliance. Earlier UI review findings and acceptance limits are unchanged.
