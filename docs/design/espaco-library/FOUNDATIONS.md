# Espaço library — fixed foundations

Current rules only. Historical values: [Original measurements](REFERENCE-MEASUREMENTS.md); source labels: [Provenance](PROVENANCE.md). Canonical runtime values: `packages/espaco-ui/src/tokens.css`; consumer override rules: [contract](CONSUMER-CONTRACT.md). Evidence labels: M measured, D declared, A local adaptation, U unobserved.

## Current user-approved authority

Current user-approved foundation: local Lucy sidebar/dark neutrals, Lucide iconography and the compact legacy account-menu finish. Account-specific geometry is specified below; Inter/Geist, the shared palette, sidebar and page layout remain fixed. These A adoption decisions supersede corresponding historical Marketer measurements without expanding the consumer styling API.

| Adopted context | Current contract |
|---|---|
| Sidebar / collapsed rail |264px /62px |
| Profile/header |42px header minimum;40px profile control;17px profile mark;14px/21px regular text;9px gap;7px horizontal padding |
| Search / collapse controls |32px wide in40px header row |
| Standard navigation |31px high;14px/19.6px,weight400;11px icon/text gap;6px radius;8px horizontal padding |
| Primary navigation |`SidebarSection purpose="primary"`;horizontal40px row;31px selected pill;selected icon fill currentColor/stroke sidebar;inactive outline;4px group gap;9px icon/text gap;11px horizontal padding;14px/21px regular text |
| Sidebar sections |Default17px top;12px/18px labels;8px heading bottom;history15px top/2px row gap;primary3px top/6px bottom |
| Sidebar glyphs |16px navigation glyph; 24×24 Lucide viewBox/1.5 stroke; 17px profile mark; fixed registry |
| Dark neutrals |Local Lucy roles; exact adopted values in canonical token register below |
| Retained type |Inter interface /Geist Mono code; sidebar role sizes above are scoped |
| Retained layout |768px breakpoint;full-bleed main;chat640px/Home720px;dashboard880px only for the isolated Home composition;16px main top inset after the content header;existing mobile chat gutters/composer |
| Light / account |Source palette retained except accessible secondary/badge text; account280px/r12 with the compact finish below |
| Verification |Current browser/token/package checks recorded in [Validation](VALIDATION.md); source evidence is historical |

The adopted main canvas is full-bleed`#191919`. The local prototype's outer`#171717` frame is not restored. Chat640px/Home720px widths and composer dimensions retain their existing geometry. Dashboard880px is an A width for the isolated Home composition; it does not alter the Lucy or MCP lanes. The16px page-top inset is a fresh M measurement from the reference MCP main wrapper; the package applies it after its own `ContentHeader` or mobile bar. Existing24px desktop/16px mobile side gutters and24px bottom inset remain A shell adaptations, not newly claimed source measurements.

| Adopted dark role | Exact value |
|---|---|
| Main/sidebar |`#191919` |
| Popup surface /subtle /raised |`#202020` /`#232323` /`#272727` |
| Hover /pressed /selected |`#ffffff05` /`#ffffff0c` /`#2a2a2a` |
| Quiet control |`#262626` |
| Text /secondary /placeholder |`#cecece` /`#949494` /`#949494` |
| Heading /input text |`#d4d4d4` /`#d0d0d0` |
| Border /subtle /strong |`#ffffff0c` /`#ffffff06` /`#ffffff13` |
| Composer surface /context |`#191919` /`#222222` |
| Composer contour /focus contour |`#ffffff04` /`#ffffff17` |
| Focus |`#b9b9b9` |
| Badge /badge text |`#414141` /`#e5e5e5` |
| Send /send text |`#dedede` /`#292929` |
| Primary/inverse /on-primary |`#f1f1f1` /`#242424` |
| Field /user message |`#191919` /`#232323` |
| Library switch off /thumb |`#414141` /`#c8c8c8`;A mapping for library-only control |
| Account shadow |`0 1px 2px #00000044,0 8px 24px #00000044`;A dark adoption;280px/r12 current account geometry |

Functional information/success/warning/error colors stay unchanged in their existing uses. Inter and Geist remain fixed; only the three sidebar text contexts are A additions in the type metadata. New role aliases keep controls, selection, composer parts, heading/input text, badges andsend surfaces distinct instead of recoloring unrelated components through one shared token. Functional badge tones use fixed theme-specific marker roles, each at least3:1 against `--es-badge`; their 10px text uses the accessible foreground rather than functional ink.

