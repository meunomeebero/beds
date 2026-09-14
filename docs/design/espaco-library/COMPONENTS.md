# Espaço library — public component contract

Visual decisions: [Foundations](FOUNDATIONS.md). Executed checks: [Validation](VALIDATION.md). Historical prototypes do not supply current defaults.

Public entry: `packages/espaco-ui/src/index.ts`. Exact TypeScript declarations are the API authority. Import only from `@espaco/ui`; no internal subpath, arbitrary className/style or raw element replacement. Named variants select fixed contexts. States: [STATES.md](STATES.md); dimensions/type: [FOUNDATIONS.md](FOUNDATIONS.md).

Current inventory:70 public components;89 tokens. Additional exports: `useDesignSystem`, `brands`, `IconName`, `Theme`, `TextVariant`, `DataTableColumn`, `DataTableRow`, `DataTableState`, `FeatureCardProps` and read-only `typography/geometry/neutrals/themes` metadata; these are not extra visual components. A source-backed component can contain locally engineered A keyboard/recovery behavior. Feedback/populated-data patterns with no matching visible source state remain A/U.

## Foundation — 6

| Component | Contract | Evidence / constraint |
|---|---|---|
|`DesignSystemProvider` |`children`, required `theme`; optional `brandColor/onThemeChange` |Fixed light/dark roles; single validated brand; no palette/font/style object |
|`Icon` |`name:IconName`, `purpose=navigation` (`navigation/action/small/feature`) |Lucide 24×24 viewBox/1.5 stroke/round caps and joins/monochrome currentColor; fixed 14/16/12/20px respective purpose sizes; existing sidebar 16px override |
|`Text` |`children`; `variant=body-small`, `tone=default` |Fixed contextual type; variants page-title/section-title/chat-title/body/body-small/label/caption/overline/option/metric; default/secondary tone only |
|`Avatar` |`name`, optional `src`; `purpose=account` (`account/workspace`) |Fixed size by identity context; fallback initials; no caller pixel size |
|`BrandMark` |Optional accessible `label=Brand` |User-owned three18×4px bars,3px gaps,18×18 footprint; provider brand fill; A identity |
|`ThemeToggle` |Optional `label/lightLabel/darkLabel` |Reads actual provider theme; invokes provider callback; disabled when callback absent; real theme control, unlike legacy fixture |

Icon registry additions: `House`, `MessageCircle`, `ChartColumn`, `UserRound`, `Briefcase`, `Coins`, `ScanText`, `Bookmark`, `CalendarDays`, `ChevronsUpDown`, `Play`, `Pause`, `ArrowLeft`. Existing names remain accepted. Former `SourceIcon` paths are [historical text evidence](../../../packages/espaco-ui/evidence/marketer-source-icons.txt), not runtime components. Callers cannot provide SVG paths, stroke, color or pixel size. Registry entries do not create configurable styling.

## Layout and navigation — 18

| Component | Required / optional API | Constraint |
|---|---|---|
|`AppShell` |`sidebar/children/collapsed/onCollapsedChange/mobileOpen/onMobileOpenChange`; optional `header/contentWidth/navigationLabel` |264px sidebar/62px rail;768 breakpoint; contentWidth chat/home/dashboard/full maps640/720/880/fluid;fixed16px page-top inset after header/mobile bar; mobile drawer traps focus and restores its opener after inert is removed; state controlled |
|`SidebarHeader` |`children`; optional search `{label,onClick}` |42px minimum header;40px identity +32px search/collapse controls; shell context owns behavior |
|`WorkspaceTrigger` |`name/onClick`; optional `mark/expanded` |40px profile control;17px mark/14px text; arbitrary data/artwork only through other library components in audited consumer |
|`SidebarSection` |`children`; optional `label`; purpose primary/default/history |Default17px top;12/18px label/8px bottom gap;history15px top;primary horizontal40px controls/31px selected pill; unique heading relationship |
|`NavItem` |`label/icon`; either `href` or `onClick`; optional `active/badge` |Primary active glyph filled currentColor with sidebar-color stroke;inactive outlined;no caller styling prop. Native link/button;31px row,14/19.6px regular text,gap11px,r6,padding8px; accessible current state; icon registry |
|`SidebarFooter` |`children` |Anchored footer region; no plan policy |
|`ContentHeader` |`children`; optional `actions` |Compact header/location region; fixed slots |
|`PageContentHeader` |`title`; optional `description/leading/actions` |Measured page-identity header:784px maximum,48px top/32px side/16px bottom desktop inset;16px/16px/12px mobile inset; fixed title/action arrangement |
|`Breadcrumbs` |`items:{id,label,href?}[]`; optional label |Named ordered navigation; last item current page; preceding href items native links |
|`PageHeader` |`title`; optional description/leading/actions/purpose |Default measured dashboard heading context; `home` is the fixed22/28px desktop,20/26px mobile greeting context; not arbitrary H1 sizing |
|`SectionHeader` |`title`; optional description/actions |Named section rhythm; no per-screen style |
|`Stack` |`children`; gap tight/default/section |Fixed semantic rhythm, not numeric spacing |
|`Inline` |`children`; gap tight/default; align start/center/between |Fixed wrapping/action grouping |
|`ResponsiveGrid` |`children` |Presentational relationship only: two equal columns from768px, one column through767px; fixed16px token gap and `min-width:0` containment. No grid ARIA, state, focus handling or visual props. |
|`Divider` |No props |Canonical theme boundary |
|`Surface` |`children`; role panel/subtle/raised |Panel transparent,r20,p16;subtle/raised intentional inset roles;no arbitrary fill |
|`CollectionCard` |`avatar/identity/title/metadata/actions`; optional selection |Transparent,r24,p20;260px desktop/240px mobile inner anatomy: identity/selection,metadata,aligned actions;content and controls caller-owned |
|`ActivityPanel` |`title/icon/children`;optional description;purpose=default/history |Transparent,r20,p16;260px desktop inner panel;mobile fits content;default header divider;history has no header divider;description keeps dotted HelpLabel in both;no ordering/request behavior |

