# Release workflow

Use when: shipping an authorized BEDS package or upgrading a consumer.
Do not use when: previewing locally or changing application business behavior.
Read next: [Artifact validation](docs/design/espaco-library/ARTIFACT-VALIDATION.md).

1. Update package version and matching canonical contracts; keep runtime/source changes explicit.
2. `npm ci --ignore-scripts` then `npm run verify`; run relevant browser checks for changed UI.
3. Pack from `packages/beds` into an external temporary directory: `npm pack --ignore-scripts --pack-destination <directory>`.
4. Inspect archive paths, secret scan and licenses; record SHA-256 outside the archive.
5. With authorization, commit source/docs/lockfile, push the named branch and a new version tag. Never replace an existing tag or release asset.
6. Attach the `.tgz` to a GitHub prerelease at that exact tag; include source SHA, artifact hash, actual gates and limits. No npm registry publication required.
7. Download the public release asset again, verify its hash and import in a fresh consumer. Update the app dependency/lockfile to the fixed release URL; no source alias.
8. Verify application build, scoped consumer roots and integration browser checks. Existing screens migrate separately with reviewed behavior.

Rollback: select the previous known release URL/integrity, reinstall and rerun app gates. Do not mutate the old release.

## Published candidate — 0.3.0-rc.2 (reference-app parity pass)

Tag `v0.3.0-rc.2`, GitHub prerelease asset `beds-0.3.0-rc.2.tgz` (SHA-256 and
source commit in the release notes). Built on 0.3.0-rc.1 after a component-by-component
check of BEDS against the reference app's current code (owner rule: its patterns are
the source of truth; BEDS stays product-agnostic). Not published to the npm registry.

**Changed defaults:**

- `Dialog`/`Drawer` `motionPreset` defaults to `elastic` (the reference app wraps every
  modal in it). The type is now `'elastic' | 'quiet'`: `quiet` is the 0.2 fade/slide and
  the former `'default'` value is gone (no known consumer passed it).
- `Dialog` no longer paints a 2px ring around the whole surface when the native shell
  takes the opening focus (visible on dialogs opened at page load). The shell is a
  programmatic focus target; every control inside keeps its ring. A fix, not parity:
  the reference app's build shows the same ring.
- Product `TextAreaField` (`field`) grows with its content from a 96px floor
  (`field-sizing: content`, no resize grip; other browsers keep the vertical handle).
- `EmptyStateCard` action is the outline pill with a trailing arrow (was the neutral fill).
- `Notice` dismiss returns to the reference app's 32px control with a 6px radius and the
  hover veil (rc.1 had made it round).
- `Breadcrumbs` take the beUI Breadcrumb anatomy the reference app ports: 13/20px medium,
  ancestors as quiet 32px pills (44px touch) with a hover tint, a soft chevron, current
  page in heading ink, wrapping labels and a soft path transition.
- `Tabs` overflow edges are 36px chevrons over the faded track ends; read-only `Chip`
  uses 10px inline padding.

**Added:** `TextField`/`TextAreaField`/`DateField` `warning` (amber-glyph note,
`role="status"`, never blocks); `TextField` `action: { label, onClick, busy? }` (one
sm secondary pill inside the field); `EmptyState` `artwork` (product artwork in place
of the icon tile); `ExpandingButton` `busy`, `state`, `loadingLabel`, `successLabel`,
`errorLabel`. Foundations: an "Editing — one mode, in place" section (no per-row
pencil/trash, one `Editar` mode, chips with the × only while editing, no drawer for one
field) and a "Badges" rule (no recommended/popular badges).

**Not carried yet:** the reference app's link pill for router links, choice cards, icon
theme switch, wrapping tooltip, full beUI chat stack, table, command palette and centered
upload are listed in [Promotion candidates](docs/design/espaco-library/PROMOTION-CANDIDATES.md).

**Consumer migration:** pass `motionPreset="quiet"` only if a modal must keep the 0.2
fade; replace `motionPreset="default"` with `"quiet"`. Apps that kept a brand-filled
sign-in pill on `ExpandingButton` before 0.3 keep their own component (0.3 renders the
outline pill).

## Previous candidate — 0.3.0-rc.1 (reference-app patterns)

