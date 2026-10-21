# Adopting BEDS 0.3.0-rc.4

Use when: an app moves from beds 0.2.x or 0.3.0-rc.1–rc.3 to rc.4, or adopts BEDS from scratch and should look like the reference app.
Do not use when: you are changing BEDS itself. Read [Governance](GOVERNANCE.md) for that.
Read next: [Agent quickstart](AGENT-QUICKSTART.md) · [Foundations](FOUNDATIONS.md) · [RC3 patterns](RC3-PATTERNS.md) · [RC4 patterns](RC4-PATTERNS.md).

## 1. Install

BEDS is not on the npm registry, because the `beds` name there belongs to a third party. Pin the GitHub prerelease asset:

```json
"beds": "https://github.com/meunomeebero/beds/releases/download/v0.3.0-rc.4/beds-0.3.0-rc.4.tgz"
```

You can also vendor the asset with `"beds": "file:vendor/beds-0.3.0-rc.4.tgz"`. Check its SHA-256 against the release notes. Peer dependencies are `react`/`react-dom` 19 and TypeScript 5.9 or later. After install, read `node_modules/beds/dist/manifest.json` for the exact props. Do not guess them.

## 2. Theme and tokens

```tsx
import 'beds/styles.css';
import { DesignSystemProvider, Toaster } from 'beds';

<DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor="#…">
  <App />
  <Toaster />
</DesignSystemProvider>
```

- **`brandColor` is required.** Pick one contrast color from the feeling the product should give, and record the reason in the app's `AGENTS.md`. See [Contrast color](FOUNDATIONS.md#contrast-color--mandatory-choice). Everything branded comes from it: `--es-brand`, `--es-brand-ink`, the gain segments, chip tints, prompt tiles and confetti.
- **Themes.** Use `theme` for `'light' | 'dark'`; both themes come from the same tokens. Wrap every BEDS subtree, including landing demos, in a provider. Toasts, confetti and modals render inside it, where the tokens live.
- **Field borders.** `fieldBorder` defaults to `soft`. Pass `strong` only when the product needs the 3:1 field outline.
- **Do not override BEDS internals.** Never override `.es-*` selectors or redefine `--es-*`. Read tokens in your own CSS, for example `color: var(--es-secondary)`. Page layout, widths and breakpoints belong to the app.

## 3. Breaking changes since 0.2.x

From 0.3.0-rc.1, the visual defaults changed but the APIs still compile:
- **`Button`** is the pill: md 40px (44px on touch), `compact` 32px. `secondary` is the default, and `destructive` is an error outline. `purpose` is deprecated.
- **`ExpandingButton`** renders the outline pill with an arrow. `context` is ignored.
- **Text entry** uses soft borders and a soft 2px focus ring. `TextField`, `TextAreaField` and `DateField` default to `purpose="field"` (the 44px pill). Dense settings pass `purpose="settings"`.
- **`Select`** defaults to `variant="input"` with a visible label. Pass `hideLabel` beside an existing label; toolbars use `variant="compact"`.
- **`SegmentedControl` and every `Tabs` variant** render one 40px tab pill. The underline strip and `joined` are gone visually.
- **Smaller changes:** `EmptyState`, `NavItem` (36px rows), `PageHeader` (30/36 H1), `PricingCard` actions and toast actions.

From 0.3.0-rc.2:
- **Modal motion.** `Dialog`/`Drawer` `motionPreset` defaults to `elastic`. Replace `motionPreset="default"` with `"quiet"`, and pass `quiet` only where a modal must keep the 0.2 fade.
- **Other changes:** `TextAreaField` grows with its content, `EmptyStateCard` uses the outline action, `Breadcrumbs` use the beUI anatomy, and `Notice` dismiss is 32px.

0.3.0-rc.3 is additive:
- 22 new components and 20 tokens.
- `CodeSnippet` gains `variant="pill"` and `hideLabel`.
- No default changed.

### From rc.3 to rc.4

