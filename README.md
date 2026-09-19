# BEDS — Bero's Design System

Portable React19 SaaS UI. Two fixed themes, one brand color, constrained public
components and versioned design contracts. Package and import name: **beds**.
No Curriculol runtime, API, database or business logic.

UI agents must automatically use the seven Better skills before design/code
decisions and before handoff; no explicit user invocation needed. Read
[Interface quality](docs/design/espaco-library/INTERFACE-QUALITY.md) and install
its routing in each consuming UI scope's `AGENTS.md`. The protocol is mandatory;
it is not an automatic skill installer or a guarantee of visual approval.

Landing work also uses [marc-lou-landing-page](docs/design/espaco-library/LANDING-PAGE-SKILL.md):
portable guidance for positioning, product proof and conversion-focused copy.
The complete skill is bundled in source/local candidates under `skills/`; it is
not in the published RC16 archive yet. Consumer agents need the documented
routing or explicit skill installation; no runtime or background audit is added.

## Develop

Node22+; npm workspace with a committed lockfile.

```sh
npm ci --ignore-scripts
npm run verify
npm run dev
```

Catalog: `http://127.0.0.1:5283/?view=components&theme=dark`.
Curriculol landing candidate: `?view=landing&theme=light` (product demo,
benefits, credits, FAQ and native local-preview CTAs; no production integration).
Use `?view=lucy`, `?view=mcp`, `?view=feature-card` or `?view=tokens`.
Settings form example: `?view=settings-form` (native Enter submission,
caller validation/focus, light/dark; no account request).
Global search example: `?view=search` (currículos/vagas fixtures, categories,
keyboard, recovery; no real search service).
Drawer example: `?view=drawer` (vacancy details, local save, nested dialog and
recovery; no product integration).
Document upload: `?view=upload` (illustrated PDF/DOCX selection; also available
through Lucy → Importar currículo; no reading or upload).
Date item: `?view=date-item` (mini calendar, optional status/details; no scheduling).
Kanban: `?view=kanban` (compact job cards, status columns, keyboard/touch menu
movement and contextual details; synthetic only, no drag/drop or persistence).
Blog cards: `?view=blog-post` (thumbnail, author, excerpt, topics and native
article round trip; fictional content, no CMS integration).
Landing footer: `?view=landing-footer` (closing message, navigation, decorative
wordmark and native CTA; local preview links, no landing integration).
Payment confirmation: `?view=payment-confirmation` (animated receipt, invoice
pending/error/recovery; synthetic only, no charge or fiscal issuance).
Checkout: `?view=checkout` (quantity,Pix/card,summary and recovery;synthetic only,
no provider or charge). Supports both fixed themes.
Illustrated empty state: `?view=empty-state` (all-clear, first use, optional
action and image recovery; original light/dark artwork; no product request).
Folder/flies variant: `?view=empty-state&preview=folder&brand=curriculol`
(no jobs/applications;visible pause,static reduced motion;no product integration).
Questions and approvals: `?view=decisions` (numbered single choice, explicit
confirmation, allow/skip/deny, recovery; simulated results only).
Pricing comparison: `?view=pricing` (illustrated plans, price/terms, benefits,
aligned actions and recovery; fictional offers, no billing integration).
For browser checks, install Chromium through Playwright, start the catalog and
run `npm run test:browser`. Alternative port: `npm run dev -- --port 5294`;
set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5294` for matching tests.

## Consume

Install the exact `.tgz` release asset, not this repository's source archive or
a mutable branch. The package contains built ESM, declarations, CSS, fonts,
contracts and consumer checks. No lifecycle scripts required.

```sh
bun add beds@https://github.com/meunomeebero/beds/releases/download/v0.1.7-rc.16/beds-0.1.7-rc.16.tgz --ignore-scripts
```

Equivalent npm install:
`npm install https://github.com/meunomeebero/beds/releases/download/v0.1.7-rc.16/beds-0.1.7-rc.16.tgz --ignore-scripts`.
RC16 is a prerelease,not production or aesthetic acceptance. Release notes own
source SHA and archive hash. Earlier local.24/RC15 checkpoints stay historical.
Keep the exact URL and lockfile together;never install a mutable source branch.

