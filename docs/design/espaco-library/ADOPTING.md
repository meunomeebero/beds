# Adopting BEDS 0.3.0-rc.3

Use when: an app moves from beds 0.2.x or 0.3.0-rc.1/rc.2 to rc.3, or adopts BEDS from scratch and should look like the reference app.
Do not use when: you are changing BEDS itself. Read [Governance](GOVERNANCE.md) for that.
Read next: [Agent quickstart](AGENT-QUICKSTART.md) · [Foundations](FOUNDATIONS.md) · [RC3 patterns](RC3-PATTERNS.md).

## 1. Install

BEDS is not on the npm registry, because the `beds` name there belongs to a third party. Pin the GitHub prerelease asset:

```json
"beds": "https://github.com/meunomeebero/beds/releases/download/v0.3.0-rc.3/beds-0.3.0-rc.3.tgz"
```

You can also vendor the asset with `"beds": "file:vendor/beds-0.3.0-rc.3.tgz"`. Check its SHA-256 against the release notes. Peer dependencies are `react`/`react-dom` 19 and TypeScript 5.9 or later. After install, read `node_modules/beds/dist/manifest.json` for the exact props. Do not guess them.

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
| Local edit-mode bar, section cards, sticky footer, empty tile | `EditModeBar`, `EditableSection`, `EditFooter`, `AddSectionTile` |
| Local gaps checklist or reading-progress list | `StepList purpose="checklist" \| "progress"` |
| Local keep/replace versions list | `VersionCompare` |
| Local nudge or repair prompt with a tinted tile | `PromptCard` |
| Local same-price / upgrade hint | `InlineSuggestion` |
| Local analytics / consent banner | `ConsentNotice` |
| Local copy pill for an endpoint | `CodeSnippet variant="pill"` |
| Local numbered setup list | `InstructionSteps` |
| Celebration / undo / stale-warning toasts | `toast({ id, tone, action })` + `dismissToast(id)` |

These stay in the app:
- sound,
- drag and drop,
- once-per-item celebration memory,
- undo windows,
- prices and coupon validation,
- what counts as a win.

Lab views show every pattern with synthetic data:
- `?view=result-patterns`
- `?view=kanban`
- `?view=editing`
- `?view=commerce`

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
