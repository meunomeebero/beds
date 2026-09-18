# Espaço library — public component contract

Visual decisions: [Foundations](FOUNDATIONS.md). Executed checks: [Validation](VALIDATION.md). Historical prototypes do not supply current defaults.

Public entry: `packages/beds/src/index.ts`. Exact TypeScript declarations are the API authority. Import only from `beds`; no internal subpath, arbitrary className/style or raw element replacement. Named variants select fixed contexts. States: [STATES.md](STATES.md); dimensions/type: [FOUNDATIONS.md](FOUNDATIONS.md).

Current local inventory:129 public components;92 tokens. Published RC16 retains113 components. Additional exports: `useDesignSystem`, `brands`, `IconName`, `Theme`, `TextVariant`, `DataTableColumn`, `DataTableRow`, `DataTableState`, `FeatureCardProps`, `EmptyStateCardProps`, `OnboardingProps`, `AccountCreditsProps`, `CreditBalance`, `ForumTopicCardProps`, `BlogPostCardProps`, `LandingFooterProps`, `LandingFooterLink`, `LandingFooterGroup`, `LandingLink`, `ProductDemoTab`, `ProcessingViewProps`, `ProcessingStep`, `ProcessingStory`, `ResultLayoutProps`, `ResultScoreProps`, `ResultFindingsProps`, `ResultSectionProps`, `ResultOfferProps`, `ResultAction`, `CheckoutLayoutProps`, `OrderSummaryProps`, `CheckoutSectionProps`, `BenefitsSectionProps`, `BenefitItem`, `BenefitIllustrationKind`, `ApplicationBoardColumn`, `ApplicationBoardItem`, `DateItemProps`, `DateItemDate`, `PaymentConfirmationProps`, `PaymentInvoice`, `PaymentReceiptRow`, `ChatOption`, pricing/decision/record-family types, `SearchResult` and read-only `typography/geometry/neutrals/themes` metadata; these are not extra visual components. A source-backed component can contain locally engineered A keyboard/recovery behavior. Feedback/populated-data patterns with no matching visible source state remain A/U.

## Checkout — 3

`CheckoutLayout`,`OrderSummary`,`CheckoutSection`:focused purchase composition,
host-formatted order summary,named form/status sections. No payment SDK,pricing
logic or invoice assertion. Reuse fields,radio groups and confirmed-payment
presentation. [Contract and source mapping](CHECKOUT.md).

## Results — 5

`ResultLayout`,`ResultScore`,`ResultFindings`,`ResultSection`,`ResultOffer`:
proof first,contextual next action,readable findings and host-owned detail.
Finite0–100 scores,missing value preserved,raw signed delta;max2 displayed
decimals,sub0.01 change explicit. `locale` controls numeric formatting.
Offers accept mutually exclusive native href or callback actions;price/terms
describe the primary control. No entitlement,pricing,checkout or delivery logic.
[Contract and source mapping](RESULTS.md). No slot machine or conversion promise.

## Processing — 1

`ProcessingView`: controlled ordered phases,estimated progress,narrative,
disclosed activity,optional metrics,pause and host terminal/recovery actions.
Types:`ProcessingViewProps`,`ProcessingStep`,`ProcessingStory`.
[Contract and source mapping](PROCESSING.md);no application timing in the DS.

## Landing composition — 7

`LandingPageLayout`, `LandingHero`, `LandingSection`, `ProductDemo`,
`DocumentPreview`, `ProcessSteps`, `FAQSection`: product-neutral native
landmarks/navigation/CTAs, controlled demo tabs, readable document sample,
ordered workflow and native disclosures. No new consumer styling API.
Reuse existing benefits, pricing, footer and application card.
[API, flow and scoped review](LANDING-PAGE.md).

## Landing benefits — 2

`BenefitsSection`: heading, optional description, ordered benefit items, optional
native action/note. Fixed first-card emphasis; page/section semantic contexts.
`BenefitIllustration`: static decorative documents/profile/match/conversation/board
miniatures. No metrics or behavior. [Contract](BENEFITS.md).

## Landing footer — 1

`LandingFooter`: site-level closing message, named link groups, optional
community/legal navigation, native primary CTA and decorative brand wordmark.
No generated destinations or product state. [Contract](LANDING-FOOTER.md).

## Application kanban — 1

