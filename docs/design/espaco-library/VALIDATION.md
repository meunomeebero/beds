# Espaço library — validation record

Date:2026-09-14. Canonical repository:`meunomeebero/beds`. Current candidate `@espaco/ui@0.1.7-rc.14`.

## Current RC14 — standalone repository extraction

Runtime source preserved byte-for-byte from the validated RC13 snapshot. Repository setup,
locked toolchain and distribution metadata added;no component orvisual change.
Current gates: `npm run verify` passes (build/typecheck;70 components/89 tokens;
32 Markdown files/241 local targets;four consumer roots;25 guard tests;fresh artifact parity/import).
Standalone catalog Playwright:106 passed,6 intentionally skipped by viewport-specific contracts,
0 failed;desktop/mobile,light/dark. Source runtime matches RC13 byte-for-byte.
Archive checksum and source commit are recorded in the release notes outside the package archive.
No production flow,physical-device,screen-reader or independent aesthetic acceptance is claimed.
Historical results below belong to their recorded local snapshot,not a new full-system audit.

## Previous RC13 — history header and greeting mark

Owner-requested polish:ActivityPanel purpose=history omits its header divider;default panels and dotted HelpLabel unchanged. Home BrandMark22→17.6px;heading,sidebar and10px title gap unchanged. No new component,token,consumer styling or application flow.

Focused Home regression reproduced the previous history divider before implementation. `npm run build`, `npm run check`, `npm run check:docs` pass:70 components,89 tokens,0 violations;32 Markdown files,241 local targets. `npm run test:guards`:25 passed. Data-patterns Playwright:8 passed,desktop/mobile andlight/dark;history has no divider,default queue retains one,existing controls/states pass. Command from apps/web:`../../node_modules/.bin/playwright test --config labs/espaco-library/data-patterns.playwright.config.ts --reporter=line --output=/private/tmp/espaco-rc13-data-patterns`.

Final artifact and Home packed-consumer results are recorded outside the archive in the Home lab contract to avoid a self-referential hash. Historical gates below are not current acceptance. Full-system/independent review,physical-device/screen-reader verification and aesthetic approval remain unclaimed;this is a two-detail change,not a DS completion audit.

## Previous RC12 — documentation consolidation

Source HEAD `514eb21b2b913a41d3ef1a8bfa5e049a868bab04`, dirty local DS tree; HEAD alone does not identify the uncommitted candidate. [Documentation audit](DOCUMENTATION-AUDIT.md) records scope, resolved routing/authority conflicts and two open implementation discrepancies. Runtime source, generated runtime and fonts unchanged; no installed Home upgrade.

| Gate | Result |
|---|---|
| Library build / static contract | Build passes; 70 public components, 89 tokens, 0 violations. |
| Consumer contract | Four explicit roots: package example, LucyPage, McpPage, FeatureCardExamples; 4 files, 0 violations. Catalog chrome and all other application roots are not implied covered. |
| Canonical + packaged docs | Filesystem gate: 32 Markdown files, 241 local targets, 0 violations; includes untracked files and canonical index coverage in library/repository maps. |
| Guard regressions | 25 passed, 0 failed/skipped; seven new documentation fixtures cover untracked/nested files, local link forms, empty/missing scope, index coverage, package containment and symlink CLI execution. |
| Package artifact | Fresh isolated rebuild matches generated runtime/docs; extracted-package links and no-alias consumer import pass; RC12, 0 violations. Final archive hash emitted by the gate, outside this self-referential package record. |
| DS routing + historical docs | Explicit supplemental scope: 17 Markdown files; 236 local targets; 0 violations. |
| Runtime preservation | 59 files across `src`, `dist` and `fonts` match pre-audit SHA-256 values; docs and check tooling are the only package changes. |
| Token register cross-check | Read-only comparison: 90 shared/theme table rows cover all 87 CSS properties with matching values; 0 differences. The two provider-owned runtime colors remain separate. This is not a CSS-computed contrast or screenshot audit. |
| Not run | New browser, physical-device, screen-reader, independent visual and aesthetic review; documentation/tooling scope only. Historical UI runs below are not new acceptance. |

Implementation/documentation consolidation completed; static/package gates recorded on the current local candidate. Visual acceptance remains pending. In particular, MCP heading type and sidebar-profile tracking metadata require separate shared implementation reconciliation; no zero-conflict/finished-DS claim.

