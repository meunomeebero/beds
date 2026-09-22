# BEDS — product-agnostic boundary

User-directed correction, 2026-09-21. This is the target contract for the current
migration, not a claim that all existing exports already comply. It supersedes
the old requirement to put every new application composition into BEDS.

## Ownership

- BEDS owns reusable individual components, interaction semantics, accessible
  states, semantic tokens and a style guide. A multi-part widget (dialog, table,
  select) is still a component when it solves one reusable interaction.
- Apps own identity assets, brand presets, content, page hierarchy, navigation
  structure, business policy, breakpoints and page composition.
- App-owned semantic HTML, layout CSS and asset rendering are legitimate. Use
  BEDS tokens and components rather than duplicating their interaction logic.
  Do not reach into private component selectors or remove focus/disabled states.
- A component should solve the same problem in unrelated products without a
  product-specific purpose, label, asset, data model or route.
- A complete hero, checkout, onboarding page, discovery header or product
  workspace belongs in the app or an explicitly optional recipe, not the core
  library. A recipe is editable example code, not a mandatory visual contract.

## Admission rule

Before adding an export: identify its single job, look for a BEUI match, describe
two unrelated uses, and test its states in isolation. If only one app needs it,
keep it in that app until actual reuse justifies extraction. Do not create a new
semantic purpose merely to relocate app CSS into the package.

Preserve useful BEUI anatomy and motion. Adapt only for a documented need;
geometry changes are design changes, not automatic improvements. Native semantics
or accessibility fixes may justify deeper changes; record those explicitly.

## Required skills

Read [Interface quality](INTERFACE-QUALITY.md), including its linked `SKILL.md`
files, before constructing UI. Skills guide judgment; package installation does
not execute them. Missing skills must be reported, not silently approximated.
Use [Foundations](FOUNDATIONS.md) as component/style guidance, not an instruction
to reproduce a former app's page layout. Historical product decisions remain
provenance, not universal rules.

## Migration and verification ledger

### Mainline promotion — 2026-09-21

The user authorized consolidation onto `main` and immutable distribution as
`0.2.0-rc.1`. This supersedes the private-candidate delivery restriction below,
not its recorded review limitations. The runtime starts at `fba8fc3`; release
metadata and current documentation are reconciled separately. Existing consumers
must explicitly migrate app-owned compositions before installing the new API.
Curriculol migration and forum polish follow publication; neither is established
by this library's technical checks. See the repository release workflow and the
GitHub release for the exact source SHA, archive hash and executed gates.

This is a breaking candidate. Do not publish or upgrade existing consumers
implicitly. Preserve the previous published artifact as their current dependency.

- [x] Replace embedded three-bar `BrandMark` artwork with a required caller-owned
  image and accessible label. Keep the component's image containment reusable.
- [x] Remove the `brands.curriculol` runtime preset; the provider accepts the
  application's explicit hex color. Existing default accent remains unchanged.
- [x] Classify all public exports: reusable component, app recipe, or product
  implementation. Remove full-page compositions from the core package surface.
- [x] Move product-specific examples and assets out of the distributable runtime;
  keep migration recipes and provenance explicitly separate from the style guide.
- [x] Replace the consumer guard's blanket bans on native elements/layout CSS
  with tests for the new boundary, without disabling component safety checks.
- [x] Reconcile entrypoints, Foundations, Components, consumer contract, examples,
  package metadata, artifact tooling and skill links with the new boundary.
- [x] Audit individual components visually and interactively in both themes,
  narrow/wide containers, keyboard, RTL, long content and reduced motion. Fix
  confirmed issues; record unverified physical-device/screen-reader checks.
- [x] Run complete source, documentation, consumer and artifact checks; verify a
  clean packed consumer and a product-neutral component catalog.

Completion requires the unchecked items as well as the initial identity fixes.
A passing unit test or a smaller export list alone does not complete this migration.

### Current affected-component acceptance matrix

This table consolidates executed observations below; it is not a new test run.
Use it for the remaining audit instead of treating every historical “pending”
sentence as a separate current task. “Partial” means the recorded scenario passed,
not that the component's complete state matrix passed. Unchanged exports are not
certified by this migration. Recipes have separate regression evidence because
they are no longer the library's public component contract.

| Changed boundary/component | Executed rendered evidence | Residual verification limits |
|---|---|---|
| BrandMark / ThemeToggle | Caller artwork and failed image both contained at18px with full accessible names; intrinsic32px targets; long labels wrap at320px RTL; narrow/wide keyboard theme activation | Native image-failure appearance is browser-owned; no invented product fallback; native AT/touch unverified |
| Provider theme transition | Both direction changes and four reversals;24-frame navigation samples; sibling provider unaffected; open Select popup24-frame color pairs verified in both directions | Not a contrast or scheduling guarantee for every overlay/state |
| TextField / TextAreaField / Tabs / SegmentedControl color bridges | Light/dark field colors; error/helper association, focus and recovery;320px containment; nested versus standalone geometry; RTL long textarea, segmented and Tabs skip-disabled keyboard selection in both themes | Native input/AT checks remain unverified |
| Switch | Both themes,320px sections,LTR/RTL,on/off,disabled,Space; JS reduced-motion on/off samples with normal-motion positive control | Native OS preference/CSS-media and physical touch remain unverified; no additional confirmed runtime defect |
| Select | Light standalone and dark nested RTL long options at320px and LTR1422px; unbroken text wraps;ArrowDown/Enter selection and Escape focus recovery;24-frame simulated reduced-motion opacity versus normal positive control | Native OS/CSS-media execution remains unverified |
| RadioGroup |32px fine-pointer labels; selection and ArrowDown update; dark/narrow checkout;320px long-label RTL ArrowDown/End skip disabled options in both themes;24-frame simulated reduced-motion dot sampling | Native preference and physical touch;44px coarse target is source evidence only |
| DropdownMenu / IconButton |32px trigger;ArrowDown/Enter action and restored focus;320px long-menu RTL wrapping in both themes; Escape restores nested trigger | No popup entrance/exit motion exists; native CSS reduced-motion item-color transition remains unverified |
| Sidebar / NavItem | Compact icon centering; both themes; narrow recipe open/trap/Escape/focus recovery; independent320px RTL long-label selection/collapse/expand;24-frame simulated reduced-motion indicator versus normal positive control | Native preference unverified; app shell focus logic remains recipe-owned; native title is not touch disclosure |
| ActivityPanel / CollectionCard | Long panel grows and final action is reachable; light desktop and dark433px;320px both-theme,LTR/RTL identity wrapping and panel containment; keyboard selection/action | Native assistive technology, physical touch and zoom remain unverified; these static layout repairs do not introduce motion |
| ChatComposer | IME229 and disabled cancellation source/SSR regressions; both-theme guided editor/browse/back focus at433px; independent320px LTR/RTL long draft, submit, busy/disabled cancellation and recovery | Native IME-device and screen-reader behavior unverified |

