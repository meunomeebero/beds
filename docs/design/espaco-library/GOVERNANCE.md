# Espaço — governance and delivery protocol

Scope: the portable library and explicitly identified consumers. Start at the [map](README.md); read only the affected contract. This protocol does not authorize delegation, commits, publishing, integration or deployment.

## Authority and conflicts

| Concern | Rule |
|---|---|
| Visual authority | [Foundations](FOUNDATIONS.md) owns approved typography, colors, icons, spacing, radii and component contexts. Consumer preferences do not create local exceptions. |
| Implementation | Public declarations own API syntax; CSS owns executed values. A mismatch with the approved contract is a defect to investigate, not an automatic new design decision. |
| Evidence | M = measured; D = declared; A = local adaptation; U = unobserved. Evidence describes its recorded state; historical measurements cannot override later explicit adoptions. |
| Product ownership | Caller owns copy, data, routing, requests, callbacks, recovery and business policy. A fixture is not a product requirement. |
| Design changes | Use an existing semantic variant first. Missing pattern → search beUI per [External component sourcing](EXTERNAL-COMPONENT-SOURCING.md), then shared proposal; no CSS, token override or arbitrary visual prop in a consumer. |
| New decision | Record rationale, affected components, source/adaptation, states, migration impact and validation. Ask the design owner if resolving the conflict requires a new aesthetic or product choice. |
| Accessibility | Report objective failures even if a shared rule causes them. Reference fidelity and design approval never waive accessibility findings. |

Generic skills are mandatory review inputs for BEDS UI tasks, not a second token system. [Interface quality](INTERFACE-QUALITY.md) owns automatic seven-skill routing, evidence and known tensions. Agents must invoke that workflow without waiting for a user skill request; missing skill/review evidence never becomes an approval.

## Scope-appropriate verification

| Change | Required checks |
|---|---|
| Documentation only | Check approved decisions against source; check all DS links including untracked files; regenerate portable docs; artifact parity if package content changes. No fabricated browser or full Better review. |
| Guard/build tooling | Focused positive/negative regression fixtures; library and consumer checks; documentation gate; artifact gate when packaging is affected. |
| Component visuals or interaction | Automatic Better workflow: all seven entrypoints before decisions and all six domains before handoff; browser evidence for both themes, desktop/mobile, keyboard, long content and affected entry/re-entry/recovery states. |
| Consumer composition | Same automatic Better workflow; strict consumer scan of every declared UI root; rendered composition and state review. A catalog wrapper or passing subset is not a compliant application. |
| Visual acceptance | Independent comparison to a versioned approved baseline, then separate design-owner aesthetic decision. Respect a no-delegation instruction; leave independent review pending rather than inventing a reviewer. |

For a visual change: record intended anatomy → implement shared fix → run gates → inspect render → independent comparison → owner decision. Repeat failed stages only as needed; preserve previous evidence as a dated checkpoint.

## Delivery status

Every handoff distinguishes **implementation**, **static gates**, **package artifact**, **visual audit**, and **aesthetic approval**. Mark each completed, pending, blocked, or not applicable with a reason. A docs-only change can be completed while the existing UI's visual acceptance remains pending.

| Verdict | Meaning |
|---|---|
| BLOCK | Confirmed blocker remains in the assessed scope. |
| PENDING | Required check or independent review is missing; no acceptance claim. |
| PASS_WITH_NOTES | Required scoped checks completed; disclosed nonblocking findings remain. |
| PASS | Required scoped checks/reviews completed without outstanding findings. Not aesthetic approval. |
| Aesthetic approval | Explicit design-owner decision for the named render/snapshot; never inferred from tests. |

Record exact scope, commands, totals, skips, evidence and limitations. An upstream `Approve` with MEDIUM/LOW findings is at most PASS_WITH_NOTES after local required checks. Historical verdict names retain their original context, not present acceptance.

## Documentation ownership

- Canonical Markdown: `docs/design/espaco-library/`; generated mirror: `packages/beds/docs/`.
- Keep current rules in their owner document. Indices, examples and agent instructions link there instead of copying geometry, inventory counts or candidate versions.
- New canonical document → row in this library map and repository README. Build exports it; `check:docs` checks links/indexing without relying on Git tracking.
- Source evidence and old validation runs remain historical. Do not rewrite an old result to describe a new snapshot or delete evidence to obtain a pass.
- Documentation/build changes → rebuild and validate the artifact. Archive hashes stay outside the archive to avoid self-reference.
- Package/lab routing may override legacy visual rules only within the portable DS scope; no automatic migration of product screens.

## Visual baseline gate

`node packages/beds/scripts/check-visual-baseline.mjs approved-baseline.json reviewer-audit.json`

Read-only. Baseline: ID, versioned source, M/D/A origin, explicit approval/date, viewport/theme/state and metrics. Audit: same context/ID, independent reviewer, capture and every metric. The gate rejects mismatches and never rewrites a baseline.

This validates structured evidence, not screenshot perception or reviewer honesty. Static guards also cannot police excluded roots, host CSS or deliberately bypassed tooling. Neither is a security sandbox or a guarantee that future agents followed the protocol.
