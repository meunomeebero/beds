# F2 migration tracking

Tracker for the BEDS Fase 2 migration: overlays, feedback, navigation, data components and typography motion from the free beUI registry.

## How to use this file

- Mark a row `[x]` only after the component is pasted, adapted to BEDS proportions, committed, and the full playground gate passes.
- `implemented; gate pending` means code/spec/docs exist but the integrated build and browser gate are still outstanding; it is not done.
- If a component is blocked, fill the `Blocked` column with the reason and do **not** mark it done.
- When credits/session ends, commit this file with the current date so the next agent knows the restart point.

## Available beUI free slugs (verified 2026-09-18)

`center-morph-modal`, `morphing-modal`, `drawer`, `bottom-sheet`, `tooltip`, `context-menu`, `popover`, `select`, `loader`, `dock`, `command-palette`, `table`, `number`, `number-ticker`, `animated-toast-stack`, `animated-badge`, `bouncy-accordion`, `text-animation`.

## Component migration checklist

| # | BEDS target | beUI slug | Internal deps needed | Status | Commit | Notes |
|---|---|---|---|---|---|---|
| 1 | `Dock` / `DockItem` / `DockSeparator` | `dock` | `SPRING_LAYOUT` | ✅ done | rc.19 | `size` removed from public API; 44px fixed |
| 2 | `NumberTicker` | `number-ticker` | `EASE_OUT` | ✅ done | rc.19 | `className`/`digitClassName` removed from public API |
| 3 | `Tooltip` | `tooltip` | `use-dismiss`, `use-hover-gesture`, `use-tap-gesture`, `TooltipSurface`, `lib/touch` | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES: focused and integrated checks pass; the historical mobile flake was not reproduced. Physical AT, non-Chromium and aesthetics remain pending |
| 4 | `Dialog` | `center-morph-modal` (visual subset); `morphing-modal` (full source) | `lib/modal`, reduced-motion store, `lib/ease` | PASS_WITH_NOTES | `BER-35` | BER35 adapts only the center-morph clip/opacity visual subset onto the existing controlled native `<dialog>` and preserves focus, inert, scroll-lock, Escape/backdrop, trigger-removal, nested and lag/reject semantics. Full `morphing-modal` remains `NO_FIT`: its lifecycle/API/geometry would replace BEDS native semantics. Focused `dialog-beui.spec.ts` is 6/6 desktop + 6/6 mobile, including live reduced-motion switching and close→reopen interruption; existing Dialog control coverage is 10/10 desktop + 10/10 mobile. Non-Chromium, physical AT and aesthetic approval remain pending |
| 5 | `Drawer` | `drawer` | existing `lib/ease` / native modal helpers | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES: focused gate 10/10 desktop+mobile across `drawer-beui.spec.ts` and existing `drawer.spec.ts`, no skips; package/lab typechecks PASS. Integrated verify PASS_WITH_NOTES. Native focus/inert/scroll-lock contract preserved. Non-Chromium/physical AT and aesthetics remain pending |
| 6 | `BottomSheet` variant | `bottom-sheet` | `lib/touch`, `PresenceGate` | DEFERRED_REQUIREMENT | — | Evaluated/deferred: source has snap/drag/dismiss APIs and a separate touch/modal lifecycle; Drawer already covers full-height mobile details. Keep outside the current replacement scope; define a new opt-in BEDS pattern only if product requires a distinct mobile sheet |
| 7 | `DropdownMenu` / `AccountMenu` | `context-menu` | `use-dismiss`, `use-tap-gesture`, `lib/touch`, `lib/ease` | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES: `account-menu-beui.spec.ts` plus `shell.spec.ts` 30 passed / 6 intentional conditional skips / 0 failed across desktop/mobile. Integrated verify PASS_WITH_NOTES. Existing controlled API, focus recovery, nested modal behavior and 280px geometry preserved. Physical AT, non-Chromium and aesthetics remain pending |
| 8 | `Select` / `FilterSelect` | `select` | `EASE_OUT` | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES: `select-beui.spec.ts`, `controls.spec.ts`, `application-card.spec.ts` and `account-menu-beui.spec.ts` ran serially for 40/40 with 0 skips/failures across desktop/mobile and light/dark. New `select.tsx` preserves the monolithic API, native popover/focus policy, fixed 260px geometry, disabled skipping and Arrow/Home/End/Enter/Tab contract while adopting bounded beUI motion; shared `anchored-popup.ts` and `option-navigation.ts` helpers avoid duplicated overlay mechanics. Integrated `npm run verify` and extracted-artifact consumer smoke PASS_WITH_NOTES; non-Chromium/physical AT and aesthetics remain pending |
| 9 | `LoadingIndicator` | `loader` | `EASE_IN_OUT` | PASS_WITH_NOTES | — | Focused and integrated technical/artifact checks PASS_WITH_NOTES; focused evidence retained. Non-Chromium, physical AT and aesthetics remain pending |
| 10 | `Toast` | `animated-toast-stack` | `EASE_OUT`, `motion/react` | PASS_WITH_NOTES | — | Focused and integrated technical/artifact checks PASS_WITH_NOTES; public event/live-region/focus contracts retained. Non-Chromium, physical AT and aesthetics remain pending |
| 11 | `Badge` animated | `animated-badge` | `AnimatePresence`, `SPRING_LAYOUT` | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES; browser report 42 passed / 6 conditional skips / 0 failed across badge/application-card/shell; skips are intentional shell project conditionals; integrated verify PASS_WITH_NOTES; aesthetics and physical AT remain pending; not marked done |
| 12 | `Disclosure` / `DisclosedRecords` | `bouncy-accordion` | `motion/react`, `ResizeObserver`, existing BEDS Button/measurement helpers | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES: focused `disclosure-beui.spec.ts` 10/10 plus existing `disclosure.spec.ts` 12/12, no skips; package/lab typechecks PASS; integrated verify PASS_WITH_NOTES. DisclosureText keeps the full string mounted; LabelField mounts the hidden remainder inert/aria-hidden; DisclosedRecords omits collapsed records from the DOM. Runtime reduced-motion switching, non-Chromium/physical AT and aesthetics remain pending |
| 13 | `DataTable` | `table` | none for current contract | DEFERRED_REQUIREMENT | — | Evaluated/deferred: beUI `table` adds virtualized 10k-row sorting, selection, resize/reorder, editable cells and menus; these are new capabilities, not a replacement for the current native caller-controlled table. Keep the current API; any future capability table needs its own owner-approved contract and regression gate |
| 14 | `SearchDialog` / `CommandPalette` | `command-palette` / `morphing-search` | `use-on-open`, `use-row-cursor`, `use-touch-capable`, `lib/command-search`, shared `lib/modal` | PASS_WITH_NOTES | — | CommandPalette remains PASS_WITH_NOTES: `command-palette-beui.spec.ts` 8/8 plus existing command-search coverage 4/4, with Drawer/SearchDialog regression in the serial gate. `morphing-search` is NO_FIT for BEDS SearchDialog: it owns an uncontrolled trigger-to-dialog morph, local filtering/categories, `className`/icon escapes, custom role/portal/scroll-lock behavior and different focus/IME lifecycle, while BEDS owns a controlled native `<dialog>` with caller-owned async/loading/error/filter state, labels, disabled identity and return-focus semantics. Preserve the existing SearchDialog contract; no code migration. Non-Chromium/physical AT and aesthetics remain pending |
| 15 | `Text` / typography motion | `text-animation` | none for current `Text`; future opt-in `TextReveal` requires a new contract | NO_FIT | — | Evaluated/no migration: split-string/character spans, `as`/`className` escapes and layout/reading changes do not fit arbitrary-`ReactNode` static `Text`; keep `Text` static and consider only a separately specified display-only reveal |