The scoped browser audit is complete for the migration's changed component
boundaries, with the limits above. Native screen reader, physical touch, native
IME and OS-level zoom/preference checks remain explicitly unverified, not replaced
with DOM assertions. This is not approval of every unchanged export or a release.
Independent baseline comparison and design-owner aesthetic approval remain
separate, pending acceptance activities under Governance.

Initial component corrections: ThemeToggle now sizes to its content rather than
stretching its track across a parent Stack, has growing labels and 32px desktop /
44px coarse-pointer targets. Switch reduced motion now settles on the checked
position instead of rendering the off position; animation duration alone changes.
These fixes do not constitute the complete visual review above.

## Initial checkpoint — 2026-09-21

Work is isolated on `codex/beds-agnostic`, based on `2da39c0` plus the existing
uncommitted canonical state copied before edits. Pre-existing changes, including
ChatWorkspace, RangeSlider and DateField, were preserved. No consumer upgrade,
commit, publication or integration has occurred.

Verified after the initial changes:

- `npm run build`, `npm run typecheck`, `npm run check`, `npm run check:docs`,
  `npm run check:consumer` and `git diff --check`: passed.
- `npm test`: 53 guard/source tests and 4 routing tests passed. These are not
  browser or aesthetic acceptance tests; legacy composition tests still exist.
- Built-module SSR: caller image/alt render; missing src/label throw; embedded
  SVG and product preset export are absent.
- Isolated catalog in the browser: supplied identity image loaded; ThemeToggle
  track stopped stretching across its panel. Measured buttons changed from
  approximately 22px to 32px high; both instances now fit content at about 101px.
  Switching to dark updated the selected state and provider theme.

Still pending: complete export extraction, full contract reconciliation, packed
consumer verification and the full visual/interaction matrix. The reduced-motion
Switch correction has a source regression test, not yet a reduced-motion browser
test. Do not promote these initial checks into whole-library acceptance.

## Extraction checkpoint — 2026-09-21

- Landing, footer, benefits and onboarding are now optional catalog recipes in
  `apps/web/labs/espaco-library/recipes/`, absent from core source, barrel, built
  modules and bundled styles. The build explicitly removes their stale outputs.
- Recipe selectors and the corresponding browser test selectors are app-owned.
  The onboarding legend retains an app-owned visually-hidden utility after the
  extraction. Browser assertions were updated, not executed at this checkpoint.
- Consumer Contract and root/package agent rules now permit app-owned HTML, CSS,
  identity and composition. They no longer require every layout gap to become a
  library API or prescribe automatic geometry changes to BEUI components.
- Verified: build, typecheck, docs (112 Markdown files, zero violations), consumer
  checks (33 roots, 48 files, zero violations), and `git diff --check` passed.
  After extraction, 55 source/guard tests plus 4 skill-routing tests passed.
- Remaining full compositions (including processing, results, checkout and chat
  workspace), other product-specific exports, Foundations reconciliation and the
  rendered review remain unfinished. These checks do not establish completion.

## Checkout extraction and radio correction — 2026-09-21

- Checkout layout, sections and order summary moved to app-owned recipes. The
  package no longer exports or builds them. Their two SSR tests were preserved
  in the catalog rather than deleted or retained as package tests.
- Removed checkout CSS that reached into private BEDS radio, dialog, theme,
  code-snippet and button selectors. Updated browser selectors and assertions
  to the actual component contracts; the browser suite has not yet been run.
- Browser inspection exposed default RadioGroup labels measuring about 16px
  tall without the page override. Core labels now measure about 32px on desktop;
  coarse-pointer CSS requests 44px. Legend spacing is explicit and wrapped text
  can grow. The visual indicator remains 16px.
- Verified in the isolated browser: selecting 10 credits updated the summary;
  ArrowDown selected 50 and updated the total; dark mode updated the selected
  toggle and palette. Narrow layout placed summary above form with no document
  horizontal overflow. The viewport override reported an effective 433px,
  not the requested 390px, and coarse-pointer emulation was unavailable; do not
  claim a physical-device or exact-390px pass. Override was reset afterward.
- Core full-page processing, results and chat workspace extraction, remaining
  product exports and complete visual/package verification are still pending.

## Result and processing extraction — 2026-09-21

- `Result*` and `ProcessingView` moved to optional catalog recipes, with their
  CSS, imports and browser selectors. No core source, barrel or built page module
  remains. The build removes old generated modules from earlier builds.
- The existing `MeterSegments` is now a public single-purpose primitive, shared
  by library components and recipes. Accessible values and unknown/progress
  semantics stay in one implementation. Product score policy and timing caps
  remain outside core. Result offers no longer reuse private button classes.
- Preserved the three result SSR tests in the recipe suite; added independent
  meter semantics and processing unknown/error regression tests. Current total:
  52 package tests and 10 recipe/routing tests passed (62 combined).
- Build, both typechecks, library check (119 components), docs check, consumer
  check (33 roots, 54 files) and whitespace check passed after extraction.
- Browser: light result hierarchy and visible segmented score rendered; dark
  processing started, paused, displayed its caller-provided error and retried.
  Retrying originally lost focus when its button disappeared. The app now sends
  focus to its stable heading; Enter retry was verified with H1 as active element.
  This recovery policy is in the app recipe, not the meter. A browser regression
  assertion was added; the complete automated browser suite remains unexecuted.
- Remaining: chat/workspace and other product-specific exports, complete style
  guide/catalog reconciliation, artifact validation and remaining interaction,
  responsive, RTL and reduced-motion coverage. No release or consumer upgrade.

## Chat composition boundary — 2026-09-21

- `ChatWorkspace` moved out of the package into optional recipe source. It had
  no catalog consumer. Its three source-contract tests moved with it; localization
  tests for individual controls remain in the package. Workspace-specific
  Tailwind utilities are absent from dist; only catalog styles scan recipes.
