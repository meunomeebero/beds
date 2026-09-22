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
| Avatar stack | Overlapping round avatars with a count, next to a CTA as social proof | Hyppo beta invite (`BetaAvatars`) | none found | Image loading and fallback; count formatting; max visible per context |
| Text highlight | Brand-colored highlighter behind selected headline words | Hyppo hero (`mark.brand-highlight`) | adapted with `text-reveal` | Belongs inside `Heading` as a marked span, or a `Highlight` inline component; wrapping across lines |
| Rotating headline | Headline that alternates between audiences every few seconds, pausing on hover/focus, static under reduced motion | Hyppo `AudienceHero` + `HeadlineReveal` | `text-reveal` (2026-09-22) | Needs a paired audience switch; timer semantics for assistive technology; layout reservation to avoid shift |
| Expanding CTA pill | Pill button whose icon circle expands into a brand fill on hover | Hyppo `XLoginButton` | `expanding-arrow-button` | Overlaps `Button`; could be a `Button` variant instead of a new component |

## Promoted

| Component | Promoted | Note |
|---|---|---|
| `HandDrawnArrow` | 0.2.0-rc.3 | Promoted at the owner's explicit request with one product in use (Hyppo); treat the second-product rule as pending confirmation |
