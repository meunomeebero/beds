# Espaço — documentation consolidation audit

Date: 2026-09-14. Scope: canonical portable DS docs, package rules/mirror, catalog routing and documentation gates. No UI redesign, production migration or product-policy audit.

## Resolved conflicts

| Finding | Consolidation |
|---|---|
| Two systems called current | Root maps route new work to the portable package (`@espaco/ui` at this audit; renamed `beds` in RC15); every legacy prototype document identifies its historical scope. |
| Parent mono/palette/skill bundle leaked into DS | Explicit package/catalog/documentation exception; product defaults remain unchanged outside that scope. |
| Repeated sidebar/account geometry and version counts drifted | Agent instructions, entrypoints and examples link to owners. Package metadata owns version; Components/Validation record inventory. |
| Historical source palette, account r10 and 260/48px shell mixed with current rules | Original tables moved to Reference measurements; current Foundations retain approved geometry and accessible text roles. |
| Removed polish skill still looked active | Better routing is current; old skill mentions retained only as replacement/provenance history. |
| Full UI review implied for docs-only edits | Governance now defines gates by change type; documentation review does not pretend to be browser QA. |
| Missing required review could be PASS_WITH_NOTES | Missing evidence is PENDING; technical result and aesthetic acceptance are distinct. No delegation implied. |
| Portable MCP docs depended on product-only guide and policy | Example explicitly local/synthetic; token/scopes/pricing policy removed from current portable contract. |
| Root link gate missed untracked DS files | Added filesystem-scoped `check:docs`, canonical index checks and extracted-package link checks, with regression fixtures. |

## Evidence coverage correction

Earlier “162 files / 0 broken links” entries came from the repository checker using `git ls-files`. They did not establish coverage of the then-untracked DS tree. Those run records remain historical; this audit narrows their meaning rather than silently relabeling the old results. The new DS gate scans files directly, regardless of Git status.

Current verification totals belong to [Validation](VALIDATION.md). The gate checks local file targets, index coverage and package containment; it does not validate remote URLs, fragment semantics, prose meaning or pixels. Semantic conflict review remains a human/agent responsibility.

## Open implementation reconciliation

Historical snapshot below. Both discrepancies resolved in local.24;
[September15 consolidation](CONSOLIDATION-2026-09-15.md) records current evidence.

| Finding | Evidence | Next step; not executed here |
|---|---|---|
| MCP heading typography | Source contract records 15/24px; shared `.es-page-content-header h1` in `layout.css` executes 16/20px. | Verify the intended component context against the approved reference; focused light/dark responsive typography regression before a shared fix. Not a reason for consumer CSS. |
| Sidebar profile tracking metadata | `typography.sidebarProfile.tracking` in `tokens.ts` is −.1px; `.es-workspace-trigger` in `layout.css` is −.15px. | Reconcile exported metadata with the approved rendered value; do not silently change the sidebar to match metadata. |

These are confirmed source/document inconsistencies, not fresh browser measurements. They remain pending rather than being hidden by a passing link/token gate. No new visual choice or universal conformance is approved by this audit.

## Remaining boundaries

- Complete-documentation consolidation is not complete component/a11y certification. Existing physical-touch, WebKit and assistive-technology checks remain unexecuted unless a named validation record says otherwise.
- Carousel control discoverability and compact touch/input geometry remain explicit tensions in Interface quality/States, not silently waived or changed here.
- No independent visual review or new aesthetic approval. Existing evidence and screenshots are preserved.
- Product-wide instructions, backend/CI policies, all other worktrees and installed consumer upgrades are outside this audit. Root edits only route DS scope; do not infer a repository-wide reconciliation.
- Generated docs travel with the package. Better skills require separate installation on another machine. A written protocol is not an automatic auditor or a guarantee of future compliance.