- `ChatLayout` and its centered start-screen geometry moved to a catalog recipe.
  Conversation/composer controls stay public; private chat layout classes and
  both composition names are excluded by the boundary regression.
- `ChatComposer` now ignores keyCode229 IME confirmation and disables cancellation
  when the host disables the control. Source/SSR regression covers both; native
  IME-device testing remains unverified. Browser regression assertions were added,
  including caller-owned logo checks instead of the obsolete embedded SVG fill.
- The export inventory, remaining product cards/layouts, style guide and full
  rendered/artifact matrix still need reconciliation. This is not a release.

## Style-guide separation — 2026-09-21

- Foundations is now a reusable style guide, not a combined product specification.
  The previous 734-line document is retained as Foundations History with an
  explicit superseded-policy warning. Both indexes link the archive. Current
  guidance covers ownership, skill routing, semantic colors, typography,
  composition, motion, state and rendered review without mandating former pages.
- Caption/overline metadata now says 12px, matching the already-rendered CSS,
  rather than the stale 11px. A regression compares all nine metadata-backed
  Text roles with their CSS size, leading and weight. No typography rendering
  was changed to make metadata match.
- Build, typechecks, library/consumer/docs checks, whitespace and 64 tests passed.
  The first isolated artifact reconstruction and packed-consumer smoke also
  passed; this is packaging evidence, not full visual approval.
- This breaking work is now identified as private `0.2.0-alpha.1`; package and
  lockfile agree. The previous lockfile still named rc16 while the manifest named
  rc21. No archive is published or installed into a consumer by this change.
- Still pending: remaining layout/product export classification and corrections,
  catalog/docs reconciliation beyond Foundations, and broad rendered acceptance.

## Pricing and payment boundary checkpoint — 2026-09-21

- Pricing comparison and payment confirmation now live in optional app recipes.
  The individual `PricingCard` remains public. Core source/build no longer owns
  payment-page modules or comparison-layout selectors. Documentation and the
  inventory distinguish recipe-only names from actual package exports.
- Added a source/declaration/CSS boundary regression for pricing, plus three
  recipe SSR regressions: heading/first-featured policy, literal zero and no
  inferred invoice action, and caller-controlled busy/disabled actions.
- Build, both typechecks, docs check and 68 tests passed (52 package tests plus
  16 recipe/routing tests). These checks do not validate rendered CSS or motion.
  Earlier pricing/payment browser results are explicitly labeled historical;
  post-extraction browser equivalence remains pending.
- Remaining work includes AppShell/navigation separation, other product exports,
  complete catalog reconciliation and the rendered verification matrix. No
  publication or consumer upgrade. The earlier artifact hash is not evidence
  for this changed candidate; rebuild and revalidate before final handoff.

## Application shell separation — 2026-09-21

- `AppShell` moved into catalog recipes, including breakpoint, page-width presets,
  main/skip-link, mobile focus/inert logic and shell-grid motion. All catalog
  consumers and the hydration fixture now import the recipe. Browser selectors
  were updated; this alone is not a browser-suite pass.
- Public `Sidebar` retains only controlled navigation presentation, with optional
  collapse/dismiss callbacks. Existing header/section/item/footer components and
  scoped active-indicator motion remain reusable. Standalone items no longer
  share a global active-indicator ID. A boundary regression excludes AppShell
  and its layout selectors from the built package.
- Rendered compact navigation exposed a left-aligned inner icon and fixed-width
  controls competing with available scrollbar space. The icon is now centered
  and compact controls fit their parent. Browser measurement found no horizontal
  nav overflow and under0.01px difference between icon and row centers.
- Browser narrow navigation: open focused the first control; Shift+Tab wrapped
  to the final control; Escape closed it, removed main inert and restored trigger
  focus. Dark and light were inspected; effective narrow viewport was433px,
  not the requested390px. Override was reset. See [Navigation](NAVIGATION.md) for
  scoped review and missing coverage. Native screen-reader/physical device and
  full responsive/RTL/reduced-motion browser acceptance remain pending.
- Build and72 tests passed (55 package +17 recipe/routing). Types and library /
  consumer checks passed after extraction. The private candidate remains
  unreleased. Remaining export classification, legacy geometry metadata, catalog
  neutrality and the complete rendered matrix are still unfinished.

## Application recipes and contract reconciliation — 2026-09-21

- ApplicationCard and ApplicationBoard now live in optional catalog recipes.
  Their company/salary/resume/ATS/FIT model is not a generic DS contract. Existing
  behavior is retained, not replaced by a speculative generic board. ResultsStatus,
  CollectionToolbar and MeterSegments remain public reusable controls. Tests check
  that extracted modules and selectors are absent from source and built runtime.
- Removed page-width and breakpoint presets from token metadata. The reusable
  640px reading measure retains its visual value under `readingWidth` and
  `--es-reading-width`. Foundations documents the breaking migration; apps retain
  responsibility for their layout. The component inventory and maps now distinguish
  these recipes from exports and remove obsolete universal sidebar geometry.
- DropdownMenu's raw trigger had an obsolete class without IconButton's utility
  styles. It now reuses IconButton, with semantic popup attributes, ref and keyboard
  forwarding. A regression checks SSR semantics and target-size classes. Earlier
  browser inspection in this worktree measured the repaired trigger at about32px,
  verified ArrowDown/Enter move behavior and focus recovery, and inspected the dark
  narrow board without document overflow (effective viewport433px). That inspection
  is scoped evidence, not a full current browser-suite or assistive-technology pass.
- `npm run verify` passed after the extraction and contract reconciliation: build,
  package/catalog typechecks,113-component/202-token contract, docs and example
  consumer checks,74 tests (55 core +19 recipe/routing), isolated artifact rebuild
  and packed-consumer smoke. Documentation-only ledger updates require regeneration
  of the package mirror; archive hashes are snapshot-specific, not release approval.
- Still pending: classify remaining guided-chat/page exports, separate product
  examples in the catalog, correct the observed transient theme contrast issue,
  and complete the affected rendered state matrix. No publication, integration or
  consumer upgrade; this private candidate is not declared complete.

## Guided chat boundary — 2026-09-21

- Moved ChatThread into an optional recipe. The core no longer exports its H1,
  viewport-height policy, transcript/next-step layout or stepKey focus behavior.
  ChatComposer, ChatOptions and message/bubble primitives remain public. This
  preserves existing source; no new widget or upstream implementation was added.