| Component | Contract | Evidence / constraint |
|---|---|---|
|`ApplicationBoard` |`label/columns`;optional `onMove/announcement/emptyLabel` |Controlled status lanes;derived counts;explicit allowed moves;compact shared ApplicationCard;no drag/persistence;[contract](KANBAN.md) |

`ApplicationCard purpose="kanban"`: named compact layout, small folio beside
identity, options menu for supplied destinations; default purpose unchanged.

## Blog posts — 2

| Component | Contract | Evidence / constraint |
|---|---|---|
|`BlogPostCard` |`title/href`;optional `image/author/excerpt/published/readingTime/tags/headingLevel` |Native editorial link;passive topics;no nested actions;full title and recovered excerpt;[contract](BLOG-POST.md) |
|`BlogPostList` |`label/children` |Named ul,one direct child per item;fixed reading width and rhythm;no data fetching |

## Date items — 2

| Component | Contract | Evidence / constraint |
|---|---|---|
|`DateItem` |`title/date`;optional `description/status`;zero or one `href/onOpen` |Mini calendar + full wrapping content;native action/link or static row;host-formatted date;[Date item](DATE-ITEM.md) |
|`DateItemList` |`label/children` |Semantic named ul;one direct item per child;fixed quiet rhythm,no inferred selection |

## Payment confirmation — 1

| Component | Contract | Evidence / constraint |
|---|---|---|
|`PaymentConfirmation` |`title/merchant/purchase/receipt`;optional `description/mark/invoice/continueAction/animate/headingLevel` |Confirmed-only presentation;paper motion never confirms payment or emits an invoice;[contract](PAYMENT-CONFIRMATION.md) |

## Foundation — 7

| Component | Contract | Evidence / constraint |
|---|---|---|
|`DesignSystemProvider` |`children`, required `theme`; optional `brandColor/onThemeChange` |Fixed light/dark roles; single validated brand; no palette/font/style object |
|`Icon` |`name:IconName`, `purpose=navigation` (`navigation/action/small/feature`) |Lucide 24×24 viewBox/1.5 stroke/round caps and joins/monochrome currentColor; fixed 14/16/12/20px respective purpose sizes; existing sidebar 16px override |
|`Text` |`children`; `variant=body-small`, `tone=default` |Fixed contextual type; variants page-title/section-title/chat-title/body/body-small/label/caption/overline/option/metric; default/secondary tone only |
|`Avatar` |`name`, optional `src`; `purpose=account` (`account/workspace/profile/forum`) |Fixed size by identity context;forum40px/r8;fallback initials;no caller pixel size. Broken image recovers once per URL to the deterministic initials — no retry loop,no network-generated identity;a changed `src` retries from scratch |
|`TextLink` |`href`; optional `external/ariaLabel` |Text-level native link, shared hover/focus contract, underline from the border token; `external` adds a 12px up-right glyph and safe `rel`; no color/style overrides |
|`BrandMark` |Optional accessible `label=Brand` |User-owned three18×4px bars,3px gaps,18×18 footprint; provider brand fill; A identity |
|`ThemeToggle` |Optional `label/lightLabel/darkLabel` |Reads actual provider theme; invokes provider callback; disabled when callback absent; real theme control, unlike legacy fixture |
|`AnimatedNumber` |`value` (`number \| null`), `format`; optional `fallback=—`, `duration=1.1`, `startOnView=false` |Tabular count-up to the true value. `null` or non-finite → renders `fallback`, never animates toward a fabricated number; reduced motion jumps straight to the final value; integer targets snap per frame. Not for evidence whose displayed text must stay stable, such as result scores. A adaptation of beUI `number` |

Icon registry additions: `House`, `MessageCircle`, `ChartColumn`, `UserRound`, `Briefcase`, `Coins`, `ScanText`, `Bookmark`, `CalendarDays`, `ChevronsUpDown`, `Play`, `Pause`, `ArrowLeft`, `ShieldCheck` (privileged/admin rows). Existing names remain accepted. Former `SourceIcon` paths are [historical text evidence](../../../packages/beds/evidence/marketer-source-icons.txt), not runtime components. Callers cannot provide SVG paths, stroke, color or pixel size. Registry entries do not create configurable styling.

## Layout and navigation — 18