Earlier repository-wide “162 files” link results below checked tracked Markdown only, not the untracked DS tree. They remain historical command outputs, not evidence of complete DS link coverage. The new filesystem and extracted-package gates close that coverage gap.

## RC12 checkpoint — Better quality protocol

Seven pinned user skills replace the standalone legacy polish skill. [Interface quality](INTERFACE-QUALITY.md) owns routing,source revision,DS precedence and evidence/verdict boundaries. UI source,CSS,fonts,public APIs and existing preview/RC11 Home dependency unchanged. This change installs review guidance,not a completed UI audit or background auditor.

| Gate | Result |
|---|---|
| Installed source |Seven skills;41 upstream files match Git blob hashes at the pinned revision;52 local Markdown references resolve;MIT notices retained |
| Skill metadata |All seven pass `quick_validate.py` through `uv run --no-project --with pyyaml`;system/bundled Python alone lacked PyYAML;no project Python dependency added |
| Removed entry |Old skill moved to the local Trash,outside active skill roots;recoverable. Upstream skill bodies remain unmodified;DS-specific policy is documented here,not injected into unrelated projects |
| Package |`npm run build`,`npm run check`,`npm run check:artifact` pass;70 components/89 tokens/0 violations;unpacked consumer smoke passes |
| Runtime preservation |54 source/distribution files match the installed Home RC11 archive byte-for-byte;no UI implementation changed |
| Documentation |`bun run scripts/check-docs-links.ts`:162 files,0 broken in canonical and primary checkouts;new quality protocol also checked directly;diff whitespace check passes |
| Not run |Browser/assistive-technology/independent behavioral audit:guidance-only update;previous browser results remain historical. New instructions do not establish visual or aesthetic approval |

## Previous RC11 — continuous forward carousel

Explicit change:infinite loop;remove visible pause/previous/next controls. Fixed34px/s,three equally spaced render groups,period rebase without reversal. One accessible/Tab set;pointer promotion preserves clicked position and controlled selection. No new component/token or animation dependency. RC10 FeatureCard retained;Home does not place it into onboarding.

| Gate | Result |
|---|---|
| Package source |Typecheck passed;70 public components/89 tokens/0 violations;18 guard regressions passed |
| Source browser |106 passed;6 existing project-scoped skips;112 cases,retries0. Includes12 surface-polish cases |
| Loop continuity |Three seam crossings per project;positive modulo position deltas≤3px/frame;no direction reversal or empty trailing lane;hidden scrollbar/no toolbar |
| Interaction |Hover/focus pause;Space persistent pause/resume;manual ArrowRight under reduced motion;copy selection updates other copies;one keyboard set;Tab stays in promoted group;no duplicate IDs;resize containment |
| Artifact |Fresh build +`check:artifact`:RC11,0 violations,extracted dist import smoke passed. Final Home archive/hash recorded by its consumer,not a mutable source alias |
| Consumer scope boundary |Catalog.tsx contains pre-existing documentation HTML/CSS;strict consumer scan reports74 findings,not a compliant application root. No guard weakened. Home consuming roots require their own strict scan;source fixtures are not substituted for that gate |
| Motion review |Personal review via emulated browser;PASS_WITH_NOTES. Static anatomy retained;no new hover/icon/type changes. No independent/human aesthetic approval;physical touch,WebKit,assistive screen reader and10% DevTools playback not verified |

Rejected:edge reversal (contradicts request),dummy inert copies (visible actions would fail),removing reduced-motion/native-scroll support (access regression),additional motion dependency (unnecessary). Captures:[Desktop](../../../apps/web/labs/espaco-library/evidence/carousel-loop-desktop.png),[Mobile](../../../apps/web/labs/espaco-library/evidence/carousel-loop-mobile.png). Gesture-hold/cancel implementation retains active pointer IDs;physical-device performance remains unmeasured.

## Previous RC10 — reusable image-led FeatureCard

User-requested screenshot adaptation:image,title,description and buttons for onboarding/other contexts. One public primitive;fixed360px/r24/p8 and3:2/r16 image;transparent body. Demo uses original synthetic artwork. No Home change or production onboarding integration.