- Removed private upload-class queries from the recipe. Native enabled control
  selection keeps the current browse-first upload order. Filename wrapping already
  belongs to FileUploadField; narrow upload targets now belong to that component
  instead of relying on a chat-page override. App recipes do not restyle internals.
- Build, package/catalog types, library and consumer checks and77 tests passed
  (56 core +21 recipe/routing). New tests cover absence from the public/built core,
  recipe heading/status order and the scoped focus policy. SSR/source assertions
  do not prove runtime focus or rendered containment by themselves.
- Browser at the isolated5297 listener: initial mount did not autofocus;
  keyboard selection focused the text editor, returning focused the first option,
  and LinkedIn selection focused the native browse button. Both themes were
  inspected. At effective433px (390px requested), no document horizontal overflow;
  upload target measured about44px and the narrow editor rendered16px text.
  Temporary viewport override was reset. No real file or personal data was used.

### Scoped Better review

| Domain | Evidence / remaining limitation |
|---|---|
| Accessibility | Browser step/return/browse focus, H1 and stable status preserved; screen-reader announcements, full keyboard matrix and forced colors not verified |
| Layout | Recipe owns former page constraints; desktop and effective433px inspected without document overflow;320px/200% zoom/RTL pending |
| Writing | Existing preview/no-upload notice and native labels retained; business copy stays in Lucy example |
| Typography | Narrow textarea measured16px; transcript wrapping inspected; expanded localization matrix pending |
| Colors | No palette changes; both themes inspected, but new contrast measurement was not performed in this checkpoint |
| UI polish | Existing composer focus perimeter retained; no motion added; slowed-motion and reduced-motion matrix pending |

This is scoped regression evidence, not whole-library visual approval. Remaining
page-export classification, catalog neutrality, theme transition correction and
broader rendered acceptance remain open. Nothing was published or integrated.

## Theme-transition safeguard — 2026-09-21

- Applied the Better UI theme-switch recipe at the controlled provider boundary:
  layout effect, provider-scoped temporary transition suppression, synchronous
  style flush and two-frame restoration. No global theme listener, stylesheet
  injection, palette change or Motion animation cancellation. Code points to the
  skill's animation reference through Interface Quality. Initial mount is untouched.
- Regression covers flush ordering, restoration after a paint, cancellation and
  rapid-flip cleanup using a deterministic frame queue. The CSS guard permits
  `transition:none` but still rejects new authored transitions outside its allowlist.
- Browser switched dark to light successfully; suppression attribute was removed,
  navigation transitions restored to150ms, settled text/background were
  rgb(106,105,102)/rgb(251,250,249). Final rendering was inspected. Frame-by-frame
  contrast sampling was unavailable in the read-only browser evaluation environment;
  the previously observed intermediate contrast failure is not declared fully
  verified fixed. Multi-provider/portal and rapid-toggle rendered checks remain open.
- Scope review: UI polish/accessibility behavior has unit and settled-browser
  evidence; no layout, copy, typography or palette redesign. Corrected one stale
  catalog caption label from11 to12px to match existing runtime typography.
  Broader export/catalog reconciliation and rendered acceptance remain pending.

## Page identity boundary — 2026-09-21

- Extracted PageContentHeader to a recipe: its784px measure and48/32/16px page
  insets are application composition, not an individual control. PageHeader and
  SectionHeader remain public. Both consumers now import the recipe; its CSS does
  not reach into private component classes. The packed-consumer smoke now checks
  PageHeader instead of requiring the removed export.
- Browser MCP example retained an approximately784px header,48px32px16px padding
  and15px title. Enter on the guide action displayed the local notice and kept
  visible keyboard focus. This is desktop/light extraction evidence only, not a
  full MCP visual review. Narrow/dark/long-copy comparison is still pending.
- Reconciled the MCP contract's obsolete ban on app CSS and named brand preset.
  Added public-boundary/CSS and recipe SSR regressions. Complete verify passed:
  81 tests (59 core +22 recipe/routing),111 public components,202 tokens, package
  and catalog types, docs/consumer guards and packed artifact smoke. Subsequent
  documentation edits are rebuilt before handoff. No consumer upgrade or release.
- Remaining classification includes PageHeader's home variant and responsive-grid
  presets; retaining the generic title control is not approval of those presets.

## Catalog discovery boundary — 2026-09-21

- Separated component navigation from app examples, including the chat recipe.
  Preserved existing examples and URLs rather than discarding consumer work.
  Components is now the fallback entry; PageContentHeader's demo explicitly says
  recipe/not exported. Tokens copy explains consumer-owned identity and layout.
- Replaced the visible Curriculol color preset with “Laranja · exemplo”. The
  previous query value remains a local URL compatibility alias, never a DS brand
  export. Browser selection confirmed the same caller-owned #ffa133 accent.
- Added a catalog-boundary source regression and updated affected browser selectors
  and obsolete same-row navigation assertions. Those browser specs were not run;
  changing their selectors is not evidence of their success. Complete verify
  passed with82 tests (59 core +23 recipe/routing) before the final fallback/copy
  edits; focused tests/types/docs are rerun afterward.
- Desktop/light browser showed two named navigation groups and the neutral color
  choice. Better layout/writing guided the distinction; native controls and palette
  are unchanged. Narrow/dark and the full catalog route matrix remain pending.
  Individual product fixtures still contain their synthetic branding, intentionally
  outside the reusable core. No claim that all remaining exports are classified.

## Home preset and skill-link checkpoint — 2026-09-21

- Removed PageHeader's `purpose="home"` API and all home-specific runtime CSS.
  Three catalog consumers use the optional HomeHeader recipe, which owns greeting
  size/top spacing. It no longer overrides BrandMark's private dimensions; caller
  identity uses the existing individual component unchanged. Generic PageHeader
  retains its original title/description/action anatomy.
- Browser empty-state example retained22px/28px heading and16px desktop top inset.
  Desktop/light visual hierarchy inspected. Other consumers, narrow/dark and long
  copy remain pending; this is not a whole-screen approval across all domains.
- Complete verify passed with84 tests (60 core +24 recipe/routing), build,
  package/catalog types,111-component/202-token contract, docs/consumer checks and
  isolated packed-consumer smoke. Source-boundary and recipe SSR tests cover the
  removed preset and retained caller-owned heading/identity semantics.