| Component | Required / optional API | Constraint |
|---|---|---|
|`AppShell` |`sidebar/children/collapsed/onCollapsedChange/mobileOpen/onMobileOpenChange`; optional `header/contentWidth/navigationLabel/closeNavigationLabel/skipToContentLabel` |First-focus skip link targets main;264px sidebar/62px rail;768 breakpoint; contentWidth chat/home/dashboard/full maps640/720/880/fluid;fixed16px page-top inset after header/mobile bar; mobile drawer traps focus and restores its opener after inert is removed; state controlled; drawer/backdrop labels accept translated copy |
|`SidebarHeader` |`children`; optional search `{label,onClick}`, `closeLabel/expandLabel/collapseLabel` |42px minimum header;40px identity +32px search/collapse controls; shell context owns behavior; collapse/search controls accept translated labels |
|`WorkspaceTrigger` |`name/onClick`; optional `mark/expanded/menuLabel` |40px profile control;17px mark/14px text; arbitrary data/artwork only through other library components in audited consumer; menu accessible name accepts translated copy |
|`SidebarSection` |`children`; optional `label`; purpose primary/default/history |Default17px top;12/18px label/8px bottom gap;history15px top;primary horizontal40px controls/31px selected pill; unique heading relationship |
|`NavItem` |`label/icon`; either `href` or `onClick`; optional `active/badge/locked` |Primary active glyph filled currentColor with sidebar-color stroke;inactive outlined;no caller styling prop. Native link/button;31px row,14/19.6px regular text,gap11px,r6,padding8px; accessible current state; icon registry. `locked` carries the truthful reason: the row stays visible and non-interactive (`disabled`, muted), keeps its accessible name and exposes the reason through `title` and the label — never a no-op handler |
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

`Dock` / `DockItem` / `DockSeparator` are migrated to Tailwind + `motion/react` (beUI `dock`, 2026-09-18): 44px fixed item size, active pill glides via `layoutId` (`SPRING_LAYOUT`), glass `bg-card/80` + `backdrop-blur-xl`. No public sizing or styling escape hatches.

## Controls — 12

| Component | API | States / constraints |
|---|---|---|
|`Button` |`label`; optional onClick/type/variant/compact/purpose/icon/disabled/busy/aria-describedby/aria-expanded/aria-controls |Primary/secondary/ghost/destructive; purpose default/welcome/connection; compact applies to default purpose only; native type; busy shows an inline spinner with the label preserved and disables repeated action (motion/react rotation, static under reduced motion); destructive fills `--destructive` with `--destructive-foreground` ink; disclosure toggles expose the controlled region state |
|`IconButton` |`label/icon/onClick`; optional disabled/aria-describedby |Accessible name; fixed action geometry |
|`IconToggleButton` |`label/icon/pressed/onPressedChange`; optional disabled/aria-describedby |Controlled native `aria-pressed`; persistent accessible name; selected icon fills currentColor; no domain policy |
|`TextField` |`label/value/onChange`; optional description/error/placeholder/disabled/readOnly/name/autoComplete/inputMode/spellCheck/focusOnError/reserveErrorLine/type; purpose settings/connection |Persistent label; associated helper/error; `reserveErrorLine` keeps the error slot occupied (visibility-hidden) so appearing errors never shift layout; semantic input mode/type and forwarded ref preserve fixed settings13/20px,36px or connection14/16px,40px geometry; 16px text under `pointer:coarse` (connection keeps its 40px box) |
|`TextAreaField` |Field contract except `type`; forwarded ref |Multiline role with fixed geometry; caller validation and optional error focus; honors `reserveErrorLine` |
|`SearchField` |`label/value/onChange`; optional placeholder/disabled/name/autoComplete/inputMode/spellCheck; forwarded ref |Native search input; filtering external |
|`Checkbox` |`label/checked/onChange`; optional description/disabled |Native checked semantics; visible source checkbox U, local visual A |
|`Switch` |Same toggle contract |Measured32×18.4px track/16px thumb; functional blue selected; native switch semantics;visible label names input,description associated separately without repetition |
|`SegmentedControl` |`label/value/options/onChange`; options id/label/disabled?; variant pill/joined |Native exclusive radios; pill24px group versus source MCP joined36px; fixed contextual geometry |
|`Tabs` |`label/value/items/onChange`; items id/label/disabled?/content; variant activity/connection/settings |Named tablist/panels;activity30px minimum group,intrinsic labels,wrap;connection owns16px shell,53px strip,36px distributed list and16/32/32px panel;settings owns48px intrinsic tabs,scroll lane,quiet selected fill+2px underline,24px panel gap;roving focus;arrows/Home/End skip disabled;settings mirrors arrows in RTL;controlled value. [Settings](SETTINGS.md) |
|`RadioGroup` |`label/value/options/onChange`; optional description/error/disabled/name/purpose |Default16px indicator/8px rhythm unchanged;`purpose="question"` numbered52px minimum rows. Native fieldset/radios;label remains visible standalone;QuestionCard hides repeated legend only. Caller owns selection/validation |
|`FileUploadField` |`label/files/onFilesChange/dropLabel/browseLabel/removeLabel`; optional description/error/status/accept/multiple/disabled/purpose/documentLabel/dragLabel |Controlled callback-only picker/drop/list/removal;document purpose adds illustrated entry;cancel preserves selection,removal restores focus. No serialization,upload,validation or persistence. [Document upload](DOCUMENT-UPLOAD.md) |

