# Document editor, rating and board drag (0.3.0-rc.4)

Use when: you show a document beside a per-section editor, ask for a private rating with one feedback action, let people drag cards between stages, or need a toggle chip, a quiet status link or a struck list price.
Do not use when: you need product rules. The document model, which sections exist, saving, revisions, rating storage, allowed moves and prices stay in the app.
Read next: [Adopting](ADOPTING.md) · [RC3 patterns](RC3-PATTERNS.md) · [Components](COMPONENTS.md#parity-patterns-030-rc4--14).

These patterns come from the reference app's current screens (its per-section editor, feedback strip, document workspace and board drag). They were checked against its CSS and against side-by-side screenshots at 1440 and 390, light and dark: same spacing, radii, type, tokens and motion.

Sourcing:
- No beUI slug matched these anatomies on 2026-10-21.
- Drag and drop runs on `@dnd-kit/core`, the library the reference app uses. The sensors, collision rules, drop slot, overlay and announcements are BEDS-owned ports of the reference app's code.

Lab views (synthetic data): `?view=document-editor` (`&open=skills|experience`, `&state=preparing|readonly`, `&pane=side`), `?view=kanban`, `?view=editing`, `?view=commerce`.

## Document workspace

- **`DocumentWorkspace`**
  - Anatomy: a square stage (1px border, no top border, `--es-doc-stage` tint) with the toolbar on top and its own scroll region; a 24px gap holding the resize handle; the side pane (42% by default, 320px minimum, scrolls on its own); a footer strip under both with 12px above it.
  - Resize: drag the handle or use ←/→ (2% steps), Home (35%) and End (60%) on it. It shows only on hover, focus or while dragging.
  - Below a 960px frame (a container query, so a collapsed sidebar counts) the panes become one 40px tab pill (`documentLabel` / `sideLabel`), full width up to 420px and edge to edge below 720px. The footer stays reachable from both tabs.
  - Without `side` the stage takes the frame and no tabs show.
  - Height comes from the host: give the workspace a bounded parent (for example `100dvh` minus the header).
- **`DocumentToolbar`**: 56px minimum, 10px 16px padding, hairline under it. Status first (a `VersionNote`), then ghost compact actions, then the one decision. `notes` take a full line in 12/18 secondary.
- **`DocumentSheet`**: light paper (`--es-paper`, `--es-paper-ink`) in both themes, because the page must match its file. Only the stage is themed. One soft elevation (`--es-sheet-shadow`), 720px max, rises 8px into place.
- **`RevisionList`**: newest first, hairlines between rows. Each row has a title, a state with a dot (`review` brand ink, `current` success, others neutral), the date line, an optional request clamped to two lines, a summary list, then "open" or "on screen". Opening only previews; restore and apply stay on the toolbar.

## Per-section editor

- **`EditorPane`**: 20px 24px block padding, 12px between cards. Heading 500 20/28, which takes focus when a host sends the person back to the sections. `meta` is the fit line (13/20 secondary, tabular numbers, e.g. a page count). `intro` holds a `VersionNote`.
- **Cards** are `EditableSection`s. Inside an `EditorPane` they take the pane density: 18px 20px 20px padding (16/16/18 when the pane is 420px or narrower), 16px titles and a 40px open target. `index` makes them rise in one after another (320ms, 28ms apart, the first eight).
- **One card open at a time**: the host keeps the open id. Asking for another card while the open one is dirty opens a `Dialog` ("Descartar as alterações?" with "Continuar editando" and a destructive "Descartar alterações"). Escape inside the card does the same.
- **Footer**: `EditFooter layout="stacked"`: optional rows (a save error `Notice`, an "also save to…" `Checkbox` shown only when the save adds new items), the note, then Cancelar (ghost) + Salvar alterações (primary, disabled until dirty, busy while saving). It sticks to the pane's bottom while the card is taller than the pane.
- **Empty section**: `AddSectionTile` in its own place ("Vazio: não aparece no …" + Adicionar). Pane density applies.
- **`BulletFields`**: a visible group label, one text area per bullet (64px minimum, their own names for assistive tech), a 24px quiet × with a 36px target 10px from the top, and a ghost compact "add" that focuses the new field. Removing focuses the previous field.
- **`ChipInput`**: `Chip`s with the quiet ×, entering and leaving with a soft scale, then a 44px field with a 40px Adicionar beside it (28px down, so it lines up with the input). Enter adds. A repeat (case-insensitive, `locale`) shows `duplicateMessage` in the field. Removing focuses the next chip's × or the field.
- **`EntryList`**: flat rows with hairlines between them. A closed row reads title (14/20) and meta (13/18). The open row shows its fields (two columns from a 520px pane; a `BulletFields` spans both), then ↑ ↓ and a destructive compact remove at the end. One entry opens by itself.
- **`VersionNote`**: one dotted line. `current` (brand dot, ink text) for "downloads use your edited version" with a ghost compact "back to the delivered version"; `review` (brand-ink dot) for a preview to check; `history` (neutral dot) for an older version on screen.
- **`PendingLine`**: the one-block "preparing" state, a live line with an 8px brand dot pulsing every 1.1s (static under reduced motion). When the work fails for a passing reason, show a warning `Notice` plus a compact outline retry; when it cannot work, an info `Notice` and keep the cards read-only.
- **Read-only lock**: while a preview waits, history is on screen or a save runs, cards stay readable with one info `Notice` saying why.

## Rating strip

- **`RatingStrip`**
  - Anatomy: 1px border, 16px radius, 12px 16px padding. The legend (500 14/20), five 32px star radios 2px apart (20px glyph; filled stars in `--es-brand-ink`), a secondary compact submit, and the trailing action at the end.
  - A star only selects. Submitting records the rating, because a receipt cannot be corrected afterwards.
  - Receipt: "sent" + a quiet score line takes focus once. At or below `lowThreshold` (3) it adds `lowNote` and `lowAction` (e.g. "Revisar seções").
  - `disabledReason` locks the stars (55% opacity) and shows the reason under them.
  - `trailing` is the one outlined md feedback button, never gated.
  - Narrow frames (720px or less): two short rows, question + stars spread across the first, the two buttons on the second (stars 28px).

## Board drag and drop

- **`KanbanBoard drag`** with `KanbanColumn id`, `KanbanCard` per card and a `KanbanDragHandle` inside it.
  - Pointer: a mouse drag starts after 8px; touch after a 250ms hold (5px tolerance). The whole card surface drags except its controls; mark a control that should still drag (the title button) with `data-kanban-grab`.
  - While a card is in the air, the source leaves the column flow and an empty slot of its height opens where it would land (by the pointer against the measured card midpoints). The lifted copy scales to 1.015 with `--es-drag-shadow`. Snap and edge fades pause. Other cards glide on a 280ms spring.
  - Drop: the overlay lands on the slot in 200ms. Dropping outside an allowed column cancels.
  - Keyboard: Space or Enter on the handle picks the card up; ↑/↓ choose the position; ←/→ jump to the next allowed column; Space or Enter drops; Escape cancels. No overlay scale under keyboard or reduced motion.
  - Announcements come from `messages` (instructions, picked, over "position N of column", outside, dropped, reordered, cancelled), plus a polite line for the slot.
  - `canDrop(cardId, columnId)` limits other columns; the own column always accepts a reorder. `onDrop({ cardId, from, to, index, method })` applies it. A returned promise locks every handle until it settles, and a keyboard drop puts focus back on the card's handle.
  - Host-owned: stored order, which moves are allowed, the move request, celebration and undo.

## Small pieces

- **`Chip pressed`** + `onPressedChange`: one `aria-pressed` button. Pressed is the filled chip with a neutral 14px tick; not pressed is dashed and quiet (secondary text, heading on hover). Press scales to .97.
- **`LinkButton purpose="quiet" dot`**: secondary 500 13/20 with a soft underline 4px below, heading and a full underline on hover, and a 6px brand dot before the label, for "N items missing". `TextLink` takes `purpose="quiet"` too.
- **`StruckPrice`**: the list price struck before the price that applies, sized by its line (450 weight, secondary, 1px line), fading in once. `aria-hidden` unless you pass `accessibleLabel`; show it only after the server accepts the discount. `PricingCard` takes it as `price.listLabel`.
- **Quiet hover fades**: section cards ease their border (200ms), the "Editar" cue fades in (150ms), and the add tile, quiet ×, entry rows and quiet links ease their color (150ms), all through Tailwind utilities and off under reduced motion. See the [motion contract](STATES.md#motion-contract).