- All seven pinned Better SKILL.md links were retrieved from their raw GitHub
  equivalents: HTTP200 and Markdown frontmatter present. This verifies availability,
  not automatic execution by a consuming agent. Their applicable AGENTS.md routing
  remains required. Current direct local skill entrypoints were used for this work.
- Remaining work includes responsive-grid classification, residual documentation
  conflicts and the broader visual/state acceptance matrix. No release or upgrade.

## Content resilience checkpoint — 2026-09-21

- The public export classification is now recorded in API-BOUNDARIES.md, including
  ResponsiveGrid as an optional layout utility, not mandatory page composition.
- A long-content fixture exposed ActivityPanel clipping its final action134px
  below an overflow-hidden body at1422px. The panel now uses a minimum height
  rather than a fixed height and no longer restyles nested Stack/ScrollableList.
  The independent ScrollableList retains its192px scroll boundary.
- CollectionCard identity now wraps instead of silently ellipsizing without a
  recovery path. Five stress-fixture identities wrapped into48px of height without
  horizontal text overflow. Existing adopted components were corrected; no new
  widget, palette, motion or dependency was introduced.
- Browser evidence: light desktop panel grew from260px to about394px; its action
  fits within the body. Dark narrow viewport was433px (390px requested), with no
  document overflow, complete text and keyboard Enter on the final action.
  Viewport override was reset. Source regression protects these layout rules.
- Better review: accessibility/layout/typography informed clipping and wrapping
  fixes; copy is synthetic and caller-owned; color tokens and motion are unchanged.
  Native AT,320px,200% zoom,RTL,contrast remeasurement and slowed-motion checks
  were not performed in this checkpoint. This is not whole-library approval.
- Full rendered acceptance and theme-transition intermediate-frame verification
  remain open. Nothing was published, integrated or upgraded in a consumer.

## Theme frame sampling — 2026-09-21

The local diagnostic at `/theme-transition.html` now samples computed navigation
foreground and its nearest opaque rendered background before24 successive
animation-frame paints. It reports raw samples and fails on unsupported
alpha-background composition rather than silently measuring against the page.
It adds no library export, CSS override, dependency or production telemetry.

- Browser dark→light: only rgb(106,105,102) on rgb(251,250,249), minimum5.266:1.
- Browser light→dark: only rgb(148,148,148) on rgb(25,25,25), minimum5.796:1.
- Four consecutive-frame reversals: both exact pairs, minimum5.266:1; no
  interpolated foreground/background values appeared in24 samples.
- All three runs began with scoped suppression, ended without it, and restored
  navigation transition durations to150ms. A sibling light provider never gained
  suppression and retained its white background.

This closes the sampled navigation intermediate-color failure and sibling-provider
check. It is not a contrast claim for all widgets, hover states or portal content,
nor a guarantee against every possible sub-frame scheduling sequence. Native
screen-reader/device and broad affected-recipe acceptance remain separate.
The previous tool sampling limitation was overcome with this source-owned local
diagnostic. The reusable provider code needed no further change.

`theme-transition.spec.ts` preserves the same assertions for future browser-suite
runs; this checkpoint executed the interactions through the browser tool, not the
automated Playwright spec. Better UI's theme-switch recipe guided the original
fix; this checkpoint verifies it without adding motion or changing colors.

## Recipe control ownership — 2026-09-21

- Source audit found no product logo, brand preset or resume/checkout business
  logic in the public runtime. Historical sourcing comments are not runtime policy.
  It did find native input/button selectors in onboarding, checkout and processing
  recipes overriding the presentation of reused BEDS controls.
- Removed those size/padding/font overrides. Onboarding's flex action container
  still stretches its action naturally; recipe layout remains app-owned. Component
  internals retain their documented pointer-dependent geometry. No new variant,
  control implementation, dependency or palette was introduced.
- Browser: onboarding desktop/light required-name recovery focused its field;
  entering synthetic text and pressing Enter displayed the no-data-sent success.
  Dark narrow433px retained the form without document overflow. Inputs measured
 36px with13px type under this fine-pointer browser; this is not mobile-touch
  evidence. The welcome action retained its40px component geometry.
- Checkout light desktop was visually inspected; dark433px had no document
  overflow. No payment action was invoked. Processing dark desktop pause/error
  remained available; Enter retry focused H1. Narrow433px retained contained
  controls; default fine-pointer action measured32px. Temporary viewport reset.
- Regression protects the specific removed override selectors. Better layout
  and UI separation informed the deletion; copy, state semantics and palette
  were not redesigned. Touch/physical-device,RTL,zoom,all error variants and
  new contrast measurements are not verified by this checkpoint.

This is scoped recipe validation, not universal accessibility approval or a
consumer upgrade. Broader affected-recipe acceptance remains in progress.

## Pricing, receipt and results recipe checkpoint — 2026-09-21

- Payment confirmation with long merchant/purchase/order strings rendered without
  losing the values. Invoice-error retry changed the local state to available;
  its action opened the explicitly fictitious invoice dialog. No payment or real
  fiscal action occurred.
- Found and corrected a missing page H1: the optional receipt recipe now accepts
  headingLevel1 alongside its existing2/3 choices. Only the standalone example
  requests1; embedded consumers retain their existing defaults. Title styling
  remains20px/28px. Regression covers all three levels and the unchanged H2 default.
- Pricing light desktop hierarchy and two cards were inspected. Selecting a plan
  entered busy state; simulated failure restored choices with recovery copy.
  Dark433px long-copy state had no document/card horizontal overflow.
- Optimization result dark desktop retained score comparison, document access
  and a separate optional next-purchase offer. The document preview opened;
  Escape completed its exit and restored focus to its trigger. Light433px
  retained the page without document overflow.
- Receipt narrow433px had no document overflow and retained20px title sizing.
  Dark theme application was separately confirmed after dialog exit. Browser
  actions during exit were not counted as successful theme changes; settled DOM
  was checked. All temporary viewport overrides were reset.

Better review scope: semantic hierarchy, long-text containment, recovery wording,
visible surfaces and selected focus paths above. Palette and motion were not
redesigned. No claim of a full contrast, touch, native screen-reader,RTL,zoom or
all-state audit; pricing/results content is synthetic app policy, not a DS rule.
Remaining broad recipe verification does not reintroduce these pages into the
runtime. No publication, integration or consumer migration.

## Marketing recipes and skill boundary — 2026-09-21