The source light secondary `#787775` is retained as historical neutral step/evidence, but the shared small-text and badge-text role uses `#6a6966` (A). Against the actual light surfaces `#ffffff`, `#fbfaf9` and `#edece9`, it yields 5.49:1, 5.27:1 and 4.65:1 contrast respectively. This is a global semantic-token correction; consumers cannot override it. The composer focus contour retains its measured source color because it is a non-text indicator with a separate UI-component contrast requirement.

`RecentItem` changes its inherited foreground to `--es-text` only while pressed. On light, `#37352e` over `#dbd8d2` is 8.63:1. On dark, `#cecece` remains above 4.5:1 over the pressed translucent surface on every canonical main/surface/subtle/raised background. This component state is A and browser-tested with a held real pointer press in the mobile `hasTouch` context; it does not add a consumer color choice.

Placeholder now shares the already accessible secondary-text role: `#6a6966` on light field `#ffffff` is 5.49:1 and `#949494` on dark field `#191919` is 5.24:1. This is an A accessibility correction, not a configurable visual option. Functional badge text likewise uses `--es-text` over the existing badge surface while the fixed semantic inset uses its contrast-qualified marker role.

## Current card and interaction finish — September 14

Latest user direction: transparent cards and broader corners from the supplied Marketer/Twin screenshots. Appearance adopted; exact CSS dimensions below are A local values, not measurements inferred from resized screenshots. This section supersedes the former generic filled/r10 Surface default. No consumer override.

| Context | Fixed contract |
|---|---|
| Surface / ActivityPanel |Transparent panel fill;1px semantic border;20px panel radius;16px inset. ActivityPanel default retains header divider;purpose=history removes it,keeping spacing and optional dotted HelpLabel |
| SettingsGroup / PlanCard |Same transparent20px/p16 panel contract;no default filled card |
| IntegrationRow / MCP client shell |Transparent shell;retain measured14px/16px contextual radii and existing row/tab inset geometry |
| CollectionCard |Transparent fill;24px card radius;20px inset;existing260px desktop/240px mobile inner anatomy |
| Opaque contexts |Popover,tooltip,dialog and explicitly subtle/raised inset surfaces retain semantic fills;floating content must remain legible |
| Logo greeting |Existing BrandMark;17.6px in Home leading slot (owner-requested20% reduction from22px);10px title gap;heading and sidebar unchanged |
| HelpLabel |Dotted2px underline;180ms pointer entry/120ms exit grace;keyboard focus/touch toggle;280px explanation popup,r14,p16;above preferred,viewport-clamped |
| FilterSelect |Transparent36px trigger,r8,p8/10;16px leading calendar and trailing up/down glyphs;existing260px choice popup |
| Hover/selected |150ms ease-out color/background transition;neutral tokens;selected nav remains selected on hover;no transform or spring |
| Carousel |Opt-in continuous forward34px/s;equal-width repeated groups with16px seam gap;instant period rebase between identical content;hidden scrollbar;no visible playback/direction controls |
| Reduced motion |Automatic rail stopped;native touch/trackpad/keyboard scroll retained;new hover transitions removed |

Fixed radius tokens: `--es-radius-panel`, `--es-radius-card`. Preserve measured MCP16px shells, account12px popup, compact controls and dialog-specific radii. Do not inflate every component or recolor `--es-surface` to simulate transparent cards.

RC11 explicit user update:loop continuously,remove toolbar. Motion remains34px/s,never reverses or eases to an edge. Hover/focus pauses;touch/wheel resumes1200ms after idle,never during a held pointer;Space on the focused region toggles persistent pause. Resize remeasures each group;controlled card updates do not reset scroll. Three render copies only for overflow,one accessible group;pointer controls keep their positions. No source-screen motion measurement or physical-device performance claim.

### FeatureCard — image-led presentation

September14 supplied onboarding-card screenshot → A local adaptation. Exact dimensions are fixed library choices,not source CSS measurements. Concentric radii, inset image outline and restrained shadow are adopted component decisions; current review routing is in [Interface quality](INTERFACE-QUALITY.md). Preserve the image → title → description → actions hierarchy;no caller geometry options.

