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

## New capability BEDS lacks entirely

`wheel-picker` `dynamic-island` `bloom-menu` `range-slider` `multi-select` `combobox` `file-tree` `infinite-masonry` `pull-to-refresh` `shader-background` `feedback-widget` `image-generation` `ai-sidebar` `chat-app` `project-folder` `card-folder`

Charts → BEDS has none. `heat-calendar` is the only broadly reusable one.

## Adopted

| Component | Source | Status |
|---|---|---|
| `AnimatedNumber` | `number` (MIT, `https://beui.dev/r/number/raw`, 2026-09-16) | In `foundation.tsx`, exported. Null/non-finite value never animates toward a fabricated number; reduced motion jumps to the final value; integer targets snap per frame. Not yet wired to a surface — see the ATS finding |

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

`knockout-bracket` `prediction-market` `swap` `returns-calendar` `price-target-fan` → wrong domain (tournaments, trading, crypto). `chat-app`,`ai-sidebar` → whole-app compositions that would dictate our layout rather than fill a gap; harvest their parts instead.
