# BEDS — agent entrypoint

Read [the DS map](docs/design/espaco-library/README.md), then the task-relevant contract.

## Automatic Better skill routing — mandatory

For every BEDS UI task, automatically load and apply `better-interface` and all six owners before design/code decisions: `better-accessibility`, `better-layout`, `better-writing`, `better-typography`, `better-colors`, `better-ui`. Do not wait for the user to name a skill. Read their complete entrypoints and task-relevant references; announcing a skill is not using it. Follow [Interface quality](docs/design/espaco-library/INTERFACE-QUALITY.md) for the workflow, conflicts and required evidence.

Before handoff, review the complete affected screen/flow in all six domains and report findings plus unverified checks. Missing skills/evidence forbid an approval claim. Never equate a static pass with visual approval or guaranteed quality. Documentation-only/backend tasks are not fabricated UI reviews.

## Repository boundaries

- This repository owns the portable design system. `beds` is the actual package/import name; no legacy package alias.
- Approved Foundations own visuals. Two fixed themes, one brand color, semantic variants only. No consumer CSS/token overrides or duplicate primitives.
- Canonical docs: `docs/design/espaco-library/`; source: `packages/beds/src/`; generated package docs/dist: build outputs, never hand-edit.
- Product data, business rules, routes, backend and credentials do not belong here. Catalog examples use synthetic state only.
- Missing pattern: shared API/contract, catalog example, states, focused regression and light/dark responsive evidence. Follow Governance and the pinned Better suite; technical tests are not aesthetic approval.
- Package/runtime change: matching docs and tests; run `npm run verify`. Visual changes also require affected browser checks. Record unavailable gates honestly.
- External API/library guidance: consult Context7 when available; if unavailable, report it and verify against official version-appropriate documentation. Never invent an API from memory.
- Preserve third-party font licenses and provenance. Public repository visibility does not grant a new license to project-owned code or reference artwork.
- No secrets, local paths, transient test reports, product repository history or user data. Keep prior evidence historical.
- Commit/push/release needs user authorization. No force-push, tag replacement, app deployment or implicit consumer upgrade. New releases are immutable; pin consumers to an exact release and integrity hash.
- Do not push to `master`/`main` without explicit same-turn authorization naming that branch. Use a `codex/` branch otherwise.