Tag `v0.3.0-rc.1`, GitHub prerelease asset `beds-0.3.0-rc.1.tgz` (SHA-256 and
source commit in the release notes). Built on rc.11 (`b52ab01`) plus the
rc.11-elastic.2 modal motion. Owner rules (2026-10-18): the patterns a production
reference app ships are the visual source of truth, and BEDS stays
product-agnostic. A minor bump because default visuals change (0.x semver). Not
published to the npm registry (the `beds` name there belongs to a third party):
consumers pin the release URL or vendor the asset.

**Breaking (visual defaults; APIs still compile):**

- `Button`: beUI StatefulButton pill, md 40px (44px on coarse pointers), `compact`
  sm 32px (hit area padded to 44px on touch), 14/12px medium; `secondary` default;
  `destructive` is an error outline (no red fill); `purpose` no longer changes
  geometry; the letter roll marks status changes only.
- `ExpandingButton`: renders the outline pill with a trailing arrow; `context`
  ignored; no brand chip.
- Text entry: `fieldBorder` defaults to `soft`; `TextField`/`TextAreaField`/
  `DateField` default to `purpose="field"` (44px pill); `SearchField` defaults to
  the 44px search pill; focus is a heading-tinted border plus a soft 2px ring (a
  transparent outline paints only in forced colors); `--es-focus-ring` is now focus
  at 40% (was 24%) and `--es-error-ring` error-text at 25%.
- `Select` defaults to `variant="input"` and form variants now render a visible
  label (`hideLabel` opts out); `compact` is a 32px pill, `filter` a 40px pill.
- `SegmentedControl` (both variants) and every `Tabs` variant render one 40px tab
  pill (32px options, 44px on touch); the settings underline strip is gone; tab
  edge scroll buttons serve pointers only (Tab goes from the tablist to its panel).
- `EmptyState`, `NavItem` (36px rows, 44px on touch), `PageHeader` (30/36px H1),
  `PricingCard` actions (featured neutral `primary`, others `outline`), toast
  action, file upload browse/remove, Drawer children (no forced 40/44px buttons).

**Added:** `Select` `hideLabel`; `Button` `variant="outline"`, `state`,
`loadingLabel`, `successLabel`, `errorLabel`, `iconPosition`, `accessibleLabel`;
`Chip`/`ChipProps`; `TextField` `maxLength`, `enterKeyHint`, `type="search"`;
`TextAreaField` `maxLength`; `SearchField` `purpose`, `maxLength`;
`fieldBorder="strong"`; tokens `--es-field-focus-border`, `--es-placeholder-soft`,
`--es-hover-soft`, `--es-remove-hover`, `--es-destructive-border`; geometry
metadata `touchButton`, `settingsField`, `segmented`, `segmentedOption`. Includes
the rc.11-elastic.2 `Dialog`/`Drawer` `motionPreset`.

**Deprecated:** `Button purpose`, `ExpandingButton context`, `fieldBorder="default"`
(alias of `strong`), `SegmentedControl variant="joined"` (renders the pill).

**Product-agnostic renames (docs and lab only; no export changed):** the guided
profile composition is the AI chat composition (`AI-CHAT-COMPOSITION.md`, lab view
`?view=ai-chat`, `AiChatPage.tsx`, `ai-chat-*.spec.ts`, `ai-chat-*` evidence);
product, persona and specialist names in docs, fixtures and copy became generic
roles (reference app, assistant, ATS and career specialists); checkout fixtures
use fictitious company data.

**Consumer migration:** dense admin/settings screens pass `purpose="settings"` to
fields and search and `variant="compact"` to toolbar selects; selects that already
sit beside a visible label (or in a filter bar) pass `hideLabel`; products that need
the 3:1 field outline pass `fieldBorder="strong"`. Apps that vendored beUI
button/input/sliding-choices ports can retire them screen by screen; older
consumers should review their `ExpandingButton` and `Select` uses.

## Local-only candidate — 0.2.0-rc.11-elastic.2

