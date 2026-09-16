# SearchDialog — categorized discovery

Scope: public BEDS component + synthetic catalog `?view=search`.
Source: owner-supplied September15 screenshot; hierarchy observed, exact geometry
adapted (A). No artwork/source code extracted or redistributed.
[Foundations](FOUNDATIONS.md) owns geometry, colors and typography.

## Contract

| Input | Responsibility |
|---|---|
| open/onOpenChange | Controlled native modal; close request on Escape/outside/close/selection |
| title/placeholder | Visible label persists above input; default PT-BR copy, overridable text |
| query/onQueryChange | Controlled editable query; no debounce, request, persistence or URL logic |
| items: SearchResult[] | Stable unique id, label, optional description/icon/disabled; categoryId, keywords and identity{name,src?} optional |
| categories | Optional labelled group; value/options/onChange. Reserve empty id/value for All; supplied options must contain it. Disabled categories cannot select |
| onSelect(id) | Explicit result action; caller owns details/navigation. No nested links/delete actions inside a listbox option |
| filterMode=local | Accent-insensitive, all search words in label/description/keywords; category filter; retains caller order |
| filterMode=manual | Render caller results as supplied, no local filtering; caller owns category/query matching, request cancellation and stale-response suppression |
| resultsLabel | Caller owns recent/recommended/results semantics. Empty query does not infer recency or history |
| state | Absent=ready. loading requires label; error requires title/description + retry{label,onClick}. Both hide all stale selectable results |
| labels | close,clear,empty,emptyHint,navigate,open,count(count) for localization; no styling escape |

Use description for type, company/date or unavailable reason. Plain complete text
wraps; no essential label truncation. Identity uses existing Avatar recovery;
label/description must carry identifying company information too. Icon registry
and identity tile have fixed geometry. Disabled rows remain readable but skipped.

## Flow

Trigger → focus search → type/filter → arrows highlight → Enter/pointer selects
→ close → caller details. Tab traverses close/input/categories/recovery only;
Shift+Tab wraps. Native dialog isolates background; shared scroll lock and
focus restoration reused from existing overlays. No extra modal package.

Home/End, modifier keys and ordinary text-editing keys stay native. IME Enter
does not select. Categories use native pressed buttons, not incomplete tabs.
Listbox rows contain no interactive descendants. Focus remains on the input
while arrows change aria-activedescendant. A stable polite region announces
count/loading/error; loading does not fabricate a spinner duration or result.
Retry focuses input before its disappearing button; query/category retained.
Clear resets query and All category, then focuses input. Reopening preserves
caller query/category and resets transient highlight to the first enabled result.

Keyboard model informed by [WAI combobox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
Context7 unavailable in this session; official platform guidance used. No new
third-party runtime dependency/API. CommandPalette behavior/API unchanged.

Global shortcut belongs to the consumer: catalog demonstrates Cmd/Ctrl K only
when no modal is open. Do not install duplicate global listeners per component
instance. No hardcoded product route or request in BEDS.

## Deliberate reference adaptations

- Two useful category examples + All, not every unrelated screenshot category.
- Quiet monochrome active row; no green CTA, decorative numbering or misleading
  key hints. All displayed keyboard hints work.
- No delete/link sub-actions; single selection keeps the search lightweight and
  avoids nested controls inside options. Complex row actions need a grid contract.
- Visible close control at all widths. Input16px; narrow filters/close44px.
- Opaque surface is intentional overlay policy; transparent-card policy does
  not apply to a floating search dialog.
- All data fictional. Results open a local explanatory dialog only.

## Scoped Better review / evidence

Canonical local.12 candidate. All seven Better entrypoints + relevant references
loaded before implementation. ui-skills craft discovery inspected; removed
make-interfaces-feel-better not reintroduced. Shared BEDS rules take precedence
over generic visual recipes. No delegated or independent reviewer.

| Domain | Evidence / result |
|---|---|
| Accessibility | Keyboard entry/filter/selection/Escape/return, disabled skip, modal Tab loop, IME guard, stable status and AX tree inspected; no unnamed controls found in search scope |
| Layout |320/390/938/1440px, light/dark, complete long strings,200% CSS-zoom/RTL stress; corrected viewport containment before handoff |
| Writing | PT-BR labels match actions; errors explain retry and preserved input; no real data/history/network promise |
| Typography |16/24px input,14/21px result,12/18px secondary; all wrap; input label persists; no truncated result title |
| Colors | Rendered WCAG text ratios4.65+ light/4.73+ dark; input focus4.39 light/8.30 dark; opaque surface/selected row measured separately; no token change |
| UI polish | Neutral active row,36px identity, shared gaps and opaque radius20 shell; dark/light/mobile/RTL captures inspected; no new animation |

| Severity | Domain | Location | Before | After / why |
|---|---|---|---|---|
| High, resolved | Layout | `packages/beds/src/overlays.css:68` |Viewport units doubled modal beyond screen at CSS zoom2 |Percentage-based fixed viewport containing block; bounded actual x/y/right/bottom at zoom2 |
| Low, resolved | UI | `packages/beds/src/overlays.css:93` |16px workspace avatar nested in36px tile |Fixed SearchDialog36px identity context,13px initials; avoid tiny double-frame mark |

Verification:

- `npm run verify`: build, package/catalog typechecks,87-component/90-token
  library guard, documentation/consumer guards,31 tooling/routing tests and
  extracted public-artifact import smoke passed.
- `node packages/beds/scripts/check-consumer.mjs apps/web/labs/espaco-library/SearchDialogPage.tsx`:
  one example root, zero violations.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- search-dialog.spec.ts --reporter=line`:
  six checks, desktop/mobile; all scenarios above. Initial Home-caret assertion
  assumed Windows behavior on macOS; replaced with actual native-left editing
  plus non-cancelled Home event. No native text-editing key intercepted.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- controls.spec.ts --grep 'Command search' --reporter=line`:
  four existing CommandPalette checks passed, both projects/themes.
- Browser runtime errors: zero during responsive checks. Evidence in catalog
  `evidence/search-dialog/` (named theme/viewport/project + zoom/RTL captures).
- Final build/artifact parity rerun after documentation and polish.

Not verified: physical iOS/Android keyboard, Safari/Firefox, real screen reader,
APCA, real search/indexing/latency, independent reviewer and owner aesthetic
acceptance. Chromium AX inspection is not a screen-reader pass or WCAG certificate.
No unresolved HIGH found in inspected scope; engineering checks completed;
Governance acceptance remains PENDING independent/owner visual review.

No commit/push/release or consumer installation implied. Existing playground
on5292 remains pinned to local.11; this addition is isolated in BEDS/catalog.
