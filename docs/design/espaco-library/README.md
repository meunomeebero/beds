# Espaço — portable SaaS interface library

Canonical library: `beds`. React 19; two fixed themes; one brand color. Independent of Curriculol business rules. This map is the entrypoint, not another geometry specification.

## Read only the relevant path

| Task | Read next |
|---|---|
| Current consolidated review | [Better review](REVIEW-CONSOLIDATION-2026-09-15.md) → [Validation](VALIDATION.md);[earlier checkpoint](CONSOLIDATION-2026-09-15.md) remains historical |
| Find useful animation | [Motion opportunities](MOTION-OPPORTUNITIES-2026-09-15.md): Emil advisory,four candidates;not implemented |
| Compose an application | [Consumer contract](CONSUMER-CONTRACT.md) → relevant [Components](COMPONENTS.md) / [States](STATES.md) entries |
| Build or change a primitive | [Foundations](FOUNDATIONS.md) → relevant component/state contract → [Governance](GOVERNANCE.md) |
| Need a pattern BEDS lacks | [External component sourcing](EXTERNAL-COMPONENT-SOURCING.md): search beUI before building from scratch;MIT adapt-never-install contract,provenance and attribution |
| Track F2 beUI migration | [F2 migration tracking](F2-MIGRATION-TRACKING.md): implementation status, helper dependencies, extraction boundary and restart point |
| Track F3 numeric/data decisions | [F3 decisions](F3-MIGRATION-DECISIONS.md): typed numeric motion adoption and explicit no-fit provenance |
| Track the full migration | [F0–F4 closeout](F0-F4-MIGRATION-TRACKING.md): authoritative phase inventory, acceptance criteria, evidence boundary and final status |
| Looking for motion to add | [beUI opportunities audit](BEUI-OPPORTUNITIES-2026-09-16.md): measured motion gap,replace/enhance/new candidates by intensity,open owner decisions |
| Review UI quality | [Interface quality](INTERFACE-QUALITY.md) → affected contracts → Governance evidence requirements |
| Create or improve a SaaS landing | [Landing-page skill](LANDING-PAGE-SKILL.md): portable `marc-lou-landing-page`, automatic scoped routing, product proof and honest CTAs |
| Compose the full landing | [Landing composition and review](LANDING-PAGE.md): shared header/hero/demo/workflow/FAQ, Curriculol preview, product evidence and scoped Better/Emil results |
| Show processing stages | [Processing](PROCESSING.md): controlled analysis/optimization presentation,current90s/75s fixtures,pause/recovery and timing-policy drift |
| Show analysis/optimization results | [Results](RESULTS.md): reusable proof/report/next-step patterns,Revenue-Centric conversion,owned-artifact access and simulated payment |
| Compose checkout | [Checkout](CHECKOUT.md): clear total,conditional fields,payment recovery and explicit mock confirmation;Revenue-Centric and form friction |
| Build personal opportunity cards | [Application card](APPLICATION-CARD.md): original-property mapping, adaptation and state contract |
| Organize opportunities by status | [Application kanban](KANBAN.md): compact cards, controlled moves and responsive status lanes |
| Build global discovery/search | [Search dialog](SEARCH-DIALOG.md): category filters, result rows, keyboard, controlled data and recovery |
| Build contextual detail panels | [Drawer](DRAWER.md): modal panel, scrollable sections and focus recovery |
| Build illustrated empty states | [Empty state](EMPTY-STATE.md): message-first card,image recovery,optional folder/flies with pause,reduced motion and compact alternative |
| Ask questions or request approval | [Decisions](DECISIONS.md): numbered choice, confirmation, operational badge, allow/skip/deny and controlled recovery |
| Present pricing plans | [Pricing](PRICING.md): illustrated cards, price/terms, benefits, one emphasized action and host-owned billing |
| Present metadata and record options | [Records](RECORDS.md): key/value rows, connected-item list, controlled disclosures and switches |
| Compose onboarding | [Onboarding](ONBOARDING.md): focused form,live decorative preview,controlled validation and feedback |
| Select a resume/document | [Document upload](DOCUMENT-UPLOAD.md): illustrated drop field,local selection,recovery and full filenames |
| Show dated entries | [Date item](DATE-ITEM.md): mini calendar,title,status and native/static rows |
| Confirm an already-paid purchase | [Payment confirmation](PAYMENT-CONFIRMATION.md): animated paper receipt,separate invoice states and host-owned actions |
| Show account credits | [Account credits](ACCOUNT-CREDITS.md): compact menu footer,truthful balance/limit,retry and host-owned action |
| Show forum topics | [Forum topics](FORUM-TOPICS.md): avatar rows,unread/current state,full-text recovery and native destinations |
| Show blog posts | [Blog posts](BLOG-POST.md): thumbnail-led editorial cards,metadata,passive topics and native article links |
| Close a marketing page | [Landing footer](LANDING-FOOTER.md): quiet navigation, oversized decorative brand and one native CTA |
| Show product benefits | [Landing benefits](BENEFITS.md): illustrated bento, first-card emphasis, responsive reading order and native CTA |
| Compose account settings | [Settings](SETTINGS.md): top tabs, open sections, controlled forms; `?view=settings`; minimal form regression remains `?view=settings-form` |
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
