# BEDS — agent entrypoint

Read [the DS map](docs/design/espaco-library/README.md), then the task-relevant contract.

## Active product-agnostic migration

Read [Agnostic DS](docs/design/espaco-library/AGNOSTIC-DS.md) first. The user now
requires reusable individual components and a style guide, not complete product
compositions. This supersedes older instructions below that force every app
layout into the library. App identity, brand presets and page hierarchy are
consumer-owned. Preserve existing consumers until an explicit migration; do not
interpret legacy exports or guards as approval to expand product coupling.

## Automatic Better skill routing — mandatory

For every BEDS UI task, automatically load and apply `better-interface` and all six owners before design/code decisions: `better-accessibility`, `better-layout`, `better-writing`, `better-typography`, `better-colors`, `better-ui`. Do not wait for the user to name a skill. Read their complete entrypoints and task-relevant references; announcing a skill is not using it. Follow [Interface quality](docs/design/espaco-library/INTERFACE-QUALITY.md) for the workflow, conflicts and required evidence.

Before handoff, review the complete affected screen/flow in all six domains and report findings plus unverified checks. Missing skills/evidence forbid an approval claim. Never equate a static pass with visual approval or guaranteed quality. Documentation-only/backend tasks are not fabricated UI reviews.

## Landing-page skill routing

For SaaS landing-page creation or review of positioning, hero, benefits, proof,
offer presentation or CTAs, automatically read and apply the complete
[marc-lou-landing-page skill](packages/beds/skills/marc-lou-landing-page/SKILL.md)
and its relevant references. Follow [Landing-page routing](docs/design/espaco-library/LANDING-PAGE-SKILL.md)
for scope and consumer setup. Better and approved DS contracts still own visual
quality. This lens does not automatically apply to dashboards, post-signup
onboarding or cosmetic-only primitive maintenance; it does not authorize offer
changes or establish conversion uplift.

## Component sourcing — beUI first, mandatory

Before building or replacing any component, search beUI through its MCP (`https://mcp.beui.dev/mcp`) or static registry, and adopt the match instead of authoring from scratch. Do not wait for the user to ask. Order → beUI (same anatomy) → beUI modified → from scratch, with the reason recorded when nothing fits.

BEDS is built on the beUI stack since 2026-09-17: Tailwind v4 utilities compiled into `dist/styles.css`, shadcn token naming with BEDS values, `motion` (approved 2026-09-16) as the interaction-motion engine, and an internal `cn` helper. Preserve useful upstream anatomy, state logic, motion and geometry. Adapt dimensions only for a documented need validated in the affected states; a geometry swap is a design change, not an automatic improvement. Never run `npx shadcn add` (installs whole registry trees); fetch individual slugs. beUI source is never imported at runtime — it is pasted and becomes BEDS-owned. Tailwind/`cn`/shadcn are internal to the package and never reach the public API (no `className` on exported components). beUI Pro is unlicensed here. Record slug, URL and retrieval date, attribute in `THIRD-PARTY-NOTICES.md`, and follow [External component sourcing](docs/design/espaco-library/EXTERNAL-COMPONENT-SOURCING.md). Upstream polish is not aesthetic approval.

## Repository boundaries

- This repository owns the portable design system. `beds` is the actual package/import name; no legacy package alias.
- Foundations guide reusable component visuals: two themes, one caller-owned brand color and semantic variants. Apps own page composition, semantic HTML, layout CSS and identity assets. Read tokens without overriding private `.es-*` selectors or redefining `--es-*` properties; do not duplicate existing interaction logic.
- Canonical docs: `docs/design/espaco-library/`; source: `packages/beds/src/`; generated package docs/dist: build outputs, never hand-edit.
- Product data, business rules, routes, backend and credentials do not belong here. Catalog examples use synthetic state only.
- Missing pattern: keep product-specific composition in the app. Admit a reusable component only with a single job, two unrelated uses, a BEUI sourcing decision, shared API/contract, catalog example, states, focused regression and light/dark responsive evidence. Follow Governance and the pinned Better suite; technical tests are not aesthetic approval.
- Package/runtime change: matching docs and tests; run `npm run verify`. Visual changes also require affected browser checks. Record unavailable gates honestly.
- External API/library guidance: consult Context7 when available; if unavailable, report it and verify against official version-appropriate documentation. Never invent an API from memory.
- Preserve third-party font licenses and provenance. Public repository visibility does not grant a new license to project-owned code or reference artwork.
- No secrets, local paths, transient test reports, product repository history or user data. Keep prior evidence historical.
- Commit/push/release needs user authorization. No force-push, tag replacement, app deployment or implicit consumer upgrade. New releases are immutable; pin consumers to an exact release and integrity hash.
- Do not push to `master`/`main` without explicit same-turn authorization naming that branch. Use a `codex/` branch otherwise.