| Part | Fixed contract |
|---|---|
| Card |360px maximum,width shrinks to parent;transparent;24px radius;8px inset;1px semantic shadow ring plus existing popup shadow |
| Image |3:2 reserved frame;cover crop;16px radius =24px outer−8px inset;quiet placeholder;1px inset outline |
| Outline |`--es-image-outline`:black10% light/white10% dark;decorative image boundary,not a control/focus indicator |
| Content |20px top,12px side/bottom inside8px shell;20px total outer-edge-to-text inset;20px copy/action gap |
| Title / body |H2 Inter18/24px600,−.15px tracking;body Inter14/22px400;8px gap;natural wrap,no line clamp |
| Actions |Existing welcome primary +optional ghost;8px wrapping gap;40px minimum desktop,44px through767px;long labels grow |
| State / motion |Reserved frame on loading/error;no animated skeleton or automatic transition;buttons retain existing interaction/reduced-motion contract |

Use inline on a canonical main/surface background. An overlay must supply its own opaque surface and accessibility behavior;FeatureCard never creates a floating layer. Artwork colors belong to image content,not additional configurable UI colors. Source product artwork is not redistributed.

## Current account-menu finish

Latest explicit preference: the local Lucy account popup. Scope is AccountMenu only. The source used system UI; the library keeps Inter and existing theme tokens. Optional identity description and footer remain data-driven; menu height must follow content rather than a fixed screenshot height.

| Part | Fixed contract |
|---|---|
| Window |280px wide;12px radius;1px `--es-border`;zero padding;`--es-surface`;existing `--es-shadow-account` |
| Type |13/19.5px regular400;`--es-text`;icons use `--es-secondary` |
| Identity |Minimum48px;10px16px padding;10px gap;24px round avatar;bottom divider;optional description adds natural height |
| Actions |30px minimum;4px8px padding;10px gap;6px radius;selected-token hover/press |
| Action group |6px8px padding;zero row gap |
| Workspaces |Top divider;8px padding;17px marks;selected check right-aligned |
| All workspaces |4px top margin;quiet `--es-control` background |
| Appearance |30px minimum;3px8px padding;theme group24px with2px padding/zero gap/r12;choice minimum44px wide×20px high,12/18px regular |
| Footer |Top divider;8px padding;caller-owned library composition |
| Mobile≤767px |Only account actions/workspaces/appearance minimum44px;theme choice40px/group44px;appearance grows to50px with padding |
| Unchanged behavior |Anchoring,viewport clamp,scrolling,theme callback,workspace/action callback,Tab loop,Escape/outside and focus return |

The menu-specific mobile target rule does not enlarge navigation, inputs, generic segmented controls or other overlays. The compact Lucy composition uses a single-line identity; applications may still supply a description.

## Current typography and content rhythm

Inter 4.1 variable normal/italic is the fixed interface family; Geist Mono 400 is for code. Both are bundled under OFL. Component contexts choose these roles; no consumer size, weight, tracking or density props. Source-declared heading scales are historical availability, not a menu of sizes.

| Current context | Size / leading | Weight / tracking |
|---|---|---|
| Text page-title / chat-title | 16/20px / 16/24px | 500 / −.15px |
| Text section-title | 13/20px | 500 / inherited −.1px |
| PageHeader default / SectionHeader | 16/20px | 500 / inherited −.1px |
| PageHeader home | 22/28px desktop; 20/26px mobile | 500 / −.25px desktop |
| PageContentHeader (MCP; open drift) | Source target 15/24px; implementation 16/20px | 500; do not treat implementation drift as an approved adaptation |
| Body / body-small | 14/21px / 13/20px | 400 / inherited −.1px |
| Label / option | 13/16px | 500 / 450; inherited −.1px |
| Caption / overline | 11/16px | 400 / 500; 0 / +.55px |
| Metric | 24/30px | 500 / −.2px; tabular numerals |
| Composer | 14/22.4px | 400 / −.15px |
| Settings input | 13/20px | 400 / −.1px |
| MCP code / copy label | Geist Mono 11/20px / Inter 14/16px | 400 / 500 |

Sidebar, AccountMenu and FeatureCard contextual type are specified above. Uppercase is limited to the explicit overline context. No general uppercase SaaS heading rule. Optical sizing is auto; font features normal; browser rasterization may differ.