- Landing desktop/light hero and demonstration were inspected. ArrowRight selected
  the letter tab; Enter expanded a native FAQ. Dark433px had no document overflow.
  The primary CTA opened the local upload preview with the explicit no-read,
  no-upload notice; browser Back returned to the landing. No file was selected.
- Benefits dark desktop long-copy composition was inspected; light433px had no
  document overflow or horizontally clipped articles. Footer light desktop long
  copy was inspected; dark433px links retained full text, approximately44px targets
  and a66px wrapped CTA. Its CTA opened local onboarding and Back returned.
  All temporary viewport overrides were reset.
- The packaged landing skill still directed agents to report every missing
  pattern as a DS gap. Corrected that contradiction: the app owns hero/grid/page
  composition; shared components require one reusable job and unrelated uses.
  Skill Creator guided this narrow edit; no new universal page template, workflow,
  dependency, automatic installation or offer policy was added.
- These are current scoped layout/keyboard/navigation observations, not the
  historical full-browser-suite results. New contrast,320px,RTL,zoom,reduced-motion,
  native screen-reader and independent skill-scenario tests remain unverified.

Checklist reconciliation above marks export classification, runtime extraction
and executed technical/package gates complete based on API-BOUNDARIES, boundary
regressions and repeated complete verification. Documentation reconciliation
and the broader affected-component state matrix remain unchecked; historical
checkpoint text below/above is not a new outstanding implementation requirement
when a later checkpoint explicitly resolves the same item.

## Usage entrypoint reconciliation — 2026-09-21

Both repository and package READMEs still taught the removed `brands` API and
linked RC16 as their installation target. They now distinguish the private
breaking candidate from historical releases and show explicit caller color and
app-owned semantic layout. The package README no longer bans app layout CSS.
Both TSX examples are typechecked against the current public package by the
boundary regression suite. This is documentation/API evidence, not new visual
approval; broader reconciliation and state-matrix checks remain open.

The component map now labels each extracted checkout/results/processing/landing/
onboarding section as an optional non-exported recipe before describing its API.
Its native-composition prohibition and WorkspaceTrigger artwork restriction were
stale; both now match the consumer contract and actual ReactNode slot. The quality
protocol distinguishes component visual authority from app layout and leaves
locale/product policy with the consumer. Historical product evidence is retained.

## Rendered control color repair — 2026-09-21

Browser inspection found the Switch thumb transparent in the current dark catalog:
the `bg-switch-thumb` utility had no Tailwind color mapping. `bg-switch-off`,
`bg-surface` and `text-bg` had the same missing bridge to existing semantic tokens.
Added those mappings without new palette values or geometry changes; checked
Switch now uses the existing white `--es-switch-thumb-on` token in both themes.
A compiled-CSS regression verifies the emitted classes and SSR verifies both
thumb variants. This preserves the adopted control rather than replacing it.

Current browser evidence at desktop width: Space toggled the native checked state;
dark off track/thumb rendered rgb(65,65,65)/rgb(200,200,200), light off rendered
rgb(120,119,117)/white, and both on states rendered rgb(0,119,230)/white with a
14px settled thumb translation. Off settled back to zero. Keyboard focus remained
visible. ArrowRight selected the second SegmentedControl option and its restored
surface rendered white in light theme. Search/checkbox/segmented controls were
inspected in the same screenshots. The browser reported reduced motion false;
this exercise does not prove reduced-motion, RTL, touch or screen-reader behavior.

The narrow check measured actual `innerWidth=320` and document scrollWidth320
in both themes (the browser viewport override required288px to obtain320 CSS px).
Light on retained the contained32px track/16px white thumb at x14; dark off
retained the gray thumb at zero. No document overflow in this catalog state.
Viewport overrides were reset. This is a320 CSS-pixel check, not200% browser zoom
or physical-touch evidence.

## Switch direction repair — 2026-09-21

The native-direction fixture `control-directions.html` reproduced a second bug:
checked RTL thumb right44.56px exceeded its track right32px. The physical positive
translateX moved it out of the track. Switch now animates relative
`insetInlineStart`0/14px instead; inherited direction mirrors movement without a
new public prop, direction observer or changed dimensions/timing. Reduced motion
still sets duration0, not a different checked position.

Browser verification in320px-wide light/dark fixture sections: Space controlled
both directions, thumb stayed inside the track at final on/off positions, long
descriptions wrapped, and disabled controls remained native disabled. The light
on and dark on/off renders were inspected; RTL and LTR on settle at logical14px,
off at0px. Added a browser regression for both themes/directions and reduced-motion
preferences; it is authored, not executed by the full automated browser runner.
The current browser preference remained no-reduction, so reduced-motion execution
is still unverified. Earlier physical-x evidence above is historical, superseded
by this logical-position correction.

## Remaining control color bridges — 2026-09-21

The follow-up source/build audit found four more missing Tailwind aliases:
`field`, `input-text`, `subtle`, and `border-subtle`. Runtime confirmation before
the fix showed dark TextField background rgb(59,59,59) and ink rgb(206,206,206),
not its existing tokens #191919/#d0d0d0. Added mappings to those existing tokens,
without new palette values. TextField/TextAreaField, SegmentedControl and Tabs
now emit the intended field/surface/border utilities. A TSX string-literal scan
checks named background utilities against declared theme colors; arbitrary
values and dynamically assembled classes remain outside that bounded check.
The compiled-CSS regression separately covers all repaired aliases.

After correction, desktop browser inspection confirmed dark field rgb(25,25,25)
with rgb(208,208,208) ink and light white with rgb(55,53,46) ink. Dark activity
Tabs rendered subtle rgb(35,35,35) and its declared translucent border. Both
theme screenshots were inspected. The demo's clear/save controls produced
aria-invalid=true, an associated recovery message, red error border and input
focus; typing cleared the invalid state. At actual320 CSS px, both themes kept
document scrollWidth320 with the invalid field present; dark error and helper
copy remained visible. The viewport override was reset. No new reduced-motion,
RTL, native AT or physical-touch claim is made by this color check.

## Public metadata consumption — 2026-09-21

Package-manifest reconciliation found the consumer guard rejecting the public
`beds/tokens` export as private. It now permits that read-only metadata entry,
while `beds/src/tokens` and `beds/dist/tokens.js` remain forbidden. A regression
enumerates the actual manifest exports, exercises metadata in app-owned styling,
and rejects private imports/re-exports. Consumer guidance names the public entry;
the root README now uses the neutral orange example query rather than the retained
legacy product query alias. No new export, palette or automatic migration was added.