Welcome action context is a source-measured fixed button purpose:40px high,12px radius,14px horizontal padding,14/16px medium label. Connection action uses40px height/10px radius. These are not general size APIs; use each with its matching context.

Button, IconButton, IconToggleButton, TextField, TextAreaField, SearchField, Checkbox, Switch, SegmentedControl and the activity/connection Tabs are migrated to Tailwind utilities + `motion/react` (F1, beUI-sourced, 2026-09-17): API and source-measured geometry preserved, legacy `.es-*` class hooks dropped for element/role/`data-purpose` selectors, interaction motion in the [motion contract](STATES.md). Checkbox/Switch keep a full-area invisible native input (`inset-0`, `opacity-0`) so the real element owns the >=44px coarse hit-target. The settings Tabs variant stays legacy CSS pending migration.

## Overlays — 10

| Component | API | Constraints |
|---|---|---|
|`Select` |`label/value/options/onChange`;optional disabled/icon;variant compact/field/context/filter |Option id/label/description?/icon?/disabled?;selected check and active option separated;260px popup;fixed contextual trigger |
|`FilterSelect` |`label/value/options/onChange`;optional disabled/icon |Transparent toolbar selector;calendar default,up/down chevrons,r8,36px;controlled options,not a date-range engine |
|`HelpLabel` |`label/description`;optional icon |Dotted explanation affordance;hover/focus/touch;noninteractive tooltip,Escape/outside dismissal;internal placement |
|`DropdownMenu` |`label/open/onOpenChange/items/onSelect`; optional icon |Items id/label/icon?/disabled?/destructive?;160px period-style popup; keyboard and disabled handling |
|`Tooltip` |`label`, one compatible library control child |Associates aria-describedby; keyboard/pointer; no arbitrary wrapper CSS; A behavior where source not audited |
|`Dialog` |`open/onOpenChange/title`; optional children/description/actions/artwork; variant standard/welcome |Native modal; labelled content; focus recovery; standard geometry derived from command surface A; welcome geometry M; artwork only in welcome region |
|`CommandPalette` |`open/onOpenChange/label/query/onQueryChange/items/onSelect`; optional emptyLabel |672px search/list surface; native modal; local filter; active-descendant choice; no network search |
|`SearchDialog` |Controlled open/query/items/onSelect; optional categories, resultsLabel, state, filterMode and copy labels; `SearchResult` adds categoryId/keywords/identity |Rich discovery overlay with category buttons, identity/result/description rows, keyboard hints and recovery. Shared native modal mechanics; CommandPalette unchanged. [Search contract](SEARCH-DIALOG.md) |
|`Drawer` |`open/onOpenChange/title/children`;optional description,headerActions,actions,closeLabel,contentLabel |Modal inline-end panel;full-height,independent body scroll,stable chrome,focus recovery;caller owns data/dismissal policy. [Drawer contract](DRAWER.md) |
|`DrawerSection` |`title/children` |Named H3 content group inside Drawer;fixed spacing,no nested card or visual props |

Overlay placement is internally anchored/clamped/flipped, never consumer coordinates. Source account466px height is fixture-specific. A welcome dialog is480px wide,24px radius with200px artwork region and24px content padding (M); private source artwork is not reused. Standard dialog672px/14px is A, derived from a measured command surface rather than a measured general-dialog claim. Native Popover/Dialog platform support and actual browser QA remain explicit.