Primary navigation reuses `NavItem` inside `SidebarSection purpose="primary"`:4px group gap,9px icon/text gap,11px horizontal padding and14px/21px text. Selected appearance persists on hover;150ms neutral transition,none with reduced motion. Collapsed rail preserves accessible names and42px-wide controls within62px. Mobile keeps the768px breakpoint.

## Controls — 12

| Component | API | States / constraints |
|---|---|---|
|`Button` |`label`; optional onClick/type/variant/compact/purpose/icon/disabled/busy/aria-describedby |Primary/secondary/ghost; purpose default/welcome/connection; compact applies to default purpose only; native type; busy disables repeated action |
|`IconButton` |`label/icon/onClick`; optional disabled/aria-describedby |Accessible name; fixed action geometry |
|`IconToggleButton` |`label/icon/pressed/onPressedChange`; optional disabled/aria-describedby |Controlled native `aria-pressed`; persistent accessible name; selected icon fills currentColor; no domain policy |
|`TextField` |`label/value/onChange`; optional description/error/placeholder/disabled/readOnly/name/autoComplete/inputMode/spellCheck/focusOnError/type; purpose settings/connection |Persistent label; associated helper/error; semantic input mode/type and forwarded ref preserve fixed settings13/20px,36px or connection14/16px,40px geometry |
|`TextAreaField` |Field contract except `type`; forwarded ref |Multiline role with fixed geometry; caller validation and optional error focus |
|`SearchField` |`label/value/onChange`; optional placeholder/disabled/name/autoComplete/inputMode/spellCheck; forwarded ref |Native search input; filtering external |
|`Checkbox` |`label/checked/onChange`; optional description/disabled |Native checked semantics; visible source checkbox U, local visual A |
|`Switch` |Same toggle contract |Measured32×18.4px track/16px thumb; functional blue selected; native switch semantics |
|`SegmentedControl` |`label/value/options/onChange`; options id/label/disabled?; variant pill/joined |Native exclusive radios; pill24px group versus source MCP joined36px; fixed contextual geometry |
|`Tabs` |`label/value/items/onChange`; items id/label/disabled?/content; variant activity/connection |Named tablist/panels;activity30px group;connection owns the measured16px client-card shell,53px tab strip,36px distributed tablist and16/32/32px panel;roving focus; arrows/Home/End skip disabled; selected value controlled |
|`RadioGroup` |`label/value/options/onChange`; optional description/error/disabled/name |Native fieldset and radios; fixed 16px indicator/8px option rhythm; caller owns selection and validation |
|`FileUploadField` |`label/files/onFilesChange/dropLabel/browseLabel/removeLabel`; optional description/error/accept/multiple/disabled |Controlled callback-only picker/drop/list/removal surface; no native form serialization, upload, validation, merging, persistence or request behavior |

Welcome action context is a source-measured fixed button purpose:40px high,12px radius,14px horizontal padding,14/16px medium label. Connection action uses40px height/10px radius. These are not general size APIs; use each with its matching context.

## Overlays — 7