| Gate | Current result |
|---|---|
| Public API / tokens |70 components;89 declared/provider tokens;0 violations;all CSS tokens indexed in Foundations |
| Types / build |Package typecheck/build and catalog TypeScript passed;catalog production build emits local SVG/font assets |
| Consumer contract |New FeatureCardExamples composition:1 file,0 violations;content/callbacks accepted,style override rejected |
| Guard regression |18 passed;includes new consumer contract case and updated artifact CSS fixture |
| Focused browser |`feature-card.spec.ts`:10 passed;Chromium desktop/mobile |
| Full source browser |104 passed,6 existing project-scoped skips;no failures;110 cases;retries0 |
| Geometry / responsive |Light/dark;transparent,r24/p8;image3:2/r16;fixed title/body;40/44px actions;320/390/768/1440 widths;no horizontal overflow or clipped long copy |
| Interaction / recovery |Real catalog navigation;Enter/Space/Tab,visible focus;primary/secondary callbacks;busy/disabled prevent activation;image pending,failed,empty,decorative and cached re-entry;loading never blocks action or shifts card height |
| Artifact |`npm run check:artifact`:RC10,0 violations,extracted package import smoke passed;FeatureCard public dist export required |
| Documentation |Repository link check:162 files,0 broken;portable docs/evidence generated from canonical source |
| Visual review |Personal light/dark desktop/mobile screenshot review;concentric corners,image inset and action hierarchy inspected. No independent review per explicit no-delegation request;human aesthetic approval remains pending |
| Limits |No real onboarding/backend/network action;no physical device,WebKit or assistive-screen-reader test;no claim of measured pixel identity with the resized reference |

Catalog entry:Library → **Card de apresentação**,`?view=feature-card&theme=light` (or `dark`). Reusable API/geometry in [Components](COMPONENTS.md) and [Foundations](FOUNDATIONS.md).

| Screenshot | Desktop | Mobile |
|---|---|---|
| Light,complete catalog |[View](../../../apps/web/labs/espaco-library/evidence/feature-card-light-desktop.png) |[View](../../../apps/web/labs/espaco-library/evidence/feature-card-light-mobile.png) |
| Dark,complete catalog |[View](../../../apps/web/labs/espaco-library/evidence/feature-card-dark-desktop.png) |[View](../../../apps/web/labs/espaco-library/evidence/feature-card-dark-mobile.png) |
| Light,component detail |[View](../../../apps/web/labs/espaco-library/evidence/feature-card-detail-light-desktop.png) |[View](../../../apps/web/labs/espaco-library/evidence/feature-card-detail-light-mobile.png) |
| Dark,component detail |[View](../../../apps/web/labs/espaco-library/evidence/feature-card-detail-dark-desktop.png) |[View](../../../apps/web/labs/espaco-library/evidence/feature-card-detail-dark-mobile.png) |
| Image unavailable |[View](../../../apps/web/labs/espaco-library/evidence/feature-card-unavailable-desktop.png) |[View](../../../apps/web/labs/espaco-library/evidence/feature-card-unavailable-mobile.png) |

## Previous RC9 — transparent surfaces and interaction finish

User-requested reference adaptation:transparent content containers,panel20px/p16,collection card24px/p20;existing Lucy sidebar preserved. FilterSelect,HelpLabel and interruptible Carousel added. Values are explicit local adoption from supplied screenshots,not measurements claimed from source CSS. Opaque popovers,selected controls and inset surfaces remain intentional.

| Gate | Current result |
|---|---|
| Public API / contract |69 components;88 declared tokens;0 violations |
| Package / catalog types |`npm run typecheck`;`npm run build`;catalog `tsc --noEmit` passed |
| Guard regression |`npm run test:guards`:17 passed |
| Packed artifact |`npm run check:artifact`:0 violations;extracted distribution consumer smoke passed. Immutable delivery hash recorded outside package |
| Complete source browser suite |94 passed;6 conditional scope skips;Chromium desktop/mobile. Includes10 new surface-polish cases;no failed cases |
| New surface / state coverage |Both themes;transparent generic panels,settings,plans,integration/MCP shells;20/24px geometry;filter keyboard/disabled/dismissal;dotted tooltip hover/focus/touch/Escape;selected navigation hover;reduced transitions |
| Automatic carousel |Fixed34px/s;soft reversal without reordered/cloned cards;hover pauses;pointer/wheel/focus persistently pause;explicit resume;offscreen/hidden stop;reduced-motion disables autoplay;manual overflow controls retained |
| Documentation |Repository link gate:162 files;0 broken links |
| Review boundary |Personal implementation and visual self-review per explicit no-delegation request. No independent review or human aesthetic approval claimed. Physical devices,WebKit and production data integration untested |