## Controlled reduced-motion branch evidence — 2026-09-21

The direction fixture now offers explicit `?motion=reduce` and `?motion=standard`
test modes. A local bootstrap simulates only the JavaScript reduced-motion media
signal before Motion initializes; native mode does not override matchMedia. The
fixture visibly labels the simulation. It does not emulate CSS media queries,
change operating-system settings, test preference changes after mounting, or
ship in the library runtime.

The page samples actual computed thumb insetInlineStart for24 animation frames
after each switch action. Browser execution confirmed light/dark, LTR/RTL on
samples all14px and off samples all0px under the reduced signal. A normal-signal
positive control produced intermediate values1.87,4.68,7.96,12.35,13.57,13.92,
13.995px before settling14px in both directions. The sampler therefore observes
movement rather than merely reading the final state. This closes the Switch's
simulated JavaScript reduced-motion branch check; native preference/CSS/physical
device coverage remains unverified. No production hook or motion policy changed.

## Nested-control ownership and Select polish — 2026-09-21

The320px containment fixture showed standalone TextField13px versus nested16px
and Switch40px versus nested44px: settings Tabs was changing unrelated descendants.
Removed those cross-component overrides. Fields, Switch and ThemeToggle retain
their own coarse-pointer rules; Select now owns a44px coarse-pointer target for
all variants, not only when nested in a settings page. TextLink stays inline.
The Settings guide identifies its old page geometry as historical app composition.
The new standalone/inside-Tabs example is included in the consumer-root scan.

Browser checks at desktop and actual320px, light/dark: fields now match13px/36px
and switches40px under the current fine pointer. Nested Select accepted
ArrowDown/Enter and updated One→Two; theme toggles and switch keyboard activation
worked. No320px document overflow. Coarse-pointer geometry is source-tested, not
physically verified. Temporary viewport overrides were reset.

The same fixture exposed short Select labels being ellipsized: a broad span rule
gave the animated chevron flex:1, leaving “One”19px for25px of text. Scoped label
flex to the non-decorative span and made the chevron flex:none. Afterward “One”
measured25px client/scroll, chevron12px; dark narrow “Two”26px client/scroll. Both
full labels were visible. Focus, selection and theme behavior were retained.
Regressions cover child-control ownership and separate label/chevron flex rules.

## Documentation reconciliation closeout — 2026-09-21

The documentation checklist item is complete for the current candidate, not for
historical evidence: root/package AGENTS and READMEs, Foundations, Components,
Consumer contract, API boundaries, Governance, skill routing, Settings ownership,
and public metadata imports agree on the app/component boundary. Historical
measurements remain labeled provenance. Source-barrel classification and recipe
extraction regressions cover the public API; package build/parity and link gates
cover the portable copies. Version/lock metadata identify the private breaking
candidate rather than a release or consumer upgrade.

API boundaries now includes explicit replacement guidance for removed exports,
caller-owned identity and page layout. Its TSX example and the Consumer contract
example join both README samples in public-package typechecking. The repository
README test skips only when canonical repository docs are absent in a standalone
package; portable examples still run. This closes instruction reconciliation,
not the remaining affected-component visual/interaction matrix or independent
aesthetic approval.

## Long-content RTL containment checkpoint — 2026-09-21

Executed the consumer fixture `control-containment.html?long=1&dir=rtl` in
the browser at measured innerWidth320 (document scrollWidth320). The standalone
light-theme Select and nested dark-theme Select kept both long options within
their menu: option clientWidth/scrollWidth243/243; the nested listbox measured
259/259 and inherited RTL. The unbroken identifier wrapped in the open menu;
the selected trigger intentionally truncates and exposes the full accessible name.
ArrowDown/Enter selected the second standalone option and returned focus to its
trigger. Escape on the nested menu restored focus to the nested trigger. A settled
dark-theme screenshot showed both option labels/descriptions and the long theme
labels wrapping. The temporary viewport override was reset.

This is English stress text under RTL layout, not verification of Arabic shaping,
translation quality, native assistive technology or physical touch. No new runtime
change was needed for this scenario. The current candidate also passed the full
`npm run verify` pipeline, including packed-consumer smoke; this checkpoint does
not close the broader individual-component matrix.

## ActivityPanel320px action containment — 2026-09-21

Executed `data-patterns.html?stress=1&theme=light` at measured innerWidth320,
then switched to dark through the demo control. Document scrollWidth stayed320.
The final “Confirmar leitura do exemplo” button measured about287px by32px;
its bottom1585.269 matched the Stack/body/panel bottom, and all three containers
had clientWidth/scrollWidth287/287. Enter reached the local action in both themes
and left the button focused. Settled screenshots showed the complete final action
and separate queue scrolling region. The viewport was reset afterward.

This closes the panel's320px final-action clipping check, not CollectionCard's
individual text measurements, RTL, physical touch or assistive technology.

## RTL cards and visually-hidden containment — 2026-09-21

The data-pattern fixture now accepts native `dir=rtl` on its app-owned main.
At320px, all five long CollectionCard identities measured159px client/scroll
width and48px height in LTR and RTL. Both ActivityPanels measured287px
client/scroll width. Keyboard Space selected the first card control; Enter
reached the final panel action. The example intentionally shares selection state
across its demo controls; this is not a library selection policy.

The RTL fixture also exposed document scrollWidth321: the visually hidden table
heading and caption used an automatic absolute position plus negative margin,
placing their1px boxes beyond the inline edge. Anchored the shared sr-only
utility with inset-inline-start:0 and margin:0, preserving clipping and accessible
content. Adding legacy clip alone did not fix the overflow and was not retained.
After rebuilding, light/dark LTR and RTL all measured document scrollWidth320;
the table still resolved by its accessible name. Dark RTL card appearance was
inspected and viewport overrides were reset. A source regression protects the
logical anchor, zero margin and absence of accessibility-hiding CSS.

Better layout/accessibility informed the containment correction; typography,
copy, colors and motion were unchanged. These browser checks do not substitute
for native screen-reader, language shaping, physical touch or OS zoom validation.

## Long-control keyboard checkpoint — 2026-09-21

Expanded the containment example with public TextAreaField, RadioGroup,
SegmentedControl and DropdownMenu, inside and outside settings Tabs. State stays
local; disabled choices sit between two enabled long-label choices.