## Settings and account — 8

Additional account footer:`AccountCredits` takes plan/label/balance/invalidValueLabel;
optional action/note. Ready/zero/loading/unavailable/error;meter only with valid
explicit bounds. [Account credits contract](ACCOUNT-CREDITS.md).

| Component | API | Constraints |
|---|---|---|
|`SettingsForm` |`label/children/onSubmit` |Named native form;Enter submits;prevents navigation;manual caller validation via field errors/first-invalid focus;caller owns pending state/persistence;fixed Stack/default rhythm,no styling escape. Never nest forms. |
|`SettingsRow` |`title/children`; optional description |Copy/control grouping; child control still needs accessible name |
|`SettingsGroup` |`children`; optional title/description;variant panel/section |Default transparent panel,r20,p16;section opt-in:unboxed,p0,16/24 heading,24px rhythm;named section. [Settings](SETTINGS.md) |
|`IntegrationRow` |`name/mark/action`; optional description/status |Transparent14px shell;measured64px row anatomy;action label/onClick/disabled?/busy?;no request |
|`RecentItem` |`title`; href or onClick; optional description/icon/meta |Quiet linked/action row; populated anatomy A where source only empty state observed; pressed state uses `--es-text` over `--es-pressed` rather than secondary text |
|`PlanCard` |`title/action`; optional usage/note |Transparent panel,r20,p16;usage label/value/max;fixed segmented meter;no billing policy;not the approved compact Home sidebar footer |
|`AccountMenu` |Controlled open/onOpenChange; trigger/identity/actions/onAction/workspaces/activeWorkspace/onWorkspaceChange/theme/onThemeChange; optional allWorkspaces/footer/labels incl. `lightLabel/darkLabel` |Identity name/description?/avatar?; action id/label/icon/disabled?; workspace id/label/mark?;280px source menu; theme option labels default Light/Dark and accept translated copy |

Unlike the old prototype, portable AccountMenu exposes workspace and theme callbacks. Workspace/action selection closes and invokes the supplied callback. Caller feeds selected theme back into the provider; account UI and application theme must share state. Footer accepts a library composition such as PlanCard; no account-specific source content embedded.

## Feedback and data — 16

| Component | API | Evidence / constraint |
|---|---|---|
|`Badge` |`label`; tone neutral/success/warning/error/info; purpose tag(default)/status |Tag retains compact filled12/16px treatment and semantic inset. Status uses transparent12/18px regular secondary text,6px leading dot/gap; no border/shadow; complete labels wrap. Visible label carries meaning; no live-region or button semantics. Status is an A adaptation, preview in ApplicationCard catalog |
|`StatusDot` |`label/status` |Named status shape; no color-only meaning |
|`Notice` |`title`; optional description/tone/onDismiss |Status/alert semantics; source complete notice matrix U; local A |
|`EmptyState` |`title`; optional description/icon/action |Observed empty-state pattern; action supplied, not inferred upsell |
|`EmptyStateCard` |`title/description`;exactly one of `image:{src,alt,fallbackLabel?}` or `illustration:'empty-folder'`;optional `icon`, `headingLevel:2\|3`, `action:{label,onClick,disabled?,busy?}` |Message-first card;480px maximum,r24,p8;image15:7/r16 or built-in folder/flies with visible pause and static reduced motion;transparent;optional next-step action;compact EmptyState unchanged. [Contract](EMPTY-STATE.md) |
|`Skeleton` |Purpose line/avatar/card |Fixed A placeholder; decorative; not proof source loading state audited |
|`LoadingIndicator` |`label` |Named A status; no hidden async request |
|`Toaster` + `toast` |Mount one `Toaster`; `toast(message|{id,message,tone,action,lifetime})`; `dismissToast(id)` |Fixed top-center notification stack; upsert by id; neutral/pending/success/warning/error/info; pending/error/warning/action notices persist; explicit close with translated dismissLabel and focus recovery; informational minimum5000ms,0 persists; hover/focus/hidden document pauses; scrollable queue retains every recovery; no position, motion or styling escape |
|`ProgressBar` |`label/value`; max100 default; tone neutral/brand |Native progress for available values; unavailable status; guarded finite bounds; A generic data primitive |
|`SegmentedMeter` |`label/value`; max100 default; tone neutral/brand/success |28 vertical segments,16px high,2px gap/radius;shared internal anatomy with ApplicationCard;label/ARIA value authoritative;generic quantization nearest,score quantization floor |
|`Metric` |`label/value`; optional description |Fixed contextual display; populated source analytics U; A |
|`DataList` |`label/children` |Named grouping of library rows; not a source data-table implementation |
|`DataTable` |`label/unavailableLabel/columns/rows/state` |Native table semantics; fixed 640px narrow scroll lane; its region joins Tab order only with horizontal overflow; caller controls data and recovery; no selection/sorting |
|`HorizontalRail` |`label/children` |Fixed manual 272–320px card lane; touch, trackpad and native focused horizontal-key scroll only; no autoplay, pagination, card state or style escape |
|`Carousel` |`label/children`;optional localized `interactionHint` |Continuous forward34px/s circular rail;no visible playback/arrows;native scroll;hover/focus pauses,touch/wheel resumes after1200ms idle;Space on focused region toggles persistent pause;offscreen/hidden/reduced-motion stops;no motion tuning |
|`PagedCarousel` |`label/previousLabel/nextLabel/slideLabel({index,count})/children` |Finite manual gallery;one full-width slide per snap;drag/touch and adjacent buttons;Left/Right on focused region jump without animation;reduced motion makes button navigation instant;no autoplay,loop,plugins or visual escape hatch |
|`ScrollableList` |`label/children` |Fixed 192px vertical list region; all children remain rendered; joins Tab order only when it overflows; no virtualization, ordering or data state |
|`Pagination` |`label/page/pageCount/summary({page,pageCount})/previousLabel/nextLabel/onPageChange` |Controlled one-based adjacent navigation; bounds normalize non-finite/fractional values; summary receives the same normalized values; responsive stack; no request or route behavior |

