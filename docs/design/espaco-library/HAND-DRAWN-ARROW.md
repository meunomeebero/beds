# HandDrawnArrow

`HandDrawnArrow` is a decorative pen-drawn arrow with an optional handwritten
note. It points at a nearby call to action, social proof or feature on
landing pages and invitations. The host owns placement relative to the target,
the copy and the target itself; the component owns the stroke geometry,
handwriting role, color roles and draw-in motion.

Built in BEDS after a beUI search (`arrow`, `annotation`, `handwritten`,
`doodle`, `callout`, `svg path draw`) returned no candidate. First used in
Hyppo's closed-beta invitation.

## Public contract

```ts
type HandDrawnArrowProps = {
  label?: string;
  direction?: 'down-left' | 'down-right' | 'up-left' | 'up-right' | 'left' | 'right';
  shape?: 'curve' | 'loop' | 'straight';
  context?: 'compact' | 'default' | 'hero';
  tone?: 'default' | 'secondary' | 'brand';
  drawIn?: boolean;
};
```

- `direction` is where the arrowhead points. The note sits on the opposite
  side: above for `down-*`, below for `up-*`, beside for `left`/`right`.
- `shape` picks one of three fixed strokes: `curve` (default), `loop` (a small
  flourish) and `straight`.
- `context` picks fixed geometry: `compact` 18px note/40×30 mark next to small
  controls, `default` 22px/52×39 and `hero` 28px/68×51 beside a hero CTA.
  Horizontal marks are 48×21, 60×26 and 80×35.
- `tone`: `default` uses `--es-heading`, `secondary` uses `--es-secondary`
  for note and stroke. `brand` colors only the stroke with `--es-brand-ink`;
  the note stays `--es-heading` so any brand color keeps readable text.
- `drawIn` (default `true`) draws the stroke once, the first time it enters the
  viewport: 550ms line from 300ms, then a 200ms head, both `EASE_OUT`.
  `false` renders the finished stroke.

No `className`, style, color, size or path props. Custom arrows belong in the
host.

## Behavior

- The whole component is `pointer-events: none`, so it can overlap the target
  without stealing clicks.
- With a `label`, the note is ordinary readable text and the SVG is
  `aria-hidden`. Without one, the whole component is `aria-hidden`. Never put
  essential information only in the note: the target's own label must stand
  alone.
- Notes wrap at 20ch with balanced lines instead of overflowing narrow screens.
- Reduced motion and print always show the full stroke; the draw-in is
  skipped and the stroke is never left hidden.
- The note uses `--font-hand` (bundled Caveat variable, OFL). Handwriting is
  only for short notes, never interface text.

## Placement

The host positions the component: typically absolute beside the target on
desktop and in normal flow (stacked above or below) on narrow screens.
Point toward the target and keep the note short, 2–5 words.

## Evidence

- `packages/beds/scripts/hand-drawn-arrow.test.mjs`: SSR semantics, mirroring
  for all six directions, distinct shapes, static render, handwriting token,
  brand ink, wrapping and reduced-motion/print visibility.
- Catalog `?view=hand-drawn-arrow`: every shape × direction, context and tone
  in light/dark; `&preview=long` exercises wrapping at 320px.
  `hand-drawn-arrow.spec.ts` covers overflow, font loading, reduced motion and
  axe.