At320px RTL in both themes, textareas measured287/287 client/scroll width and
radio fieldsets288/288; document width stayed320. RadioGroup ArrowDown (standalone)
and End (nested) selected the last enabled choice. SegmentedControl ArrowLeft in
RTL selected the last enabled choice in both instances; End did not change its
selection and is not counted as a passing supported interaction.

Long menu items wrapped at151px without horizontal overflow; their heights were
72/32/52px. ArrowDown skipped the disabled item, Enter reported local action `two`
and restored trigger focus; nested Escape restored its own trigger. Keyboard
theme activation worked. Wide LTR Select at measured1422px kept both long options
at243/243 client/scroll width in light/dark and Escape closed each popup.
Viewport overrides were reset. No runtime component change was required.

Source inspection confirms DropdownMenu uses conditional native popup markup,
not an entrance/exit animation; only its item-color CSS transition has a native
reduced-motion media rule. Therefore an animated-popup motion test is inapplicable
to that component, not a missing feature to implement. Native CSS-media execution,
screen readers, touch and complete localization remain unverified.

## Independent navigation and composer — 2026-09-21

The containment example now includes a public Sidebar/NavItem group and a public
ChatComposer with local state only, without AppShell or guided-chat recipes.
At320px RTL the expanded navigation measured287/287 client/scroll width; settled
compact navigation measured63/63. Enter selected the second destination; collapse
and expansion remained keyboard-operable. Intermediate layout-animation samples
can exceed settled width and are not reported as stable containment evidence.

Long expanded navigation labels lacked a pointer disclosure: title was only set
in compact mode. NavItem now keeps the full native title in both modes, while
locked entries retain the reason. The accessible name was already complete and
is unchanged. SSR regression and rendered title inspection cover the correction;
native tooltip presentation, touch disclosure and AT remain unverified.

The320px composer textarea measured255/255 client/scroll width with an unbroken
identifier in LTR and RTL. Enter incremented the local submission counter. With
busy and disabled both set, editor and cancellation were natively disabled;
re-enabling then canceling restored the send action. Light/dark states were
inspected and document scrollWidth stayed320. No transport, attachment access or
product workflow was added; the viewport override was reset.

## Remaining component JavaScript motion branches — 2026-09-21

The containment fixture accepts `motion=reduce` or `motion=standard`, installed
before importing Motion; visible copy distinguishes simulated JS preference from
native CSS media/OS settings. Native mode does not patch matchMedia. A source-owned
24-RAF sampler records actual option opacity and radio/navigation transforms after
interactions. Diagnostics and selectors stay outside the library runtime.

Browser reduced light/dark Select samples all had opacity1. The normal-signal
positive control showed intermediate opacities0,0.0141888,0.0991639,0.344282,
0.507644,0.682518 before subsequently reaching1. Reduced navigation had only an
initial layout-preparation transform at sample0, then none for samples1–23; the
normal control had multiple intermediate translations19.7354,19.4846,18.714,
17.6278,16.2056 and onward. Do not describe the reduced case as zero transient
transform at every observation.

Reduced radio light similarly had a preparation transform only at sample0;
dark nested radio had none in all24 samples. The normal radio run also settled
after its first preparation sample, so it is not evidence of a distinct normal
radio animation. The sampler's positive controls are Select and navigation.
These checks establish the sampled JS branches, not native preference changes
after mount, CSS media behavior, every scheduling sequence or physical perception.
No production motion code was changed for this diagnostic.

## Identity, tabs, popup theme and implementation closeout — 2026-09-21

At320px RTL, a caller image and a deliberately invalid image both retained18px
containment and their complete accessible names; naturalWidth150 versus0 confirmed
loaded versus failed state. No library-owned logo or fabricated fallback appears.
Long-label Tabs ArrowLeft selected the second enabled tab, skipping the disabled
tab; ArrowRight returned to the first in dark theme. The selected tab remained
inside the288px tablist and document scrollWidth stayed320. ThemeToggle Enter
activation updated the selected light/dark state at narrow and1422px widths.

A fixture-only F6 shortcut changed theme while Select stayed open. Across24 RAF
samples, dark popup text/background were exclusively rgb(206,206,206)/rgb(32,32,32);
the reverse was exclusively rgb(55,53,46)/white. No intermediate pair appeared.
Viewport overrides were reset. This extends the provider check to representative
top-layer popup content, not every overlay or every potential scheduling sequence.

### Requirement-by-requirement implementation audit

| User requirement | Current proof |
|---|---|
| Individual reusable components, not complete app compositions | Explicit barrel/API classification plus source/dist exclusion tests; removed pages are editable catalog recipes, not runtime exports |
| Product-agnostic identity | Caller-owned BrandMark src/label, no named brand presets, no product names or logo references found in runtime source; loaded/failed image browser checks |
| Reusable style guide | Foundations owns component tokens/type/interaction guidance; app owns page geometry, identity and business policy; consumer guard permits native layout and app CSS |
| Essential skill Markdown references for agents | Source-barrel comment, portable AGENTS, direct pinned SKILL.md links and consumer routing instructions; routing/link/parity regressions |
| Correct confirmed behavior and visual-polish issues | Scoped matrix and checkpoints above; focused regressions for repaired shared controls, containment, theme changes and ownership |
| Practical criticism and future prevention | One-job/two-unrelated-uses admission rule; no automatic promotion of app work into DS; representative-screen review before expansion; skills/tests do not guarantee aesthetics |

Per-domain self-review: accessibility—keyboard, focus, names, disabled/recovery
paths checked with native AT limits disclosed; layout—app/core ownership and
affected narrow/wide/RTL containment checked; writing—caller-owned copy and
truthful local-state examples retained; typography—long-copy wrapping/truncation
and component scale checked; colors—missing utility bridges and sampled theme
pairs corrected/verified; UI polish—target geometry, independent containment and
sampled motion verified. No new product direction or universal page template.

Delivery status: implementation and scoped self-audit complete; final technical
verification uses `npm run verify` and `git diff --check`. Independent visual
baseline acceptance and design-owner aesthetic approval are pending, not inferred.
The candidate stays private0.2.0-alpha.1 in the isolated worktree, with inherited
work preserved. No commit, publication, integration or consumer migration is part
of this delivery. Historical unfinished checkpoints above are provenance; the
current matrix and this requirement audit are the present implementation status.
