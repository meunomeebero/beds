# Date item

Use when: showing dated entries, appointments or history in a quiet list.
Read next: [Foundations](FOUNDATIONS.md), [Components](COMPONENTS.md),
[States](STATES.md), [Interface quality](INTERFACE-QUALITY.md).

## Reference and scope

Owner-supplied September15 events screenshot → **A adaptation**. Mini calendar
with month above day; adjacent title and optional status; neutral row hover.
Original HTML/CSS, no redistributed artwork or new dependency. The BEDS status
variant stays quiet rather than introducing another filled badge treatment.
No scheduling, countdown, date picker or calendar integration is implied.

## Public contract

| API | Contract |
|---|---|
| `DateItem` | Required `title/date`; optional `description/status` and exactly zero or one `href/onOpen` |
| `DateItemDate` | `dateTime`: valid ISO date; `month/day`: short visual labels; `label`: complete localized date including year |
| `status` | Explicit `label` + optional existing Badge `tone`; no state inferred from date or current clock |
| `href` | Native anchor; supports copy address and opening another tab |
| `onOpen` | Native button; Enter/Space activate; host owns detail view and focus recovery |
| Neither destination | Static div; no focus stop, pointer cursor or hover affordance |
| `DateItemList` | Named semantic ul; one item per direct keyed child; no listbox/selection model |

Host formats all four date values from one source date in its intended locale.
No `new Date()`/implicit browser timezone conversion. Day may be a localized
numeral; month should be the locale's short form. Unknown dates belong in a
separate undated state, not a fabricated calendar. `time` retains machine date;
full label is available to assistive technology and through its native title.
Copy the complete date into the detail view when one exists. Visible title,
description and status wrap; no hidden ellipsis. No nested controls in the row.

## Example and states

[Catalog example](../../../apps/web/labs/espaco-library/DateItemPage.tsx):
`?view=date-item&theme=light|dark`; `preview=long` stresses title/status wrapping.

Entry → first row → local detail drawer → Escape/close → focus back → reopen.
Second row is a native link; remaining rows are informative. Dates/statuses are
fixed fixtures, not assertions about the viewer's current day. No requests or
persistence. Empty/loading/error/retry belong to the host's collection, using
existing feedback primitives; an individual date item has no async lifecycle.

## Better review and delivery

Scope: DateItem/DateItemList and their catalog example; React19, existing BEDS
tokens and component-owned CSS. AGENTS, Foundations, Governance and Interface
quality govern the implementation. Seven Better entrypoints + frontend-design
applied; no additional visual system or motion introduced.

| Domain | Coverage |
|---|---|
| Accessibility | Native action/link/static distinction; title name, complete date/status description; keyboard drawer/re-entry and focus; no color-only state |
| Layout | Adjacent calendar/content, wrapping inline status; narrow and long labels; logical RTL placement |
| Writing | Explicit local demo; optional metadata without fabricated scheduling or progress |
| Typography | Inter, tabular day, short uppercase month only; full title/description/status wrap |
| Colors | Existing neutral/semantic roles; light/dark and interactive-state contrast checks |
| UI polish | Nested calendar radii/insets; restrained depth only on calendar; transparent row, no separators or motion |

No actionable interface findings in the inspected states. Technical checks
passed; acceptance remains **PENDING** independent comparison/owner decision.

| Executed check — September15 | Result |
|---|---|
| `npm run verify` | Passed: build/typecheck/library/docs/consumer/guard/artifact checks;106 components,90 tokens;temporary packed consumer smoke passed |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npx playwright test --config apps/web/labs/espaco-library/playwright.config.ts date-item.spec.ts --reporter=line` |4 passed:2 tests × desktop/mobile;both themes,full date semantics,static/native action/link,keyboard re-entry,contrast≥4.5:1,320px long copy,RTL,forced colors,reduced motion and1280px CSS200% zoom stress |
| Rendered inspection | Desktop light + mobile dark +320px dark long-label screenshots;calendar geometry and copy containment inspected;captures in `apps/web/labs/espaco-library/evidence/date-item/` |

Packaging regression: added stylesheet to build order and its isolated fixture;
the missing-document-asset guard still asserts its original error,not a generic
failure. No checks disabled or narrowed to hide failures.

Native screen reader,physical devices,actual browser zoom,independent visual
comparison and owner aesthetic approval remain unverified. CSS200% zoom is only
a stress proxy. Source/catalog addition only:no release,consumer upgrade,
production integration or push.
