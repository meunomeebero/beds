# Promotion candidates

App-owned patterns that could become BEDS components. A candidate is promoted only
when it has a clear function and concrete use in **at least two distinct products**;
until then it stays in the app. Promotion is its own BEDS task: API, states,
accessibility, canonical doc, catalog example, tests, beUI provenance and license,
then an immutable release before consumers update.

Add a row when an app builds something reusable. Record the second product when it
appears, then promote.

| Candidate | Function | Uses so far | beUI source | Open questions |
|---|---|---|---|---|
| Avatar stack | Overlapping round avatars with a count, next to a CTA as social proof | A sibling app beta invite (`BetaAvatars`) | none found | Image loading and fallback; count formatting; max visible per context |
| Text highlight | Brand-colored highlighter behind selected headline words | A sibling app hero (`mark.brand-highlight`) | adapted with `text-reveal` | Belongs inside `Heading` as a marked span, or a `Highlight` inline component; wrapping across lines |
| Rotating headline | Headline that alternates between audiences every few seconds, pausing on hover/focus, static under reduced motion | A sibling app `AudienceHero` + `HeadlineReveal` | `text-reveal` (2026-09-22) | Needs a paired audience switch; timer semantics for assistive technology; layout reservation to avoid shift |

**Reference-app pieces BEDS does not carry yet (parity review, 2026-10-19).** Found while
checking BEDS 0.3 against the reference app; deferred from 0.3.0-rc.2 because no other
product needs them yet and the owner rejects partial beUI ports (port fully or not at all).

| Candidate | Function | Uses so far | beUI source | Open questions |
|---|---|---|---|---|
| Link pill | A focal action that navigates: the outline pill on the app router's own link, CSS-only press | The reference app (5 uses) | `button` | A plain `<a>` reloads router apps; needs a class helper or render prop, which the no-`className` rule forbids today |
| Choice cards | Single choice as cards: radio ring with a gliding dot, tinted fill, optional value and factual badge | The reference app (pricing packages); a sibling app (artwork choice) | `radio-group` | Card anatomy, two-column breakpoint, badge semantics |
| Icon theme switch | Sun/Moon icon button with a swap and a circle-reveal theme transition | The reference app's public header; two sibling apps | none recorded | Today `ThemeToggle` is a two-button group; port one implementation fully |
| Wrapping tooltip | A long explanation on an info glyph (24ch, wraps, keyboard and touch) | The reference app | `tooltip` | `Tooltip` takes one no-wrap string; `HelpLabel` renders its own label |
| AI chat stack | Bubbles with the pop entrance, prompt input with an action popover, scroller preview rail, streaming response, plan list | The reference app's assistant (about 90KB of ports) | chat components | BEDS chat predates these ports; full port only |
| Table | Virtualized rows, sortable headers, selection, column reorder and resize | The reference app | `table` | Adds `@tanstack/react-virtual`; `DataTable` differs |
| Command palette | Keyboard palette (⌘K) | The reference app | command-palette block | `CommandPalette` is an older adaptation the owner rejected |
| Centered upload | Large centered dropzone, 64px tile, queue rows with status glyphs | The reference app's document upload | `file-upload` | `FileUploadField` keeps its compact and document anatomy |

**Reference-app pieces deferred from 0.3.0-rc.3 (parity audit, 2026-10-21).**

| Candidate | Function | Uses so far | beUI source | Open questions |
|---|---|---|---|---|
| Drag and drop on the board | Handle, drop slot, overlay, keyboard drag between `KanbanColumn`s | The reference app's stage board | none | Adds `@dnd-kit/core`; today moves go through the card menu |
| Pressed chip | Neutral `aria-pressed` toggle chip in a review list | The reference app's import review | none | A `Chip` pressed state vs a separate control |
| Dotted quiet link | `LinkButton` with a leading brand dot for "N items missing" | The reference app's profile | none | A `LinkButton` mark slot |
| Struck list price | Old price struck before the total | The reference app's pricing | none | Belongs on `PricingCard` |

## Promoted

| Component | Promoted | Note |
|---|---|---|
| Result, board, editing and commerce patterns (22 components) | 0.3.0-rc.3 | Owner rule (2026-10-18): the reference app's current design is the truth and BEDS follows it, so a sibling app can look the same. See [RC3 patterns](RC3-PATTERNS.md) |
| `LinkButton`, `TextLink purpose="nav"` | 0.2.0-rc.6 | From a sibling app header "Como funciona" and footer link lists, where a ghost button's hover fill clashed with the pill CTA. Owner explicit request; second product is the reference app's redesign (sidebar/footer links) |
| `Dialog` quiet entry | 0.2.0-rc.5 | Not a promotion: the beUI center-morph was removed after owner review; recorded here so agents do not re-add a morph around Dialog |
| `ExpandingButton` | 0.2.0-rc.4 | Promoted at the owner's explicit request from a sibling app `XLoginButton`; kept separate from `Button` because its motion needs its own geometry and a single-instance rule. Second product pending |
| `HandDrawnArrow` | 0.2.0-rc.3 | Promoted at the owner's explicit request with one product in use (a sibling app); treat the second-product rule as pending confirmation |