Additive. Nothing to change unless you adopt the new pieces:
- **New dependency:** `@dnd-kit/core` (MIT) comes with the package. Only the board drag code imports it; tree-shaking bundlers leave it out when you do not use `KanbanBoard`.
- **14 new components:** `DocumentWorkspace`, `DocumentToolbar`, `DocumentSheet`, `RevisionList`, `EditorPane`, `VersionNote`, `PendingLine`, `BulletFields`, `ChipInput`, `EntryList`, `RatingStrip`, `KanbanCard`, `KanbanDragHandle`, `StruckPrice`.
- **New props:** `KanbanBoard drag` and `KanbanColumn id`; `EditableSection index`; `EditFooter layout="stacked"` + `children`; `Chip pressed` + `onPressedChange`; `LinkButton dot` and `purpose="quiet"` (also on `TextLink`); `PricingCard price.listLabel` + `listAccessibleLabel`; `Icon name="ArrowDown"`.
- **6 tokens:** `--es-drag-shadow`, `--es-version-dot`, `--es-doc-stage`, `--es-paper`, `--es-paper-ink`, `--es-sheet-shadow`.
- **Visual changes you may notice:** section cards ease their border (200ms) and fade their "Editar" cue (150ms) on hover, and the add tile eases its tint; before, these changes were instant. An `EditableSection` inside an `EditorPane` uses the pane density (18/20px padding, 16px title) instead of the page density.
- **Board drag replaces your own:** if your app ran its own drag on top of `KanbanBoard`, remove it before passing `drag`. Keep your stored order and move request in `onDrop`.

## 4. Component map

Replace local ports and 0.2 usages screen by screen. Check each screen in light and dark, at 1440 and 390 width, before you delete the old code.

| Old (0.2 API or a local app port) | New (rc.3) |
|---|---|
| `Button purpose=…`, local beUI button port | `Button variant="primary" \| "secondary" \| "ghost" \| "outline"` + `compact` |
| Local beUI input/field port, coupon input with an inner button | `TextField purpose="field"` (+ `action`), `CouponField` for the full coupon flow |
| Local sliding-choices / tab pill port | `Tabs` or `SegmentedControl` (one pill) |
| `motionPreset="default"` | `motionPreset="quiet"` (or the `elastic` default) |
| Local segmented "XP" meter | `ScoreMeter` (`MeterSegments` stays for plain progress) |
| Local before/after score board, count-up | `ScoreComparison` (`gain` only for a celebrated win) |
| Local confetti rain | `ConfettiBurst` |
| Local drawn success mark | `SuccessMark` |
| Local next-step / offer side card | `NextStepCard` |
| Local "what changed" card | `ChangeSummary` |
| Local "what went in / left out" note | `SelectionNote` |
| Local dashed confirm chips | `ChipChecklist` |
| Local yes/no question rows | `BinaryQuestionList` |
| Local board columns, `ApplicationBoard`-style recipe | `KanbanBoard` + `KanbanColumn` (cards stay yours) |
| Local board drag (`@dnd-kit` in the app: handle, drop slot, overlay, keyboard drag) | `KanbanBoard drag` + `KanbanColumn id` + `KanbanCard` + `KanbanDragHandle` in the card |
| Local edit-mode bar, section cards, sticky footer, empty tile | `EditModeBar`, `EditableSection`, `EditFooter`, `AddSectionTile` |
| Local gaps checklist or reading-progress list | `StepList purpose="checklist" \| "progress"` |
| Local keep/replace versions list | `VersionCompare` |
| Local nudge or repair prompt with a tinted tile | `PromptCard` |
| Local same-price / upgrade hint | `InlineSuggestion` |
| Local struck list price before a total | `StruckPrice` (or `PricingCard price.listLabel`) |
| Local toggle chips in a review (`aria-pressed`) | `Chip pressed onPressedChange` |
| Local "N items missing" link with a dot | `LinkButton purpose="quiet" dot` |
| Local analytics / consent banner | `ConsentNotice` |
| Local copy pill for an endpoint | `CodeSnippet variant="pill"` |
| Local numbered setup list | `InstructionSteps` |
| Celebration / undo / stale-warning toasts | `toast({ id, tone, action })` + `dismissToast(id)` |

**Document editor** (rc.4):