RC9 screenshot evidence;synthetic library content only:

| Pattern | Desktop | Mobile |
|---|---|---|
| Filter,dark |[Screenshot](../../../apps/web/labs/espaco-library/evidence/filter-select-desktop-dark.png) |[Screenshot](../../../apps/web/labs/espaco-library/evidence/filter-select-mobile-dark.png) |
| Filter,light |[Screenshot](../../../apps/web/labs/espaco-library/evidence/filter-select-desktop-light.png) |[Screenshot](../../../apps/web/labs/espaco-library/evidence/filter-select-mobile-light.png) |
| Help,dark |[Screenshot](../../../apps/web/labs/espaco-library/evidence/help-label-desktop-dark.png) |[Screenshot](../../../apps/web/labs/espaco-library/evidence/help-label-mobile-dark.png) |
| Help,light |[Screenshot](../../../apps/web/labs/espaco-library/evidence/help-label-desktop-light.png) |[Screenshot](../../../apps/web/labs/espaco-library/evidence/help-label-mobile-light.png) |

## Historical RC2 checkpoint

Records below describe their named candidates,not current candidate approval. Original source evidence and older immutable archives remain preserved.

| Gate | Command / evidence | Result |
|---|---|---|
| Public API + tokens | `node packages/espaco-ui/scripts/check-library.mjs --tokens src/tokens.css` |61 components;81 declared/provider properties;0 violations |
| ResponsiveGrid | `responsive-grid.spec.ts` in the source catalog |4 passed;dark/light;desktop/mobile projects;320/390/768/1440;fixed16px gap,stacking,child Tab order and no horizontal overflow |
| Consumer sample | `node packages/espaco-ui/scripts/check-consumer.mjs packages/espaco-ui/examples/consumer.tsx` |Pending fresh RC2 rerun |
| Guard regression | `npm run test:guards` from `packages/espaco-ui` |17 passed; includes consumer escapes,missing documentation assets,artifact parity,packed consumer and visual-baseline gate |
| Package type/build | `npm run typecheck`; `npm run build` from `packages/espaco-ui` |Historical RC2 result; RC4 rerun recorded below |
| Catalog TypeScript | `tsc -p apps/web/labs/espaco-library/tsconfig.json` |RC2 passed |
| Integrated browser suite | RC1 historical baseline |72 passed;6 intentional scope skips; not rerun for RC2 |
| Shell focus + contrast | RC1 historical baseline |18 passed;6 project-scoped skips; not rerun for RC2 |
| RecentItem touch contrast | RC1 historical baseline |Held real pointer press verifies pressed foreground/background in both themes; not rerun for RC2 |
| MCP source-geometry flow | RC1 historical baseline |4 passed; not rerun for RC2 |
| Form primitives | RC1 historical baseline |8 passed; not rerun for RC2 |
| Lucy visual regression | RC1 historical baseline |4 passed; not rerun for RC2 |
| Production catalog build | `vite build apps/web/labs/espaco-library --config apps/web/labs/espaco-library/vite.config.ts` |RC2 passed; fonts bundled locally |
| Packed consumer |`npm run check:artifact` from `packages/espaco-ui`; local tarball extracted outside repository; Node ESM/SSR render; font/doc paths; both guards from extracted package |RC2 passed;61 components;brand validation;0 violations;the handoff records the immutable archive SHA |
| Documentation links | Repository-wide link gate |Not rerun for RC2; RC4 rerun recorded below |

## RC4 source candidate — B2/B3/B4 only

This `0.1.7-rc.4` source candidate fixes three confirmed library-contract defects without changing the immutable RC2 archive, Home consumer or active demonstration: functional badge/placeholder contrast, defensive Pagination bounds with a normalized summary callback, and callback-only FileUploadField semantics. RC4 adds a browser-enforced3:1 contrast requirement for each semantic badge marker against its actual badge surface. The generated RC2 archive remains untouched; visual audit and aesthetic approval are still pending human evidence.

