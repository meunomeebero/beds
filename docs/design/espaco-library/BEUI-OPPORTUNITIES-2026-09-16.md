# beUI integration opportunities — audit 2026-09-16

Read with [External component sourcing](EXTERNAL-COMPONENT-SOURCING.md). Since 2026-09-17 BEDS runs the beUI stack (Tailwind compiled in, shadcn token naming with BEDS values, `motion`, internal `cn`), so adoption means pasting source with geometry classes swapped for BEDS proportions. This audit lists candidates; each adoption still needs its own contract, states, catalog example, evidence and owner aesthetic approval.

## Baseline measured

| Fact | Value |
|---|---|
| BEDS surface | 129 components, 35 stylesheets |
| BEDS motion today | 12 `@keyframes` total; 22 of 35 stylesheets have **zero** keyframes and zero transitions |
| beUI inventory | 85 components, MIT; 82 interaction + 3 finance charts |
| Dependency | `motion@^13.4.0` approved by the design owner and installed 2026-09-16 |

Zero-motion stylesheets → `account-credits` `application-board` `benefits` `blog-post` `chat` `data` `date-item` `decisions` `disclosure` `feature-card` `feedback` `form-fields` `forum-topic` `foundation` `landing-footer` `onboarding` `patterns` `pricing` `records` `technical` (plus `reset`,`tokens`, correctly inert). That list is the real gap, not the component count.

Opportunities are grouped by the owner's three approved intensities: 1 everyday calm → 2 component personality → 3 transformation moments.

## Replace — their version is strictly better

Same anatomy we already own, plus motion we never wrote.

| BEDS | beUI source | Gain | Intensity |
|---|---|---|---|
| `InputOTP` | `otp-input` | per-slot digit roll,gliding focus ring,error shake,success check | 2 |
| `TextField`,`FormField` | `input` | error shake,success draw,stable error row → no layout jump | 1 |
| `Tabs` | `tabs`,`expandable-tabs`,`morphing-tabs` | spring shared indicator instead of instant swap | 1 |
| `Switch` | `switch` | spring thumb with travel feedback | 1 |
| `Checkbox` | `checkbox` | draw-on check,real indeterminate | 1 |
| `RadioGroup` | `radio` | gliding selection dot | 1 |
| `Select`,`FilterSelect` | `select` | unfolds from its own trigger | 1 |
| `DropdownMenu` | `context-menu` | pointer-origin clip morph,gliding row highlight | 1 |
| `Tooltip`,`Popover` | `tooltip`,`popover` | blur enter/exit,spring spawn from anchor | 1 |
| `Drawer` | `drawer`,`bottom-sheet` | spring travel,backdrop blur,scroll lock | 1 |
| `Dialog` | `center-morph-modal`,`morphing-modal` | morph from origin,height morph between steps | 1 |
| `CommandPalette`,`SearchDialog` | `command-palette`,`morphing-search` | spring active row,input morphs into results | 1 |
| `Toaster` | `animated-toast-stack`,`notification-stack` | true stack,swipe dismiss,layout-aware reflow | 1 |
| `DataTable` | `table` | sortable/resizable,virtualized for long lists | 1 |
| `Pagination` | `adaptive-stepper` | rolling digits | 1 |
| `DisclosureText`,`DisclosedRecords` | `bouncy-accordion` | weighted spring open/close | 1 |
| `AppShell` nav,`NavItem` | `animated-sidebar`,`bounce-sidebar`,`preview-rail`,`dock` | collapse/expand and rail motion for the 264/62px shell | 1 |
| `Button` | `button`,`expanding-arrow-button`,`action-swap` | spring press;CTA affordance;label→state swap | 1-2 |
| `LoadingIndicator`,`Skeleton` | `loader`,`loading-states`,`text-animation` | 17 loader variants,shimmer,staged copy | 2 |
| `Notice`,`Badge`,`StatusDot` | `animated-badge` | state icon transition,pulse for live states | 2 |
| `FileUploadField` | `file-upload` | attachment workspace,per-file progress queue | 2-3 |
| `CodeSnippet` | `code-block` | streaming reveal,line numbers,focused lines | 2 |
| `EmptyState`,`EmptyStateCard` | `not-found` | expressive empty/404 treatments | 2 |
| `Carousel`,`PagedCarousel`,`HorizontalRail` | `cylinder-carousel`,`marquee` | depth carousel,continuous rail | 3 |
| `Onboarding` signup | `signup-form` | validate on blur,clear error on fix,strength meter | 1 |
| `ApprovalCard`,`QuestionCard` | `approval-card`,`tool-approval` | decision surfaces currently at zero motion | 2 |
| `Conversation`,`ChatMessage`,`ChatComposer` | `message`,`message-bubble`,`message-scroller`,`prompt-input`,`streaming-response`,`citations` | streaming, pinned scroll, composer states | 2 |
| `ThemeToggle` | `theme-toggle` | View Transition page repaint — owner decision, see below | 3 |

## Enhance — animate what is currently inert

