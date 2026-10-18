# BEDS — reusable interface foundations

BEDS provides individual components, interaction behavior, semantic tokens and
style guidance. It does not prescribe an application's identity or page design.
This guide replaces the [historical foundations](FOUNDATIONS-HISTORY.md), whose
product-specific measurements remain provenance, not instructions for new apps.
The [agnostic migration ledger](AGNOSTIC-DS.md) records extraction, scoped
verification and residual acceptance limits; [API boundaries](API-BOUNDARIES.md)
classifies every current export.

**Source of truth for visual defaults (owner decision, 2026-10-18):** the patterns
the reference app ships win. Where BEDS and the reference app differed, BEDS now
follows the reference app: pill buttons (md 40 / sm 32), soft text-entry borders with a
soft focus ring, one proportional tab pill, outline calls to action and the
layout proportions in [Proportions](#proportions--the-finished-look).

## Required authoring skills

Before constructing UI, read [Interface quality](INTERFACE-QUALITY.md), its direct
links to the seven pinned `SKILL.md` files and the relevant skill references.
Route those instructions from the consuming app's own `AGENTS.md`; installing
BEDS does not execute skills or automatically load nested package instructions.
Skills guide judgment and verification, not a guarantee of a polished result.
Report missing context and unverified states. Technical acceptance is not visual
approval. [Governance](GOVERNANCE.md) defines evidence and release boundaries.

## Responsibility and composition

| BEDS owns | The consuming app owns |
|---|---|
| Reusable controls and their accessible interaction states | Page hierarchy, navigation structure and business flows |
| Semantic colors, shared type roles and spacing vocabulary | Identity, logo, artwork, content and named brand presets |
| Component containment, focus and keyboard behavior | Page widths, grids, breakpoints, grouping and reading order |
| Documented variants and controlled callbacks | Requests, persistence, validation policy and truthful outcomes |

Use semantic HTML and app-owned layout CSS around BEDS components. Read tokens;
do not target private `.es-*` classes or redefine `--es-*` properties. A wrapper
for page layout is legitimate; copying a select's keyboard logic is usually not.
Do not add a library component merely to move CSS out of an app. New components
must have one reusable job and credible uses in unrelated products.
Promote only such components—not every creation made during app development.
Document at least two concrete, unrelated product uses; if reuse is unclear,
keep the implementation in the app. Renaming it or adding configuration does
not make it product-agnostic. Follow [component admission](GOVERNANCE.md#component-admission).
Multi-part widgets such as dialogs and tables can still be individual components.
See [Consumer contract](CONSUMER-CONTRACT.md) for the enforced boundary.

The 0.2 release line removes page presets from `geometry`: `sidebar`,
`rail`, `breakpoint`, `mobileGutter`, `desktopGutter`, `chat`, `home` and
`dashboard`. Corresponding sidebar/rail/chat/home/dashboard CSS width tokens
are removed. Apps choose these values in their own layout styles; do not copy
them back as global DS policy. `geometry.readingWidth` and `--es-reading-width`
retain the 640px reading measure used by contained editorial/decision components,
not a mandatory application width. This is a breaking migration, not an implicit
consumer upgrade.

## Color and identity

Use semantic roles, not palette positions, to describe intent. Current runtime
values live in `packages/beds/src/tokens.css`; read-only metadata is exported
from `tokens.ts`. The light/dark palette remains stable during extraction.

| Purpose | Token |
|---|---|
| Canvas and primary text | `--es-bg`, `--es-text` |
| Secondary copy and headings | `--es-secondary`, `--es-heading` |
| Contained and subtle surfaces | `--es-surface`, `--es-subtle` |
| Structural border and mark boundary (checkbox, radio, switch) | `--es-border`, `--es-control-border` |
| Text-entry boundary (fields, text areas, selects, OTP slots, file dropzone) | `--es-field-border`: equals `--es-border` (soft) by default; `DesignSystemProvider fieldBorder="strong"` makes it `--es-control-border` |
| Text-entry focus and error | `--es-field-focus-border` (heading at 40%), `--es-focus-ring` (focus at 40%, 2px), `--es-error-ring` (error at 25%, 2px) |
| Quiet interaction tints | `--es-hover-soft` (outline/ghost pills, chips), `--es-remove-hover` (round ×), `--es-destructive-border` |
| Focus | `--es-focus` |
| Primary action | `--es-primary`, `--es-on-primary` |
| Caller-owned branded emphasis | `--es-brand`, `--es-on-brand` |
| Decorative brand stroke (never text) | `--es-brand-ink`: light theme mixes 70% brand with `--es-heading` in oklab so light hues stay visible; dark theme is `--es-brand` |
| Error text | `--es-error-text` |

Shadcn-style names such as `--background`, `--foreground`, `--card`, `--muted`,
`--primary` and `--ring` are declared in the same theme boundary. Existing
`--es-*` aliases keep component roles compatible; neither naming system implies
permission to replace component internals with application overrides.

`DesignSystemProvider` accepts an explicit theme and a **required** six-digit
brand color. There is no default and there are no named product presets.
`BrandMark` contains a caller-supplied image and requires `src` and `label`.
It contains no BEDS-owned product logo. Assets and their licenses belong to the
app. Functional error/success states must not depend on brand color alone.

`DesignSystemProvider` also accepts `fieldBorder: 'soft' | 'strong'`. `soft` is
the default since 0.3 (owner, about the reference app: "não gosto de input com borda
grossa, gosto com borda suave"): fields, text areas, selects, OTP slots and the
file dropzone draw the structural card border (`--es-border`) and are identified by
their visible label, placeholder and the soft focus ring. `strong` restores the
functional-contrast outline (`--es-control-border`, at least 3:1) for products that
need it; `default` is accepted as a deprecated alias of `strong`. Checkbox, radio
and switch marks never soften, and focus and error keep their own colors. Focus on
text entry is never a hard outline: the border turns `--es-field-focus-border` and
a 2px `--es-focus-ring` surrounds the control. Inside dialogs and drawers text
entry is outlined without a fill.

Choose actual foreground/background pairs and inspect contrast in both themes.
A palette value is not a contrast guarantee for every placement. Keep floating
menus and dialogs on a legible surface; a preference for transparent cards does
not justify transparent popovers.

## Contrast color — mandatory choice

Owner decision, 2026-09-22. Neutrals give structure; one contrast color gives the
product its identity. A product with only black, white and gray reads as raw and
unfinished, so every consumer passes a deliberate `brandColor` (the type and
`check-consumer` both require it). It is still exactly one color. Functional
blue, success, warning and error stay separate and never double as the brand.

**Choosing it (agent task when the user has not decided):**

1. Name the feeling the product should give its customers in two or three words,
   from its audience and promise. Examples: "energy, money, new"; "calm, trust, focus".
2. Pick a hue that carries that feeling and stays distinct from functional colors.
   Starting points, not rules: electric lime or yellow for energy, speed and money
   (for example `#d0f300`); orange for warmth and optimism (for example `#ff5a00`); violet
   for creativity and premium; teal or green for growth and health; pink or coral
   for playful and social. Avoid link-like blues and red, which read as links and errors.
3. Prefer saturated colors with presence on both `#ffffff` and `#191919`. BEDS
   derives black or white foreground on brand fills; `--es-brand-ink` keeps light
   brands visible as decoration on light surfaces.
4. Record the color and a one-sentence reason in the product's `AGENTS.md`.

**Using it:** selected or active marks, progress and meters, small identity marks
(logo accent, highlighter under key headline words, decorative strokes such as
`HandDrawnArrow`) and illustrations. Keep it to a few focal points per screen.
Buttons are not brand-filled (the reference app decision, 2026-09-29: orange fills with
black labels read loud; the focal action is the outline pill with a trailing arrow
and the filled action is the neutral `primary`). Never use brand for body text,
large page backgrounds or several competing accents. Brand is never the only
carrier of meaning.

## Personality layers — a correct screen is not a finished screen

Owner decision, 2026-09-22. A screen built only from correct BEDS controls on a
neutral background still reads as generic: gray empty states, gray icon tiles,
one filled button, no voice. Before calling a screen done, give it the product's
personality in these layers, in this order. Each one is small; together they are
the difference between "a template" and "a product".

1. **Voice first.** Rewrite headings and empty states as the product speaking to
   one person about their next win, not as system status. "Nenhum processo em
   andamento" becomes the promise plus the next step. Never invent counts,
   testimonials or urgency; label demo data as demo.
2. **One focal point per view.** Decide the single thing the user should do and
   make it visibly the primary action: the outline pill with a trailing arrow
   (`Button variant="outline" icon="ArrowRight" iconPosition="end"`, or
   `ExpandingButton`, which now renders exactly that), at most one per screen, with
   value stated before the ask. Everything else is secondary, ghost or a
   `LinkButton`. Async work uses the button's `state` (spinner slot and rolling
   label), never a hand-swapped label.
3. **Contrast color on few, meaningful spots.** The primary CTA fill, a
   highlighter under one or two key headline words, the logo accent, active or
   selected state, progress and small decorative strokes (`HandDrawnArrow`). Never
   body text, large backgrounds or gradients.
4. **Hierarchy through type and hairlines, not boxes.** One large headline with
   tight tracking; big numbers for the metric that matters; 1px `--es-border`
   rules between groups instead of gray filled panels, shadows or glows.
5. **One signature motion.** Pick one or two motions that express the product
   (word-by-word headline reveal, a drawn arrow toward the CTA, the pill fill) and
   reuse them everywhere. Motion explains or rewards; it never decorates for its
   own sake, and each has a reduced-motion path.
6. **Show, don't frame.** Prefer a preview of the real output (the post, the
   résumé, the job card) over an icon tile describing it. An empty state shows what
   the filled state will look like, or the one step that fills it.

What personality is **not**: gradients, neon, glow, heavy shadows, glassmorphism,
several accent colors, confetti, or motion on every element. Those read as
generated. Elegant restraint with one confident accent beats decoration.

### Building blocks for these layers

| Need | Use |
|---|---|
| The one focal call to action | `Button variant="outline"` with a trailing `ArrowRight`, or `ExpandingButton` (same pill; `mark` for a provider logo) |
| A value the person added, removable | `Chip` with `onRemove` (quiet round ×) |
| Header, footer and link-list items | `TextLink purpose="nav"` (URL) or `LinkButton purpose="nav"` (in-page action): no underline at rest, a drawn underline on hover and keyboard focus |
| Links inside prose | `TextLink` (default `inline`), always underlined |
| A handwritten note pointing at the CTA | `HandDrawnArrow` with a short note |
| Modal content | `Dialog`: quiet fade and slight scale by default, no morph. `motionPreset="elastic"` opts into a bounded 260ms spring with 4px lift and .97→1 scale. Do not add a second entrance animation around it |
| Highlighter, rotating headline, avatar stack | App-owned for now; see [Promotion candidates](PROMOTION-CANDIDATES.md) |

## Proportions — the finished look

Owner review, 2026-09-28: per-component fidelity is not enough; the product is
read as a whole against pro.beui.dev. Oversized CTAs (48–64px), 48px tabs with a
box and an underline, mixed content widths, ragged left edges and display
headlines inside in-page prompts read as amateur. The components carry the first
four rows; the rest are app-owned layout values the reference app proved, recommended for
any BEDS product (copy the values into the app's own layout CSS, never into BEDS
tokens).

| Axis | Rule |
|---|---|
| Buttons | One geometry: pill md 40px (44px touch), sm 32px, 14/12px medium. No 48–64px CTAs. One focal action per view (outline + arrow); the filled action is neutral `primary`, never brand |
| Tabs and filters | One tab pill: 40px track, 32px options (`SegmentedControl`, `Tabs`). No boxed or underlined tab strips |
| Fields | 44px pill, 16px text, label 14/20px inset 4px, soft border, soft 2px focus ring; dense 36px rows only in admin/settings |
| Chips and dismiss | 28px pill, 13px text, round 24px × with a quiet tint; toasts and notices share the × |
| Cards | One anatomy per product: 1px `--es-border`, 16px radius, 24px inset (20px on phones), a surface step instead of a shadow; collection/job cards may use the 24px card radius. No card inside a card; hairline-divided panes instead |
| Content width | Signed-in pages: `wide` 1040px (lists, boards, search) and `compact` 760px (profile, forum, settings); both centered with the same top rhythm and fluid 16–40px gutters. Public/landing frame: 1216px outer, 32px gutter (20px on phones) |
| Rhythm | Page header → content 48px (the header owns no bottom padding); landing sections 112px (80px on phones); section head = quiet 14px eyebrow, 36px/500 title, 16px lead, 48px to content |
| Page identity | One H1 per page: 30/36px medium, tracking -0.025em (26/32px on phones), lead 15/22px secondary at 60ch (`PageHeader`). In-page prompts use a 16px card title, never a display headline |
| Navigation | Rows 36px (44px touch), 16px icons, 10px gap, 10px radius (`NavItem`); breadcrumbs and the first control's glyph sit on the content's left edge (optical alignment, not box alignment) |
| Empty states | Message first: round 40px icon tile or the product's own artwork, 18px title, 14px reason at 52ch, one outline action (`EmptyState`) |
| Motion | Press .97 with a short spring release on pointer only (the reference app's tuned value; beUI upstream uses .93 and better-ui suggests .96); state changes swap in place; reduced motion jumps to the end state |

## Typography

The current component family uses bundled Inter for interface text and Geist
Mono for code. Caveat (`--font-hand`) is bundled only for short handwritten
`HandDrawnArrow` notes; never use it for interface text. Preserve font licenses. Runtime Text roles are:

| Role | Size / line height | Weight |
|---|---|---|
| `page-title` | 16 / 20 px | 500 |
| `section-title` | 13 / 20 px | 500 |
| `chat-title` | 16 / 24 px | 500 |
| `body` | 14 / 21 px | 400 |
| `body-small` | 13 / 20 px | 400 |
| `label` | 13 / 16 px | 500 |
| `option` | 13 / 16 px | 450 |
| `caption` | 12 / 16 px | 400 |
| `overline` | 12 / 16 px | 500 |
| `metric` | 24 / 30 px | 500 |

These are existing component roles, not a universal page scale. A marketing hero
need not use a compact 16px page title. The app chooses its heading hierarchy,
measure and scale in its own composition. Keep semantic heading order independent
of visual prominence; use native headings when Text's fixed semantics do not fit.
Prefer natural wrapping over truncating essential actions, errors or identities.
Use tabular figures for changing numbers, and localize labels and formatting.

## Spacing, surfaces and responsive layout

The existing spacing vocabulary is `--es-space-1` through `--es-space-12`:
2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32 and 48 px respectively. Reuse it to express
relationships. Related items should be closer than unrelated groups; do not
substitute one fixed gap for every screen. Larger app-owned section spacing can
compose these values without introducing product-specific core tokens.

Use structure and whitespace before adding boxes. Borders describe boundaries;
shadows describe elevation. Nested radii should respect the inset, not use the
same radius blindly. Current panel/card choices are component defaults, not a
requirement that every app surface look like a card.

Choose breakpoints from content pressure and available container width. Do not
copy a previous app's 640/720/880px lanes as universal rules. Keep the DOM's
reading order meaningful when grids collapse. Test narrow containers, long words,
localized labels and zoom; labels/actions must grow rather than overlap.
Prefer logical spacing and placement for RTL. Legacy layout metadata is not a
recommendation to build another copy of the reference app.

## Interaction and motion

Prefer an existing BEUI match before inventing a new interaction. Preserve useful
anatomy, state and motion; document why adaptations are needed. Shrinking corners
or controls is a design decision, not an automatic improvement. Keep sourcing
and license records in [Provenance](PROVENANCE.md).

- Every action needs an accessible name, visible focus and truthful feedback.
- Preserve controlled values on failure; the component must not infer success.
- Keep disabled actions inactive, including secondary actions such as cancellation.
- Keep selection legible without motion. Reduced motion changes the transition,
  not the final checked/selected state.
- Provide generous non-overlapping hit areas. The md button, fields, tab options
  and nav rows grow to 44px on coarse pointers; the sm button and the chip × keep
  their visual size and pad their hit area instead. RadioGroup and ThemeToggle
  targets are at least 32px on desktop and 44px for coarse pointers; this is not a
  claim that all legacy components have completed their target audit.
- Use motion to explain change, not to occupy attention. Favor interruptible,
  brief feedback for frequent interactions; avoid decorative animation by default.
- Restore focus deliberately when a triggering action disappears. The app owns
  flow-specific destinations; overlays own their generic focus containment.

The component state contracts remain in [States](STATES.md) and
[Components](COMPONENTS.md). Known unverified coverage must remain visible.

## Review before reuse

Start with one representative screen and realistic content. Review hierarchy,
density, alignment, type, color and interaction before expanding to more screens.
Check light/dark, narrow/wide, keyboard, long content, empty/loading/error,
reduced motion and RTL where relevant. Test components without page-specific
private overrides so the app cannot conceal defects in the library.

Keep optional recipes distinct from the core API. A recipe's product labels,
illustrations, prices and page structure are examples, not default design rules.
Do not equate passing source checks, old screenshots or a smaller export list
with completed visual review. Use the current migration ledger and named evidence.