| Candidate gate | Result |
|---|---|
| Public API + tokens |61 components;85 tokens;0 violations |
| Type/source checks |`npm run typecheck`; `npm run build`; catalog `tsc --noEmit` passed. Candidate source and generated RC4 output were validated together; RC2 output remains unchanged |
| Guards |17 passed |
| Shell contrast/focus |22 passed;6 intentional mobile/viewport scope skips;functional badge text/placeholders meet4.5:1 and every semantic badge marker meets3:1 in both themes |
| Data patterns |8 passed;desktop/mobile × light/dark;zero,negative,NaN,Infinity and fractional pages normalize to recoverable adjacent navigation;Tab and Arrow-key behavior follows actual horizontal overflow |
| Form primitives |8 passed;desktop/mobile × light/dark;FileUploadField has no native `name` and remains controlled local `File[]` selection |
| Package artifact |`npm run check:artifact` passed: RC4 package has0 violations and its extracted consumer smoke passed. The fresh local archive hash is recorded with the delivery, outside the package to avoid self-referential artifact content. |
| Documentation links |`bun run check:docs-links` passed:162 files,0 broken links |
| Visual/aesthetic approval |Pending;no baseline or approval status was generated |

## RC8 source candidate — manual scroll primitives and isolated Home composition

This `0.1.7-rc.8` candidate preserves the RC4 archive and adds HorizontalRail, ScrollableList, IconToggleButton, CollectionCard, ActivityPanel and the semantic 880px dashboard content width. They expose no consumer styling, domain data, scheduling, order, score, request or animation behavior. The candidate's source, package, catalog and focused Home browser gates passed; visual/aesthetic approval remains separate.

| Candidate gate | Result |
|---|---|
| Public API + tokens | 66 public components; 86 declared tokens; 0 violations |
| Package source | `npm run typecheck`; `npm run build` passed |
| Guards | `npm run test:guards`: 17 passed |
| Packed artifact | `npm run check:artifact`: 0 violations; extracted consumer smoke passed. Archive hash remains outside the package to avoid self-reference. |
| Data catalog | TypeScript passed; `data-patterns.spec.ts`: 8 passed across desktop/mobile and light/dark. Horizontal rail, scrollable list, icon toggle, collection card and activity panel are exercised. |
| Focused Home consumer | Packed candidate only; lab TypeScript/Vite build and 16 Playwright desktop/mobile flows passed. It covers the 880px lane, card/panel anatomy, native scroll and local selection without product behavior. |
| Visual/aesthetic approval | Pending human decision; technical evidence is not aesthetic approval. |

Two skips are the duplicated viewport-loop tests in the mobile project; two are the desktop instances of a mobile-only drawer-focus assertion; and two are the desktop instances of a mobile-only pressed-state assertion. The desktop project runs320/390/768/1440px layout checks; the mobile project separately exercises touch configuration, drawer, focus, pressed state and theme interactions. A skip is not a passing test.

## Exercised behavior

| Flow | Coverage |
|---|---|
| Shell |264→62px collapse/expand;767/768 responsive boundary;264px mobile drawer; Escape/internal-close focus restoration after `inert` leaves main; no horizontal overflow across inspected widths |
| RecentItem |Quiet row/default secondary hierarchy; held mobile touch press changes foreground to `--es-text` over `--es-pressed`; no product request |
| Account |280px popup/r12/1px contour;regular13/19.5px text;24px avatar;30px desktop/44px mobile rows;24px desktop/44px mobile theme group; actual theme and workspace changes; Tab loop/outside/Escape; nested Escape closes account before drawer |
| Select/menu |260px choices,160px menu, viewport clamping; arrows/Home/End/disabled skip; selection callbacks; Tab/outside/Escape/focus return |
| Dialog/command |Native modality; explicit Tab containment; document scroll lock/restoration; query/empty/disabled actions; dismiss/return; welcome480px or available mobile width |
| Context variants |Pill24px;joined36px;activity tabs30px/connection28px;connection input40/r10;welcome action40/r12;context selector28px,transparent,label+helper |
| Form |Label/helper/error association; empty-submit error; recovery; disabled/read-only; checkbox/switch/radio/tab control |
| Chat |640px desktop/358px mobile;120+36=156px;correct separate surfaces in both themes;whitespace disabled;suggestion→draft;Shift+Enter;IME guard;submit→clear |
| Brand |Orange changes only brand emphasis;neutral/semantic values and composer dimensions unchanged in both themes |
| Missing data |Null means unavailable;0 is valid;max value renders truthfully |
| Copy |Failure→recovery→clipboard confirmation;changed value resets copied indication;Geist Mono loaded;single-line42px/r12 surface |

