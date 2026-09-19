# F3 data and numeric motion decisions

Scope: F3 BEDS surfaces only, reviewed 2026-09-19. This record is a focused
decision log, not a replacement for the consolidated F0–F4 tracker.

## Adopted

| Surface | Contract | Decision |
|---|---|---|
| `AccountCredits` | `CreditBalance.ready.value` plus localized `formattedValue` | Use the existing BEDS `AnimatedNumber` only when the host also supplies typed `formatValue(value)`. The number is authoritative; display text is never parsed. Missing formatter keeps the existing literal display. |
| `Metric` | Existing string `value` plus optional `numericValue/formatValue` | Additive typed entry point. Animation requires both finite numeric data and its host formatter; the existing string remains the fallback. |
| `PricingCard` | Existing literal `price.label` plus optional `price.amount` | Keep the first render/static price literal. Animate only after the controlled numeric amount changes, using the previous numeric value and host formatter. No currency, locale, interval or plan state is inferred from a label. |

Source provenance for the adopted motion is recorded in
[THIRD-PARTY-NOTICES](../../../THIRD-PARTY-NOTICES.md): beUI `number`,
`https://beui.dev/r/number/raw`, and existing BEDS `number-ticker`,
`https://beui.dev/r/number-ticker/raw`; both MIT, retrieved 2026-09-19 for
this F3 decision (the original source records retain their earlier retrieval
dates). No runtime beUI import is added.

## Explicit NO_FIT decisions

| BEDS surface | beUI provenance | Concrete incompatibility | Capabilities that would be added | Preserved BEDS contract |
|---|---|---|---|---|
| `DataTable` | `table`, MIT, `https://beui.dev/r/table/raw`, retrieved 2026-09-19 | Upstream requires a virtualized editable grid model and different column/row ownership; BEDS owns a short native read-only table with caller-controlled states. | Virtualization, row selection, sorting, resize/reorder, editable cells, row/column menus and extra helpers/dependencies. | Native `<table>` semantics, short-list rendering, truthful loading/empty/error rows, overflow focus only when needed, no selection/sorting. |
| `Pagination` | `adaptive-stepper`, MIT, `https://beui.dev/r/adaptive-stepper/raw`, retrieved 2026-09-19 | Upstream is a bounded quantity stepper with increment/decrement controls and liquid rolling value; it does not represent one-based page navigation or page summaries. | Min/max/step quantity state, plus/minus controls, liquid transitions and quantity-oriented announcements. | Controlled one-based adjacent page buttons, normalized bounds, caller summary, responsive layout, no route/request ownership. |
| `ApplicationBoard` / kanban | `kanban`, `https://beui.dev/r/kanban/raw`, retrieved 2026-09-19 → HTTP 404; candidate `swipeable-list`, MIT, `https://beui.dev/r/swipeable-list/raw`, retrieved 2026-09-19 | No beUI kanban source exists. Swipeable list is a mobile row-action surface and does not preserve status lanes, card ownership, or explicit destination transitions. | Swipe gesture state, reveal rails, action tones, refresh/close behavior and a new item/action contract. | Controlled status columns, compact shared `ApplicationCard`, explicit `moveTo`, caller-confirmed updates, keyboard menu movement, stacked narrow layout and no drag/swipe persistence. |

The NO_FIT rows are complete decisions. They do not remain pending migration
items and do not create a future phase or backlog obligation.

## Verification boundary

The focused browser gate covers the adopted account/pricing states and the
existing data-pattern contract. Chromium emulation, physical assistive
technology, Safari/Firefox and aesthetic owner approval remain separate
evidence; none is implied by the static or browser checks.
