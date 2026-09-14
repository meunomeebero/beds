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
| Font origin | Official [Inter download](https://rsms.me/inter/download) / rsms Inter4.1; normal+italic variable WOFF2; `packages/espaco-ui/fonts/OFL.txt` |
| Code font origin |Official vercel/geist-font commit`10dc7658f13c38a474cde201bb09a4617267545b`; Geist Mono Regular400; [Geist OFL](../../../packages/espaco-ui/fonts/Geist-OFL.txt) |
| Earlier evidence | [Reference measurements](REFERENCE-MEASUREMENTS.md) and the portable JSON record below preserve the source observations; the original product prototype is not bundled. Legacy local Lucy supplies only the explicitly adopted sidebar/dark and iconography subsets |
| Portable source record | [marketer-reference.json](../../../packages/espaco-ui/evidence/marketer-reference.json); retained source evidence and precision/coverage context |
| Historical icon paths | [marketer-source-icons.txt](../../../packages/espaco-ui/evidence/marketer-source-icons.txt); former extracted `SourceIcon` TSX retained as text evidence, excluded from runtime |
| Package boundary | Independent `@espaco/ui`; old DS and production remain separate |

| Label | Meaning | Adoption rule |
|---|---|---|
|M |Measured visible/computed element in recorded state | Preserve value/context; do not generalize one viewport to every state |
|D |Declared token or rule | Record availability; do not claim visible use everywhere |
|A |Local adaptation/equivalent | State rationale and difference; test locally; aesthetic approval separate |
|U |Unobserved/unsupported by evidence | Do not describe invented behavior as extracted |

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