## Visual evidence

All screenshots use synthetic library content, not source account data.

| View | Desktop | Mobile |
|---|---|---|
| Orange-brand chat,dark |[Screenshot](../../../packages/espaco-ui/evidence/library-dark-desktop.png) |[Screenshot](../../../packages/espaco-ui/evidence/library-dark-mobile.png) |
| Orange-brand chat,light |[Screenshot](../../../packages/espaco-ui/evidence/library-light-desktop.png) |[Screenshot](../../../packages/espaco-ui/evidence/library-light-mobile.png) |
| Account,dark |[Screenshot](../../../packages/espaco-ui/evidence/account-dark-desktop.png) |[Screenshot](../../../packages/espaco-ui/evidence/account-dark-mobile.png) |
| Account,light |[Screenshot](../../../packages/espaco-ui/evidence/account-light-desktop.png) |[Screenshot](../../../packages/espaco-ui/evidence/account-light-mobile.png) |

Reviewed refreshed dark desktop and light mobile form captures, plus the MCP desktop/mobile captures. Integrated suite refreshed desktop/mobile chat,account,welcome and component catalog evidence. Retained full catalog captures and JSON test report: `apps/web/labs/espaco-library/evidence/`. Numeric gates verify the exercised constraints; human aesthetic approval remains separate.

## Lucy application composition — prior v0.1.1 baseline

The legacy page supplies sidebar labels/groups only. All temporary workspace-specific library changes were removed. At that checkpoint, `@espaco/ui` was version 0.1.1; no new component, font, palette, geometry or variant was introduced for this exercise.

| Gate | Current result |
|---|---|
| Source preservation | 21/21 library source files byte-identical to pre-exercise `espaco-ui-0.1.1.tgz`; [hash record](../../../apps/web/labs/espaco-library/evidence/lucy-library-baseline.json) |
| Consumer guard | `LucyPage.tsx`: 1 file, 0 violations; public components only |
| Library guard | 55 public components, 81 tokens, 0 violations |
| TypeScript / catalog build | Passed after removing workspace adaptations |
| Complete browser suite | 52 passed, 2 duplicate-viewport skips; 1.5m; Chromium desktop/mobile |
| New composition cases | 6 passed; both themes; catalog entry + alias, sidebar hierarchy and bottom credits, existing visual geometry, context/send/new conversation, account theme/dismissal, collapse/drawer |
| Visual review | Current desktop page and mobile dark page/drawer inspected; screenshot links below |

| Composition capture | Desktop | Mobile |
|---|---|---|
| Dark | [Page](../../../apps/web/labs/espaco-library/evidence/lucy-dark-desktop.png) | [Page](../../../apps/web/labs/espaco-library/evidence/lucy-dark-mobile.png) |
| Light | [Page](../../../apps/web/labs/espaco-library/evidence/lucy-light-desktop.png) | [Page](../../../apps/web/labs/espaco-library/evidence/lucy-light-mobile.png) |
| Dark account/navigation | [Account](../../../apps/web/labs/espaco-library/evidence/lucy-account-dark-desktop.png) | [Sidebar](../../../apps/web/labs/espaco-library/evidence/lucy-navigation-dark-mobile.png) |

These checks validate composition with the existing DS, not visual parity with port 5282. Other sections and all account/credit/chat data are local demonstration fixtures. [Composition contract](LUCY-COMPOSITION.md).

## Iconography adoption — v0.1.2

Latest explicit user request: use the legacy Lucy icon family throughout the DS. Public `Icon` now renders Lucide only, with fixed 1.5 stroke. Existing icon names remain supported; additional registered names supply the old sidebar symbols. No consumer styling option added.

