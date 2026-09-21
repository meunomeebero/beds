# Public API boundary classification

This is a contract-level ownership classification for the private agnostic candidate,
not a claim of complete visual, accessibility or behavioral acceptance. Read
[Agnostic DS](AGNOSTIC-DS.md) for implementation/verification status and
[Components](COMPONENTS.md) for detailed APIs. Every named barrel export, including
TypeScript types, appears below. A regression checks coverage as the barrel changes.

A component may contain subcomponents. The boundary is its reusable job and
caller-owned policy, not the number of DOM elements or lines of code. Keeping a
widget does not endorse all its historical geometry or certify every state.

## Retained exports

| Source family | Exports (including related types) | Ownership decision |
|---|---|---|
| foundation | `DesignSystemProvider`, `useDesignSystem`, `Icon`, `Text`, `Avatar`, `TextLink`, `BrandMark`, `ThemeToggle`, `AnimatedNumber`, `IconName`, `Theme`, `TextVariant` | Retain: theme boundary, identity container and individual visual/number primitives. BrandMark requires the caller's image; no embedded product identity. |
| meter-segments | `MeterSegments` | Retain: one bounded meter/progress representation. Labels, values and units are caller-owned. |
| number-ticker | `NumberTicker`, `NumberTickerProps` | Retain: changing numeric text, not a score or revenue policy. |
| tokens | `typography`, `geometry`, `neutrals`, `themes` | Retain: read-only component style metadata. No shell/page-width presets; reading measure is not a mandatory app width. |
| controls | `Button`, `IconButton`, `IconToggleButton`, `TextField`, `DateField`, `TextAreaField`, `SearchField`, `Checkbox`, `Switch`, `SegmentedControl`, `Tabs` | Retain: individual controls with controlled values and semantic variants. Variant names describe existing presentation; they do not mandate a screen or business process. |
| form-fields | `RadioGroup`, `FileUploadField`, `RadioOption`, `RadioGroupProps`, `FileUploadFieldProps` | Retain: choice and local file-selection controls. No upload endpoint, resume parser, file entitlement or storage policy. |
| range-slider | `RangeSlider`, `RangeSliderProps` | Retain: bounded numeric input with host-owned domain and formatting. |
| overlays | `Select`, `FilterSelect`, `HelpLabel`, `DropdownMenu`, `Tooltip`, `Dialog`, `Drawer`, `DrawerSection`, `CommandPalette`, `SearchDialog`, `SearchResult` | Retain: single popup/modal/search interaction boundaries, including their parts and data contracts. Search content, requests and destinations stay caller-owned. |
| select | `FilterSelectProps`, `SelectOption`, `SelectProps` | Retain: types for the public selection controls, not a separate composition. |
| sandboxed-html-preview | `SandboxedHtmlPreview`, `SandboxedHtmlPreviewProps` | Retain: one isolated content preview. Host owns trust decisions and supplied content; never a product page template. |
| dock | `Dock`, `DockItem`, `DockSeparator`, `DockProps`, `DockItemProps` | Retain: one action/navigation widget and its parts. Caller selects items and destinations. |
| layout | `Sidebar`, `SidebarHeader`, `WorkspaceTrigger`, `SidebarSection`, `NavItem`, `SidebarFooter`, `ContentHeader`, `Breadcrumbs`, `PageHeader`, `SectionHeader`, `Stack`, `Inline`, `ResponsiveGrid`, `Divider`, `Surface`, `CollectionCard`, `ActivityPanel`, `SurfaceProps` | Retain: navigation parts, headings, semantic surfaces, lightweight grouping utilities and individual cards. See the boundary decisions below; no application shell or page inset preset. |
| data | `DataTable`, `HorizontalRail`, `Carousel`, `ScrollableList`, `Pagination`, `DataTableColumn`, `DataTableRow`, `DataTableState` | Retain: data presentation, contained scrolling and pagination. No fetching, business records or page orchestration. |
| paged-carousel | `PagedCarousel`, `PagedCarouselProps` | Retain: finite manual gallery with caller children; no onboarding flow. |
| disclosure | `DisclosureText`, `LabelField`, `DisclosedRecords` | Retain: measured content disclosure. No domain records or fetching. |
| patterns | `SettingsForm`, `SettingsRow`, `SettingsGroup`, `IntegrationRow`, `RecentItem`, `PlanCard`, `AccountMenu` | Retain: form/row/group semantics, individual integration/recent/usage cards and an account popup. No account backend, settings page, pricing plan or authentication workflow. |
| feedback | `Badge`, `StatusDot`, `Notice`, `EmptyState`, `Skeleton`, `LoadingIndicator`, `ProgressBar`, `SegmentedMeter`, `Metric`, `DataList`, `MetricProps` | Retain: individual status, empty, loading and numeric feedback. No synthetic successful operations. |
| chat | `Conversation`, `ConversationBubble`, `ChatComposer`, `SuggestionRow`, `ChatMessage`, `ChatOptions`, `ChatOption`, `ComposerAttachment`, `ComposerAttachmentPicker` | Retain: transcript/bubble/composer/choice primitives. No complete workspace, guided page, provider transport or step policy. |
| technical | `CodeSnippet`, `CodeSnippetMessages` | Retain: selectable code and copy feedback; caller owns content and localized messages. |
| feature-card | `FeatureCard`, `FeatureCardProps` | Retain: one image-led card, not a landing section or onboarding page. |
| account-credits | `AccountCredits`, `AccountCreditsProps`, `CreditBalance` | Retain: one controlled balance card. No inferred quota, price or charging; can serve usage credits or membership points in unrelated apps. |
| forum-topic | `ForumTopicCard`, `ForumTopicList`, `ForumTopicCardProps` | Retain: one discussion destination plus list semantics. Content and navigation are caller-owned, not a forum application. |
| blog-post | `BlogPostCard`, `BlogPostList`, `BlogPostCardProps` | Retain: one editorial destination plus list semantics; no CMS, feed fetching or editorial policy. |
| date-item | `DateItem`, `DateItemList`, `DateItemProps`, `DateItemDate` | Retain: date-led record and list semantics; calendar interpretation, timezone and event policy stay with the host. |
| records | `DefinitionTable`, `OptionList`, `DefinitionRow`, `DefinitionTableProps`, `RecordOption`, `OptionListItem`, `OptionListProps` | Retain: key/value and option-disclosure widgets, not domain schemas or configuration pages. |
| pricing | `PricingCard`, `PricingCardProps` | Retain: one caller-specified offer card. No comparison-page layout, default featured plan, billing logic or checkout. |
| empty-state-card | `EmptyStateCard`, `EmptyStateCardProps` | Retain: one empty-state presentation with caller message, artwork and action, not an empty application page. |
| decisions | `DecisionStatus`, `DecisionActions`, `ApprovalCard`, `QuestionCard`, `DecisionState`, `DecisionStatusProps`, `DecisionAction`, `DecisionActionsProps`, `ApprovalCardProps`, `QuestionCardProps` | Retain: one explicit approval/question interaction and its parts. Host owns permission checks, operations and outcomes. |
| input-otp | `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`, `InputOTPProps`, `InputOTPStatus` | Retain: one segmented code input and parts. No verification service, login flow or success inference. |
| toast | `Toaster`, `toast`, `dismissToast`, `ToastInput`, `ToastTone`, `ToastAction` | Retain: transient feedback service and visual host. No product request or business event interpretation. |
| collection-controls | `ResultsStatus`, `CollectionToolbar` | Retain: status text and search/filter slot grouping. No application-card schema or lifecycle. |