| Target | beUI source | Why |
|---|---|---|
| `AccountCredits` balance | `number`,`wallet-card` | balance is not evidence → safe count-up |
| `PricingCard`,`CreditPackageSelector` | `number`,`tilt-card` | price ticks on package change;card depth on hover |
| `FeatureCard`,`BenefitsSection` | `tilt-card`,`text-animation`,`scroll-animation` | landing reveal;both files at zero motion |
| `ApplicationBoard` (kanban) | `swipeable-list`,`pull-to-refresh` | mobile row actions and refresh, absent today |
| `ForumTopic`,`Records` | `heat-calendar`,`infinite-masonry`,`file-tree` | activity density;feed;threaded structure |
| `DateItem`,`DateItemList` | `availability-scheduler` | zero motion today |
| `ProcessingView` | `todo-list`,`loading-states`,`agent-activity`,`tool-result`,`file-diff` | F4 adopts `todo-list` status-mark and ATS segment-fill intent only; secondary candidates are deferred on public-state mismatch |
| Overflow/toolbars | `overflow-actions`,`expandable-action-bar`,`expandable-control` | progressive disclosure of actions |
| Cross-surface transitions | `shared-layout-bg` | continuity between card → detail |

## Sources deferred until a product need exists

This is a sourcing index, not a promise to export every upstream component.
Before a product creates a local workaround, use the linked public beUI source
to assess the same anatomy. Follow [External component
sourcing](EXTERNAL-COMPONENT-SOURCING.md): copy/adapt only after a BEDS
contract, provenance and focused technical evidence exist; use a catalog
fixture only when the frozen catalog is explicitly reopened. Never import beUI
at runtime or run its install command in this repository.