| Gate | Result |
|---|---|
| Change boundary | `foundation.tsx` icon registry/renderer; old source glyph implementation moved to historical evidence; all CSS, palette tokens, typography and layout files unchanged from v0.1.1; [scope record](../../../apps/web/labs/espaco-library/evidence/iconography-scope.json) |
| Library / consumer guards | 55 public components;81 tokens;0 violations; Lucy consumer1 file,0 violations |
| Existing browser cases | 52 passed;2 duplicate-viewport skips with the new icons |
| Focused iconography | 4 passed after correcting a test-only SSR transform issue;desktop/mobile × light/dark;actual Lucide paths,1.5 stroke,fixed14/16/12/20px purposes,16px sidebar,existing aliases and new sidebar mapping |
| TypeScript | Passed for library and catalog |
| Visual inspection | Current dark Lucy page inspected in browser; matching source glyph choices, existing layout and colors |
| Dead code | Not green: existing consumer sample entry plus2 backend dependencies and7 backend exports reported; no archived glyph runtime left in source |

The previous full-source identity assertion applies to the earlier composition exercise only. The current, explicitly authorized delta is recorded above. Historical Marketer glyph data remains available as [text evidence](../../../packages/espaco-ui/evidence/marketer-source-icons.txt). No production integration or publication performed.

## Account-menu finish — v0.1.3

Live reference inspected in Chrome; source menu280px/r12/1px border/30px rows and regular13/19.5px text. Adopted through AccountMenu CSS and one internal class for All workspaces. Lucy identity is single-line; other optional descriptions and footers remain supported. Existing DS fonts, theme tokens, icons, sidebar, main and other controls unchanged.

| Gate | Result |
|---|---|
| Browser suite |56 passed;2 intentional duplicate-viewport skips;26.2s |
| Runtime scope |[Version comparison](../../../apps/web/labs/espaco-library/evidence/account-menu-scope.json):only account styling and internal class;all tokens,fonts,icons and layout source unchanged |
| Menu coverage |Both themes,desktop/mobile,280px width,r12,1px border,regular text,24px avatar,identity/group separators,quiet All workspaces,30/44px actions,20/40px appearance choices |
| Interaction |Real profile trigger,theme switching,workspace selection,Tab loop,Escape/outside,focus restoration,nested mobile drawer |
| Guard / types |55 components,81 tokens,0 library violations;1-file Lucy consumer passes;catalog TypeScript passes |
| Visual review |Reference dark menu plus updated mobile dark/desktop light screenshots inspected |

Prior version records above are historical checkpoints. The existing semantic shadow tokens remain unchanged; light uses the established library palette rather than introducing new color roles.

## Selected primary-navigation icon — v0.1.4

User-requested state from the legacy Lucy reference: selected primary-nav SVG uses `fill:currentColor` and `stroke:var(--es-sidebar)`. Inactive icons remain outlined. Only `SidebarSection purpose="primary"` is affected; standard navigation, suggestions and controls keep their existing icon treatment. No geometry, palette, typography or API change.

| Gate | Result |
|---|---|
| Focused browser suite |14 passed;9.7s;desktop/mobile;light/dark;Lucy composition,iconography and navigation |
| Selection regression |Chat→Components→Chat moves the fill with active/aria-current;inactive sibling returns to none;standard navigation remains outlined |
| Lucy regression |Selected Lucy filled,inactive Início outlined;existing page/account/chat interactions retained |
| Scope |One CSS state rule in layout.css;existing component states and tokens only |

The complete56-pass/2-skip suite above belongs to v0.1.3. This revision reran the14 relevant cases rather than claiming a fresh full-suite run.

## MCP composition — local preview

The original MCP composition record below is historical. The current source-measured layout and compacted consumer are recorded in the v0.1.5 section that follows. Its product content was checked against the implemented product-owned Agent/MCP guide (not bundled); all OAuth, credential and MCP actions stay local fixtures.

| Gate | Result |
|---|---|
| Consumer contract | `node packages/espaco-ui/scripts/check-consumer.mjs apps/web/labs/espaco-library/McpPage.tsx` → 1 file, 0 violations |
| Library contract | `node scripts/check-library.mjs --tokens src/tokens.css` from `packages/espaco-ui` → 55 public components, 81 tokens, 0 violations |
| Catalog TypeScript | `node node_modules/typescript/bin/tsc -p apps/web/labs/espaco-library/tsconfig.json` → passed |
| Focused MCP browser flow | `mcp-page.spec.ts` → 4 passed; desktop/mobile, dark/light, client tabs, policy, invalid/valid callback, credential receipt and no external XHR/fetch |
| Integrated browser suite | `npx playwright test --config labs/espaco-library/playwright.config.ts --reporter=dot` from `apps/web` → 60 passed, 2 existing duplicate-viewport skips, 27.5s |
| Visual review | Historical capture files are no longer retained. This record is not current visual approval; the reproducible v0.1.6 captures are listed below. |