| Component | API | Constraints |
|---|---|---|
|`Select` |`label/value/options/onChange`;optional disabled/icon;variant compact/field/context/filter |Option id/label/description?/icon?/disabled?;selected check and active option separated;260px popup;fixed contextual trigger |
|`FilterSelect` |`label/value/options/onChange`;optional disabled/icon |Transparent toolbar selector;calendar default,up/down chevrons,r8,36px;controlled options,not a date-range engine |
|`HelpLabel` |`label/description`;optional icon |Dotted explanation affordance;hover/focus/touch;noninteractive tooltip,Escape/outside dismissal;internal placement |
|`DropdownMenu` |`label/open/onOpenChange/items/onSelect`; optional icon |Items id/label/icon?/disabled?/destructive?;160px period-style popup; keyboard and disabled handling |
|`Tooltip` |`label`, one compatible library control child |Associates aria-describedby; keyboard/pointer; no arbitrary wrapper CSS; A behavior where source not audited |
|`Dialog` |`open/onOpenChange/title`; optional children/description/actions/artwork; variant standard/welcome |Native modal; labelled content; focus recovery; standard geometry derived from command surface A; welcome geometry M; artwork only in welcome region |
|`CommandPalette` |`open/onOpenChange/label/query/onQueryChange/items/onSelect`; optional emptyLabel |672px search/list surface; native modal; local filter; active-descendant choice; no network search |

Overlay placement is internally anchored/clamped/flipped, never consumer coordinates. Source account466px height is fixture-specific. A welcome dialog is480px wide,24px radius with200px artwork region and24px content padding (M); private source artwork is not reused. Standard dialog672px/14px is A, derived from a measured command surface rather than a measured general-dialog claim. Native Popover/Dialog platform support and actual browser QA remain explicit.

## Settings and account — 6

| Component | API | Constraints |
|---|---|---|
|`SettingsRow` |`title/children`; optional description |Copy/control grouping; child control still needs accessible name |
|`SettingsGroup` |`children`; optional title/description |Transparent panel,r20,p16;named section;fixed inter-setting rhythm |
|`IntegrationRow` |`name/mark/action`; optional description/status |Transparent14px shell;measured64px row anatomy;action label/onClick/disabled?/busy?;no request |
|`RecentItem` |`title`; href or onClick; optional description/icon/meta |Quiet linked/action row; populated anatomy A where source only empty state observed; pressed state uses `--es-text` over `--es-pressed` rather than secondary text |
|`PlanCard` |`title/action`; optional usage/note |Transparent panel,r20,p16;usage label/value/max;fixed segmented meter;no billing policy;not the approved compact Home sidebar footer |
|`AccountMenu` |Controlled open/onOpenChange; trigger/identity/actions/onAction/workspaces/activeWorkspace/onWorkspaceChange/theme/onThemeChange; optional allWorkspaces/footer/labels |Identity name/description?/avatar?; action id/label/icon/disabled?; workspace id/label/mark?;280px source menu |

Unlike the old prototype, portable AccountMenu exposes workspace and theme callbacks. Workspace/action selection closes and invokes the supplied callback. Caller feeds selected theme back into the provider; account UI and application theme must share state. Footer accepts a library composition such as PlanCard; no account-specific source content embedded.

## Feedback and data — 15

| Component | API | Evidence / constraint |
|---|---|---|
|`Badge` |`label`; tone neutral/success/warning/error/info |Fixed semantic marker with at least3:1 contrast against its badge surface; visible label carries the state meaning; text always uses the accessible badge foreground; extra state designs A |
|`StatusDot` |`label/status` |Named status shape; no color-only meaning |
|`Notice` |`title`; optional description/tone/onDismiss |Status/alert semantics; source complete notice matrix U; local A |
|`EmptyState` |`title`; optional description/icon/action |Observed empty-state pattern; action supplied, not inferred upsell |
|`Skeleton` |Purpose line/avatar/card |Fixed A placeholder; decorative; not proof source loading state audited |
|`LoadingIndicator` |`label` |Named A status; no hidden async request |
|`ProgressBar` |`label/value`; max100 default; tone neutral/brand |Native progress for available values; unavailable status; guarded finite bounds; A generic data primitive |
|`SegmentedMeter` |`label/value`; max100 default; tone neutral/brand/success |28 fixed segments; source geometry M; quantization local; label/ARIA value authoritative |
|`Metric` |`label/value`; optional description |Fixed contextual display; populated source analytics U; A |
|`DataList` |`label/children` |Named grouping of library rows; not a source data-table implementation |
|`DataTable` |`label/unavailableLabel/columns/rows/state` |Native table semantics; fixed 640px narrow scroll lane; its region joins Tab order only with horizontal overflow; caller controls data and recovery; no selection/sorting |
|`HorizontalRail` |`label/children` |Fixed manual 272–320px card lane; touch, trackpad and native focused horizontal-key scroll only; no autoplay, pagination, card state or style escape |
|`Carousel` |`label/children`;optional localized `interactionHint` |Continuous forward34px/s circular rail;no visible playback/arrows;native scroll;hover/focus pauses,touch/wheel resumes after1200ms idle;Space on focused region toggles persistent pause;offscreen/hidden/reduced-motion stops;no motion tuning |
|`ScrollableList` |`label/children` |Fixed 192px vertical list region; all children remain rendered; joins Tab order only when it overflows; no virtualization, ordering or data state |
|`Pagination` |`label/page/pageCount/summary({page,pageCount})/previousLabel/nextLabel/onPageChange` |Controlled one-based adjacent navigation; bounds normalize non-finite/fractional values; summary receives the same normalized values; responsive stack; no request or route behavior |