`value=0` is valid. Null/non-finite value or invalid max yields unavailable; finite out-of-range values clamp defensively. No arbitrary segment count, dimensions or score thresholds exposed. Before/after meaning and source data accuracy remain caller responsibilities.

`NumberTicker` (beUI `number-ticker`, 2026-09-18) renders slot-machine rolling digits with staggered entrance; inherits font metrics; reduced-motion guards. Use for live metrics/counts only — never for the fabricated ATS score, which stays static by invariant. Public `className`/`digitClassName` props were removed per the BEDS contract.

Carousel RC11 replaces the RC9 edge-reversal/toolbar contract. Overflow uses three rendered copies of caller-controlled cards;one group is exposed to assistive navigation/Tab at a time. Pointer selection promotes its copy before focus;matching controlled values update every copy. Supply stable keyed,presentational cards;keep dialogs,requests and side effects outside repeated children. No per-copy data fetching,uncontrolled selection,caller hardcoded DOM IDs or analytics mount events. Underfilled rails stay single/static. Locale hint describes native scroll and Space pause;former pause/resume/previous/next label props removed.

## Forum topics — 2

| Component | API | Constraint |
|---|---|---|
|`ForumTopicCard` |`title/author`;exactly one `href/onOpen`;optional `excerpt/activity/repliesLabel/status/unreadLabel/selected` |Avatar-led native destination;transparent rest,neutral current;full subject wrap,excerpt recovered at destination;no data effects. [Contract](FORUM-TOPICS.md) |
|`ForumTopicList` |`label/children` |Named ul with one li per direct keyed card;fixed4px rhythm;not a listbox;no fragments wrapping multiple cards |

## Chat — 8

