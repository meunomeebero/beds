# Espaço data patterns

`DataTable` and `Pagination` are portable, controlled patterns. They add no request, route, sorting, selection, upload, cache or business-rule behavior.

## DataTable

| Part | Fixed contract |
|---|---|
| Identity | Required localized `label` becomes the section and table name. |
| Columns | Ordered `id`, localized `label`, optional `numeric`; numeric cells are end-aligned tabular values. |
| Rows | Ordered IDs and text/number/null cells. `null` renders the unavailable mark, never zero. |
| Localized absence | Required `unavailableLabel` names the unavailable mark for assistive technology. |
| State | Caller supplies `ready`, `loading`, `empty` or `error`; recovery callbacks stay caller-owned. |
| Narrow layout | Native table remains at 640px minimum inside its only horizontal scroll region. No hidden columns or card conversion. The region joins Tab order only while it overflows; then native horizontal Arrow-key scrolling remains available. |

Loading sets `aria-busy`. Empty and error state use the existing `EmptyState` and `Notice` components. A ready empty list remains caller data; it is not silently converted into an empty state.

The pattern deliberately omits sorting, selection, row navigation, filters, virtualization, page-size selection and drag interactions. A future addition needs a separate component contract, keyboard model and browser evidence.

## Pagination

| Prop | Fixed contract |
|---|---|
| `page` / `pageCount` | Controlled one-based values. Non-finite and fractional values normalize to finite integers in `1..max(pageCount, 1)` before adjacent controls calculate their bounds. |
| `summary` | Required localized function receiving normalized `{ page, pageCount }`; it renders the visible polite status from the same values that drive adjacent controls. |
| Labels | `previousLabel` and `nextLabel` are required localized button labels. |
| `onPageChange` | Only adjacent valid page values. The component performs no route change, fetch or retry. |

Under 768px, summary and controls stack. Previous and next retain native disabled semantics at their bounds.

## Evidence and limits

The data-pattern browser exercise covers light/dark, desktop/mobile, ready/loading/empty/error recovery, long values, unavailable cells, conditional keyboard focus and Arrow-key scroll, narrow-table containment and adjacent-page bounds including non-finite and fractional values. It does not establish Safari, Firefox, hardware touch or screen-reader support.