Based exactly on rc.11 (`b52ab01479f6c072017816845181052864e1f60f`). Additive
`Dialog`/`Drawer` `motionPreset: 'default' | 'elastic'` retains the existing
default; elastic is a bounded internal spring with independent fade and short
ease-out exit. Native modal lifecycle, focus recovery and reduced-motion
semantics remain owned by BEDS. This candidate is a uniquely named local pack,
not a publication, tag or replacement of the public rc.11 archive. Source and
canonical contracts are tracked together; build generates the portable docs
and public manifest. [Motion contract](docs/design/espaco-library/STATES.md#motion-contract).

Candidate .2 hardens live reduced-motion changes during entry or exit: a distinct
neutral transform target cancels the running spring, while distinct opacity
keyframes keep the fade in the replacement completion/presence lifecycle. The
previous .1 local archive stays immutable; no native modal or focus remount.

## Published baseline — 0.2.0-rc.11

Additive over rc.10. `DesignSystemProvider` accepts `fieldBorder: 'default' | 'soft'`
(default `default`, so nothing changes unless a product opts in). Text-entry
controls (`TextField`, `TextAreaField`, `DateField`, `SearchField`, `Select` field and
input variants, `InputOTP` slots and the generic file dropzone) now draw their
boundary with the new `--es-field-border` token, which equals `--es-control-border`
by default. `soft` maps it to `--es-border`, the card border, for products that want
delicate fields; checkbox, radio and switch marks always keep the functional
boundary, and focus and error borders are unchanged. `soft` gives up the 3:1
outline on text-entry controls: the field is identified by label, fill,
placeholder and focus ring. New lab spec `field-border.spec.ts` covers both modes,
the marks, focus and error, OTP and the dropzone. No default, token value or other
API changes.

## Previous candidate — 0.2.0-rc.10

Fix only, over rc.9. The `Badge` status marker (the 6px tone dot before the
label) was invisible: the generic `.es-badge-label>span` rule (specificity
0,2,1) out-ranked `.es-badge-marker` (0,2,0), because the marker is itself a
span child of the label. The marker fell back from `inline-flex` to block, its
dot shifted down inside a 6px `overflow:hidden` box and was clipped, leaving
only the 12px gap. The label rule now excludes the marker
(`.es-badge-label>span:not(.es-badge-marker)`). The badge lab spec asserts the
dot sits inside its marker and on the first text line. No API, token or
default changes.

## Previous candidate — 0.2.0-rc.9

Fix plus one additive variant over rc.8. `SegmentedControl` and `RadioGroup`
option faces no longer join the tab order: their `.92` press came from Motion
`whileTap`, which gives any element that is not natively focusable `tabindex=0`,
so every option added an inert extra tab stop beside its radio. The press is now
a pointer-state spring with the same value and curve. `Select` gains
`variant="input"`: the 44px pill, 14px inline padding and 16px text of
`TextField purpose="field"`, full width, so a select sits flush in the same
form. No default, token or other API changes.

## Previous candidate — 0.2.0-rc.8

Additive over rc.7. `TextField`, `DateField` and `TextAreaField` accept
`purpose="field"`: the beUI `input` anatomy for product forms (44px pill,
14px inline padding, 16px text on every pointer, label and notes inset 4px;
the text area keeps a 20px radius). Functional-contrast border, focus ring,
error nudge and settled error message are unchanged. `settings` remains the
default density and `connection` keeps its measured geometry.

## Earlier candidate — 0.2.0-rc.7

Motion-only change over rc.6. `AccountMenu` opens and closes with the beUI
Popover Morph corner clip (320ms) plus the panel spring, anchored to the corner
nearest its trigger; reduced motion uses a 120ms fade. The menu stays mounted
through exit and focus returns to the trigger on dismissal. Native popover
positioning, controlled API, keyboard behavior and geometry are unchanged. No
API, token or default changes. Provenance in `THIRD-PARTY-NOTICES.md`.

## Earlier candidate — 0.2.0-rc.6

Additive over rc.5. `TextLink` gains `purpose: 'inline' | 'nav'`; `nav` has no
underline at rest and draws a 1.5px underline from the inline start on hover or
keyboard focus (motion/react, 220ms, instant under reduced motion). New
`LinkButton` renders a native button with the same look for in-page actions among
links. Foundations adds "Personality layers": the checklist that turns a correct
screen into a product (voice, one focal CTA, contrast color on few spots, type and
hairline hierarchy, one signature motion, preview over icon tile), plus a table
mapping each layer to `ExpandingButton`, `TextLink`/`LinkButton`, `HandDrawnArrow`
and the quiet `Dialog`. No changes to existing defaults.

## Earlier candidate — 0.2.0-rc.5

Visual change over rc.4. `Dialog` drops the beUI center-morph clip unfold after
owner review found it showy. Entry is now a quiet 180ms fade with a 0.97→1
scale, exit 150ms, reduced motion 140ms opacity only. Focus, inert gating and
native lifecycle are unchanged. No API or token changes.

## Earlier candidate — 0.2.0-rc.4

Additive over rc.3. Adds `ExpandingButton`, a pill call to action whose
brand-colored chip fills the control on fine-pointer hover or `:focus-visible`
(beUI `expanding-arrow-button`, MIT, via a sibling app). Optional decorative `mark`
slot for provider or product logos, `default`/`hero` contexts, 44px on touch
screens, instant under reduced motion, forced-colors fallback. No changes to
existing components or tokens.

## Earlier candidate — 0.2.0-rc.3

Agent-experience release from a sibling app consumer feedback. **Breaking:**
`DesignSystemProvider` requires `brandColor` (type, runtime error and
`check-consumer` `BRAND_REQUIRED`); add the product's contrast color when upgrading.
Adds `beds/manifest.json`, generated from the TypeScript program (props, required
flags, literal values, object fields, canonical docs, tokens), an Agent quickstart,
the Contrast color foundation and Promotion candidates. Adds `HandDrawnArrow`,
bundled Caveat (`--font-hand`, OFL) and `--es-brand-ink`. Components read reduced
motion through the SSR-safe hook, fixing hydration mismatches in `Select`,
`SegmentedControl` and eight other components under `prefers-reduced-motion`,
now covered by a reduced-motion hydration regression. Stylesheet order lives in
`scripts/css-order.json`, and the build fails on an unlisted component stylesheet.

## Older candidate — 0.2.0-rc.2

Consumer validation exposed WebKit's native Tab behavior skipping modal buttons
when full keyboard access is disabled. Modal containment now owns every Tab /
Shift+Tab step and preserves one stop per native radio group. No visual tokens,
geometry, motion timing or public API changes. Native dialog lifetime, nested
modal behavior and keyboard opener restoration remain in the shared helper.
The dedicated WebKit form regression complements the existing Dialog/Drawer
Chromium lifecycle checks. Physical-device and screen-reader speech remain
unverified; this is not blanket accessibility or aesthetic approval.

## Agnostic mainline promotion — 0.2.0-rc.1

`main` supersedes the historical bootstrap branch as the default. Source starts
from the reviewed agnostic extraction `fba8fc3`; former branches and releases
remain reachable. The release changes distribution metadata and current guidance,
not the candidate's component runtime. Foundations and Consumer contract own
the new app/core boundary. Full-page recipes remain repository examples, not
package exports. This candidate does not claim completed consumer migration,
independent aesthetic approval, native assistive-technology or physical-device QA.

Initial extraction preserves RC13 runtime byte-for-byte. RC14 changes repository/
distribution metadata and repository setup only. Historical machine-specific reports
are excluded from publication; source screenshots/provenance remain historical.

RC15 renames the actual package/import to `beds` and source folder to `packages/beds`.
RC14 remains immutable under its original name. Upgrade consumers by replacing
the dependency and imports, not by adding an alias. Public components, CSS classes,
tokens and fonts are unchanged. Historical document/catalog directory names remain
stable; package paths in canonical docs follow the current repository layout.

RC16 consolidates the catalog additions since RC15:113 public components and92
tokens. New shared control-boundary/error-text roles intentionally strengthen
functional contrast without changing decorative card borders. Toast errors,
warnings and actions now persist until dismissed;informational notices have a
5s minimum. AppShell adds a default Portuguese keyboard bypass label,overridable
through `skipToContentLabel`. Existing consumer product behavior remains owned
by each host. See the current validation record and six-domain consolidation
review before adoption;motion proposals are not implemented or approved.
