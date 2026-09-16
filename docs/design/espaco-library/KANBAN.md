# Application kanban

Scope: public `ApplicationBoard`; opt-in `ApplicationCard purpose="kanban"`.
Local.24 source addition; catalog `?view=kanban&theme=light` or `theme=dark`.
No Curriculol runtime, persistence, requests, release or consumer upgrade.

## Reference and adaptation

Owner screenshot `codex-clipboard-29e5faaf-9668-40e2-aeac-4c4d70bd49f6.png`:
compact cards, quiet status lanes, title-led hierarchy, metadata and raised
drag preview. **A adaptation**, not measured source CSS. Keep readable upright
cards; do not imply drag through a resting rotation or grab cursor. Drag/drop
and reorder are **not implemented**. Existing document folio retains its
established small tilt; no new motion, assets, dependencies or tokens.

Shared card identity, score semantics, notes, artifacts and callbacks remain
owned by [ApplicationCard](APPLICATION-CARD.md). No duplicate score logic.
Host chooses summary fields; details must recover omitted data. Catalog keeps
salary, keywords and provenance in the existing Drawer. Default cards unchanged.

## Public API

| Input | Contract |
|---|---|
| `label` | Accessible board name; region focusable only while horizontally overflowing |
| `columns` | Ordered `ApplicationBoardColumn[]`: unique `id`, visible `label`, optional semantic `tone/emptyLabel`, `items` |
| `items` | `ApplicationBoardItem[]`: globally unique stable `id`; existing card props except purpose/status/statusOptions/onStatusChange; column owns status |
| `moveTo` | Per-item explicit destination IDs; omitted/empty = read-only; missing IDs ignored, current column never offered |
| `onMove(itemId,columnId)` | Optional controlled request; host validates transitions and updates columns; callback does not send, generate or persist anything |
| `announcement` | Host-confirmed update or recovery copy; stable polite live region; no synthetic success inferred |
| `emptyLabel` | Default `Nenhuma vaga nesta etapa`; per-column override for context |

Counts derive from actual items. Columns use labelled sections and h2 headings;
cards use h3 + native actions inside ul/li, not an ARIA grid. Status meaning
always has visible text; color is supplementary. Reading and Tab order agree.
Desktop overflow stays inside a positioned board viewport; narrow screens stack
columns in source order. No nested vertical scroll, hidden cards or fixed height.

```tsx
<ApplicationBoard label="Vagas por status" columns={[
  { id: 'saved', label: 'Salvas', items: [{
    id: 'vaga-1', title: 'Product designer', company: 'Norte',
    moveTo: ['sent'], onOpen: openDetails,
  }] },
  { id: 'sent', label: 'Enviadas', items: [] },
]} onMove={requestStatusChange} announcement={feedback} />
```

Host must keep item IDs stable, unique and in one column only. No hidden status
mapping. Async requests: preserve previous data until confirmed, report recovery
visibly and in `announcement`, restrict repeated transitions while pending.
No whole-board loading/error policy inside this presentation component; compose
existing LoadingIndicator/Notice before supplying settled data.

## Flow and states

| Entry → transition | Result / recovery |
|---|---|
| Card title / Ver detalhes → Drawer | Complete synthetic context; Escape restores the activating control |
| Options menu → allowed destination | Caller changes columns; count follows actual items; focus follows moved card; host announces confirmation |
| Host rejects move | Original column/count retained; no success announcement; menu remains usable |
| Read-only / preparing | No move control; no fabricated workflow transition |
| Empty column / empty board | Visible heading, zero count and meaningful empty text |
| Unknown score / preparing score | Text only, never a misleading zero or filled meter |
| Reload preview | Restores fixtures; no persistence claim |

Catalog fixtures use Salvas/Em preparação/Prontas para enviar/Enviadas, not a
new production enum. Manual marking does not imply email delivery. No job data,
personal data, real documents or external calls used.

## Better review — September15

Scope: shared compact purpose, board, local demo; React19, BEDS fixed CSS.
All seven Better entrypoints + focused keyboard, semantics, grouping/adaptivity
references; frontend-design used within Foundations, no palette replacement.

| Domain | Evidence / result |
|---|---|
| Accessibility | Native controls, labelled regions/lists, menu keyboard model, focused move/return, no misleading draggable role; scoped browser checks |
| Layout | Same existing card, compact summary, full detail recovery; four status columns → stacked mobile; only board scrolls |
| Writing | PT-BR sentence case, explicit movement vs sending, singular/plural counts, contextual empty/recovery text |
| Typography | Inter14/20 title,12/18 secondary copy; full wrapping title; tabular counts/scores; no title clamp |
| Color | Semantic canvas/subtle/text/secondary; brand only in existing meter; measured text contrast in both themes |
| UI | R14/p16 compact card, r20/p8 lanes, small folio, quiet shadow;44px narrow menu/document/detail controls |

Fixed during review: absolute screen-reader count text escaped the horizontal
scroller and widened the document. Positioned viewport now contains it; regression
asserts document and card bounds. No assertion removed to mask the failure.

Self-review result and actual gates recorded in [Validation](VALIDATION.md).
Independent review and design-owner aesthetic acceptance pending. Chromium
emulation/CSS zoom are not native screen-reader, physical touch, Safari/Firefox
or actual browser-zoom certification. No overall WCAG conformance claim.

Evidence:
[desktop light](../../../apps/web/labs/espaco-library/evidence/kanban/desktop-light-1440.png),
[desktop dark](../../../apps/web/labs/espaco-library/evidence/kanban/desktop-dark-1440.png),
[320px light](../../../apps/web/labs/espaco-library/evidence/kanban/mobile-light-320.png),
[320px dark](../../../apps/web/labs/espaco-library/evidence/kanban/mobile-dark-320.png),
[zoom/RTL](../../../apps/web/labs/espaco-library/evidence/kanban/mobile-zoom-rtl.png).
[Example](../../../apps/web/labs/espaco-library/KanbanPage.tsx),
[regression spec](../../../apps/web/labs/espaco-library/kanban.spec.ts).