| beUI source | Consider when | Current BEDS decision |
|---|---|---|
| [`range-slider`](https://beui.dev/components/motion/range-slider) ([source](https://beui.dev/r/range-slider/raw)) | A host needs a controlled numeric interval rather than a text field or discrete Select. A future named consumer is credit-package flexibility, from 0–100. | Adopted 2026-09-20 as the public BEDS `RangeSlider`: controlled/uncontrolled value, truthful min/max/step grid, native keyboard/form/RTL semantics and decorative bounded ticks. The host owns promotion ranges, multiplier copy, pricing, eligibility and purchase outcome; [BER-7](https://linear.app/berolab-ltda/issue/BER-7/permitir-checkout-flexivel-de-1-a-100-creditos) remains backend-only. [Contract](RANGE-SLIDER.md). Metadata SHA-256 `39fc6c6a1c2a9d2eb7754456bb8b19769448c1d0516a4761a935632c4eeef78a`; source SHA-256 `def8fd8a27890ce28da2298c8cca31b8bd9780cb594dcb9a876d524deb3f8e29` retrieved 2026-09-20. |
| [`chat-app`](https://beui.dev/components/agents/chat-app) ([source](https://beui.dev/r/chat-app/raw)) | A product needs a complete agent-conversation workspace rather than an isolated bubble or composer. | Adopted 2026-09-20 only as the bounded public BEDS `ChatWorkspace`: controlled transcript/composer, incremental assistant content, visible stream/error/cancel/retry states and reduced-motion guard. Preserve the current `Conversation`, `ConversationBubble`, `ChatLayout`, `ChatComposer`, `ChatMessage`, `ChatThread`, `ChatOptions` and `SuggestionRow` exports for future consumers; do not delete or silently re-scope them. The upstream 59-file application with `shiki`, sidebar, planning, approvals, tools, code, generated media, citations and network/SSE policy remains excluded. [Contract](CHAT-WORKSPACE.md). Historical metadata SHA-256 `42b6850ad2d6d965e903c2fc6ff4a3513eb874641bdcc52a4638bba92939d1a2`; observed registry metadata SHA-256 `5fa25847e0a302f34107a1bf46d35e98068ab3d79eb1861815aee648aea5325d`; source SHA-256 `1cdd61e981ec04933357997277d99a2a5b918be1cb71c38b360bbd8b0ce8c45e` retrieved 2026-09-20. |
| [`wheel-picker`](https://beui.dev/components/motion/wheel-picker) | A bounded value benefits from wheel-style selection and a native select is not sufficient. | **NO_FIT for calendar-date forms (2026-09-20):** the static beUI registry exposes a wheel-style date/time composition, not a labelled native `type="date"` field with browser range semantics. `DateField` reuses the already-adopted beUI `input` anatomy and preserves the platform control. Keep this reference for a future explicitly scoped wheel-selection need; assess keyboard, touch and screen-reader behavior then. |
| [`dynamic-island`](https://beui.dev/components/blocks/dynamic-island) | A short-lived, interruptible activity needs persistent status in compact chrome. | Deferred; needs an explicit status, dismissal and reduced-motion contract. |
| [`bloom-menu`](https://beui.dev/components/blocks/bloom-menu) | One secondary action launcher needs a spatially revealed choice set. | Deferred; not a replacement for navigation or a generic menu. |
| [`multi-select`](https://beui.dev/components/motion/multi-select) | A caller needs multiple selected entities, not the existing one-value Select. | Deferred; requires controlled selection, long-value and keyboard contracts. |
| [`combobox`](https://beui.dev/components/motion/combobox) | A caller needs searchable selection with a bounded result set. | Deferred; define filtering, async/recovery and IME ownership first. |
| [`file-tree`](https://beui.dev/components/motion/file-tree) | A product owns hierarchical resources that cannot be represented as a flat list. | Deferred; needs caller-owned loading, selection and expansion state. |
| [`infinite-masonry`](https://beui.dev/components/blocks/infinite-masonry) | A visual collection, rather than a record list, needs progressive loading. | Deferred; do not substitute it for native data-table/list semantics. |
| [`pull-to-refresh`](https://beui.dev/components/motion/pull-to-refresh) | A touch-first surface has an explicit host refresh action and recovery behavior. | Deferred; requires a product fetch/error policy, never an implicit request. |
| [`shader-background`](https://beui.dev/components/motion/shader-background) | A branded, decorative surface has an approved performance and reduced-motion fallback. | Deferred; no decorative runtime is added without a design-owner decision. |
| [`feedback-widget`](https://beui.dev/components/blocks/feedback-widget) | A product needs a controlled feedback capture flow. | Deferred; host owns privacy, submission, success and recovery policy. |
| [`image-generation`](https://beui.dev/components/agents/image-generation) | An agent product needs to present generated-media progress and result states. | Deferred; BEDS never creates media, sends prompts or owns provider policy. |
| [`ai-sidebar`](https://beui.dev/components/agents/ai-sidebar) | An agent workspace separately needs hierarchical resource navigation. | Deferred; it is not implicitly adopted with the Chat App direction. |
| [`project-folder`](https://beui.dev/components/blocks/project-folder) / [`card-folder`](https://beui.dev/components/blocks/card-folder) | A product has a concrete project/folder organization model. | Deferred; decide whether the model is a data structure, a visual grouping, or both before adoption. |
| [`heat-calendar`](https://beui.dev/charts/heat-calendar) | A product has activity data that needs a reusable chart, not merely decorative density. | Deferred; BEDS currently has no chart contract. |
| [`theme-toggle`](https://beui.dev/components/motion/theme-toggle) / [`scroll-animation`](https://beui.dev/components/motion/scroll-animation) | A design owner requests whole-page theme-transition behavior or scroll-driven narrative motion. | Deferred; theme repaint affects every surface and upstream scroll motion introduces Lenis/native-scroll ownership concerns. |

## Adopted

| Component | Source | Status |
|---|---|---|
| `AnimatedNumber` | `number` (MIT, `https://beui.dev/r/number/raw`, 2026-09-16) | In `foundation.tsx`, exported. Null/non-finite value never animates toward a fabricated number; reduced motion jumps to the final value; integer targets snap per frame. Not yet wired to a surface — see the ATS finding |
| `RangeSlider` | `range-slider` (MIT, `https://beui.dev/r/range-slider/raw`, 2026-09-20) | In `range-slider.tsx`, exported. Native single-value range with bounded grid, visible value, keyboard/form/RTL behavior and BEDS-owned focus/motion; quantities, promotions, pricing, checkout and persistence stay host-owned. [Contract](RANGE-SLIDER.md) |
| `ChatWorkspace` | `chat-app` (MIT, `https://beui.dev/r/chat-app/raw`, 2026-09-20) | In `chat-workspace.tsx`, exported. Bounded shell/transcript/composer adaptation only: controlled message IDs support incremental assistant content; stream/cancel/error/retry are supplied by the host. No runtime beUI import, `shiki`, planning/tools/code/media/citations/sidebar or transport policy. [Contract](CHAT-WORKSPACE.md) |

## Needs owner decision before adoption

| # | Item | Finding |
|---|---|---|
| 1 | Count-up on the ATS score | Attempted and reverted. `results.spec.ts` captures the score text, opens the search dialog and asserts the text is **unchanged**; a count-up makes the evidence non-deterministic and briefly renders scores that were never computed. `results.tsx` already carries the rule "Never animate a fabricated score". Options → animate the 28-segment meter fill with a stagger, or a blur/spring reveal of the true number, keeping the text stable. Ticker stays valid for credits and prices |
| 2 | `todo-list` on the optimization screen | Resolved in F4 as a bounded local adaptation: retain the host-owned 90s/75s choreography, 95% hold and retro geometry; adopt only status-mark morphing and segmented ATS fill, with static true text and reduced-motion support |
| 3 | `theme-toggle` View Transition | Repaints the whole page on theme change. Touches brand identity across every surface, not one component |
| 4 | `scroll-animation` | Upstream pairs with Lenis → a second runtime dependency and hijacked native scrolling |
| 5 | `table` virtualization | May pull a virtualization dependency; current `DataTable` lists are short |
| 6 | beUI Pro blocks/templates | Paid private registry, unlicensed here. Excluded by contract |

## Not adopting

`knockout-bracket` `prediction-market` `swap` `returns-calendar` `price-target-fan` → wrong domain (tournaments, trading, crypto). The full `chat-app` remains excluded: only its bounded conversation anatomy is adopted by `ChatWorkspace`. `ai-sidebar` remains deferred until a product needs resource navigation independently of that Chat App scope.