```tsx
import { DesignSystemProvider, brands, Button } from 'beds';
import 'beds/styles.css';

<DesignSystemProvider theme="dark" brandColor={brands.curriculol}>
  <Button label="Continuar" onClick={continueFlow} />
</DesignSystemProvider>
```

Use the host application's actual theme and callbacks. Do not import
`beds/reset.css` into an existing app implicitly: it resets html/body.
Wrap only explicitly migrated screens; never enclose legacy UI to simulate migration.
[Bun tarball installation](https://bun.sh/guides/install/add-tarball).

## Documentation map

| Contract | Owner |
|---|---|
| [Consolidated Better review](docs/design/espaco-library/REVIEW-CONSOLIDATION-2026-09-15.md) | Six-domain findings,shared corrections and limits |
| [Motion opportunities](docs/design/espaco-library/MOTION-OPPORTUNITIES-2026-09-15.md) | Emil advisory;four proposals,not implemented |
| [September15 consolidation](docs/design/espaco-library/CONSOLIDATION-2026-09-15.md) | Historical local.24 checkpoint |
| [Library map](docs/design/espaco-library/README.md) | Routing and boundaries |
| [Foundations](docs/design/espaco-library/FOUNDATIONS.md) | Approved visual values |
| [Components](docs/design/espaco-library/COMPONENTS.md) | Public component anatomy |
| [InputOTP](docs/design/espaco-library/INPUT-OTP.md) | Controlled 4/6/8 digit entry, caller-owned status, motion and evidence |
| [Document upload](docs/design/espaco-library/DOCUMENT-UPLOAD.md) | Illustrated drop field, controlled selection and recovery |
| [Date item](docs/design/espaco-library/DATE-ITEM.md) | Mini calendar, dated rows and optional native destinations |
| [Blog posts](docs/design/espaco-library/BLOG-POST.md) | Compact editorial cards, native article links and thumbnail recovery |
| [Landing footer](docs/design/espaco-library/LANDING-FOOTER.md) | Oversized brand, compact navigation and native closing CTA |
| [Landing benefits](docs/design/espaco-library/BENEFITS.md) | Responsive bento, original feature illustrations and one profile CTA; `?view=benefits` |
| [Landing composition and review](docs/design/espaco-library/LANDING-PAGE.md) | Reusable hero/demo/workflow/FAQ, Curriculol product evidence, Marc/Better/Emil review; `?view=landing` |
| [Processing screens](docs/design/espaco-library/PROCESSING.md) | Shared animated analysis/optimization; `?view=analysis-loading` / `?view=optimization-loading`; local simulation only |
| [Results and conversion](docs/design/espaco-library/RESULTS.md) | Shared result patterns; `?view=analysis-result` / `?view=optimization-result`; Revenue-Centric,free/account/paid boundaries and simulated checkout |
| [Checkout](docs/design/espaco-library/CHECKOUT.md) | Focused purchase,exact host-owned total,Pix/card fields and recovery;Revenue-Centric,local simulation only |
| [Settings](docs/design/espaco-library/SETTINGS.md) | Top tabs, borderless groups and local account preferences preview |
| [Payment confirmation](docs/design/espaco-library/PAYMENT-CONFIRMATION.md) | Printer-style receipt, separate invoice status and controlled actions |
| [Application card](docs/design/espaco-library/APPLICATION-CARD.md) | Personal notes, document folio, scores and controlled next steps |
| [Application kanban](docs/design/espaco-library/KANBAN.md) | Compact card purpose, status lanes and controlled accessible moves |
| [Search dialog](docs/design/espaco-library/SEARCH-DIALOG.md) | Categorized global search, result selection and controlled recovery |
| [Drawer](docs/design/espaco-library/DRAWER.md) | Contextual details, scrollable sections and modal focus recovery |
| [Illustrated empty state](docs/design/espaco-library/EMPTY-STATE.md) | Message-first empty card, optional next step and image recovery |
| [Questions and approvals](docs/design/espaco-library/DECISIONS.md) | Decision cards, operational badges and explicit allow/skip actions |
| [Pricing comparison](docs/design/espaco-library/PRICING.md) | Image-led pricing cards, literal billing terms and controlled actions |
| [Record presentation](docs/design/espaco-library/RECORDS.md) | Compact metadata and item-level options;catalog `?view=records` |
| [Onboarding](docs/design/espaco-library/ONBOARDING.md) | Standalone form and decorative live preview;catalog `?view=onboarding` |
| [Account credits](docs/design/espaco-library/ACCOUNT-CREDITS.md) | Balance,segmented meter and action in existing user menu;catalog `?view=account-credits` |
| [Forum topics](docs/design/espaco-library/FORUM-TOPICS.md) | Avatar cards,conversation metadata and accessible detail;catalog `?view=forum` |
| [States](docs/design/espaco-library/STATES.md) | Interaction and accessibility |
| [Consumer contract](docs/design/espaco-library/CONSUMER-CONTRACT.md) | Application composition |
| [Governance](docs/design/espaco-library/GOVERNANCE.md) | Change and acceptance gates |
| [Interface quality](docs/design/espaco-library/INTERFACE-QUALITY.md) | Better skill routing |
| [Landing-page skill](docs/design/espaco-library/LANDING-PAGE-SKILL.md) | Bundled Marc Lou adaptation, landing-only routing and consumer setup |
| [External component sourcing](docs/design/espaco-library/EXTERNAL-COMPONENT-SOURCING.md) | beUI-first search before building a missing pattern; adapt-never-install contract and attribution |
| [F2 migration tracking](docs/design/espaco-library/F2-MIGRATION-TRACKING.md) | Live checklist for the beUI-based overlay/feedback/navigation/data migration; restart point if a session ends mid-work |
| [F3 migration decisions](docs/design/espaco-library/F3-MIGRATION-DECISIONS.md) | Typed numeric motion adoption and explicit no-fit provenance for data surfaces |
| [F0–F4 migration closeout](docs/design/espaco-library/F0-F4-MIGRATION-TRACKING.md) | Canonical phase inventory, acceptance criteria, evidence boundary and closeout status |
| [beUI opportunities audit](docs/design/espaco-library/BEUI-OPPORTUNITIES-2026-09-16.md) | Measured motion gap, replace/enhance/new candidates by intensity, and the decisions still owed |
| [MCP/Profile review, 2026-09-15](docs/design/espaco-library/REVIEW-MCP-PROFILE-2026-09-15.md) | Six-domain preview audit; unresolved findings, not release approval |
| [Artifact validation](docs/design/espaco-library/ARTIFACT-VALIDATION.md) | Build/pack/import parity |
| [Validation](docs/design/espaco-library/VALIDATION.md) | Snapshot-specific results |
| [Documentation audit](docs/design/espaco-library/DOCUMENTATION-AUDIT.md) | Conflict review and limitations |
| [Data patterns](docs/design/espaco-library/DATA-PATTERNS.md) | Reusable data surfaces |
| [Lucy composition](docs/design/espaco-library/LUCY-COMPOSITION.md) | Guided chat;LinkedIn,experience and résumé choices;local-only preview |
| [MCP composition](docs/design/espaco-library/MCP-COMPOSITION.md) | Synthetic integration example |
| [Provenance](docs/design/espaco-library/PROVENANCE.md) | Source vs adaptation |
| [Reference measurements](docs/design/espaco-library/REFERENCE-MEASUREMENTS.md) | Historical evidence, not current overrides |
| [Release workflow](RELEASING.md) | Immutable distribution and rollback |
| [Third-party notices](THIRD-PARTY-NOTICES.md) | Fonts, icons and reference assets |

Candidate releases are not a claim of universal accessibility or final aesthetic
approval. Existing recorded review limitations remain; extraction does not erase them.