`value=0` is valid. Null/non-finite value or invalid max yields unavailable; finite out-of-range values clamp defensively. No arbitrary segment count, dimensions or score thresholds exposed. Before/after meaning and source data accuracy remain caller responsibilities.

Carousel RC11 replaces the RC9 edge-reversal/toolbar contract. Overflow uses three rendered copies of caller-controlled cards;one group is exposed to assistive navigation/Tab at a time. Pointer selection promotes its copy before focus;matching controlled values update every copy. Supply stable keyed,presentational cards;keep dialogs,requests and side effects outside repeated children. No per-copy data fetching,uncontrolled selection,caller hardcoded DOM IDs or analytics mount events. Underfilled rails stay single/static. Locale hint describes native scroll and Space pause;former pause/resume/previous/next label props removed.

## Chat — 4

| Component | API | Evidence / constraint |
|---|---|---|
|`ChatLayout` |`title/children`; optional mark/suggestions/recent |Measured header/composer/suggestion/recent grouping |
|`ChatComposer` |`label/value/onChange/onSubmit`; optional placeholder/context/tools/busy/disabled/onAttach/onCancel/error |Source composer geometry M; local state engineering A; Enter submits, Shift+Enter newline, IME guarded; slot controls remain caller-coordinated |
|`SuggestionRow` |`icon/title/onClick`; optional description |Measured40px row/24px tile; content external |
|`ChatMessage` |`role:user|assistant`, children; status sending/sent/error; optional onRetry |Source message surface observed; complete populated/streaming states U; local A recovery |

APIs specify controlled local behavior, not provider integrations. A rendered reply fixture is not an AI response. Consumers coordinate context/tools availability with composer busy state; primitives do not silently mutate sibling slot controls.

## Technical content — 1

| Component | API | Evidence / constraint |
|---|---|---|
|`CodeSnippet` |`label/value`; optional async `onCopy(value)` |Measured MCP code/copy context; Geist Mono40011/20px;42px total region,12px radius,6% border,raised background; code padding10px12px;40px copy action with12px horizontal padding/14px medium label |

Copy begins only on a user click. Caller may inject an asynchronous copy callback; otherwise the component calls the browser clipboard API. Copying disables repeat activation; copied state announces success; failure offers retry or manual selection. Horizontally scrollable code remains selectable/focusable. These local recovery states are A, not evidence that source clipboard failures were observed. No pasted value is submitted to a network service.

## Feature presentation — 1

| Component | API | Constraints |
|---|---|---|
|`FeatureCard` |`image:{src,alt,fallbackLabel?}`,`title`,`description`,`primaryAction:{label,onClick,disabled?,busy?}`;optional `secondaryAction` with same action contract |Image-led introduction;360px maximum,r24,p8;3:2 image,r16;transparent body;one primary and optional ghost secondary;fixed H2 and body type |

Use for onboarding entry,feature discovery or a contextual next step. Not a carousel,modal,tour or onboarding state machine. Native named article;H2 title and associated description;native buttons remain `type="button"`. Caller owns navigation,dismissal,progress,requests and error recovery. No custom visual props,arbitrary children or automatic action.

Provide an owned/licensed image,prefer3:2 crop with no essential embedded instructions;`object-fit:cover` is fixed. `alt` is required;empty only for decorative imagery. Loading preserves space without blocking actions. Failed/empty source keeps the media frame and accessible fallback;new `src` resets loading,including cached images. `busy` disables only the corresponding action;caller supplies its current label. Long copy grows naturally;actions wrap,40px minimum desktop/44px mobile. Complete geometry: [Foundations](FOUNDATIONS.md).

Catalog:Library → **Card de apresentação** (`?view=feature-card`). [Controlled example](../../../apps/web/labs/espaco-library/FeatureCardExamples.tsx);local synthetic content,no real onboarding request.