## Borderline decisions

- **ResponsiveGrid stays optional.** It has one job: arrange arbitrary children
  in two columns, then one at its documented breakpoint. It contains no routes,
  named page regions, identity or data. Apps may use their own grid instead;
  no guard requires this utility or its breakpoint. Container-responsive refinement
  may improve reuse later, but replacing a generic utility with a recipe is not
  necessary merely because it makes a layout choice. Stack and Inline use the
  same criterion.
- **SettingsGroup/SettingsRow stay.** Grouping field content is reusable; a full
  account-settings screen, section order and save/validation policy remain app-owned.
- **AccountMenu stays a widget.** Identity/actions/workspaces are passed in; the
  popup owns keyboard/focus behavior. Authentication and workspace authorization
  never belong in this component. Its icon-based sign-out placement is presentation,
  not an authorization mechanism.
- **Cards stay when individually reusable.** PricingCard, PlanCard and
  AccountCredits present supplied offers/usage. BlogPostCard, ForumTopicCard and
  DateItem represent one item, not a product. ApplicationCard was different: its
  resume/company/salary/ATS/FIT model bundled a specific product workflow.
- **ActivityPanel/CollectionCard are not pages.** Their bounded presentation is
  retained, but clipping, long-content and overflow behavior still require rendered
  acceptance. This classification does not waive those checks.
