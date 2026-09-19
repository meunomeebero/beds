# Espaço library — provenance and coverage

Historical adoption record (account-menu checkpoint, not the latest release): adopt the compact account popup from [local Lucy](http://127.0.0.1:5282/?view=home&tab=lucy). Live inspection confirmed280px width,r12,1px contour,30px rows,13/19.5px regular text and24px identity avatar. This A adoption retains the library font, theme palette and768px breakpoint. Earlier sidebar/dark and Lucide1.5 decisions remain in force; the old page is not a replacement visual system.

| Account/sidebar adoption checkpoint | Scope at that checkpoint |
|---|---|
| Sidebar |264px expanded/62px collapsed;40px profile;31px standard nav;40px horizontal primary row with31px selected pill |
| Sidebar type/rhythm |Inter;nav14/19.6px400,gap11px,r6,padding8px;section17px top,label12/18px,8px bottom;profile17px mark/14px text |
| Dark neutrals |Local Lucy palette mapped into canonical semantic tokens; original source-black/warm-neutral values retained only as evidence |
| Iconography |Every registry entry uses Lucide 24×24/1.5 stroke; fixed 14px navigation/12px small/16px action/20px feature purposes; existing 16px sidebar context retained |
| Preserved foundations |Light source palette except accessible secondary/badge text;Inter/Geist fonts;768px breakpoint;full-bleed main/chat geometry;account width280px;current finish follows Foundations |
| Historical inventory |61 components / 81 tokens at an earlier checkpoint; current inventory belongs to Components and Validation. |
| Validation |Sidebar/dark baseline: 46 browser cases passed; 6 guard regressions passed; package 0.1.1 verified outside repository. These results precede the icon override; current checks belong in [Validation](VALIDATION.md) |

Current contract: [Foundations](FOUNDATIONS.md). Original tables: [Reference measurements](REFERENCE-MEASUREMENTS.md). Package versions and test totals below are dated checkpoints, never current acceptance.

## September 14 continuous-carousel update — RC11

Explicit user request:infinite card loop,remove pause/previous/next controls. A interaction change,not extracted from a static reference. Replaces RC9 reversal with three equal render groups and seamless forward period wrapping. One group exposed to assistive/keyboard navigation;controlled state shared,copy clicked becomes accessible. Hover/focus stops,touch/wheel pauses until idle,Space on focused region retains an explicit pause mechanism;reduced-motion/offscreen/hidden safeguards remain. No new CSS values outside DS,no dependency,no production flow changes.

## September 14 feature presentation addition

Reference:supplied `codex-clipboard-91b21212-d40c-4848-8f31-4d7d818b27e4.png`;image-led onboarding card. Extracted visual relationships:inset top image,concentric rounded corners,title/body hierarchy,primary and secondary actions. The then-active `make-interfaces-feel-better` skill informed concentric radii and surface polish; it has since been replaced by the Better suite. Fixed360px/24px/8px/16px/3:2 implementation is A,not a measured pixel match. Dark,responsive,loading/failure and keyboard states are locally engineered A;source behavior U.

Original [demo artwork](../../../apps/web/labs/espaco-library/assets/feature-onboarding.svg):locally authored abstract/chat illustration with synthetic Lucy copy;no reference-product image,private data or third-party marks copied. Artwork is catalog content,not a runtime dependency. Card does not implement real onboarding. Current inventory:70 components/89 tokens;see [Validation](VALIDATION.md).

## September 14 card / interaction adoption — RC9 checkpoint

User-supplied Marketer Activity/Analytics screenshots and the Home comparison:transparent panel/card surfaces,broader corners,dotted explanation labels and calendar selector. A adoption:panel20px/card24px radii;not exact source measurements. Existing Lucy sidebar remains authoritative. Carousel behavior is explicitly user-requested A,not extracted from a static screenshot. RC9 inventory:69 components/88 tokens. See [Foundations](FOUNDATIONS.md) and [Validation](VALIDATION.md);older inventory below/above remains historical.

## Original source inspection — historical record

| Record | Value |
|---|---|
| Source | [Marketer dashboard](https://app.marketer.com/dashboard), authenticated user-provided Chrome session |
| Inspection date |2026-09-12 |
| Desktop |1728×852 CSS pixels;DPR2 |
| Responsive |390×844; breakpoint comparison768/767px; expanded260px/collapsed48px sidebar |
| Method | Rendered DOM, computed style, bounds, declared CSS variables/rules, screenshots, opening/dismissing controls |
| Privacy | No retained private names, email, chat IDs/messages, balances, credentials or request payloads |
| Font origin | Official [Inter download](https://rsms.me/inter/download) / rsms Inter4.1; normal+italic variable WOFF2; `packages/beds/fonts/OFL.txt` |
| Code font origin |Official vercel/geist-font commit`10dc7658f13c38a474cde201bb09a4617267545b`; Geist Mono Regular400; [Geist OFL](../../../packages/beds/fonts/Geist-OFL.txt) |
| Earlier evidence | [Reference measurements](REFERENCE-MEASUREMENTS.md) and the portable JSON record below preserve the source observations; the original product prototype is not bundled. Legacy local Lucy supplies only the explicitly adopted sidebar/dark and iconography subsets |
| Portable source record | [marketer-reference.json](../../../packages/beds/evidence/marketer-reference.json); retained source evidence and precision/coverage context |
| Historical icon paths | [marketer-source-icons.txt](../../../packages/beds/evidence/marketer-source-icons.txt); former extracted `SourceIcon` TSX retained as text evidence, excluded from runtime |
| Package boundary | Independent `beds` (called `@espaco/ui` before RC15); old DS and production remain separate |

| Label | Meaning | Adoption rule |
|---|---|---|
|M |Measured visible/computed element in recorded state | Preserve value/context; do not generalize one viewport to every state |
|D |Declared token or rule | Record availability; do not claim visible use everywhere |
|A |Local adaptation/equivalent | State rationale and difference; test locally; aesthetic approval separate |
|U |Unobserved/unsupported by evidence | Do not describe invented behavior as extracted |

## F2 beUI adaptations — 2026-09-19

These are local BEDS adaptations, not runtime imports. The public registry and complete helper set were recovered directly; the historical tracker recipe mentioning `shadcn add` is superseded by the current no-install contract.

| Component | Source / license | Local adaptation and evidence boundary |
|---|---|---|
| Tooltip | beUI `tooltip`, MIT, [raw](https://beui.dev/r/tooltip/raw), [registry item](https://beui.dev/r/tooltip.json); raw SHA-256 `248e25c9e322f862ca2bf982d7a8747fe5bf0f779a1b009f34f522dc93c6bcb0`; registry JSON SHA-256 `b4b154e9a3b5e5c20f258dd65ea18b4825e70fdf32d11da057ed4527fd9ec2ad` | `packages/beds/src/overlays.tsx`, `tooltip-surface.tsx`, `lib/touch.ts`, `lib/hooks/use-dismiss.ts`, `use-hover-gesture.ts`, `use-tap-gesture.ts`. BEDS keeps `label` + child, bottom default, r8 surface and an 8px anchor gap. The public viewport contract remains `>=8px`; the internal animated-surface clamp uses `max(10px, 8px + width * 0.02 / 2)` to reserve the calculated spring scale overshoot for long/mobile surfaces. This is an internal safety margin, not a public spacing token. Independent technical review and integrated verify are PASS_WITH_NOTES; the historical mobile flake was not reproduced. Physical AT, non-Chromium and aesthetics remain pending. |
| Drawer | beUI `drawer`, MIT, [raw](https://beui.dev/r/drawer/raw), [registry item](https://beui.dev/r/drawer.json); retrieved 2026-09-19; raw SHA-256 `cb2282d9462850592e6102af210fe7e9e5569778a7d7bef7063d2889a37ee8fb`; registry JSON SHA-256 `e4eaa7294ff9e883a74fd555ff2e41360d47e18f083aa77318cde845cfacf43b` | `packages/beds/src/overlays.tsx` adopts the beUI panel utility anatomy with BEDS token/value swaps (`bg-card`, local shadow, 672px width, inline-end and 767px mobile boundary); header/body/section/footer layout utilities now live on the component. `packages/beds/src/overlays.css` retains only the native `dialog::backdrop` scrim. beUI `SPRING_PANEL`/reduced-motion behavior is adapted onto the native `<dialog>` with the source full-travel `±100%` panel expression, so BEDS keeps `open/onOpenChange/title/children`, browser focus trap/inert background, body scroll lock, Escape/backdrop dismissal, long-content region and RTL inline-end placement. Upstream `aside`/backdrop button, 320px/85vw geometry, blur and public style/side escape hatches remain intentionally omitted. The earlier 2026-09-15 read-only advisory proposing bounded 16/8px travel was not implemented; the later checkpoint approving the beUI/Motion expression supersedes it. No new helper. Independent technical review and integrated verify PASS_WITH_NOTES: focused gate 10/10 desktop+mobile with no skips; non-Chromium/physical AT and aesthetics remain pending. |
| Disclosure / DisclosedRecords | beUI `bouncy-accordion`, MIT, [raw](https://beui.dev/r/bouncy-accordion/raw), [registry item](https://beui.dev/r/bouncy-accordion.json), [docs](https://beui.dev/components/motion/bouncy-accordion.md); retrieved 2026-09-19; raw SHA-256 `a64ac619939b4fe5167cbb580cb2c9d0714ffb90801050a7e0a19975b28fe9ab`; registry JSON SHA-256 `bee4f7e546db58ed8f1af16c413cee6f26b31a86cb8b5e2cd5d29139075dd7f7`; documentation SHA-256 `ee3ee86088540321e288f20aa801b4796259010acde525901e1d82309fbc73e4` | Local BEDS adaptation in `packages/beds/src/disclosure.tsx` / `disclosure.css`: height/opacity/layout reveal, `motion/react`, `useReducedMotion` and ResizeObserver intent adopted while public APIs and BEDS geometry remain. `DisclosureText` keeps the full string mounted; `LabelField` keeps the hidden remainder mounted inert/aria-hidden; `DisclosedRecords` intentionally omits collapsed records from the DOM to preserve the existing tab-stop contract. No shadcn command or runtime beUI import. Independent technical review and integrated verify PASS_WITH_NOTES: focused 10/10 plus existing 12/12, no skips; package/lab typechecks PASS. Runtime reduced-motion switching, non-Chromium/physical AT and aesthetics remain pending. |
| AccountMenu | beUI `context-menu`, MIT, [raw](https://beui.dev/r/context-menu/raw), [registry item](https://beui.dev/r/context-menu.json); retrieved 2026-09-19; raw SHA-256 `5d5f57cf5994803215344285ef8447669870c9bc1017e502d490de4309b28789`; registry JSON SHA-256 `babe5776e5124ae67e28bb741900fae158904b2ee324dc349edddd9b9e07a945` | Local adaptation remains in `packages/beds/src/patterns.tsx` / `patterns.css`: upstream active-row/content motion intent is layered onto the established controlled AccountMenu contract, preserving role/dialog semantics, 280px anchored geometry, focus containment/recovery, theme/workspace callbacks and nested modal behavior. Generic context-menu trigger, menuitem, checkbox/radio APIs and public style/size escapes are not exposed. No runtime beUI import or shadcn extraction. Independent technical review and integrated verify PASS_WITH_NOTES: `account-menu-beui.spec.ts` plus `shell.spec.ts` 30 passed / 6 intentional conditional skips / 0 failed across desktop/mobile. Physical AT, non-Chromium and aesthetics remain pending. |
| CommandPalette | beUI `command-palette`, MIT, [raw](https://beui.dev/r/command-palette/raw), [registry item](https://beui.dev/r/command-palette.json), [repository](https://github.com/starc007/ui-components); retrieved 2026-09-19; raw SHA-256 `fa19172779923d319155166a71038e7077dd9f71a056591ae9493c0ec9ad05f7`; registry JSON SHA-256 `c58fed6d7f19dd6e6c5ab9202477b0751539ace1b6f929fae90e210606dac175`; repository main HEAD `90c29d7f80f661263f7b424629738e40a5a48db7`, LICENSE SHA-256 `9e27b491d5691a1bd95708e79de23beb2962f33fe6c1ee31ab639f43009a0b20` | Local BEDS module `packages/beds/src/command-palette.tsx` adopts fuzzy search/cursor, active-row motion and reduced-motion intent while preserving the existing controlled `open/onOpenChange/label/query/onQueryChange/items/onSelect/emptyLabel` API, IconName registry and measured `.es-command` geometry. It shares `packages/beds/src/lib/modal.ts` with Dialog/Drawer/SearchDialog so one WeakMap owns native modal scroll locking, focus recovery, outside dismissal and Tab containment. Upstream PresenceGate/panel entrance motion is intentionally omitted: the native dialog closes with controlled state and measured bounds must remain stable for outside-click checks. No public grouped/keyword/badge/checkbox/radio APIs, style escapes, shadcn command or runtime beUI import. Independent technical review and integrated verify PASS_WITH_NOTES: focused 8/8 plus existing command-search 4/4; serial Drawer/SearchDialog regression 20/20, no skips/failures. Non-Chromium/physical AT and aesthetics remain pending. |
| Select / FilterSelect | beUI `select`, MIT, [raw](https://beui.dev/r/select/raw), [registry item](https://beui.dev/r/select.json), [repository](https://github.com/starc007/ui-components); retrieved 2026-09-19; raw SHA-256 `2752510f98d60caea18794d93f868916dbf27f099746828ca9e5bde8c4a201ab`; registry JSON SHA-256 `6c728098323f93c3ec7e713c5cbfc2668dbd12ee24b93ad9bd788d6720b6ba6b` | Local BEDS module `packages/beds/src/select.tsx` adopts bounded trigger radius, chevron, popup opacity and option entry motion while preserving the controlled `Select`/`FilterSelect` API, native manual popover, 260px fixed popup, viewport clamp, disabled skipping, `aria-activedescendant`, keyboard navigation and focus restoration. Shared `lib/anchored-popup.ts` and `lib/option-navigation.ts` preserve the existing overlay/navigation mechanics without duplication. The composable upstream API, trigger-width geometry, search and multi-select behavior are not exposed. No runtime beUI import or shadcn extraction. Independent technical review and integrated `npm run verify`/extracted-artifact consumer smoke are PASS_WITH_NOTES: serial `select-beui.spec.ts`, `controls.spec.ts`, `application-card.spec.ts` and `account-menu-beui.spec.ts` totaled 40/40 with 0 skips/failures across desktop/mobile and light/dark. Non-Chromium/physical AT and aesthetics remain pending. |
| Badge | beUI `animated-badge`, MIT, [raw](https://beui.dev/r/animated-badge/raw), [registry item](https://beui.dev/r/animated-badge.json); retrieved 2026-09-19; raw SHA-256 `4d52c2e2be1af023ce911d48121278c94f7bb110913c61ed7d8ade47ee17ea06`; registry JSON SHA-256 `0647ea2c8abd6062cf72d8ab4031e5602cc8f9afb98fdcffec0d5abe37b68f83` | Local adaptation in `packages/beds/src/feedback.tsx` / `feedback.css`: AnimatePresence label/marker roll and upstream layout spring adopted; BEDS keeps `{label,tone,purpose}`, status-dot geometry and compatibility marker measurement. Upstream status/size/icon/showIcon/pulse/contentKey/class props are omitted; reduced motion disables transforms/filters and there is no perpetual decorative animation. Independent technical review and integrated verify PASS_WITH_NOTES: browser report 42 passed / 6 conditional skips / 0 failed across badge/application-card/shell; skips are intentional shell project conditionals. Aesthetics and physical AT remain pending. |
| LoadingIndicator | beUI `loader`, MIT, [raw](https://beui.dev/r/loader/raw), [registry item](https://beui.dev/r/loader.json); retrieved 2026-09-19; raw SHA-256 `24a3255b7a9b106cd60c246853864b541d9dd665c9fda99d314b74c98a01d66c`; registry JSON SHA-256 `0bd742a4322bfe6594ba1d9e21b83c99cf33c197d3bddb582db1d6679cd1bd97` | Local adaptation in `feedback.tsx` / `feedback.css`; focused and integrated technical/artifact checks are PASS_WITH_NOTES, with focused evidence retained. Non-Chromium, physical AT and aesthetics remain pending. |
| Toaster / toast | beUI `animated-toast-stack`, MIT, [raw](https://beui.dev/r/animated-toast-stack/raw); retrieved 2026-09-19; local source-comment SHA-256 `e1fe639d87cc5419b720e48289a9ee2ba776050413cede9b8f08af48ee28da28` | Local adaptation in `toast.tsx` / `toast.css`; public event API, top-centered geometry, timeout/pause/live-region/focus recovery retained. Focused and integrated technical/artifact checks are PASS_WITH_NOTES. Non-Chromium, physical AT and aesthetics remain pending. |

## Surface matrix

| Source surface | Inspected | Remaining U |
|---|---|---|
| Shell |Light/dark; expanded/collapsed; mobile drawer; workspace/nav |All intermediate widths, long localized names and physical touch behavior |
| Dashboard |Welcome, Home composer variant, suggestions, empty recent section |Populated dashboard metrics/tasks |
| Chat |Resting/empty composer, agent/model/context menus |Populated/streaming AI content, attachments in flight, retry/error/success matrix |
| Account |Identity grouping, action rows, theme control, workspace grouping, source plan card;light/dark shadow/ring confirmed;280px/r10/zero border |All workspace/account counts; real account mutation outcomes |
| Profile settings |Fields, disabled controls, labels/buttons |Save/validation/network outcomes; no form submitted |
| Notifications |Switch dimensions, off/on colors in both themes, label/helper/row spacing |Full keyboard/screen-reader matrix; checkbox visual appearance |
| Activity |Search/filter/tabs/captions and empty sections |Populated activity, complex data states |
| Analytics |Disconnected state; date/resolution/compare/channel controls |Populated charts, axis/legend/data-grid designs |
| Campaign |Disabled objective/channel controls |Enabled campaigns/results |
| Integrations |List row geometry |Connected/configured/error states; no integration created |
| Briefs |Status/project/group/search/sort and empty state |Populated list/document editor |
| Automations |Search/type/state and empty state |Execution history; no automation run |
| Deliverables |Empty state |Populated assets/editor/actions |
| Command / period / choice overlays |Dimensions, rows, selected/active presentation; Escape dismissals |Complete arrow/commit/typeahead behavior and every placement edge |
| Welcome dialog |Creatives entry;480px width/24px radius;200px artwork region;24px content padding;18/24px heading;40px action |Private artwork excluded; other onboarding flows unobserved |
| MCP setup |Actual Geist Mono11/20px code in both themes;42px region/12px radius/6% border/raised fill;40px copy action;15/24px page heading;13/20px sections;28px client tabs;36px joined choices |Setup requests not performed; source copy/error outcome matrix unobserved |

## Explicit adaptations

| A | Rationale / limit |
|---|---|
| Portable React19 API |Source implementation internals not copied; public controlled components built locally |
| Official font registration |Actual Inter interface and measured Geist Mono code context; legal redistributable package assets/licensing; source-hosted font files not copied |
| Three-bar brand mark / one configurable brand |User-owned library identity/configuration; not source company artwork or global recolor |
| User-selected Lucy sidebar/dark |264px/62px geometry,31px navigation andlocal dark neutrals supersede original Marketer defaults;not an accidental drift or consumer override |
| User-selected Lucy iconography |All current glyphs use Lucide 24×24/1.5 stroke; source mixed custom 18×18 and Lucide 24×24/2 stroke. This explicit icons-only override replaces the runtime `SourceIcon` map; extracted paths remain historical text evidence |
| Registry compatibility |Adds `House`, `MessageCircle`, `ChartColumn`, `UserRound`, `Briefcase`, `Coins`, `ScanText`; `Home` and `BarChart3` remain accepted Lucide names. No caller glyph/stroke/size escape |
| Semantic accessibility |Explicit labels, focus recovery and truthful missing/error states added where source behavior was not fully audited |
| Light secondary/badge contrast |Source `#787775` remains evidence/neutral600; the shared small-text and badge-text role is `#6a6966` so it reaches at least4.5:1 on the actual light main/sidebar/subtle surfaces |
| Mobile drawer focus return |The library restores the opener one animation frame after close, after React removes `inert` from the main region; Escape and the internal close control are browser-tested |
| RecentItem pressed foreground |Local adaptation: a pressed recent-item uses `--es-text` over `--es-pressed`, including inherited icon and metadata foreground; browser-tested in the mobile `hasTouch` context, with light 8.63:1 and documented dark canvas pairs above4.5:1 |
| Functional badge and placeholder contrast |Local accessibility adaptation: badge text uses the accessible foreground while its fixed functional role remains an inset marker; placeholders use the accessible secondary role on their field surface |
| Callback-only file selection |Local contract correction: `FileUploadField` exposes controlled `File[]` only and does not expose a native form `name` that would imply retained browser file state |
| Guarded consumer API |Build-time contract; source product has no implied equivalent enforcement |
| Missing component states |Local controlled examples, not evidence that source asynchronous behavior matched them |

The current library adopts the Lucy sidebar dimensions/type, dark neutrals and iconography while retaining compact non-sidebar controls and the 768px breakpoint. The icon override leaves fonts and geometry unchanged; later light secondary, badge and placeholder accessibility corrections are recorded adaptations. It does not restore the old page's exterior frame or system font. It does not inherit blanket 44px/16px mobile adaptations. Real touch-target and iOS input-zoom limits remain explicit.

After the final source inspection, Chrome returned to the source Home in light theme. Navigation, overlay inspection and temporary theme changes only; no account/settings form saved, integration setup executed or chat message sent.

Full design-language capture means a detailed reusable specification of inspected patterns. It does not mean all source components, data states or icon paths were observed. Every new source observation updates M/D evidence first; every new local pattern states A/U and adds independent QA. No claim of universal WCAG, browser, device or pixel-perfect equivalence follows from this audit.
