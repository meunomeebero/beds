# ExpandingButton

`ExpandingButton` is a pill call to action whose brand-colored chip grows to
fill the whole control on hover or keyboard focus. Use it for the one primary
action in a header, a sign-in entry point or beside a hero headline, where a
little motion helps the action stand out. Use `Button` everywhere else: forms,
dialogs, toolbars, lists and secondary actions.

Adapted from beUI `expanding-arrow-button`
(`https://beui.dev/components/motion/expanding-arrow-button`, retrieved
2026-09-22, MIT). First built in Hyppo (`XLoginButton`) and promoted at the
owner's explicit request.

## Public contract

```ts
type ExpandingButtonProps = {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  icon?: IconName;          // default 'ArrowRight'
  mark?: ReactNode;         // monochrome brand glyph; replaces icon
  context?: 'default' | 'hero';
  accessibleLabel?: string; // must contain the visible label
  disabled?: boolean;
  'aria-describedby'?: string;
};
```

- The resting pill uses `--es-primary` / `--es-on-primary`. The chip and the
  expanding fill use the product's contrast color, `--es-brand` /
  `--es-on-brand`. There is no color or variant prop; the brand comes from
  `DesignSystemProvider`.
- `icon` picks a registry glyph. `mark` accepts a sign-in provider or product
  logo drawn with `currentColor` (an inline SVG). BEDS sizes it to 14px
  (`default`) or 16px (`hero`) and always hides it from assistive tech.
  Never pass text, images with their own colors or interactive content.
- `context` picks fixed geometry: `default` is 40px tall (44px on touch
  screens) for headers and side panels; `hero` is 48px beside a hero headline.
- `accessibleLabel` gives a fuller name when the visible label is short, for
  example label `Entrar` with `accessibleLabel` `Entrar com X`. It must start
  with or contain the visible words so voice control still works.

No `className`, style, width or color props. One `ExpandingButton` per view;
a row of them turns the motion into noise.

## Behavior

- Expands on hover only for fine pointers that can hover, and on
  `:focus-visible` keyboard focus. Touch taps do not expand, they press.
- The fill is a spring (`SPRING_LAYOUT`); the press scales to 0.97
  (`SPRING_PRESS`). Under reduced motion the fill switches instantly and
  there is no press scale.
- The label inside the fill is a clipped, `aria-hidden` copy, so the button
  has one accessible name and one text node for assistive tech.
- The collapsed chip size is set in CSS, so server-rendered markup matches
  the first client frame; the width is measured with `ResizeObserver` only
  to animate.
- Disabled: no expansion, 50% opacity, `not-allowed` cursor.
- Forced colors: the fill is hidden and the pill gets a system border.
- Long labels stay on one line and truncate with an ellipsis inside the
  available width.

## Evidence

- `packages/beds/scripts/expanding-button.test.mjs`: single accessible
  button, hidden accent copy, default icon, mark replacing the icon,
  `accessibleLabel`, contexts, submit type, disabled, token-only colors, touch
  size and forced colors.
- Catalog `?view=expanding-button`: icons, a brand mark, both contexts, disabled
  and a long label in light/dark. `expanding-button.spec.ts` covers hover
  and keyboard expansion, touch not expanding, reduced motion, 320px overflow
  and accessible names.
