# F2 migration tracking

Tracker for the BEDS Fase 2 migration: overlays, feedback, navigation, data components and typography motion from the free beUI registry.

## How to use this file

- Mark a row `[x]` only after the component is pasted, adapted to BEDS proportions, committed, and the full playground gate passes.
- `implemented; gate pending` means code/spec/docs exist but the integrated build and browser gate are still outstanding; it is not done.
- If a component is blocked, fill the `Blocked` column with the reason and do **not** mark it done.
- When credits/session ends, commit this file with the current date so the next agent knows the restart point.

## Available beUI free slugs (verified 2026-09-18)

`morphing-modal`, `drawer`, `bottom-sheet`, `tooltip`, `context-menu`, `popover`, `select`, `loader`, `dock`, `command-palette`, `table`, `number`, `number-ticker`, `animated-toast-stack`, `animated-badge`, `bouncy-accordion`, `text-animation`.

## Component migration checklist

| # | BEDS target | beUI slug | Internal deps needed | Status | Commit | Notes |
|---|---|---|---|---|---|---|
| 1 | `Dock` / `DockItem` / `DockSeparator` | `dock` | `SPRING_LAYOUT` | ✅ done | rc.19 | `size` removed from public API; 44px fixed |
| 2 | `NumberTicker` | `number-ticker` | `EASE_OUT` | ✅ done | rc.19 | `className`/`digitClassName` removed from public API |
| 3 | `Tooltip` | `tooltip` | `use-dismiss`, `use-hover-gesture`, `use-tap-gesture`, `TooltipSurface`, `lib/touch` | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES: focused and integrated checks pass; the historical mobile flake was not reproduced. Physical AT, non-Chromium and aesthetics remain pending |
| 4 | `Dialog` | `morphing-modal` | `PresenceGate`, `lib/ease` | ⬜ pending | — | Evaluated/no migration: source API, custom exit/body-scroll lifecycle, geometry and non-native modal semantics are incompatible with BEDS `Dialog`; keep the controlled native modal and only consider a separately specified multi-view pattern if a real contract requires it |
| 5 | `Drawer` | `drawer` | existing `lib/ease` / native modal helpers | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES: focused gate 10/10 desktop+mobile across `drawer-beui.spec.ts` and existing `drawer.spec.ts`, no skips; package/lab typechecks PASS. Integrated verify PASS_WITH_NOTES. Native focus/inert/scroll-lock contract preserved. Non-Chromium/physical AT and aesthetics remain pending |
| 6 | `BottomSheet` variant | `bottom-sheet` | `lib/touch`, `PresenceGate` | ⬜ pending | — | Evaluated/deferred: source has snap/drag/dismiss APIs and a separate touch/modal lifecycle; Drawer already covers full-height mobile details. Keep outside the current replacement scope; define a new opt-in BEDS pattern only if product requires a distinct mobile sheet |
| 7 | `DropdownMenu` / `AccountMenu` | `context-menu` | `use-dismiss`, `use-tap-gesture`, `lib/touch`, `lib/ease` | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES: `account-menu-beui.spec.ts` plus `shell.spec.ts` 30 passed / 6 intentional conditional skips / 0 failed across desktop/mobile. Integrated verify PASS_WITH_NOTES. Existing controlled API, focus recovery, nested modal behavior and 280px geometry preserved. Physical AT, non-Chromium and aesthetics remain pending |
| 8 | `Select` / `FilterSelect` | `select` | `EASE_OUT` | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES: `select-beui.spec.ts`, `controls.spec.ts`, `application-card.spec.ts` and `account-menu-beui.spec.ts` ran serially for 40/40 with 0 skips/failures across desktop/mobile and light/dark. New `select.tsx` preserves the monolithic API, native popover/focus policy, fixed 260px geometry, disabled skipping and Arrow/Home/End/Enter/Tab contract while adopting bounded beUI motion; shared `anchored-popup.ts` and `option-navigation.ts` helpers avoid duplicated overlay mechanics. Integrated `npm run verify` and extracted-artifact consumer smoke PASS_WITH_NOTES; non-Chromium/physical AT and aesthetics remain pending |
| 9 | `LoadingIndicator` | `loader` | `EASE_IN_OUT` | PASS_WITH_NOTES | — | Focused and integrated technical/artifact checks PASS_WITH_NOTES; focused evidence retained. Non-Chromium, physical AT and aesthetics remain pending |
| 10 | `Toast` | `animated-toast-stack` | `EASE_OUT`, `motion/react` | PASS_WITH_NOTES | — | Focused and integrated technical/artifact checks PASS_WITH_NOTES; public event/live-region/focus contracts retained. Non-Chromium, physical AT and aesthetics remain pending |
| 11 | `Badge` animated | `animated-badge` | `AnimatePresence`, `SPRING_LAYOUT` | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES; browser report 42 passed / 6 conditional skips / 0 failed across badge/application-card/shell; skips are intentional shell project conditionals; integrated verify PASS_WITH_NOTES; aesthetics and physical AT remain pending; not marked done |
| 12 | `Disclosure` / `DisclosedRecords` | `bouncy-accordion` | `motion/react`, `ResizeObserver`, existing BEDS Button/measurement helpers | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES: focused `disclosure-beui.spec.ts` 10/10 plus existing `disclosure.spec.ts` 12/12, no skips; package/lab typechecks PASS; integrated verify PASS_WITH_NOTES. DisclosureText keeps the full string mounted; LabelField mounts the hidden remainder inert/aria-hidden; DisclosedRecords omits collapsed records from the DOM. Runtime reduced-motion switching, non-Chromium/physical AT and aesthetics remain pending |
| 13 | `DataTable` | `table` | none for current contract | ⬜ pending | — | Evaluated/no-fit: beUI `table` adds virtualized 10k-row sorting, selection, resize/reorder, editable cells and menus; these are new capabilities, not a replacement for the current native caller-controlled table. Keep the current API; any future motion-only slice needs its own owner-approved contract |
| 14 | `SearchDialog` / `CommandPalette` | `command-palette` | `use-on-open`, `use-row-cursor`, `use-touch-capable`, `lib/command-search`, shared `lib/modal` | PASS_WITH_NOTES | — | Independent technical review PASS_WITH_NOTES: new `command-palette-beui.spec.ts` 8/8 plus existing command-search coverage 4/4, and Drawer/SearchDialog regression included in the 20/20 serial gate; no skips/failures. Integrated verify PASS_WITH_NOTES. Public bridge is live through `overlays.tsx`; the legacy implementation was removed. Native modal lifecycle is shared through one WeakMap. Upstream PresenceGate/panel entrance motion intentionally omitted to preserve measured native-dialog geometry. SearchDialog remains pending a separate targeted motion decision; `morphing-search` is not a one-for-one fit. Non-Chromium/physical AT and aesthetics remain pending |
| 15 | `Text` / typography motion | `text-animation` | none for current `Text`; future opt-in `TextReveal` requires a new contract | ⬜ pending | — | Evaluated/no migration: split-string/character spans, `as`/`className` escapes and layout/reading changes do not fit arbitrary-`ReactNode` static `Text`; keep `Text` static and consider only a separately specified display-only reveal |

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

