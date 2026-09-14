# BEDS — agent entrypoint

Read [the DS map](docs/design/espaco-library/README.md), then the task-relevant contract.

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