| Old (local app code) | New (rc.4) |
|---|---|
| Workspace frame: document stage, side pane, resize separator, footer, phone tabs | `DocumentWorkspace` (`toolbar`, `document`, `side`, `footer`, `notices`, `pane`/`onPaneChange`) |
| Document toolbar with a status dot and actions | `DocumentToolbar` + `VersionNote tone="review" \| "history"` |
| Letter or text page on the stage | `DocumentSheet` (a PDF viewer stays yours, inside `document`) |
| History drawer list | `Drawer` + `RevisionList` |
| Side-pane heading, page-count line, "back to the delivered version" row | `EditorPane` (`meta`, `intro`) + `VersionNote tone="current"` with a ghost compact `Button` |
| Section card (closed preview, open form, cue) | `EditableSection` inside `EditorPane` (+ `index` for the staggered rise) |
| Card footer: save error, "save to profile too", note, Cancelar / Salvar | `EditFooter layout="stacked"` with `Notice` and `Checkbox` as children |
| Empty section tile | `AddSectionTile` |
| Bullet fields with × | `BulletFields` |
| Skills chips + "Novo item" + Adicionar | `ChipInput` |
| Experience / education / language rows with ↑ ↓ | `EntryList` (+ `BulletFields` in `fields`) |
| "Splitting into sections" line, retry, read-only notice | `PendingLine`, `Notice` + compact outline `Button` |
| Discard-changes confirmation | `Dialog` with a destructive action |

**Feedback** (rc.4):

| Old (local app code) | New (rc.4) |
|---|---|
| Star rating form + "Enviar avaliação" | `RatingStrip` (`legend`, `starLabel`, `submitLabel`, `onSubmit`, `pending`, `disabledReason`) |
| Receipt line, low-score note and "Revisar seções" | `RatingStrip receipt`, `scoreLabel`, `lowThreshold`, `lowNote`, `lowAction` |
| The one outlined "Envie feedback" | `RatingStrip trailing={<Button variant="outline" … />}` (your form opens from it) |
| Two-row phone layout | Built in (container query at 720px) |

These stay in the app:
- sound,
- stored card order and which moves are allowed (BEDS ships the drag gesture since rc.4),
- the document model, saving, revisions and the PDF viewer,
- rating storage and the feedback form,
- once-per-item celebration memory,
- undo windows,
- prices and coupon validation,
- what counts as a win.

Lab views show every pattern with synthetic data:
- `?view=result-patterns`
- `?view=kanban`
- `?view=editing`
- `?view=commerce`
- `?view=document-editor`

## 5. Follow these principles

These are distilled from the reference app and enforced in review:

1. **One tab pill.** Each surface has one tab or segmented pill (40px track). Never stack two tab rows, and never use underline tabs.
2. **Small buttons.** Use md 40px or `compact` 32px pills. In-card and secondary actions use `compact`. Full-width buttons only in a `NextStepCard` or on phones. The focal CTA is the outline pill with an arrow; no brand-filled buttons.
3. **Aligned edges.** Text, cards and controls share one left edge. A ghost button that starts a row gets −12px of optical alignment. Hit areas bleed outward with negative margins; the content edge never moves.
4. **No clutter icons.** No pencil or trash per row and no decorative icon tiles. A glyph appears only when it carries meaning (status, link, copy). The one tinted tile on a screen is a `PromptCard`.
5. **In-place editing.** One `Editar` mode per page (`EditModeBar`). Sections open where they are (`EditableSection`), and decisions sit in the sticky footer. Never open a drawer for a single field. Chips show their × only while editing.
6. **Truthful states.** No pair, no number. Unavailable data says so. Credits and refunds are shown from persisted state. Every tap answers in one polite status line. See [Truthful states](FOUNDATIONS.md#truthful-states-and-celebration).
7. **Celebration only on real wins.** Brand "+N", brand segments, confetti and sound only for a measured win the product defines, a reached goal or an accepted offer. Never celebrate on load, on undo or for small gains. Negative outcomes are calm and neutral, and can be undone.
8. **The brand color means one thing per screen.** On a result it is what the product added. Lists, presence and reasons stay neutral.
9. **No recommended or popular badges.** On offers, `Badge` is for status, not persuasion.

## 6. Verify the upgrade

- Run the app build and typecheck.
- Run BEDS's consumer guard on the app's roots: `node node_modules/beds/scripts/check-consumer.mjs <paths>`.
- Run the app's own browser checks for the screens you migrated.
- To roll back, pin the previous release URL and integrity, then reinstall. Never mutate an old release.