Current restart point: Tooltip, LoadingIndicator and Toast are `PASS_WITH_NOTES`; Tooltip focused and integrated checks pass, and its historical mobile flake was not reproduced. AccountMenu is independent technical `PASS_WITH_NOTES` at 30 passed / 6 intentional conditional skips / 0 failed with integrated verify PASS_WITH_NOTES. Drawer and Disclosure are independent technical `PASS_WITH_NOTES`, with integrated verify PASS_WITH_NOTES: Drawer 10/10 focused plus existing coverage, Disclosure 10/10 focused plus existing 12/12, all with no skips. CommandPalette is `PASS_WITH_NOTES` at 8/8 focused plus 4/4 existing command-search coverage and integrated verify PASS_WITH_NOTES. Badge remains `PASS_WITH_NOTES` at 42 passed / 6 intentional conditional skips / 0 failed with integrated verify PASS_WITH_NOTES. Select/FilterSelect is `PASS_WITH_NOTES` at 40/40 serial focused/regression cases with 0 skips/failures across desktop/mobile and light/dark; integrated `npm run verify` and extracted-artifact consumer smoke are PASS_WITH_NOTES. Dialog and Text were evaluated as no-fit replacements and remain pending without code migration; BottomSheet and DataTable remain deferred/no-fit evaluated. Runtime reduced-motion switching where noted, non-Chromium/physical AT and aesthetics remain pending. Do not mark rows done or infer aesthetic approval from technical results.