## Shared utility layer

Before migrating components that need internal hooks, mirror the utilities from beUI into `packages/beds/src/lib/`:

- `lib/ease.ts` — already exists; add any missing constants as needed.
- `lib/presence-gate.tsx` — needed by `morphing-modal`; Drawer and CommandPalette keep native dialog lifecycles and intentionally omit the unused exit-subtree helper.
- `lib/modal.ts` — shared native modal lifecycle, focus containment and single document scroll-lock map for Dialog, Drawer, SearchDialog and CommandPalette.
- `lib/touch.ts` — needed by `tooltip`, `context-menu`, `bottom-sheet`.
- `lib/hooks/use-dismiss.ts` — needed by `tooltip`, `context-menu`, `popover`.
- `lib/hooks/use-hover-gesture.ts` — needed by `tooltip`, `popover`.
- `lib/hooks/use-tap-gesture.ts` — needed by `tooltip`, `context-menu`, `popover`.
- `lib/hooks/use-on-open.ts` — needed by `command-palette`.
- `lib/hooks/use-row-cursor.ts` — needed by `command-palette`.
- `lib/hooks/use-touch-capable.ts` — needed by `command-palette`.

Rule: each util is committed in the same commit as the first component that uses it, with a note in `THIRD-PARTY-NOTICES.md`.