Open reconciliation: MCP heading and sidebar-profile tracking metadata differ from their documented/source counterparts. Exact evidence and required next verification are in [Documentation audit](DOCUMENTATION-AUDIT.md). No runtime value was changed by the documentation consolidation.

| Layout context | Fixed relationship |
|---|---|
| AppShell main | Full-bleed; 16px top after content header/mobile bar; 24px desktop sides/bottom, 16px mobile sides |
| Content lanes | Chat 640px; home 720px; dashboard 880px; full fluid. The dashboard variant supports the isolated Home, not a global widening of Lucy/MCP. |
| PageContentHeader | Max 784px; desktop 48/32/16px top/side/bottom; mobile 16/16/12px |
| Stack | Tight 8px; default 16px; section 48px |
| Inline | Tight 8px; default 16px; wrapping enabled |
| ResponsiveGrid | Two equal columns from 768px; one through 767px; 16px gap; children min-width:0 |
| Composer | 20px radius; 120px minimum input panel; 14px vertical/16px horizontal inset; 36px agent strip |
| Suggestions | 40px row; 24px icon tile; 20px heading-to-composer gap; 48px recent-section separation |

These are named relationships, not consumer pixel options. Fixed widths are maxima; wrapping may increase row heights. Source coordinates never authorize absolute-positioning a screen.

## Current compact controls and overlays

| Context | Fixed geometry |
|---|---|
| Choice popup | 260px maximum; r10; p8; 28px minimum options; r7 rows; 2px row separation |
| Dropdown popup | 160px maximum; r8; p4; 32px minimum rows; r6 rows; 6/8px row padding |
| Command / standard dialog | 672px maximum; r14; viewport-clamped. Command options min36px/r10. Standard dialog is A, not a source-measured general dialog. |
| Welcome dialog | 480px maximum; r24; 200px artwork; 24px content inset; height follows content |
| Button | Default min32px/r8; compact min28px/r6; welcome min40px/r12; connection min40px/r10 |
| Field / field selector | Settings min36px/r8; field selector width224px; connection field min40px/r10 |
| Theme / pill segment | 24px group; 22px options; 1px inset/2px gap. Account overrides are scoped above. |
| Activity tabs | 30px minimum group; 24px minimum tabs; 2px inset/gap; r8/r6 |
| Connection tabs | 16px shell radius; 53px strip; 8px inset; distributed 36px tablist/r10; 28px options. Desktop panel16/32/32px; mobile16/16/24px. |
| Joined choices | 36px; 11/16px labels; 8px horizontal padding/r8 outer corners |
| Switch | 32×18.4px track; 16px thumb; fixed functional blue checked state |
| Segmented meter | 28 segments; 16px high; 2px gap/radius; count is geometry, not billing policy |
| MCP code | 42px region/r12; raised semantic surface; 10/12px code padding; 40px copy control |
| Integration row | 64px resting anatomy; r14; 8/14px inset; 12px internal gap; 8px between rows |

Do not normalize all controls to one density. The scoped mobile target exceptions and remaining touch/autozoom limitations are in [States](STATES.md). Overlays remain opaque; transparent card policy never removes the surface needed for floating text.

## Icons and motion

Original Marketer navigation mixed custom outlined 18×18 glyphs and Lucide 24×24 glyphs, both displayed 14px; inspected custom paths used 1.5 stroke and Lucide paths 2 stroke (M). These are historical observations. The latest icons-only override adopts the local Lucy pattern for every current registry entry: Lucide SVG 24×24 viewBox, `strokeWidth={1.5}`, round caps/joins, `fill="none"` and monochrome `currentColor` (A). It does not change Inter/Geist, theme tokens, component dimensions or layout.

Consumer imports remain restricted to library `IconName`/`Icon`; no arbitrary SVG paths, external icon imports, size or stroke props. Fixed purposes set display size; the existing sidebar context retains its 16px glyph override. BrandMark and identity artwork are separate components, not icon-registry entries.

| Icon purpose / context | Fixed display size |
|---|---|
|`navigation` (default) |14px |
|`small` |12px |
|`action` |16px |
|`feature` |20px |
|Sidebar navigation |16px; existing context override |

