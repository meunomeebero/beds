# BEDS F0–F4 migration closeout tracker

This is the canonical phase tracker for the BEDS beUI migration. The focused
[F2 tracker](F2-MIGRATION-TRACKING.md), [F3 decisions](F3-MIGRATION-DECISIONS.md)
and [Processing contract](PROCESSING.md) remain supporting records; they do not
replace this file.

## Closeout rule

The phase is technically closed only when the implementation, provenance,
package checks, focused browser checks and integrated verification are all
recorded against the same checkout. `PASS_WITH_NOTES` means the technical gate
passed with explicit limitations; it is not aesthetic approval. `NO_FIT` and
`DEFERRED_REQUIREMENT` are resolved scope decisions, not unfinished migration
rows.

The authoritative inventory is F0, F1, F2, F3 and F4. There is no F5. The
historical [motion opportunities](MOTION-OPPORTUNITIES-2026-09-15.md) record is
advisory and does not reopen Drawer, Switch, Dialog, or drop-target work as a
new phase.

## Authority and acceptance criteria

- BEDS `AGENTS.md`, package governance, the [interface-quality protocol](INTERFACE-QUALITY.md),
  and the no-runtime-beUI/no-public-escape-hatch contract govern implementation.
- The Auditor Ultra phase plan dated 2026-09-19 defines the F0–F4 inventory and
  acceptance boundary.
- Every adopted source records its beUI slug, raw/registry URL, MIT notice and
  retrieval/hash information in [Provenance](PROVENANCE.md) and, where
  applicable, `THIRD-PARTY-NOTICES.md`.
- Each adaptation preserves the existing BEDS API, ownership of state and
  product side effects, measured BEDS geometry, keyboard/focus/RTL semantics,
  reduced-motion behavior and forced-colors behavior. New source capabilities
  are not silently added.
- The final closeout runs library build/typecheck/contract/docs/guard checks,
  extracted-artifact parity and consumer smoke, focused browser coverage in
  desktop/mobile and light/dark, the six Better domains, `npm run verify`, and
  the final source/artifact evidence check.

## Phase matrix

| Phase | Scope and beUI equivalents | Current checkpoint | Evidence / boundary |
|---|---|---|---|
| F0 | Stack, tokens, package boundary, guards and evidence protocol | Technical `PASS_WITH_NOTES` | `7cf82fb` baseline plus the final integrated gates below. No production integration, release or publication. |
| F1 | Base controls and shell: controls/input/button/radio adaptations, Settings Tabs (`tabs`), AppShell/NavItem (`animated-sidebar`, `bounce-sidebar`) and their first-frame/reduced-motion behavior | Technical `PASS_WITH_NOTES` | `1aed8df`, `a93091b`, `4ef908b`, `1a9fcec`, `9b55346`; focused Tabs/navigation evidence includes 12 passes and 4 intentional project-conditional skips. |
| F2 | Overlays, feedback, navigation, selection and disclosure: `tooltip`, `drawer`, `context-menu`, `select`, `loader`, `animated-toast-stack`, `animated-badge`, `bouncy-accordion`, `command-palette`; compatible Tailwind/Motion adaptations for the remaining controls | Technical `PASS_WITH_NOTES` | The focused F2 tracker and [Provenance](PROVENANCE.md) contain the per-component matrix. BER35 adapts the approved `center-morph-modal` visual subset onto native Dialog; full `morphing-modal` and `morphing-search`/SearchDialog remain `NO_FIT`; `bottom-sheet` is `DEFERRED_REQUIREMENT`; `text-animation`/Text and `popover` are `NO_FIT`. |
| F3 | Numeric/data surfaces: typed `AccountCredits`, `Metric` and controlled `PricingCard` motion; review of DataTable, Pagination and ApplicationBoard | Technical `PASS_WITH_NOTES` | `03c3256`, `20da53b`, `aa208c7`, `05d2b4a`, `8bfddae`, `fd9f9c9`; focused AnimatedNumber/AccountCredits/Pricing coverage is 10/10 across desktop/mobile. `table`, `adaptive-stepper` and `kanban`/`swipeable-list` are explicit `NO_FIT` decisions. |
| F4 | Processing product moment: bounded `todo-list` status-mark adaptation and ATS segmented-fill reveal, with static truthful score text | Technical `PASS_WITH_NOTES` | `ccefbe0`, `31a8eab`; focused Processing plus legacy coverage is 26/26. The 90s/75s host cadence, 95% hold, pause/offscreen/reduced motion, explicit completion and no-auto-success contract remain. |

Final technical freeze: `fd9f9c9`. `npm run verify` passed with 134 public
components, 205 declared tokens, 98 Markdown files/925 local targets, 33
consumer roots/39 files with 0 violations, 39 guards, 4 quality-routing tests,
and extracted-artifact consumer smoke. The packed artifact SHA-256 is
`452231bafcf921eb1cff53227340e4ffda31ff01c152a72a559247d6221580bd`.
Independent Sol review is `PASS_WITH_NOTES` with no technical blockers. These
are technical results, not aesthetic approval.

## Commit and documentation boundary

The historical commit order is intentional and is mapped explicitly here:
`ccefbe0` owns the F4 Processing implementation and focused browser spec;
`03c3256` owns the F3 numeric implementation and also recorded the shared F4
beUI provenance/license entries in `PROVENANCE.md` and
`THIRD-PARTY-NOTICES.md` before the F4 code commit. The provenance/notice rows
are documentation snapshots, not a claim that F4 code shipped in `03c3256`.
The F4 implementation and its review remain owned by `ccefbe0` and `31a8eab`.

## Explicit no-fit and deferred decisions

These are completed decisions and must not be represented as pending work:

- `Dialog` versus full `morphing-modal`: the upstream lifecycle and geometry
  would replace native BEDS modal semantics and add a second focus/scroll state
  machine. BER35 adopted a `center-morph-modal` clip subset, which 0.2.0-rc.5
  removed after owner visual review; Dialog now uses a BEDS-original quiet
  fade + scale with no new public API, portal lifecycle or body-scroll owner.
- `SearchDialog` versus `morphing-search`: the source owns an uncontrolled
  trigger morph, local filtering and public style/role escapes; BEDS owns a
  controlled native dialog with caller-owned async state and focus recovery.
- `Text` versus `text-animation`: split-character rendering and arbitrary
  `ReactNode`/layout changes do not fit the static Text contract.
- `Popover`: the goo clip-path and compound render-prop API do not match the
  existing anchored Tooltip/Select/Dropdown contracts.
- `DataTable`, `Pagination` and `ApplicationBoard`: the candidate sources add
  virtualization/editing, quantity-stepper or mobile swipe contracts instead
  of preserving the BEDS table/page/lane contracts.
- `BottomSheet`: snap/drag/dismiss behavior is a distinct product requirement,
  not a safe Drawer substitution.
- `Notice`, `Skeleton` and `Avatar`: no matching free beUI source was resolved;
  local BEDS contracts remain local and no third-party source is claimed.

## Review and human boundary

Technical review covers source fidelity, API preservation, state semantics,
browser behavior and artifact parity. It does not approve aesthetics. The
remaining human gate is visual/aesthetic acceptance across the submitted
desktop/mobile light/dark evidence. Physical assistive technology,
non-Chromium engines, real browser zoom and performance profiling are also
outside the Chromium technical gate unless separately recorded. Until that
human validation is complete, keep PR #1 draft and do not merge, release, tag,
publish or upgrade consumers.
