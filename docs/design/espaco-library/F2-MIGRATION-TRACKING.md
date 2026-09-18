# F2 migration tracking

Tracker for the BEDS Fase 2 migration: overlays, feedback, navigation, data components and typography motion from the free beUI registry.

## How to use this file

- Mark a row `[x]` only after the component is pasted, adapted to BEDS proportions, committed, and the full playground gate passes.
- If a component is blocked, fill the `Blocked` column with the reason and do **not** mark it done.
- When credits/session ends, commit this file with the current date so the next agent knows the restart point.

## Available beUI free slugs (verified 2026-09-18)

`morphing-modal`, `drawer`, `bottom-sheet`, `tooltip`, `context-menu`, `popover`, `select`, `loader`, `dock`, `command-palette`, `table`, `number`, `number-ticker`, `animated-toast-stack`, `animated-badge`, `bouncy-accordion`, `text-animation`.

## Component migration checklist

| # | BEDS target | beUI slug | Internal deps needed | Status | Commit | Notes |
|---|---|---|---|---|---|---|
| 1 | `Dock` / `DockItem` / `DockSeparator` | `dock` | `SPRING_LAYOUT` | ✅ done | rc.19 | `size` removed from public API; 44px fixed |
| 2 | `NumberTicker` | `number-ticker` | `EASE_OUT` | ✅ done | rc.19 | `className`/`digitClassName` removed from public API |
| 3 | `Tooltip` | `tooltip` | `use-dismiss`, `use-hover-gesture`, `use-tap-gesture`, `TooltipSurface`, `lib/touch` | ⬜ pending | — | replaces current `Tooltip` in `overlays.tsx` |
| 4 | `Dialog` | `morphing-modal` | `PresenceGate`, `lib/ease` | ⬜ pending | — | decide between `morphing-modal` or plain `dialog` if available |
| 5 | `Drawer` | `drawer` | `PresenceGate`, `lib/ease` | ⬜ pending | — | keep current API (`open/onOpenChange/title/children`) |
| 6 | `BottomSheet` variant | `bottom-sheet` | `lib/touch`, `PresenceGate` | ⬜ pending | — | optional if Drawer covers mobile |
| 7 | `DropdownMenu` / `AccountMenu` | `context-menu` | `use-dismiss`, `use-tap-gesture`, `lib/touch`, `lib/ease` | ⬜ pending | — | `AccountMenu` lives in `patterns.tsx` |
| 8 | `Select` / `FilterSelect` | `select` | `EASE_OUT` | ⬜ pending | — | preserve current option API |
| 9 | `LoadingIndicator` | `loader` | `EASE_IN_OUT` | ⬜ pending | — | replace spinner in `feedback.tsx` |
| 10 | `Toast` | `animated-toast-stack` | unknown | ⬜ pending | — | check if free slug exists; fallback keep current |
| 11 | `Badge` animated | `animated-badge` | unknown | ⬜ pending | — | optional polish, low priority |
| 12 | `Disclosure` / `DisclosedRecords` | `bouncy-accordion` | unknown | ⬜ pending | — | accordion for disclosure; table for records |
| 13 | `DataTable` | `table` | `@tanstack/react-virtual`, many hooks | ⬜ pending | — | complex; may skip if too many deps |
| 14 | `SearchDialog` / `CommandPalette` | `command-palette` | `use-on-open`, `use-row-cursor`, `use-touch-capable`, `PresenceGate`, `lib/command-search` | ⬜ pending | — | high value but high complexity |
| 15 | `Text` / typography motion | `text-animation` | unknown | ⬜ pending | — | apply to `Text` component in `foundation.tsx` |

## Shared utility layer

Before migrating components that need internal hooks, mirror the utilities from beUI into `packages/beds/src/lib/`:

- `lib/ease.ts` — already exists; add any missing constants as needed.
- `lib/presence-gate.tsx` — needed by `drawer`, `morphing-modal`, `command-palette`.
- `lib/touch.ts` — needed by `tooltip`, `context-menu`, `bottom-sheet`.
- `lib/hooks/use-dismiss.ts` — needed by `tooltip`, `context-menu`, `popover`.
- `lib/hooks/use-hover-gesture.ts` — needed by `tooltip`, `popover`.
- `lib/hooks/use-tap-gesture.ts` — needed by `tooltip`, `context-menu`, `popover`.
- `lib/hooks/use-on-open.ts` — needed by `command-palette`.
- `lib/hooks/use-row-cursor.ts` — needed by `command-palette`.
- `lib/hooks/use-touch-capable.ts` — needed by `command-palette`.

Rule: each util is committed in the same commit as the first component that uses it, with a note in `THIRD-PARTY-NOTICES.md`.

## Extraction method

1. Setup a minimal Next.js project in `/tmp/beui-extract` with `shadcn init`.
2. Install beUI components with `npx shadcn add @beui/{slug}`.
3. Copy generated files from `components/motion/` and `lib/` into BEDS.
4. Adapt imports (`@/lib/*` → `./lib/*` or `../lib/*`).
5. Remove public `className`/`style`/`size` props per `check-library.mjs`.
6. Swap geometry to BEDS proportions.
7. Register in `THIRD-PARTY-NOTICES.md` and update this tracker.

## Restart point

Last session ended after rc.19. Next action: setup `/tmp/beui-extract` and start extracting from `tooltip` (lowest dependency surface).