The visible `codex mcp add` and `codex mcp login` strings use the documented production endpoint plus an `agent_<client-id>` placeholder. A copied command still requires a user-registered client, browser consent and scopes; the local preview does not create an application, OAuth consent, token or MCP connection.

## MCP source geometry and compact composition — v0.1.5

Read-only live inspection of the reference MCP page at1728×852 supplied the exact frame values:784px page header with `48px 32px 16px` inset;784px main wrapper with `16px 32px 32px` inset;720px content lane;48px main-section gap. The package now owns the matching page identity with `PageContentHeader` and the16px main top inset through `AppShell`. This replaces the previous unmeasured24px page-top adaptation. Desktop side/bottom24px package gutters remain explicitly A adaptations.

The MCP consumer removes its extra breadcrumb header, fragmented approval prose and separate Codex commands. It composes one policy panel, one client setup panel and one callback panel from public primitives; credential/OAuth/MCP behavior remains local-only.

| Gate | Result |
|---|---|
| Catalog TypeScript | `node node_modules/typescript/bin/tsc -p apps/web/labs/espaco-library/tsconfig.json` → passed |
| Consumer contract | `node packages/espaco-ui/scripts/check-consumer.mjs apps/web/labs/espaco-library/McpPage.tsx` →1 file,0 violations |
| Library contract | `node packages/espaco-ui/scripts/check-library.mjs --root packages/espaco-ui --tokens src/tokens.css` →56 public components,81 tokens,0 violations |
| Focused browser flow | `mcp-page.spec.ts` →4 passed;desktop/mobile,dark/light,source16px inset,policy/client/callback controls and no external XHR/fetch |
| Integrated browser suite | `npx playwright test --config labs/espaco-library/playwright.config.ts --reporter=dot` from `apps/web` →60 passed,2 existing duplicate-viewport skips |
| Documentation links | `bun run check:docs-links` →162 files,0 broken links |
| Visual review | Historical capture files are no longer retained. This record is not current visual approval; the reproducible v0.1.6 captures are listed below. |

## MCP connection-card correction — v0.1.6

The earlier connection composition was structurally valid but used the `Tabs` component in the wrong anatomy: it wrapped a compact tab list in a generic `Surface`. Comparison against the approved MCP reference identified a wrong outer radius, compact left-grouped options and insufficient panel inset. The correction moves the full client-card anatomy into `Tabs variant="connection"`; the MCP consumer contains no spacing, radius or distribution CSS.

| Gate | Result |
|---|---|
| Source-derived geometry |16px outer radius;53px strip with8px inset;36px/r10 five-way tablist;16px32px32px desktop panel;16px16px24px mobile panel |
| Focused browser flow |`mcp-page.spec.ts` →4 passed;desktop/mobile,dark/light;asserts radius,strip inset,tablist height/distribution,panel padding and document containment |
| Static contracts |TypeScript passed;MCP consumer1 file/0 violations;library56 components/81 tokens/0 violations |
| Integrated browser suite |`npx playwright test --config labs/espaco-library/playwright.config.ts --reporter=dot` from `apps/web` →60 passed,2 existing duplicate-viewport skips |
| Visual audit |Stable [desktop dark](../../../apps/web/labs/espaco-library/evidence/mcp-content-dark-desktop.png) and [mobile dark](../../../apps/web/labs/espaco-library/evidence/mcp-content-dark-mobile.png) captures inspected against the source card geometry |

## Limits

- Chromium only; Safari/Firefox/real-device keyboards and assistive technology not executed.
- Source compact touch targets and13–14px editable text deliberately retained; no claim of universal accessibility conformance.
- Source motion declared/measured in provenance; v0.1 state changes remain immediate; no animation-parity claim.
- Populated source analytics/charts/tables, streaming/upload failures and full billing/onboarding states not available in this read-only audit. Local fallback components are marked A/U.
- No source account message, integration setup, purchase or settings save performed. No local product backend required.