| Current glyph implementation | Provenance |
|---|---|
|All registered names |Lucide 24×24 glyphs/1.5 stroke; explicit Lucy adoption A, not a claim of exact Marketer path identity |
|Added registry names |`House`, `MessageCircle`, `ChartColumn`, `UserRound`, `Briefcase`, `Coins`, `ScanText`; same fixed contract |
|`Home`, `BarChart3`, `Plug` |Remain accepted; now render their Lucide glyphs through the same registry |
|Former `SourceIcon` map |Removed from runtime; extracted TSX text retained only in [historical icon evidence](../../../packages/espaco-ui/evidence/marketer-source-icons.txt); not a public component |

The original registry extension itself added no public component or color token. Its inventory was a historical checkpoint; current inventory is recorded in [Components](COMPONENTS.md).

Adopted sidebar dimensions/type and retained compact control roles remain on mobile: no blanket44px control or16px input override. Responsive behavior changes placement, wrapping and containment. Dense targets and13–14px editable text carry touch/autozoom limitations; see [states](STATES.md). Keyboard/focus engineering is independent of that visual-density decision.

Source durations150/250/400ms and ease-out `cubic-bezier(.16,1,.3,1)` are D; sidebar width/hover150ms also observed in computed styles. Declared reduced-motion rules are not full accessibility verification. Only implemented, reviewed motion paths belong to the package contract; do not invent decorative animation while filling missing states.

## Complete canonical token register

Current adopted snapshot of `packages/espaco-ui/src/tokens.css`,2026-09-14:87 distinct CSS custom properties plus2 provider runtime properties,89 total. Shared declarations provide defaults;theme assignments override them. Sidebar/dark values follow the latest user-approved Lucy adoption above. Light values retain the existing palette;new aliases preserve its established role values. Raw [Marketer source evidence](../../../packages/espaco-ui/evidence/marketer-reference.json) remains unchanged and is not a claim that these A adoption values were measured there. Never override these properties in consuming apps.

### Shared defaults — 45

| Token | Exact default value |
|---|---|
| `--es-mono` | `'Espaco Geist Mono',ui-monospace,monospace` |
| `--es-font` | `'Espaco Inter',Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif` |
| `--es-info` | `#0077e6` |
| `--es-success` | `#15b042` |
| `--es-warning` | `#e87800` |
| `--es-error` | `#e83535` |
| `--es-focus` | `#0077e6` |
| `--es-white` | `#ffffff` |
| `--es-switch-thumb-on` | `#ffffff` |
| `--es-black` | `#000000` |
| `--es-transparent` | `transparent` |
| `--es-image-outline` | `rgba(0,0,0,.1)` |
| `--es-overlay` | `#0000007a` |
| `--es-sidebar-width` | `264px` |
| `--es-rail-width` | `62px` |
| `--es-chat-width` | `640px` |
| `--es-home-width` | `720px` |
| `--es-dashboard-width` | `880px` |
| `--es-account-width` | `280px` |
| `--es-choice-width` | `260px` |
| `--es-command-width` | `672px` |
| `--es-space-1` | `2px` |
| `--es-space-2` | `4px` |
| `--es-space-3` | `6px` |
| `--es-space-4` | `8px` |
| `--es-space-5` | `10px` |
| `--es-space-6` | `12px` |
| `--es-space-7` | `14px` |
| `--es-space-8` | `16px` |
| `--es-space-9` | `20px` |
| `--es-space-10` | `24px` |
| `--es-space-11` | `32px` |
| `--es-space-12` | `48px` |
| `--es-radius-2` | `2px` |
| `--es-radius-6` | `6px` |
| `--es-radius-7` | `7px` |
| `--es-radius-8` | `8px` |
| `--es-radius-10` | `10px` |
| `--es-radius-14` | `14px` |
| `--es-radius-20` | `20px` |
| `--es-radius-panel` | `20px` |
| `--es-radius-card` | `24px` |
| `--es-radius-full` | `999px` |
| `--es-shadow-popup` | `0 4px 6px -1px #0000001a,0 2px 4px -2px #0000001a` |
| `--es-shadow-xs` | `0 1px 2px #0000000d` |

### Theme assignments — 45

These45 rows include42 additional property names and3 overrides of shared defaults (`--es-focus`,`--es-overlay`,`--es-image-outline`). Light cells for those properties show the inherited shared value. Do not double-count them as additional tokens.

