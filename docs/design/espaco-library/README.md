# Espaço — portable SaaS interface library

Canonical library: `beds`. React 19; two fixed themes; one brand color. Independent of Curriculol business rules. This map is the entrypoint, not another geometry specification.

## Read only the relevant path

| Task | Read next |
|---|---|
| Compose an application | [Consumer contract](CONSUMER-CONTRACT.md) → relevant [Components](COMPONENTS.md) / [States](STATES.md) entries |
| Build or change a primitive | [Foundations](FOUNDATIONS.md) → relevant component/state contract → [Governance](GOVERNANCE.md) |
| Review UI quality | [Interface quality](INTERFACE-QUALITY.md) → affected contracts → Governance evidence requirements |
| Inspect current MCP/Profile review | [2026-09-15 audit](REVIEW-MCP-PROFILE-2026-09-15.md): named preview only; findings remain open |
| Maintain documentation | Governance → [Documentation audit](DOCUMENTATION-AUDIT.md); no UI or full skill-suite pass unless rendering changes |
| Build or hand off a package | [Artifact validation](ARTIFACT-VALIDATION.md) → [Validation](VALIDATION.md) |
| Inspect an example | [Lucy](LUCY-COMPOSITION.md), [MCP](MCP-COMPOSITION.md), or [Data patterns](DATA-PATTERNS.md); not a production-flow specification |
| Trace a design decision | [Provenance](PROVENANCE.md) → [Original measurements](REFERENCE-MEASUREMENTS.md), only when needed |

## Ownership

| Concern | Single owner |
|---|---|
| Active visual decisions | Foundations: approved Lucy sidebar/dark neutrals, Inter/Geist, Lucide, contextual geometry and transparent cards |
| Public API | Package `src/index.ts` and exported TypeScript declarations; Components explains intended use |
| Runtime values | Package `src/tokens.css` and component styles; Foundations records the approved contract |
| Consumer behavior | Application data, copy, routes, requests, persistence and business policy |
| Quality protocol | Governance; Better skills guide review but do not replace approved DS values |
| Verification | Validation records a specific snapshot and scope; never inherited approval |
| Historical evidence | Provenance / Original measurements / legacy prototype; not current instructions |

Repository authors edit `docs/design/espaco-library/*.md`. Build generates the portable `packages/beds/docs/*.md` mirror; never edit both independently. Standalone consumers read the shipped mirror. Package `AGENTS.md` and README route here rather than repeat measurements.

The old `apps/web/src/design-system/espaco` prototype, terminal product typography and D5 screen contracts are separate systems. Do not merge their visual defaults into this package. A code/doc disagreement is drift to investigate against the approved decision, not permission to declare either side correct automatically.

Local candidate version comes from package metadata; executed inventory and gates from Validation. New patterns require a shared library contract, not consumer CSS. Technical checks do not grant aesthetic approval or establish universal accessibility.
