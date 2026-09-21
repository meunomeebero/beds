# RangeSlider

`RangeSlider` is a portable, presentational single-value range control. It owns
the native range semantics, bounded numeric value, visible label/value, helper
text, BEDS track/fill/ticks and focus treatment. The host owns the meaning of
the number, persistence, validation, prices, discounts, checkout and recovery.

This is an A adaptation of beUI `range-slider`, not a product pricing control.
Its source provenance is recorded below and in the source repository's
third-party notice.

## Public contract

```ts
type RangeSliderProps = {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  description?: string;
  formatValue?: (value: number) => string;
  name?: string;
  id?: string;
  showTicks?: boolean;
};
```

`label` is required and remains visible. `description`, when present, is
associated with the native input. `formatValue` formats both the visible
`output` and the control's accessible value text; do not use it to smuggle
pricing or promotion policy into the primitive.

With `value`, the caller is authoritative: `onValueChange` reports a candidate
and the rendered control changes only after the caller supplies the next value.
Without `value`, `defaultValue` initializes local presentation state. The
native `name` participates in ordinary form submission; no hidden duplicate
field is generated.

`min` defaults to `0`, `max` to `100` and `step` to `1`. The effective maximum
is the last grid point at or below the declared `max`; it is the `max` rendered
on the native input and used by React, visible text, ARIA and callbacks. For
example, `min={0}`, `max={10}`, `step={6}` has legal values `0` and `6`, so its
effective maximum is `6` — never an unreachable `10`. Values are clamped to
that inclusive effective range and snapped to its declared grid before they are
rendered or reported. A non-finite bound falls back to its default; an inverted
range collapses at `min`; a non-positive step falls back to `1`. These defensive
behaviors prevent an invalid visual state, but hosts should still provide a
valid domain contract.

## Semantics and interaction

The actual control is `<input type="range">`, not a scripted `div` with
`role="slider"`. It therefore retains native form participation and the
browser's keyboard model: Arrow keys adjust by `step`, Page Up/Down make the
browser's larger adjustment, and Home/End reach the bounds. The input is
disabled natively. The visual track is decorative and never captures a pointer.

The fill starts at the logical inline start and the native range inherits the
document direction, so a right-to-left context mirrors the visual direction
instead of treating right as a hard-coded physical edge. A 2px visible focus
perimeter surrounds the whole 40px desktop target (44px on coarse pointers);
forced-colors replaces it with the system `Highlight` color.

The source's eased fill response is retained through `motion/react` and
`SPRING_GLIDE`; its first render is static and reduced-motion users receive an
immediate fill. The value is always also visible as text, so motion is never
the sole state cue. `showTicks` adds only decorative marks and is bounded to 50
intervals to avoid a dense or expensive rail; it does not alter legal values.

## Generic example

```tsx
import { RangeSlider } from 'beds';

function FlexibilityExample() {
  const [flexibility, setFlexibility] = useState(0);
  return <RangeSlider
    label="Flexibility"
    description="Choose a value from 0 to 100."
    value={flexibility}
    min={0}
    max={100}
    step={1}
    formatValue={value => `${value}%`}
    onValueChange={setFlexibility}
  />;
}
```

The example demonstrates only a percentage-like range. It does not calculate
prices, choose a package, apply a promotion or initiate a checkout action.

## Source and evidence

| Item | Record |
|---|---|
| beUI source | `range-slider`, [raw source](https://beui.dev/r/range-slider/raw), retrieved 2026-09-20 |
| Registry metadata | [range-slider.json](https://beui.dev/r/range-slider.json), SHA-256 `c1b0f6500546abd80536d9b02748da171c41deda83611f8c332f03199160c5cd` |
| Raw source | SHA-256 `def8fd8a27890ce28da2298c8cca31b8bd9780cb594dcb9a876d524deb3f8e29` |
| Adaptation | BEDS keeps the source anatomy, tick cap and reduced-motion fill intent; native range semantics replace the upstream custom pointer/ARIA hook. No runtime beUI import or new dependency. |
| Required visual follow-up | Both fixed themes, desktop/narrow width, keyboard, long localized label, RTL, reduced motion and forced-colors need rendered evidence before visual or aesthetic acceptance. |

Technical guards do not constitute visual or aesthetic approval. [Governance](GOVERNANCE.md)
owns the required status terminology and handoff evidence.