| Token | Light effective value | Dark effective value |
|---|---|---|
| `--es-bg` | `#ffffff` | `#191919` |
| `--es-sidebar` | `#fbfaf9` | `#191919` |
| `--es-surface` | `#ffffff` | `#202020` |
| `--es-subtle` | `#edece9` | `#232323` |
| `--es-raised` | `#edece9` | `#272727` |
| `--es-hover` | `#e6e4e0` | `#ffffff05` |
| `--es-pressed` | `#dbd8d2` | `#ffffff0c` |
| `--es-text` | `#37352e` | `#cecece` |
| `--es-secondary` | `#6a6966` | `#949494` |
| `--es-placeholder` | `#6a6966` | `#949494` |
| `--es-inverse` | `#191919` | `#f1f1f1` |
| `--es-border` | `#00000014` | `#ffffff0c` |
| `--es-border-subtle` | `#0000000f` | `#ffffff06` |
| `--es-border-strong` | `#0000001f` | `#ffffff13` |
| `--es-image-outline` | `rgba(0,0,0,.1)` | `rgba(255,255,255,.1)` |
| `--es-primary` | `#202020` | `#f1f1f1` |
| `--es-on-primary` | `#ffffff` | `#242424` |
| `--es-field` | `#ffffff` | `#191919` |
| `--es-message-user` | `#edece9` | `#232323` |
| `--es-switch-off` | `#0000001f` | `#414141` |
| `--es-switch-thumb` | `#ffffff` | `#c8c8c8` |
| `--es-success-subtle` | `#caface` | `#053818` |
| `--es-error-subtle` | `#ffe4e0` | `#570808` |
| `--es-badge-success-marker` | `#0b7a2b` | `#49c670` |
| `--es-badge-warning-marker` | `#a54f00` | `#ff9f32` |
| `--es-badge-error-marker` | `#c52a2a` | `#ff7b7b` |
| `--es-badge-info-marker` | `#0066c2` | `#5aaaff` |
| `--es-shadow-account` | `0 0 0 1px #0000000f,0 20px 25px -5px #0000001f,0 8px 10px -6px #00000029` | `0 1px 2px #00000044,0 8px 24px #00000044` |
| `--es-glass` | `#00000008` | `#ffffff02` |
| `--es-glass-border` | `#0000001f` | `#ffffff13` |
| `--es-shadow-dialog` | `0 1px 2px #0000000a,0 8px 24px #0000000f` | `0 1px 1px #0000001f,0 12px 32px #00000024` |
| `--es-selected` | `#edece9` | `#2a2a2a` |
| `--es-composer-surface` | `#ffffff` | `#191919` |
| `--es-composer-context` | `#fbfaf9` | `#222222` |
| `--es-composer-border` | `#0000000f` | `#ffffff04` |
| `--es-composer-focus` | `#787775` | `#ffffff17` |
| `--es-control` | `#edece9` | `#262626` |
| `--es-heading` | `#37352e` | `#d4d4d4` |
| `--es-input-text` | `#37352e` | `#d0d0d0` |
| `--es-badge` | `#edece9` | `#414141` |
| `--es-on-badge` | `#6a6966` | `#e5e5e5` |
| `--es-send` | `#202020` | `#dedede` |
| `--es-on-send` | `#ffffff` | `#292929` |
| `--es-focus` | `#0077e6` | `#b9b9b9` |
| `--es-overlay` | `#0000007a` | `#080808a8` |

### Provider-owned runtime properties — 2

| Token | Value / ownership |
|---|---|
| `--es-brand` |Validated provider `brandColor`; reference default`#d0f300`; Curriculol preset`#ffa133`; the only configurable visual color |
| `--es-on-brand` |Internally derived`#000000` or`#ffffff` from brand relative luminance; not a second consumer option |

Font-face registration stays fixed: Inter normal/italic weights100..900 andGeist Mono normal400. Contextual dimensions such as welcome24px radius,code12px radius,40px connection controls andadopted sidebar31px rows remain component-owned values even when not separate tokens. Consumers cannot select raw pixel values. Any token or contextual-value change requires matching documentation andfocused light/dark visual verification. Current sidebar/dark checks are recorded in [Validation](VALIDATION.md).