| Component | API | Evidence / constraint |
|---|---|---|
|`Conversation` |`label/children` |Named semantic message stack;fixed8px chronology gap;no arbitrary layout props |
|`ConversationBubble` |`role:user|assistant/children`;optional `sentAt/reactions` |User/assistant alignment and fixed surface anatomy;time remains visibly available instead of hidden behind an undiscoverable click;reactions are named metadata;no caller variant/color/radius escape |
|`ChatLayout` |`title/children`; optional mark/suggestions/recent |Measured header/composer/suggestion/recent grouping |
|`ChatComposer` |`label/value/onChange/onSubmit`; optional placeholder/context/tools/busy/disabled/onAttach/onCancel/error/purpose/sendLabel/attachLabel/cancelLabel;attachments/attachmentsLabel/onRemoveAttachment/attachmentPicker |Default geometry retained;guided adds visible label,error focus,mobile16px input. Controlled attachment chips precede editor;full names,kind icons,individual removal and focus recovery. Optional local picker;no upload/read. Enter submits,Shift+Enter newline,IME guarded. [Lucy](LUCY-COMPOSITION.md) |
|`SuggestionRow` |`icon/title/onClick`; optional description |Measured40px row/24px tile; content external |
|`ChatMessage` |`role:user|assistant`,children;status sending/sent/error;optional onRetry/purpose/author/mark |Default bubble retained;thread opens assistant prose across the lane and preserves newlines;optional author/DS mark;user bubble remains trailing. PT-BR sending/error recovery;no provider or streaming behavior |
|`ChatThread` |`title/children/interaction/stepKey`;optional notice/announcement |640px host chat lane;open transcript + in-flow next step;hidden H1;stable polite announcement;changed stepKey moves focus to new step,never initial mount or theme flip. [Lucy](LUCY-COMPOSITION.md) |
|`ChatOptions` |`title/options/onChoose`;optional disabled |Native action rows from `ChatOption:{id,label,description?,icon,disabled?}`;no radio selection or automatic confirmation;no policy/provider calls. [Lucy](LUCY-COMPOSITION.md) |

APIs specify controlled local behavior, not provider integrations. A rendered reply fixture is not an AI response. Consumers coordinate context/tools availability with composer busy state; primitives do not silently mutate sibling slot controls.

## Questions and approvals — 4

| Component | API | Constraint |
|---|---|---|
|`DecisionStatus` |`state/label` |Passive operational badge;approval/confirmation/processing/success/skipped/denied/error;fixed decorative icon,neutral surface;no focus stop,animation or live region |
|`DecisionActions` |`primary:{label,onClick,disabled?}`;optional secondary/alternative/disabled |Shared40px desktop/44px narrow pill buttons;primary then optional alternative then secondary;trailing secondary when all three exist;callbacks only,no persistence |
|`ApprovalCard` |`title/status/primaryAction/secondaryAction`;optional description/feedback/alternativeAction/details/context |Named transparent640px maximum,r24,p16;optional literal label/value summary and context;processing/resolved states lock actions;stable feedback status;caller owns approval policy |
|`QuestionCard` |`title/status/options/value/onChange/onConfirm/confirmLabel`;optional description/feedback/error/skipAction |Controlled numbered native radios;selection never submits;explicit submit passes enabled selected ID or null;validation focus and answer retention;processing/resolved locks;no nested forms |

Exact type exports and consumer examples: [Decision contract](DECISIONS.md).

## Pricing — 2

| Component | API | Evidence / constraint |
|---|---|---|
|`PricingCard` |`title/description/image/price/featuresLabel/features/action`;optional featured/actionNote/feedback/headingLevel |Transparent360px maximum,r24,p20;4:1 art;literal price and billing description;semantic benefit list;one full-width40/44px pill action;caller owns requests and outcomes |
|`PricingSection` |`title/plans`;optional description/mark/headingLevel |Centered720px maximum;two columns when space permits,one below664px available width;named section and semantic heading hierarchy;only first explicitly featured plan gets brand emphasis |

Full API,source adaptation and validation: [Pricing contract](PRICING.md).

## Record presentation — 2

| Export | Public contract | Behavior |
|---|---|---|
|`DefinitionTable` |title,rows,unavailableLabel,emptyMessage;optional headingLevel |Native dl/dt/dd;transparent r20 key/value frame;icons,nullable values and actual links;zero preserved |
|`OptionList` |title,items,emptyMessage;optional headingLevel |Native list;identity/link/meta;independent controlled disclosure;inset fieldset of existing Switch controls;no persistence or permission grant inferred |

Types:DefinitionRow,DefinitionTableProps,RecordOption,OptionListItem,OptionListProps.
[Records contract](RECORDS.md) owns boundaries,reference adaptation and evidence.
Existing PlanCard remains the compact account/usage summary,not a plan comparison.
Neither a badge nor a button grants permission. Hosts must authorize, validate,
persist, deduplicate and report actual outcomes independently of presentation.
Existing Badge tag/status and compact RadioGroup styles remain unchanged.

## Technical content — 1