- **Headings stay without page presets.** PageHeader/SectionHeader present a
  title and related action; PageContentHeader and HomeHeader own example-specific
  page margins/hierarchy and live in recipes.

## Outside the runtime

AppShell, ChatLayout, ChatThread, ChatWorkspace, PageContentHeader, HomeHeader,
landing/footer/benefits, onboarding, checkout, processing/results, pricing comparison,
payment confirmation and application cards/board are optional app-owned recipes.
They must not reappear in the public barrel or compiled runtime through a convenience
export. Existing catalog examples are preserved, not mandatory compositions.

## Admission rule

For each proposed export: define one job, give two credible unrelated uses, keep
identity/data/requests/business policy caller-owned, search BEUI, and specify the
states, documentation and regression evidence. If it instead describes a screen,
page hierarchy or domain workflow, keep it in the app. Do not rename a product
composition to a generic noun merely to pass this review. See
[Governance](GOVERNANCE.md) and the essential [skill protocol](INTERFACE-QUALITY.md).

## Explicit consumer migration

This private breaking candidate is not an automatic upgrade. Keep an existing
consumer pinned until its owner authorizes a scoped migration and immutable
artifact. Do not restore removed exports as compatibility wrappers that bring
page composition back into the core.

| Previous dependency | Consumer-owned replacement |
|---|---|
| `brands.curriculol` or another named product preset | An explicit six-digit color in the app's configuration |
| Embedded `BrandMark` artwork | Caller-supplied `src` and accessible `label`; larger wordmarks use app-owned images |
| `AppShell`, `PageContentHeader`, `HomeHeader`, page-width geometry tokens | App layout/styles composing public Sidebar, headings and native landmarks; optional recipes are editable examples |
| Landing, onboarding, checkout, processing/results, payment confirmation | App-owned page hierarchy and flow, reusing individual public controls |
| `ChatWorkspace`, `ChatThread`, `ChatLayout` | App-owned transcript/step orchestration using the retained conversation/composer primitives |
| `ApplicationCard` / `ApplicationBoard` | App-owned domain model and presentation; no ATS/FIT/job schema in the core |
| `PricingSection` / `PricingPlan` | App-owned comparison and offer policy; `PricingCard` remains reusable |

Minimal identity/composition example for the new boundary:

```tsx
import { BrandMark, DesignSystemProvider, Text } from 'beds';
import 'beds/styles.css';

export function Example({ logoUrl }: { logoUrl: string }) {
  return <DesignSystemProvider theme="light" brandColor="#5470c6">
    <header className="app-header">
      <BrandMark src={logoUrl} label="Application identity" />
      <h1>Workspace</h1>
    </header>
    <main className="app-content"><Text>Caller-owned content</Text></main>
  </DesignSystemProvider>;
}
```

The app defines those classes; BEDS does not prescribe their grid, spacing or
page width. Read metadata from `beds/tokens` and CSS tokens where useful, without
overriding component internals. Route the essential skills from the app's own
AGENTS.md as described in [Interface quality](INTERFACE-QUALITY.md). Before
expanding the migration, typecheck, run the consumer guard on all affected roots,
and inspect one representative screen and its error/empty/loading states in both
themes, narrow/wide layouts and keyboard navigation. A passing import migration
is not a completed visual review or authorization to publish.