## Historical extraction method (superseded; do not run)

The steps below are retained as historical context from the earlier checkpoint. Current root/package `AGENTS.md` explicitly forbids `npx shadcn add` in BEDS and requires direct public registry recovery (`https://beui.dev/r/{slug}/raw` plus complete registry metadata/helpers). No shadcn extraction was used for this batch.

1. Setup a minimal Next.js project in `/tmp/beui-extract` with `shadcn init`.
2. `[DO NOT EXECUTE — documentation-only historical example]` Install beUI components with `npx shadcn add @beui/{slug}`.
3. Copy generated files from `components/motion/` and `lib/` into BEDS.
4. Adapt imports (`@/lib/*` → `./lib/*` or `../lib/*`).
5. Remove public `className`/`style`/`size` props per `check-library.mjs`.
6. Swap geometry to BEDS proportions.
7. Register in `THIRD-PARTY-NOTICES.md` and update this tracker.

## Restart point

> 0.2.0-rc.5: the Dialog `center-morph-modal` adaptation was removed after owner visual review; Dialog now uses a BEDS-original quiet fade + scale. See [Provenance](PROVENANCE.md).

Current restart point: Tooltip, LoadingIndicator and Toast are `PASS_WITH_NOTES`; Tooltip focused and integrated checks pass, and its historical mobile flake was not reproduced. AccountMenu is independent technical `PASS_WITH_NOTES` at 30 passed / 6 intentional conditional skips / 0 failed with integrated verify PASS_WITH_NOTES. Drawer and Disclosure are independent technical `PASS_WITH_NOTES`, with integrated verify PASS_WITH_NOTES: Drawer 10/10 focused plus existing coverage, Disclosure 10/10 focused plus existing 12/12, all with no skips. CommandPalette is `PASS_WITH_NOTES` at 8/8 focused plus 4/4 existing command-search coverage and integrated verify PASS_WITH_NOTES; SearchDialog is explicitly closed as NO_FIT against `morphing-search`. Badge remains `PASS_WITH_NOTES` at 42 passed / 6 intentional conditional skips / 0 failed with integrated verify PASS_WITH_NOTES. Select/FilterSelect is `PASS_WITH_NOTES` at 40/40 serial focused/regression cases with 0 skips/failures across desktop/mobile and light/dark; integrated `npm run verify` and extracted-artifact consumer smoke are PASS_WITH_NOTES. Dialog is now `PASS_WITH_NOTES` for the approved native center-morph visual subset: focused `dialog-beui.spec.ts` 6/6 desktop + 6/6 mobile, including live reduced-motion switching and close→reopen interruption, and Dialog control coverage 10/10 desktop + 10/10 mobile; full `morphing-modal` remains `NO_FIT`. BER35 clean-checkout artifact gate is `PASS_WITH_EXTERNAL_PREREQUISITE/BLOCKED`: the shared dirty checkout's verify saw four historical untracked Drawer assets — `apps/web/labs/espaco-library/evidence/drawer-beui/{desktop-dark,mobile-dark}.png` and `packages/beds/evidence/drawer-beui/{desktop-dark,mobile-dark}.png` — which are intentionally outside `e997e95`. Typecheck, focused browser checks and diff-check are PASS; do not call the BER35 artifact gate self-contained until that prerequisite is resolved. Text remains `NO_FIT`; BottomSheet and DataTable are `DEFERRED_REQUIREMENT`. Runtime reduced-motion switching where noted, non-Chromium/physical AT and aesthetics remain pending. Do not mark rows done or infer aesthetic approval from technical results.