| Component | API | Evidence / constraint |
|---|---|---|
|`CodeSnippet` |`label/value`; optional async `onCopy(value)` and complete `messages: CodeSnippetMessages` |Measured MCP code/copy context;Geist Mono40012/20px;42px region,r12;caller owns localization including accessible label,pending,success,error recovery. English default preserves existing consumers;stable live region and inset focus ring |

Copy begins only on a user click. Caller may inject an asynchronous copy callback; otherwise the component calls the browser clipboard API. Copying disables repeat activation; copied state announces success; failure offers retry or manual selection. Horizontally scrollable code remains selectable/focusable. These local recovery states are A, not evidence that source clipboard failures were observed. No pasted value is submitted to a network service.

## Onboarding — 1

Standalone form composition:`Onboarding` takes title/children/submitLabel/onSubmit;
optional description,brandMark,preview,secondaryAction,busy,disabled,feedback,footer.
Native main/form;not a nested dialog or a step engine. [Onboarding contract](ONBOARDING.md).

## Feature presentation — 1

| Component | API | Constraints |
|---|---|---|
|`FeatureCard` |`image:{src,alt,fallbackLabel?}`,`title`,`description`,`primaryAction:{label,onClick,disabled?,busy?}`;optional `secondaryAction` with same action contract |Image-led introduction;360px maximum,r24,p8;3:2 image,r16;transparent body;one primary and optional ghost secondary;fixed H2 and body type |

Use for onboarding entry,feature discovery or a contextual next step. Not a carousel,modal,tour or onboarding state machine. Native named article;H2 title and associated description;native buttons remain `type="button"`. Caller owns navigation,dismissal,progress,requests and error recovery. No custom visual props,arbitrary children or automatic action.

Provide an owned/licensed image,prefer3:2 crop with no essential embedded instructions;`object-fit:cover` is fixed. `alt` is required;empty only for decorative imagery. Loading preserves space without blocking actions. Failed/empty source keeps the media frame and accessible fallback;new `src` resets loading,including cached images. `busy` disables only the corresponding action;caller supplies its current label. Long copy grows naturally;actions wrap,40px minimum desktop/44px mobile. Complete geometry: [Foundations](FOUNDATIONS.md).

## Measured disclosure — 3

| Component | API | Constraints |
|---|---|---|
|`DisclosureText` |`children:string`; optional `lines=3` (`2/3/6`); required `moreLabel/lessLabel` |Measured line clamp with a ghost compact toggle that exists only when the clamped layout really overflows, re-measured after fonts settle and on resize; full text stays in the DOM; collapse keeps the toggle available |
|`LabelField` |`labels:readonly string[]`; optional `initialRows=3`; required `moreLabel(hidden)/lessLabel` |Passive wrap of inert labels disclosed by measured wrap rows; labels beyond the row budget collapse behind a real-count toggle; labels are never buttons; re-measured after fonts/resize/list change |
|`DisclosedRecords` |`records`, `visibleCount`, `moreLabel(hidden)/lessLabel`, `render(visible)` |Count-based record disclosure: older records leave the document while collapsed (no hidden tab stops), real remaining count in the toggle; caller renders each slice |

These primitives own measurement and disclosure semantics only; they never fetch or style consumer content. `DisclosureText`/`LabelField` keep full content present for assistive reading of the clamped state; `DisclosedRecords` removes collapsed records from the document by design. Both toggles expose `aria-expanded`/`aria-controls` through the shared `Button`.

Catalog:Library → **Card de apresentação** (`?view=feature-card`). [Controlled example](../../../apps/web/labs/espaco-library/FeatureCardExamples.tsx);local synthetic content,no real onboarding request.
## Application tracking

`ApplicationCard`, `ResultsStatus`, `CollectionToolbar`: [Application card contract](APPLICATION-CARD.md).
Portable data/actions; personal document folio and annotation; controlled status,
FIT/ATS distinction; no product runtime. Catalog `?view=application-card`.

## InputOTP contract

User-supplied OTP adaptation; `input-otp` native-input foundation. Exports `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`. Required label/value/onChange; maxLength 4/6/8 (default6). Optional status idle/processing/error/success, message, disabled, required, id/name, onComplete. No caller styling props. Caller owns verification; completion never implies processing or success. Processing/success read-only, error editable; message provides non-color status and recovery. Native one-time-code autocomplete; numeric keyboard; paste spaces/hyphens normalized. Optional children compose groups/slots/separator; indices must cover maxLength exactly. Catalog `?view=otp`.
