# Result, board, editing and commerce patterns (0.3.0-rc.3)

Use when: you show a measured before/after result, a stage board, a single in-place edit mode, quick confirmations, a coupon, a consent notice or setup steps.
Do not use when: you need product rules. Thresholds, what counts as a win, prices, undo windows and stage policies stay in the app.
Read next: [Adopting](ADOPTING.md) · [Foundations](FOUNDATIONS.md#truthful-states-and-celebration) · [Components](COMPONENTS.md#parity-patterns-030-rc3--22).

These patterns come from the reference app's current screens. They were checked pixel by pixel against its CSS: same spacing, radii, type, tokens and motion, and light and dark themes come from the same tokens.

Sourcing:
- No beUI slug matched these anatomies on 2026-10-21. The closest were `radio-group` for the chips and `animated-toast-stack`, which BEDS already ships.
- The components are BEDS-owned ports of the reference app's own code. No third-party source is used.

Lab views (synthetic data):
- `?view=result-patterns`
- `?view=kanban`
- `?view=editing`
- `?view=commerce`

## Results

- **`ScoreComparison`**
  - What it shows: the score board. The current reading counts from 0 over 1.3s after a 0.25s delay. Then the before row and the now row fill segment by segment, and the band line fades in.
  - Celebration: pass `gain` only for a measured win the product celebrates. That turns on the 44px brand-ink "+N" and the brand segments. A small gain, a tie or a drop stays neutral.
  - Missing data: when `value` or `before` is `null`, the board draws no number. Only `status` renders, for example "the credit came back".
  - `criteria`: per-criterion pairs measured the same way as the score. Show all of them or none.
  - Celebration hook: `onGainShown` fires once when the "+N" appears. The host can play `ConfettiBurst` or a sound from it.
  - Accessibility: the board says one sentence through `accessibleSummary`. The visual parts are `aria-hidden`.
- **`ScoreMeter`**
  - Anatomy: 28 segments, 12px tall with 3px gaps. `compact` is 8px with 2px gaps. Segment radius is 2px.
  - `tone="compare"`: the measured part in `--es-meter-base` and the gain in `--es-brand`.
  - `tone="level"`: one reading tinted by the caller's `level`. `palette="calm"` shows green only for strong. `palette="traffic"` shows green, amber or red.
  - It is decorative. The row beside it states the value.
- **`ConfettiBurst`**: 90 seeded pieces in 10×5 or 6×10px, falling for 2.1–3.5s. Each new non-zero `burst` value plays it once. It is fixed over the viewport, or inside the parent with `contained`. It is absent under reduced motion. It is silent: the host owns any sound.
- **`NextStepCard`**
  - Anatomy: title at 18px, then the actions stacked full width (40px, 44px on touch), then an optional centered note.
  - Order: put the action you recommend first. When the honest advice is the free path, it is the `primary` and the paid one is secondary, with the cost in `note`.
  - `emphasis`: adds a brand hairline, a 4px brand ring and one 4px nudge. Use it once the page's main task is done.
- **`ChangeSummary`**: what changed. Groups of neutral outline chips, each with an optional quiet link, then plain lines and a closing note, split by hairlines. It never uses the brand color. It renders nothing when empty.
- **`SelectionNote`**: which of the person's own items went in, were left out or were shortened. Each row has a quiet reason tag (`--es-tint-quiet`). It ends with a reassurance line.
- **`ChipChecklist`**
  - Anatomy: a card of pressable chips, 36px tall (44px on touch). They are dashed until chosen, then get a solid brand hairline and tint with a check.
  - `locked`: already true elsewhere, so it shows checked and cannot be removed.
  - `frozen`: every chip waits while a dependent action runs.
  - Each tap is the answer; there is no submit. `status` gives one line for saving, saved or error, with an optional action.
- **`BinaryQuestionList`**: up to a few yes/no rows in one card. Each answer saves on tap. Yes takes the brand tint. No stays neutral (`--es-hover`). It shares the status line with `ChipChecklist`.

## Board

- **`KanbanBoard`**
  - Columns are fixed at 360px (320px on phones) and keep scrolling sideways on every width. They never stack.
  - Inline scroll snap. The edge that has more content fades over 56px.
  - With the board focused, Arrow keys move one column and Home/End jump to the ends.
- **`KanbanColumn`**
  - Anatomy: a bordered, transparent 20px panel with 16px padding. The heading is 16/20 with a 24px count pill. Cards sit 8px apart.
  - Empty state: an empty line in 13/20 secondary text.
  - `headingId` lets the host send focus back to the heading after a card leaves.
- **What the host owns**: moves, celebrations and undo. Since 0.3.0-rc.4 BEDS ships the drag gesture (`KanbanBoard drag`, see [RC4 patterns](RC4-PATTERNS.md#board-drag-and-drop)); applying a move stays the host's.
- **The rule**: celebrate only confirmed real wins, never on load or on undo. Keep a closed or negative outcome calm. Offer one undo toast at a time with a fixed id, and call `dismissToast` on the next confirmed move. Answer a stale undo with a warning toast.

## Editing — one mode, in place

- **`EditModeBar`**: a sticky pill with a brand dot, the mode label and one done action. It takes focus when the mode starts.
- **`EditableSection`**
  - Closed: a 20px card with a 44px title target. A hover or focus cue says "Edit", and clicking anywhere on the card opens it.
  - Open: the border firms and the body eases open over 0.26s.
  - `footer`: the sticky decision footer. Use **`EditFooter`** for its note and actions.
- **`AddSectionTile`**: a dashed tile for an empty section.
- **`StepList`**
  - Marks: 18px rings that turn into a filled brand disc with a check.
  - `purpose="checklist"`: one question at a time. The current row opens `currentContent`, and pending rows can be picked.
  - `purpose="progress"`: the steps of a long task, with `aria-current="step"`.
- **`VersionCompare`**: a `dl` for keeping or replacing a value. States are `stays` (heading), `unused` (secondary) and `goes` (struck through with `--es-strike`).
- **`PromptCard`**: a 40px tile tinted with `--es-tile-brand`, then the title, the body and the actions. It collapses away when `open` becomes false. It is the one accent on the screen.
- **`SuccessMark`**: a drawn circle, then a check, for a completed outcome. It is 56px, or 28px with `compact`. It is decorative.

## Commerce, consent and setup

- **`CouponField`**: the phases are `closed`, `open`, `applied` and `kept`.
  - `closed`: a ghost toggle.
  - `open`: its own form, a 44px pill field and an inner Apply pill. Enter applies the code and never submits an outer form.
  - `applied` / `kept`: a 44px tinted row with Remove.
  - The caller owns validation and copy through `labels`.
  - Focus follows the phase: input, then the applied line, then the toggle.
- **`InlineSuggestion`**: a hint plus one secondary compact action, for example "same price, more units". It never acts by itself.
- **`ConsentNotice`**: a first-run usage-data disclosure.
  - `placement="floating"`: bottom-start, 360px.
  - `placement="inline"`: static, for phones where it would cover a buy button.
  - Actions: a ghost Decline and a secondary Accept.
- **`InstructionSteps`**: numbered setup steps. Each step can embed content such as a `CodeSnippet variant="pill"`, and an optional note can follow.
- **`CodeSnippet variant="pill"`**: a rounded pill with a link glyph, 13px text (not mono) and a 40px `--es-control` copy button. `hideLabel` keeps the label for assistive tech only.

Settings opt-outs stay `SettingsGroup` + `Switch`, with saving, saved and failed toasts that reuse one id.
